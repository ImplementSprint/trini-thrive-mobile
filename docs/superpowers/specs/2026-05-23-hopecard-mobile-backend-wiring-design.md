# Design: HopeCard Mobile — Backend Wiring

**Date:** 2026-05-23
**Repo:** `trini-thrive-mobile`
**App:** `hope-card/`
**Backend:** `hopecard-donor-service` (port 3104 locally)

---

## Context

The `hope-card` Expo/React Native app is a fully built UI shell with all screens backed by hardcoded mock data. This spec covers replacing that mock data with real API calls to the `hopecard-donor-service` NestJS backend. No backend code enters this repo — only typed HTTP client code and React hooks.

---

## Layer Structure

All new files live inside `hope-card/`.

```
hope-card/
  services/
    api.ts                   ← base fetch client: attaches JWT header, throws typed errors, handles 401
    auth.service.ts          ← register, login, verify-email, forgot-password, verify-otp, reset-password, id-document upload
    campaigns.service.ts     ← list (search/category/limit params), get by id, get public by id
    profile.service.ts       ← get, update, upload photo, get impact
    cart.service.ts          ← get cart, add item, update item qty, remove item
    purchases.service.ts     ← create checkout, get purchase history
    notifications.service.ts ← list notifications, mark one read
  hooks/
    useAuth.ts               ← auth actions + decoded current user; reads/writes JWT from SecureStore
    useCampaigns.ts          ← TanStack Query hook for campaign list with optional filters
    useCampaign.ts           ← TanStack Query hook for single campaign by id
    useProfile.ts            ← profile query + update/uploadPhoto mutations
    useCart.ts               ← cart query + add/update/remove mutations
    usePurchases.ts          ← checkout mutation + history query
    useNotifications.ts      ← notifications query + markRead mutation
  context/
    AuthContext.tsx           ← JWT + decoded user in React context; clears token on 401
  .env                        ← gitignored; EXPO_PUBLIC_API_BASE_URL pointing at local service
  .env.example                ← committed placeholder
```

---

## Environment Config

`.env` (gitignored):
```
# Android emulator / physical device on same network
EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:3104

# iOS simulator
# EXPO_PUBLIC_API_BASE_URL=http://localhost:3104

# Expo Go with tunnel — use the tunnel URL printed by `npx expo start --tunnel`
```

`.env.example` (committed):
```
EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:3104
```

`app.config.ts` already exposes `EXPO_PUBLIC_API_BASE_URL` via `config.extra.apiBaseUrl` — no changes needed there.

---

## API Client (`services/api.ts`)

- Reads `EXPO_PUBLIC_API_BASE_URL` for the base URL; all paths are prefixed `/hopecard/donor`
- Reads the JWT from `AuthContext` and attaches `Authorization: Bearer <token>` on every authenticated request
- On `401`: clears the stored token and throws so `AuthContext` can redirect to `/(auth)/login`
- On non-2xx: throws `{ status, message }` so hooks can surface meaningful errors
- Exports `apiGet`, `apiPost`, `apiPut`, `apiPatch`, `apiDelete`, and `apiUpload(path, file, authenticated?)` (multipart). `authenticated` defaults to `true`; pass `false` for the id-document upload which is a public endpoint used before the user has a token.

---

## Auth Token Lifecycle

1. Login or register → backend returns JWT
2. JWT decoded (`sub`, `email`, `name`, `persona`) and stored via `expo-secure-store`
3. `AuthContext` loads token on app start; exposes `{ user, token, login, logout }`
4. `api.ts` reads `token` from context for every request
5. On `401` anywhere in the app: token cleared, user redirected to login screen

---

## Screen-by-Screen Wiring

| Screen | Hook(s) used | Endpoint(s) |
|---|---|---|
| `login.tsx` | `useAuth().login(email, password)` | POST `/auth/login` |
| `signup.tsx` | `useAuth().uploadIdDoc(file)` → `useAuth().register(data)` | POST `/auth/id-document` → POST `/auth/register` |
| `verify.tsx` | `useAuth().verifyEmail(email, otp)` | POST `/auth/verify-email` |
| `forgot-password.tsx` | `useAuth().forgotPassword(email)` | POST `/auth/forgot-password` |
| `forgot-password-otp.tsx` | `useAuth().verifyOtp(email, otp)` then `useAuth().resetPassword(token, password)` | POST `/auth/verify-otp` → POST `/auth/reset-password` |
| `home.tsx` | `useCampaigns({ limit: 3, category?, search? })` | GET `/campaigns` |
| `explore.tsx` | `useCampaigns({ category?, search? })` | GET `/campaigns` |
| `modal.tsx` | `useCampaign(id)` | GET `/campaigns/public/:id` |
| `profile.tsx` | `useProfile()` + `.update()` + `.uploadPhoto()` | GET `/profile` + PUT `/profile` + POST `/profile/photo` |
| `wallet.tsx` | `useCart()` + `useProfile()` (TRAIN Law total) | GET `/cart` + cart mutations + GET `/profile` |
| `checkout.tsx` | `useCart()` + `usePurchases().checkout()` + `useProfile()` | GET `/cart` + POST `/purchases` |
| `notifications.tsx` | `useNotifications()` + `.markRead(id)` | GET `/notifications` + PATCH `/notifications/:id` |
| `history.tsx` | `usePurchases().history()` | GET `/purchases` |
| `impact.tsx` | `useProfile().impact()` (real) + static mock (points tier) | GET `/profile/impact` |

**TRAIN Law display** (wallet + checkout): reads `profile.total_donations_amount` against the ₱250,000 annual ceiling. No separate endpoint — covered by `useProfile()`.

---

## Loading & Error States

- `QueryClientProvider` wraps the root `app/_layout.tsx`
- Each screen shows an inline spinner or skeleton while `isLoading` is true
- Each screen shows an inline error message with a retry button on `isError`
- No global error modal — errors are scoped to the screen that caused them

---

## What Stays Mock

- **HOPECARD points / membership tier** on the Impact tab — no backend table exists yet per the backend spec; the points/tier section remains hardcoded until that system is built

---

## What Is NOT in Scope

- Building or modifying any backend code
- Google OAuth flow changes (backend already handles it; deep-link callback wiring is a separate task)
- PayMongo webhook handling
- Push notification setup
- Admin or beneficiary screens
