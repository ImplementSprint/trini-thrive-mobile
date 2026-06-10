# Design: HopeCard Donor Service — Full Backend Implementation

**Date:** 2026-05-23  
**Repo:** `TriniThrive_Hopecard/Backend/trini-thrive-be`  
**Service:** `apps/hopecard-donor-service`  
**Mobile app:** `trini-thrive-mobile/hope-card` (consumers; no backend code here)

---

## Context

The `hopecard-donor-service` is a NestJS microservice that serves the `hope-card` mobile app (donor-facing Expo/React Native app). The service already implements:

- Google OAuth auth (get URL + callback)
- Campaigns list (with category/search)
- Cart CRUD
- Purchases / PayMongo checkout flow
- Profile get/update/impact
- Notifications (get, mark read, broadcast)
- Global stats

The mobile app currently uses **mock data** for all screens. This spec covers the missing backend endpoints that allow the mobile app to be fully wired to real data.

---

## Gaps to Fill

### 1. Email/Password Auth

The mobile has Login, Signup, Verify (OTP), Forgot Password, and Reset Password screens. The donor service only supports Google OAuth.

**Endpoints to add** (all under `/hopecard/donor/auth`):

| Method | Path | Description |
|--------|------|-------------|
| POST | `/register` | Create account: email, password, first_name, last_name, barangay, municipality, province. Creates Supabase auth user + `digital_donor_profiles` row (status=`pending`). Sends email OTP for verification. Returns JWT. |
| POST | `/login` | Authenticate with email + password. Verifies user exists in `digital_donor_profiles`. Returns JWT with `persona: 'donor'`. |
| POST | `/verify-email` | Accept 6-digit OTP sent at registration. Marks profile `status='verified'`. |
| POST | `/forgot-password` | Accept email. Clears old OTPs, generates new 6-digit OTP, sends email. Uses OTP in `otp_sessions` table (same as beneficiary service). |
| POST | `/verify-otp` | Accept email + OTP. Returns `reset_token` (base64 payload). |
| POST | `/reset-password` | Accept `reset_token` + `new_password`. Updates Supabase auth password. |

**JWT payload** (same shape as Google OAuth path):
```json
{ "sub": "<authUserId>", "email": "...", "name": "...", "persona": "donor", "system": "hopecard" }
```

**OTP table:** Reuse existing `otp_sessions` table (email, otp, expires_at_ms, created_at_ms, used).

**Email sending:** Use nodemailer (same SMTP env vars already used by beneficiary service: `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`).

---

### 2. Campaign Detail

The modal.tsx screen looks up a campaign by ID from mock data. A real detail endpoint is needed.

**Endpoint to add** (in existing campaigns module):

| Method | Path | Description |
|--------|------|-------------|
| GET | `/hopecard/donor/campaigns/:id` | Return full campaign detail: id, title, description, category, target_amount, collected_amount, progress_pct, cover_image_url, status, end_date. |
| GET | `/hopecard/donor/campaigns/public/:id` | Same but unauthenticated (for pre-login browsing). |

**Implementation:** Single `supabaseRequest` to `hc_campaigns?id=eq.<id>` with same field selection as list. Returns 404 if not found.

---

### 3. File Upload

The signup screen requires a Valid ID document. The profile screen allows profile photo updates. Both are stored in Supabase Storage.

**Approach:** Direct multipart/form-data upload through the NestJS backend. Backend streams to Supabase Storage admin client, returns the storage key and public URL.

**Endpoints to add:**

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/hopecard/donor/profile/photo` | `@RequirePersona('donor')` | Upload profile photo. Accepts `multipart/form-data` with `file` field. Stores in bucket `donor-files` under `profile-photos/<authUserId>.<ext>`. Updates `digital_donor_profiles.profile_photo_key`. Returns `{ key, url }`. |
| POST | `/hopecard/donor/auth/id-document` | Public (used during registration) | Upload ID document. Accepts `multipart/form-data` with `file` field. Stores in bucket `donor-files` under `id-documents/<timestamp>-<originalname>`. Returns `{ key }`. Key is then passed to `/register` as `id_document_key`. |

**File constraints:** Max 5 MB, accepted MIME types: `image/jpeg`, `image/png`, `application/pdf`.

**Supabase Storage bucket:** `donor-files` (needs to be created with appropriate RLS; service role key bypasses RLS).

**NestJS setup:** Use `@nestjs/platform-express` multer interceptor (`FileInterceptor`) with `memoryStorage()` so file bytes are in-memory for immediate upload to Supabase.

---

## Architecture

All new functionality extends existing modules in-place — no new NestJS modules created. The pattern follows `hopecard-beneficiary-service` for the OTP/email flows.

```
hopecard-donor-service/src/
  auth/
    auth.controller.ts    ← add register, login, verify-email, forgot-password, verify-otp, reset-password, id-document upload
    auth.service.ts       ← extend with new methods
    dto/
      register.dto.ts     ← NEW
      login.dto.ts        ← NEW
      verify-email.dto.ts ← NEW
      forgot-password.dto.ts ← NEW (or reuse from common pattern)
      verify-otp.dto.ts   ← NEW
      reset-password.dto.ts ← NEW
  campaigns/
    campaigns.controller.ts ← add GET :id and GET public/:id
    campaigns.service.ts    ← add getCampaignById()
  profile/
    profile.controller.ts   ← add POST /photo
    profile.service.ts      ← add uploadProfilePhoto()
```

---

## Data Flow

### Registration
1. Mobile `POST /hopecard/donor/auth/register` with `{ email, password, first_name, last_name, barangay, municipality, province, id_document_key? }`
2. Backend: `supabase.auth.admin.createUser({ email, password, email_confirm: false })`
3. Backend: Insert `digital_donor_profiles` with `status = 'pending'`
4. Backend: Generate OTP, insert `otp_sessions`, send verification email
5. Return JWT + `{ isNew: true }`
6. Mobile shows `verify.tsx` (OTP entry)
7. Mobile `POST /hopecard/donor/auth/verify-email` with `{ email, otp }`
8. Backend: Validate OTP, update `digital_donor_profiles.status = 'verified'`
9. Mobile navigates to `/(tabs)/home`

### Login
1. Mobile `POST /hopecard/donor/auth/login` with `{ email, password }`
2. Backend: `supabase.auth.signInWithPassword`
3. Backend: Confirm `digital_donor_profiles` row exists
4. Return JWT

### Forgot Password
1. Mobile `POST /hopecard/donor/auth/forgot-password` with `{ email }`
2. Backend: Verify `digital_donor_profiles` row exists, generate OTP, send email
3. Mobile `POST /hopecard/donor/auth/verify-otp` with `{ email, otp }` → `{ reset_token }`
4. Mobile `POST /hopecard/donor/auth/reset-password` with `{ reset_token, new_password }`

### File Upload (ID document)
1. Mobile: `POST /hopecard/donor/auth/id-document` with file → `{ key }`
2. Mobile: Include `id_document_key` in `/register` body

### Profile Photo
1. Mobile: `POST /hopecard/donor/profile/photo` with `authUserId` header + file
2. Backend: Upload to Supabase Storage, update profile row, return `{ key, url }`

---

## Error Handling

All endpoints return standard NestJS HTTP exceptions with appropriate status codes:
- `400` — validation failure, bad OTP, missing fields
- `401` — wrong credentials, expired reset token
- `404` — user not found
- `409` — email already registered
- `500` — Supabase/SMTP failures

---

## Environment Variables

All already present in `.env` / `.env.example`:
- `SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_SECRET`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`

---

## What Is NOT in Scope

- HOPECARD points system (Impact tab shows mock point data — no backend table exists yet)
- TRAIN Law tracking (wallet/checkout shows hardcoded tax data)
- Beneficiary or admin-side features
- Payment webhook handlers (purchases service already handles confirm flow)
