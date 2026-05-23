# HopeCard Mobile — Backend Wiring Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all hardcoded mock data in `hope-card/` with real API calls to the `hopecard-donor-service` on port 3104, covering auth, campaigns, profile, cart, checkout, notifications, and history.

**Architecture:** A typed fetch wrapper (`services/api.ts`) handles HTTP, JWT injection, and 401 redirect. Service modules provide typed API calls. TanStack Query hooks wrap those services and expose `isLoading`/`isError`/`data` to screens. JWT state lives in `AuthContext` backed by `expo-secure-store`. No backend code enters this repo.

**Tech Stack:** TanStack Query v5, expo-secure-store, expo-document-picker, expo-image-picker, React 19, expo-router v6

---

## File Map

### New files
| File | Purpose |
|---|---|
| `hope-card/services/api.ts` | Base fetch client — JWT header injection, error handling, 401 redirect trigger |
| `hope-card/services/auth.service.ts` | Auth API calls |
| `hope-card/services/campaigns.service.ts` | Campaign list + detail API calls |
| `hope-card/services/profile.service.ts` | Profile get/update/photo/impact API calls |
| `hope-card/services/cart.service.ts` | Cart CRUD API calls |
| `hope-card/services/purchases.service.ts` | Checkout + purchase history API calls |
| `hope-card/services/notifications.service.ts` | Notifications list + mark-read API calls |
| `hope-card/context/AuthContext.tsx` | JWT lifecycle — SecureStore, decoded user, 401 handler setup |
| `hope-card/hooks/useAuth.ts` | Auth mutations wrapping auth.service + AuthContext |
| `hope-card/hooks/useCampaigns.ts` | TanStack Query hook for campaign list |
| `hope-card/hooks/useCampaign.ts` | TanStack Query hook for single campaign |
| `hope-card/hooks/useProfile.ts` | Profile query + update/uploadPhoto mutations |
| `hope-card/hooks/useCart.ts` | Cart query + add/update/remove mutations |
| `hope-card/hooks/usePurchases.ts` | Checkout mutation + purchase history query |
| `hope-card/hooks/useNotifications.ts` | Notifications query + markRead mutation |
| `hope-card/tests/unit/api.test.ts` | Unit tests for api.ts |
| `hope-card/tests/unit/auth.service.test.ts` | Unit tests for auth.service.ts |
| `hope-card/tests/unit/campaigns.service.test.ts` | Unit tests for campaigns.service.ts |
| `hope-card/.env.example` | Committed env placeholder |

### Modified files
| File | Change |
|---|---|
| `hope-card/packages/ui/types.ts` | Update `Campaign` type to use API field names |
| `hope-card/packages/mock-data/campaigns.ts` | Update mock data to use new field names |
| `hope-card/tests/unit/mockData.test.ts` | Update assertions to use new field names |
| `hope-card/components/campaigns/CampaignCard.tsx` | Update field access to new Campaign type |
| `hope-card/jest.config.ts` | Add `services/**/*.ts` to `collectCoverageFrom` |
| `hope-card/app/_layout.tsx` | Wrap tree with `QueryClientProvider` + `AuthProvider` |
| `hope-card/app/(tabs)/_layout.tsx` | Add auth guard — redirect to login if no user |
| `hope-card/app/(auth)/login.tsx` | Wire `useAuth().login()` |
| `hope-card/app/(auth)/signup.tsx` | Wire `uploadIdDoc()` + `register()` |
| `hope-card/app/(auth)/verify.tsx` | Wire `verifyEmail()` |
| `hope-card/app/forgot-password.tsx` | Wire `forgotPassword()` |
| `hope-card/app/forgot-password-otp.tsx` | Wire `verifyOtp()` + `resetPassword()`, add password reset step |
| `hope-card/app/(tabs)/home.tsx` | Replace mock import with `useCampaigns()` |
| `hope-card/app/(tabs)/explore.tsx` | Replace mock import with `useCampaigns()` |
| `hope-card/app/modal.tsx` | Replace mock lookup with `useCampaign(id)` |
| `hope-card/app/(tabs)/profile.tsx` | Wire `useProfile()` + mutations |
| `hope-card/app/(tabs)/wallet.tsx` | Wire `useCart()` + `useProfile()` for TRAIN Law |
| `hope-card/app/checkout.tsx` | Wire `useCart()` + `usePurchases().checkout` |
| `hope-card/app/history.tsx` | Wire `usePurchases().history` |
| `hope-card/app/(tabs)/impact.tsx` | Wire `useProfile().impactQuery` |
| `hope-card/app/notifications.tsx` | Wire `useNotifications()` + `markRead` |

---

## Task 1: Install dependencies and create env files

**Files:**
- Create: `hope-card/.env.example`

- [ ] **Step 1: Install runtime dependencies**

Run inside `hope-card/`:
```bash
npx expo install expo-secure-store expo-document-picker expo-image-picker
npm install @tanstack/react-query
```

Expected: packages added to `package.json` dependencies with expo-compatible versions.

- [ ] **Step 2: Create `.env.example`**

Create `hope-card/.env.example`:
```
# Local dev — Android emulator / physical device on same WiFi
EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:3104

# iOS simulator: use http://localhost:3104
# Expo Go with tunnel: use the tunnel URL printed by `npx expo start --tunnel`
```

- [ ] **Step 3: Create your local `.env`**

Copy `.env.example` to `.env` and set the URL for your device/emulator. Confirm `.env` is already in `.gitignore` (it is by default with Expo).

- [ ] **Step 4: Commit**

```bash
git add hope-card/package.json hope-card/package-lock.json hope-card/.env.example
git commit -m "chore(hope-card): install tanstack-query, secure-store, document/image pickers"
```

---

## Task 2: Base API client

**Files:**
- Create: `hope-card/services/api.ts`
- Create: `hope-card/tests/unit/api.test.ts`
- Modify: `hope-card/jest.config.ts`

- [ ] **Step 1: Write failing tests**

Create `hope-card/tests/unit/api.test.ts`:
```typescript
import { apiGet, apiPost, setToken, ApiError } from '../../services/api';

const BASE = (process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://10.0.2.2:3104') + '/hopecard/donor';

beforeEach(() => {
  setToken(null);
  (global.fetch as jest.Mock) = jest.fn();
});

describe('apiGet', () => {
  it('calls the correct URL without auth header when no token', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ id: '1' }),
    });
    const result = await apiGet('/campaigns', false);
    expect(global.fetch).toHaveBeenCalledWith(
      `${BASE}/campaigns`,
      expect.objectContaining({ method: 'GET' })
    );
    expect(result).toEqual({ id: '1' });
  });

  it('attaches Authorization header when token is set', async () => {
    setToken('test-jwt');
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({}),
    });
    await apiGet('/profile');
    const call = (global.fetch as jest.Mock).mock.calls[0];
    expect(call[1].headers['Authorization']).toBe('Bearer test-jwt');
  });

  it('throws ApiError with status and message on non-2xx', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ message: 'Not found' }),
    });
    await expect(apiGet('/campaigns/bad-id', false)).rejects.toMatchObject({
      status: 404,
      message: 'Not found',
    });
  });

  it('throws ApiError(401) and calls onUnauthorized handler on 401', async () => {
    const handler = jest.fn();
    const { setUnauthorizedHandler } = await import('../../services/api');
    setUnauthorizedHandler(handler);
    setToken('stale-token');
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 401, json: async () => ({}) });
    await expect(apiGet('/profile')).rejects.toMatchObject({ status: 401 });
    expect(handler).toHaveBeenCalled();
  });
});

describe('apiPost', () => {
  it('sends JSON body with Content-Type header', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ access_token: 'jwt' }),
    });
    await apiPost('/auth/login', { email: 'a@b.com', password: 'pass' }, false);
    const call = (global.fetch as jest.Mock).mock.calls[0];
    expect(call[1].headers['Content-Type']).toBe('application/json');
    expect(call[1].body).toBe(JSON.stringify({ email: 'a@b.com', password: 'pass' }));
  });
});
```

- [ ] **Step 2: Run tests — expect failure (module not found)**

```bash
cd hope-card && npx jest --testPathPattern=tests/unit/api.test.ts --no-coverage
```
Expected: FAIL — `Cannot find module '../../services/api'`

- [ ] **Step 3: Create `hope-card/services/api.ts`**

```typescript
const BASE_URL =
  (process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://10.0.2.2:3104') + '/hopecard/donor';

let _token: string | null = null;
let _onUnauthorized: (() => void) | null = null;

export function setToken(token: string | null): void {
  _token = token;
}

export function setUnauthorizedHandler(handler: () => void): void {
  _onUnauthorized = handler;
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  authenticated = true,
): Promise<T> {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (options.body && typeof options.body === 'string') {
    headers['Content-Type'] = 'application/json';
  }

  if (authenticated && _token) {
    headers['Authorization'] = `Bearer ${_token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (res.status === 401) {
    _onUnauthorized?.();
    throw new ApiError(401, 'Unauthorized');
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    throw new ApiError(res.status, body.message ?? res.statusText);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export function apiGet<T>(path: string, authenticated = true): Promise<T> {
  return request<T>(path, { method: 'GET' }, authenticated);
}

export function apiPost<T>(path: string, body: unknown, authenticated = true): Promise<T> {
  return request<T>(path, { method: 'POST', body: JSON.stringify(body) }, authenticated);
}

export function apiPut<T>(path: string, body: unknown, authenticated = true): Promise<T> {
  return request<T>(path, { method: 'PUT', body: JSON.stringify(body) }, authenticated);
}

export function apiPatch<T>(path: string, body: unknown, authenticated = true): Promise<T> {
  return request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }, authenticated);
}

export function apiDelete<T>(path: string, authenticated = true): Promise<T> {
  return request<T>(path, { method: 'DELETE' }, authenticated);
}

export async function apiUpload<T>(
  path: string,
  file: { uri: string; name: string; type: string },
  authenticated = true,
): Promise<T> {
  const form = new FormData();
  form.append('file', { uri: file.uri, name: file.name, type: file.type } as unknown as Blob);

  const headers: Record<string, string> = {};
  if (authenticated && _token) {
    headers['Authorization'] = `Bearer ${_token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, { method: 'POST', headers, body: form });

  if (res.status === 401) {
    _onUnauthorized?.();
    throw new ApiError(401, 'Unauthorized');
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    throw new ApiError(res.status, body.message ?? res.statusText);
  }

  return res.json();
}
```

- [ ] **Step 4: Add `services/**/*.ts` to jest coverage**

In `hope-card/jest.config.ts`, add to `collectCoverageFrom`:
```typescript
collectCoverageFrom: [
  'constants/**/*.ts',
  'hooks/use-theme-color.ts',
  'packages/ui/tokens.ts',
  'packages/mock-data/campaigns.ts',
  'services/**/*.ts',   // ← add this line
],
```

- [ ] **Step 5: Run tests — expect pass**

```bash
cd hope-card && npx jest --testPathPattern=tests/unit/api.test.ts --no-coverage
```
Expected: PASS (4 tests)

- [ ] **Step 6: Commit**

```bash
git add hope-card/services/api.ts hope-card/tests/unit/api.test.ts hope-card/jest.config.ts
git commit -m "feat(hope-card): add base API client with JWT injection and error handling"
```

---

## Task 3: Auth service

**Files:**
- Create: `hope-card/services/auth.service.ts`
- Create: `hope-card/tests/unit/auth.service.test.ts`

- [ ] **Step 1: Write failing tests**

Create `hope-card/tests/unit/auth.service.test.ts`:
```typescript
import { login, register, verifyEmail, forgotPassword, verifyOtp, resetPassword, uploadIdDocument } from '../../services/auth.service';

jest.mock('../../services/api', () => ({
  apiPost: jest.fn(),
  apiUpload: jest.fn(),
}));

import { apiPost, apiUpload } from '../../services/api';

beforeEach(() => jest.clearAllMocks());

describe('login', () => {
  it('calls apiPost /auth/login unauthenticated with email and password', async () => {
    (apiPost as jest.Mock).mockResolvedValueOnce({ access_token: 'jwt' });
    const result = await login('a@b.com', 'pw');
    expect(apiPost).toHaveBeenCalledWith('/auth/login', { email: 'a@b.com', password: 'pw' }, false);
    expect(result).toEqual({ access_token: 'jwt' });
  });
});

describe('register', () => {
  it('calls apiPost /auth/register unauthenticated', async () => {
    (apiPost as jest.Mock).mockResolvedValueOnce({ access_token: 'jwt', isNew: true });
    const payload = { email: 'a@b.com', password: 'pw', first_name: 'A', last_name: 'B', barangay: 'X', municipality: 'Y', province: 'Z' };
    await register(payload);
    expect(apiPost).toHaveBeenCalledWith('/auth/register', payload, false);
  });
});

describe('verifyEmail', () => {
  it('calls apiPost /auth/verify-email authenticated', async () => {
    (apiPost as jest.Mock).mockResolvedValueOnce({ message: 'ok' });
    await verifyEmail('a@b.com', '123456');
    expect(apiPost).toHaveBeenCalledWith('/auth/verify-email', { email: 'a@b.com', otp: '123456' }, true);
  });
});

describe('forgotPassword', () => {
  it('calls apiPost /auth/forgot-password unauthenticated', async () => {
    (apiPost as jest.Mock).mockResolvedValueOnce({ message: 'sent' });
    await forgotPassword('a@b.com');
    expect(apiPost).toHaveBeenCalledWith('/auth/forgot-password', { email: 'a@b.com' }, false);
  });
});

describe('verifyOtp', () => {
  it('calls apiPost /auth/verify-otp unauthenticated and returns reset_token', async () => {
    (apiPost as jest.Mock).mockResolvedValueOnce({ reset_token: 'tok' });
    const res = await verifyOtp('a@b.com', '654321');
    expect(apiPost).toHaveBeenCalledWith('/auth/verify-otp', { email: 'a@b.com', otp: '654321' }, false);
    expect(res.reset_token).toBe('tok');
  });
});

describe('resetPassword', () => {
  it('calls apiPost /auth/reset-password unauthenticated', async () => {
    (apiPost as jest.Mock).mockResolvedValueOnce({ message: 'ok' });
    await resetPassword('tok', 'newpw');
    expect(apiPost).toHaveBeenCalledWith('/auth/reset-password', { reset_token: 'tok', new_password: 'newpw' }, false);
  });
});

describe('uploadIdDocument', () => {
  it('calls apiUpload /auth/id-document unauthenticated', async () => {
    (apiUpload as jest.Mock).mockResolvedValueOnce({ key: 'id-docs/file.jpg' });
    const file = { uri: 'file://tmp/id.jpg', name: 'id.jpg', type: 'image/jpeg' };
    const res = await uploadIdDocument(file);
    expect(apiUpload).toHaveBeenCalledWith('/auth/id-document', file, false);
    expect(res.key).toBe('id-docs/file.jpg');
  });
});
```

- [ ] **Step 2: Run tests — expect failure**

```bash
cd hope-card && npx jest --testPathPattern=tests/unit/auth.service.test.ts --no-coverage
```
Expected: FAIL — `Cannot find module '../../services/auth.service'`

- [ ] **Step 3: Create `hope-card/services/auth.service.ts`**

```typescript
import { apiPost, apiUpload } from './api';

export type AuthTokenResponse = {
  access_token: string;
  isNew?: boolean;
};

export type VerifyOtpResponse = {
  reset_token: string;
};

export type MessageResponse = {
  message: string;
};

export type RegisterPayload = {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  barangay: string;
  municipality: string;
  province: string;
  id_document_key?: string;
};

export type UploadIdDocumentResponse = {
  key: string;
};

export function login(email: string, password: string): Promise<AuthTokenResponse> {
  return apiPost<AuthTokenResponse>('/auth/login', { email, password }, false);
}

export function register(payload: RegisterPayload): Promise<AuthTokenResponse> {
  return apiPost<AuthTokenResponse>('/auth/register', payload, false);
}

export function verifyEmail(email: string, otp: string): Promise<MessageResponse> {
  return apiPost<MessageResponse>('/auth/verify-email', { email, otp }, true);
}

export function forgotPassword(email: string): Promise<MessageResponse> {
  return apiPost<MessageResponse>('/auth/forgot-password', { email }, false);
}

export function verifyOtp(email: string, otp: string): Promise<VerifyOtpResponse> {
  return apiPost<VerifyOtpResponse>('/auth/verify-otp', { email, otp }, false);
}

export function resetPassword(reset_token: string, new_password: string): Promise<MessageResponse> {
  return apiPost<MessageResponse>('/auth/reset-password', { reset_token, new_password }, false);
}

export function uploadIdDocument(
  file: { uri: string; name: string; type: string },
): Promise<UploadIdDocumentResponse> {
  return apiUpload<UploadIdDocumentResponse>('/auth/id-document', file, false);
}
```

- [ ] **Step 4: Run tests — expect pass**

```bash
cd hope-card && npx jest --testPathPattern=tests/unit/auth.service.test.ts --no-coverage
```
Expected: PASS (7 tests)

- [ ] **Step 5: Commit**

```bash
git add hope-card/services/auth.service.ts hope-card/tests/unit/auth.service.test.ts
git commit -m "feat(hope-card): add auth service"
```

---

## Task 4: Campaigns service + hooks

**Files:**
- Create: `hope-card/services/campaigns.service.ts`
- Create: `hope-card/hooks/useCampaigns.ts`
- Create: `hope-card/hooks/useCampaign.ts`
- Create: `hope-card/tests/unit/campaigns.service.test.ts`

- [ ] **Step 1: Write failing tests**

Create `hope-card/tests/unit/campaigns.service.test.ts`:
```typescript
import { getCampaigns, getCampaignById, getCampaignPublic } from '../../services/campaigns.service';

jest.mock('../../services/api', () => ({ apiGet: jest.fn() }));
import { apiGet } from '../../services/api';

beforeEach(() => jest.clearAllMocks());

describe('getCampaigns', () => {
  it('calls /campaigns with no params when empty options', async () => {
    (apiGet as jest.Mock).mockResolvedValueOnce([]);
    await getCampaigns();
    expect(apiGet).toHaveBeenCalledWith('/campaigns', true);
  });

  it('appends limit and category query params', async () => {
    (apiGet as jest.Mock).mockResolvedValueOnce([]);
    await getCampaigns({ limit: 3, category: 'Health' });
    expect(apiGet).toHaveBeenCalledWith('/campaigns?limit=3&category=Health', true);
  });

  it('skips category param when value is "All"', async () => {
    (apiGet as jest.Mock).mockResolvedValueOnce([]);
    await getCampaigns({ category: 'All' });
    expect(apiGet).toHaveBeenCalledWith('/campaigns', true);
  });

  it('appends search param', async () => {
    (apiGet as jest.Mock).mockResolvedValueOnce([]);
    await getCampaigns({ search: 'health' });
    expect(apiGet).toHaveBeenCalledWith('/campaigns?search=health', true);
  });
});

describe('getCampaignById', () => {
  it('calls /campaigns/:id authenticated', async () => {
    (apiGet as jest.Mock).mockResolvedValueOnce({ id: '1' });
    await getCampaignById('1');
    expect(apiGet).toHaveBeenCalledWith('/campaigns/1', true);
  });
});

describe('getCampaignPublic', () => {
  it('calls /campaigns/public/:id unauthenticated', async () => {
    (apiGet as jest.Mock).mockResolvedValueOnce({ id: '1' });
    await getCampaignPublic('1');
    expect(apiGet).toHaveBeenCalledWith('/campaigns/public/1', false);
  });
});
```

- [ ] **Step 2: Run tests — expect failure**

```bash
cd hope-card && npx jest --testPathPattern=tests/unit/campaigns.service.test.ts --no-coverage
```
Expected: FAIL — `Cannot find module '../../services/campaigns.service'`

- [ ] **Step 3: Create `hope-card/services/campaigns.service.ts`**

Import `Campaign` from `@digdon/ui/types` (updated in Task 8 to match API fields) so screens and `CampaignCard` receive the same type with no casting.

```typescript
import { apiGet } from './api';
import { Campaign } from '@digdon/ui/types';

export type { Campaign };

export type CampaignListParams = {
  limit?: number;
  category?: string;
  search?: string;
};

export function getCampaigns(params: CampaignListParams = {}): Promise<Campaign[]> {
  const qs = new URLSearchParams();
  if (params.limit) qs.set('limit', String(params.limit));
  if (params.category && params.category !== 'All') qs.set('category', params.category);
  if (params.search) qs.set('search', params.search);
  const query = qs.toString();
  return apiGet<Campaign[]>(`/campaigns${query ? `?${query}` : ''}`, true);
}

export function getCampaignById(id: string): Promise<Campaign> {
  return apiGet<Campaign>(`/campaigns/${id}`, true);
}

export function getCampaignPublic(id: string): Promise<Campaign> {
  return apiGet<Campaign>(`/campaigns/public/${id}`, false);
}
```

**Note:** Task 4 must be executed AFTER Task 8 (which updates the `Campaign` type), or run Task 8 first if doing tasks out of order.

- [ ] **Step 4: Run tests — expect pass**

```bash
cd hope-card && npx jest --testPathPattern=tests/unit/campaigns.service.test.ts --no-coverage
```
Expected: PASS (6 tests)

- [ ] **Step 5: Create `hope-card/hooks/useCampaigns.ts`**

```typescript
import { useQuery } from '@tanstack/react-query';
import { getCampaigns, CampaignListParams } from '../services/campaigns.service';

export function useCampaigns(params: CampaignListParams = {}) {
  return useQuery({
    queryKey: ['campaigns', params],
    queryFn: () => getCampaigns(params),
  });
}
```

- [ ] **Step 6: Create `hope-card/hooks/useCampaign.ts`**

```typescript
import { useQuery } from '@tanstack/react-query';
import { getCampaignPublic } from '../services/campaigns.service';

export function useCampaign(id: string) {
  return useQuery({
    queryKey: ['campaign', id],
    queryFn: () => getCampaignPublic(id),
    enabled: !!id,
  });
}
```

- [ ] **Step 7: Commit**

```bash
git add hope-card/services/campaigns.service.ts hope-card/hooks/useCampaigns.ts hope-card/hooks/useCampaign.ts hope-card/tests/unit/campaigns.service.test.ts
git commit -m "feat(hope-card): add campaigns service and query hooks"
```

---

## Task 5: Remaining services and hooks

**Files:**
- Create: `hope-card/services/profile.service.ts`
- Create: `hope-card/services/cart.service.ts`
- Create: `hope-card/services/purchases.service.ts`
- Create: `hope-card/services/notifications.service.ts`
- Create: `hope-card/hooks/useProfile.ts`
- Create: `hope-card/hooks/useCart.ts`
- Create: `hope-card/hooks/usePurchases.ts`
- Create: `hope-card/hooks/useNotifications.ts`

- [ ] **Step 1: Create `hope-card/services/profile.service.ts`**

```typescript
import { apiGet, apiPut, apiUpload } from './api';

export type DonorProfile = {
  id: string;
  auth_user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  barangay: string | null;
  municipality: string | null;
  province: string | null;
  profile_photo_key: string | null;
  status: string;
  total_donations_amount: number;
  total_donations_count: number;
};

export type UpdateProfilePayload = {
  first_name?: string;
  last_name?: string;
  phone?: string;
  barangay?: string;
  municipality?: string;
  province?: string;
};

export type ProfileImpact = {
  total_donations_amount: number;
  total_donations_count: number;
};

export type UploadPhotoResponse = {
  key: string;
  url: string;
};

export function getProfile(): Promise<DonorProfile> {
  return apiGet<DonorProfile>('/profile');
}

export function updateProfile(payload: UpdateProfilePayload): Promise<DonorProfile> {
  return apiPut<DonorProfile>('/profile', payload);
}

export function uploadProfilePhoto(
  file: { uri: string; name: string; type: string },
): Promise<UploadPhotoResponse> {
  return apiUpload<UploadPhotoResponse>('/profile/photo', file, true);
}

export function getProfileImpact(): Promise<ProfileImpact> {
  return apiGet<ProfileImpact>('/profile/impact');
}
```

- [ ] **Step 2: Create `hope-card/services/cart.service.ts`**

```typescript
import { apiGet, apiPost, apiPatch, apiDelete } from './api';

export type CartItem = {
  id: string;
  cart_id: string;
  campaign_id: string;
  face_value: number;
  quantity: number;
  campaign: {
    id: string;
    title: string;
    cover_image_url: string | null;
  };
};

export type Cart = {
  id: string;
  items: CartItem[];
};

export function getCart(): Promise<Cart> {
  return apiGet<Cart>('/cart');
}

export function addToCart(
  campaign_id: string,
  face_value: number,
  quantity = 1,
): Promise<Cart> {
  return apiPost<Cart>('/cart/items', { campaign_id, face_value, quantity });
}

export function updateCartItem(itemId: string, quantity: number): Promise<Cart> {
  return apiPatch<Cart>(`/cart/items/${itemId}`, { quantity });
}

export function removeCartItem(itemId: string): Promise<Cart> {
  return apiDelete<Cart>(`/cart/items/${itemId}`);
}
```

- [ ] **Step 3: Create `hope-card/services/purchases.service.ts`**

```typescript
import { apiGet, apiPost } from './api';

export type Purchase = {
  id: string;
  hopecard_id: string;
  amount_paid: number;
  payment_method: string;
  status: string;
  purchased_at: string;
  hopecard: {
    card_code: string;
    campaign: { title: string };
  };
};

export type CheckoutPayload = {
  payment_method: 'gcash' | 'card' | 'bank' | 'maya' | 'bank_transfer';
};

export type CheckoutResponse = {
  checkout_url: string;
  purchase_id: string;
};

export function checkout(payload: CheckoutPayload): Promise<CheckoutResponse> {
  return apiPost<CheckoutResponse>('/purchases/checkout', payload);
}

export function getPurchaseHistory(): Promise<Purchase[]> {
  return apiGet<Purchase[]>('/purchases');
}
```

- [ ] **Step 4: Create `hope-card/services/notifications.service.ts`**

```typescript
import { apiGet, apiPatch } from './api';

export type DonorNotification = {
  id: string;
  type: 'new_campaign' | 'donation_success';
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

export function getNotifications(): Promise<DonorNotification[]> {
  return apiGet<DonorNotification[]>('/notifications');
}

export function markNotificationRead(id: string): Promise<void> {
  return apiPatch<void>(`/notifications/${id}/read`, {});
}
```

- [ ] **Step 5: Create `hope-card/hooks/useProfile.ts`**

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getProfile,
  updateProfile,
  uploadProfilePhoto,
  getProfileImpact,
  UpdateProfilePayload,
} from '../services/profile.service';

export function useProfile() {
  const qc = useQueryClient();

  const profileQuery = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
  });

  const update = useMutation({
    mutationFn: (payload: UpdateProfilePayload) => updateProfile(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['profile'] }),
  });

  const uploadPhoto = useMutation({
    mutationFn: (file: { uri: string; name: string; type: string }) =>
      uploadProfilePhoto(file),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['profile'] }),
  });

  const impactQuery = useQuery({
    queryKey: ['profile', 'impact'],
    queryFn: getProfileImpact,
  });

  return { profileQuery, update, uploadPhoto, impactQuery };
}
```

- [ ] **Step 6: Create `hope-card/hooks/useCart.ts`**

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCart, addToCart, updateCartItem, removeCartItem } from '../services/cart.service';

export function useCart() {
  const qc = useQueryClient();

  const cartQuery = useQuery({
    queryKey: ['cart'],
    queryFn: getCart,
  });

  const addItem = useMutation({
    mutationFn: ({
      campaign_id,
      face_value,
      quantity,
    }: {
      campaign_id: string;
      face_value: number;
      quantity?: number;
    }) => addToCart(campaign_id, face_value, quantity),
    onSuccess: (data) => qc.setQueryData(['cart'], data),
  });

  const updateItem = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      updateCartItem(itemId, quantity),
    onSuccess: (data) => qc.setQueryData(['cart'], data),
  });

  const removeItem = useMutation({
    mutationFn: (itemId: string) => removeCartItem(itemId),
    onSuccess: (data) => qc.setQueryData(['cart'], data),
  });

  return { cartQuery, addItem, updateItem, removeItem };
}
```

- [ ] **Step 7: Create `hope-card/hooks/usePurchases.ts`**

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { checkout, getPurchaseHistory, CheckoutPayload } from '../services/purchases.service';

export function usePurchases() {
  const qc = useQueryClient();

  const history = useQuery({
    queryKey: ['purchases'],
    queryFn: getPurchaseHistory,
  });

  const checkoutMutation = useMutation({
    mutationFn: (payload: CheckoutPayload) => checkout(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cart'] });
      qc.invalidateQueries({ queryKey: ['profile'] });
      qc.invalidateQueries({ queryKey: ['purchases'] });
    },
  });

  return { history, checkout: checkoutMutation };
}
```

- [ ] **Step 8: Create `hope-card/hooks/useNotifications.ts`**

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getNotifications, markNotificationRead } from '../services/notifications.service';

export function useNotifications() {
  const qc = useQueryClient();

  const notificationsQuery = useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications,
  });

  const markRead = useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  return { notificationsQuery, markRead };
}
```

- [ ] **Step 9: Run typecheck**

```bash
cd hope-card && npm run typecheck
```
Expected: no errors

- [ ] **Step 10: Commit**

```bash
git add hope-card/services/ hope-card/hooks/useProfile.ts hope-card/hooks/useCart.ts hope-card/hooks/usePurchases.ts hope-card/hooks/useNotifications.ts
git commit -m "feat(hope-card): add profile, cart, purchases, notifications services and hooks"
```

---

## Task 6: AuthContext and useAuth hook

**Files:**
- Create: `hope-card/context/AuthContext.tsx`
- Create: `hope-card/hooks/useAuth.ts`

- [ ] **Step 1: Create `hope-card/context/AuthContext.tsx`**

```typescript
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';
import { setToken as setApiToken, setUnauthorizedHandler } from '../services/api';

const TOKEN_KEY = 'hopecard_jwt';

export type AuthUser = {
  sub: string;
  email: string;
  name: string;
  persona: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  saveToken: (token: string) => Promise<void>;
  clearToken: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function decodeJwt(token: string): AuthUser | null {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64));
    return {
      sub: payload.sub,
      email: payload.email,
      name: payload.name,
      persona: payload.persona,
    };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setLocalToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const clearToken = useCallback(async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    setApiToken(null);
    setLocalToken(null);
    setUser(null);
  }, []);

  const saveToken = useCallback(async (jwt: string) => {
    await SecureStore.setItemAsync(TOKEN_KEY, jwt);
    setApiToken(jwt);
    setLocalToken(jwt);
    setUser(decodeJwt(jwt));
  }, []);

  // Load persisted token on mount
  useEffect(() => {
    SecureStore.getItemAsync(TOKEN_KEY).then((stored) => {
      if (stored) {
        setApiToken(stored);
        setLocalToken(stored);
        setUser(decodeJwt(stored));
      }
      setIsLoading(false);
    });
  }, []);

  // Wire 401 handler — clear token and redirect to login
  const clearTokenRef = useRef(clearToken);
  clearTokenRef.current = clearToken;

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearTokenRef.current();
      router.replace('/(auth)/login');
    });
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, saveToken, clearToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used inside AuthProvider');
  return ctx;
}
```

- [ ] **Step 2: Create `hope-card/hooks/useAuth.ts`**

```typescript
import { useRouter } from 'expo-router';
import { useAuthContext } from '../context/AuthContext';
import * as authService from '../services/auth.service';

export function useAuth() {
  const { user, token, isLoading, saveToken, clearToken } = useAuthContext();
  const router = useRouter();

  async function login(email: string, password: string) {
    const res = await authService.login(email, password);
    await saveToken(res.access_token);
    return res;
  }

  async function register(payload: authService.RegisterPayload) {
    const res = await authService.register(payload);
    await saveToken(res.access_token);
    return res;
  }

  async function uploadIdDoc(file: { uri: string; name: string; type: string }) {
    return authService.uploadIdDocument(file);
  }

  async function verifyEmail(email: string, otp: string) {
    return authService.verifyEmail(email, otp);
  }

  async function forgotPassword(email: string) {
    return authService.forgotPassword(email);
  }

  async function verifyOtp(email: string, otp: string) {
    return authService.verifyOtp(email, otp);
  }

  async function resetPassword(reset_token: string, new_password: string) {
    return authService.resetPassword(reset_token, new_password);
  }

  async function logout() {
    await clearToken();
    router.replace('/(auth)/login');
  }

  return {
    user,
    token,
    isLoading,
    login,
    register,
    uploadIdDoc,
    verifyEmail,
    forgotPassword,
    verifyOtp,
    resetPassword,
    logout,
  };
}
```

- [ ] **Step 3: Run typecheck**

```bash
cd hope-card && npm run typecheck
```
Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add hope-card/context/AuthContext.tsx hope-card/hooks/useAuth.ts
git commit -m "feat(hope-card): add AuthContext with SecureStore JWT lifecycle and useAuth hook"
```

---

## Task 7: Wire providers in layouts

**Files:**
- Modify: `hope-card/app/_layout.tsx`
- Modify: `hope-card/app/(tabs)/_layout.tsx`

- [ ] **Step 1: Update `hope-card/app/_layout.tsx`**

Replace the entire file with:
```typescript
import { useEffect } from 'react';
import { Stack, SplashScreen } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts, PlusJakartaSans_400Regular, PlusJakartaSans_600SemiBold, PlusJakartaSans_700Bold, PlusJakartaSans_800ExtraBold } from '@expo-google-fonts/plus-jakarta-sans';
import { Manrope_400Regular, Manrope_500Medium, Manrope_600SemiBold, Manrope_700Bold, Manrope_800ExtraBold } from '@expo-google-fonts/manrope';
import { AuthProvider } from '../context/AuthContext';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });

  useEffect(() => {
    if (error) {
      console.error('Font loading error:', error);
      throw error;
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </QueryClientProvider>
  );
}

function RootLayoutNav() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Donate' }} />
      <Stack.Screen name="checkout" options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="confirmation" options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="history" options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="forgot-password" options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="forgot-password-otp" options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="notifications" options={{ presentation: 'modal', headerShown: false }} />
    </Stack>
  );
}
```

- [ ] **Step 2: Add auth guard to `hope-card/app/(tabs)/_layout.tsx`**

Add these imports at the top and the guard block inside `TabLayout`, before the `return`:
```typescript
import { Redirect } from 'expo-router';
import { useAuthContext } from '../../context/AuthContext';
```

At the start of the `TabLayout` function body, before `return (`:
```typescript
  const { user, isLoading } = useAuthContext();

  if (isLoading) return null;
  if (!user) return <Redirect href="/(auth)/login" />;
```

- [ ] **Step 3: Run typecheck**

```bash
cd hope-card && npm run typecheck
```
Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add hope-card/app/_layout.tsx hope-card/app/(tabs)/_layout.tsx
git commit -m "feat(hope-card): add QueryClientProvider and AuthProvider to root layout, auth guard on tabs"
```

---

## Task 8: Update Campaign UI type to match API fields

The `CampaignCard` component uses the `Campaign` type from `packages/ui/types.ts` with fields `image`, `target`, `raised`. The API returns `cover_image_url`, `target_amount`, `collected_amount`. Update the type and all consumers.

**Files:**
- Modify: `hope-card/packages/ui/types.ts`
- Modify: `hope-card/packages/mock-data/campaigns.ts`
- Modify: `hope-card/tests/unit/mockData.test.ts`
- Modify: `hope-card/components/campaigns/CampaignCard.tsx`

- [ ] **Step 1: Update `hope-card/packages/ui/types.ts`**

Replace the `Campaign` interface:
```typescript
export interface Campaign {
  id: string;
  title: string;
  description: string | null;
  cover_image_url: string | null;
  target_amount: number;
  collected_amount: number;
  progress_pct: number;
  category: string | null;
  status: string;
  end_date: string | null;
}
```

Leave `User` and `Transaction` unchanged.

- [ ] **Step 2: Update `hope-card/packages/mock-data/campaigns.ts`**

Replace the file content with:
```typescript
import { Campaign } from '@digdon/ui';

export const campaigns: Campaign[] = [
  {
    id: '1',
    title: 'Empower a New Generation of Scholars',
    description: 'Providing essential learning resources and mentorship to 500 children in underserved communities.',
    cover_image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD0sMTuVxihDdvfK60Wl_3jZ5JWA-eHi-Ztx8MkGH6VqP_dv2YRhjuysyxRjapRtNkYaJ2h1GvZDxVPXwZlG1o-io5pvFReMRf0gClwPSr8upaCg_jN7k19iyKNrmB0DMPHh-AfasatRiS656UGU4AvVP7_6REv3LXxPDZDstiwXxQMGc1BxqgAAZuYWrzJc502WjZtjAiVgz3V4PB5WuzyxBM9A-nYrcnTWskz9UpH8usz2Nb8YGb4R_J7ORPUPxrgNdFnQ42VPJ6s',
    target_amount: 25000,
    collected_amount: 20500,
    progress_pct: 82,
    category: 'Education',
    status: 'active',
    end_date: null,
  },
  {
    id: '2',
    title: 'Reforest the Ancient Valley',
    description: 'Protecting local biodiversity by planting 5,000 native tree species to restore the natural ecosystem.',
    cover_image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBoBk7VFRjfzzycmsMZMyPANG24ZeZ_bb3akHt43xK1WCUmETA4yLD85l1Q-Kj1hfaGtAniHZ9Izmn_tv4GNoMCjmHWTuuBuiPKbRgIHeRXEOXQyo6sMsyrvD1Ex2Q_vYE4-MkueumVgkxZS2f2k8QzFTAjOFyi4JAlC6HdgaTzUlW4hpO9dB4twPW0DF3d1YPrDbN6bPbjCWYdUqm_Ac8B4xJeTjL9gWmW9pAuzsNSYWVcL4OtoIRm2VLH0fDt-BmFLhyZdNdhI9JF',
    target_amount: 10000,
    collected_amount: 4500,
    progress_pct: 45,
    category: 'Environment',
    status: 'active',
    end_date: null,
  },
  {
    id: '3',
    title: 'Rural Mobile Health Units',
    description: 'Providing critical medical checkups and vaccinations to isolated mountain villages.',
    cover_image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCeZozXMYf-7Hmye6OkJcB4kvjbtuClv-O4egJh0IcTw7zU2NjWcqBwb0NsPm9ma0qAI0ghh2DwSQ5PSCdsxCAdeIwAgeoFsgbW4QiEgI4Luwd20MmvfY2VLZtmtGUSDgvK5PS8ZbDZGAGXfNobr_aOiofViJ16FmJ6yppt7WWC_2GBtbGapcDbYWSxUJipDBrd_pRaZDaz_4nlTVZ7usjDkWmxtKJXC-td74glWSiuStBeW0E9ix6Df19j91STWXImtcQDOb_eF1No',
    target_amount: 25000,
    collected_amount: 17200,
    progress_pct: 68,
    category: 'Health',
    status: 'active',
    end_date: null,
  },
];
```

- [ ] **Step 3: Update `hope-card/tests/unit/mockData.test.ts`**

Replace field assertions to match new type:
```typescript
import { campaigns } from '@digdon/mock-data';

describe('mockData campaigns', () => {
  it('defines an array of mock campaigns', () => {
    expect(campaigns).toBeDefined();
    expect(Array.isArray(campaigns)).toBe(true);
    expect(campaigns.length).toBe(3);

    const firstCampaign = campaigns[0];
    expect(firstCampaign.id).toBe('1');
    expect(firstCampaign.title).toBe('Empower a New Generation of Scholars');
    expect(firstCampaign.target_amount).toBe(25000);
    expect(firstCampaign.collected_amount).toBe(20500);
    expect(firstCampaign.category).toBe('Education');
  });
});
```

- [ ] **Step 4: Update `hope-card/components/campaigns/CampaignCard.tsx`**

Change the three field accesses in the component body:

```typescript
// line 18 — was: campaign.target > 0 ? campaign.raised / campaign.target : 0
const progress = campaign.progress_pct / 100;

// line 24 — was: source={{ uri: campaign.image }}
source={{ uri: campaign.cover_image_url ?? undefined }}

// line 39 — was: ${campaign.raised.toLocaleString()}
₱{campaign.collected_amount.toLocaleString()}
```

The import at the top and all other code stays the same.

- [ ] **Step 5: Run tests to verify mock data test passes**

```bash
cd hope-card && npx jest --testPathPattern=tests/unit/mockData.test.ts --no-coverage
```
Expected: PASS

- [ ] **Step 6: Run typecheck**

```bash
cd hope-card && npm run typecheck
```
Expected: no errors

- [ ] **Step 7: Commit**

```bash
git add hope-card/packages/ui/types.ts hope-card/packages/mock-data/campaigns.ts hope-card/tests/unit/mockData.test.ts hope-card/components/campaigns/CampaignCard.tsx
git commit -m "feat(hope-card): align Campaign UI type with API field names"
```

---

## Task 9: Wire auth screens

**Files:**
- Modify: `hope-card/app/(auth)/login.tsx`
- Modify: `hope-card/app/(auth)/signup.tsx`
- Modify: `hope-card/app/(auth)/verify.tsx`
- Modify: `hope-card/app/forgot-password.tsx`
- Modify: `hope-card/app/forgot-password-otp.tsx`

- [ ] **Step 1: Wire `hope-card/app/(auth)/login.tsx`**

Add these imports after the existing imports:
```typescript
import { useAuth } from '../../hooks/useAuth';
```

Add state for the form and loading at the top of `LoginScreen`:
```typescript
  const { login } = useAuth();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
```

Add the submit handler:
```typescript
  async function handleLogin() {
    if (!email || !password) return;
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      router.replace('/(tabs)/home');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }
```

Update the email `TextInput` to add `value` and `onChangeText`:
```typescript
value={email}
onChangeText={setEmail}
```

Update the password `TextInput`:
```typescript
value={password}
onChangeText={setPassword}
```

Replace the `HButton` `onPress`:
```typescript
onPress={handleLogin}
disabled={loading}
title={loading ? 'Signing in...' : 'Sign In'}
```

Add error display above the `HButton`:
```typescript
{error && (
  <Text style={{ color: 'red', fontSize: 13, textAlign: 'center', fontFamily: 'Manrope_500Medium' }}>
    {error}
  </Text>
)}
```

- [ ] **Step 2: Wire `hope-card/app/(auth)/signup.tsx`**

Add imports:
```typescript
import { useAuth } from '../../hooks/useAuth';
import * as DocumentPicker from 'expo-document-picker';
```

Add state and handler at the top of the screen function:
```typescript
  const { uploadIdDoc, register } = useAuth();
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [barangay, setBarangay] = React.useState('');
  const [municipality, setMunicipality] = React.useState('');
  const [province, setProvince] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [idDocKey, setIdDocKey] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handlePickIdDocument() {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['image/jpeg', 'image/png', 'application/pdf'],
    });
    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];
    const res = await uploadIdDoc({ uri: asset.uri, name: asset.name, type: asset.mimeType ?? 'application/octet-stream' });
    setIdDocKey(res.key);
  }

  async function handleRegister() {
    setLoading(true);
    setError(null);
    try {
      await register({
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        barangay,
        municipality,
        province,
        id_document_key: idDocKey ?? undefined,
      });
      router.push('/(auth)/verify');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  }
```

Wire each `TextInput` to its state variable (`value` + `onChangeText`). Wire the file upload button to `handlePickIdDocument`. Replace the Sign Up button `onPress` with `handleRegister`. Add error display above the button.

- [ ] **Step 3: Wire `hope-card/app/(auth)/verify.tsx`**

Add imports:
```typescript
import { useAuth } from '../../hooks/useAuth';
import { useAuthContext } from '../../context/AuthContext';
```

Add in the screen function:
```typescript
  const { verifyEmail } = useAuth();
  const { user } = useAuthContext();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleVerify() {
    const otpString = otp.join('');
    if (otpString.length !== 6 || !user?.email) return;
    setLoading(true);
    setError(null);
    try {
      await verifyEmail(user.email, otpString);
      router.replace('/(tabs)/home');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Verification failed');
    } finally {
      setLoading(false);
    }
  }
```

Replace the "Verify & Continue" button `onPress` with `handleVerify`. Add error display. The `otp` state array already exists in the screen — keep it.

- [ ] **Step 4: Wire `hope-card/app/forgot-password.tsx`**

Add imports:
```typescript
import { useAuth } from '../hooks/useAuth';
```

Add in the screen function:
```typescript
  const { forgotPassword } = useAuth();
  const [email, setEmail] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSend() {
    if (!email) return;
    setLoading(true);
    setError(null);
    try {
      await forgotPassword(email);
      setSent(true);
      router.push({ pathname: '/forgot-password-otp', params: { email } });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  }
```

Wire the email `TextInput` to `email`/`setEmail`. Replace the send button `onPress` with `handleSend`. Add error display.

- [ ] **Step 5: Wire `hope-card/app/forgot-password-otp.tsx`**

This screen handles two steps: OTP verification → password reset.

Add imports:
```typescript
import { useAuth } from '../hooks/useAuth';
import { useLocalSearchParams } from 'expo-router';
```

Add in the screen function (the `otp` array state already exists — keep it):
```typescript
  const { verifyOtp, resetPassword } = useAuth();
  const { email } = useLocalSearchParams<{ email: string }>();
  const [step, setStep] = React.useState<'otp' | 'reset'>('otp');
  const [resetToken, setResetToken] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleVerifyOtp() {
    const otpString = otp.join('');
    if (otpString.length !== 6 || !email) return;
    setLoading(true);
    setError(null);
    try {
      const res = await verifyOtp(email, otpString);
      setResetToken(res.reset_token);
      setStep('reset');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword() {
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await resetPassword(resetToken, newPassword);
      router.replace('/(auth)/login');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Password reset failed');
    } finally {
      setLoading(false);
    }
  }
```

When `step === 'otp'`: show the existing OTP input UI, wire the verify button to `handleVerifyOtp`.

When `step === 'reset'`: show two password inputs (`newPassword`, `confirmPassword`) and a "Reset Password" button wired to `handleResetPassword`. The simplest approach is to conditionally render a second block below the OTP inputs:

```typescript
{step === 'reset' && (
  <View style={{ gap: 16, marginTop: 24 }}>
    <Text style={{ fontSize: 18, fontWeight: '700', color: colors.onSurface, textAlign: 'center', fontFamily: 'PlusJakartaSans_700Bold' }}>
      Set New Password
    </Text>
    <TextInput
      value={newPassword}
      onChangeText={setNewPassword}
      placeholder="New password"
      secureTextEntry
      style={{ backgroundColor: colors.surfaceContainerHighest, borderRadius: 18, padding: 18, fontSize: 16, color: colors.onSurface, fontFamily: 'Manrope_500Medium' }}
    />
    <TextInput
      value={confirmPassword}
      onChangeText={setConfirmPassword}
      placeholder="Confirm password"
      secureTextEntry
      style={{ backgroundColor: colors.surfaceContainerHighest, borderRadius: 18, padding: 18, fontSize: 16, color: colors.onSurface, fontFamily: 'Manrope_500Medium' }}
    />
    {error && <Text style={{ color: 'red', fontSize: 13, textAlign: 'center' }}>{error}</Text>}
    <HButton title={loading ? 'Resetting...' : 'Reset Password'} onPress={handleResetPassword} size="lg" disabled={loading} />
  </View>
)}
```

Hide the original verify button and OTP inputs when `step === 'reset'` by wrapping them: `{step === 'otp' && ( ... )}`.

- [ ] **Step 6: Run typecheck**

```bash
cd hope-card && npm run typecheck
```
Expected: no errors

- [ ] **Step 7: Commit**

```bash
git add hope-card/app/(auth)/ hope-card/app/forgot-password.tsx hope-card/app/forgot-password-otp.tsx
git commit -m "feat(hope-card): wire auth screens to backend"
```

---

## Task 10: Wire campaign screens

**Files:**
- Modify: `hope-card/app/(tabs)/home.tsx`
- Modify: `hope-card/app/(tabs)/explore.tsx`
- Modify: `hope-card/app/modal.tsx`

- [ ] **Step 1: Update `hope-card/app/(tabs)/home.tsx`**

Replace the mock import and state at the top:

Remove:
```typescript
import { campaigns } from '@digdon/mock-data/campaigns';
```

Add:
```typescript
import { useCampaigns } from '../../hooks/useCampaigns';
```

Replace the `featuredCampaign` line and add debounced search state in `HomeScreen`:
```typescript
  const [search, setSearch] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');

  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data: campaigns, isLoading, isError, refetch } = useCampaigns({
    limit: 3,
    category: activeCategory,
    search: debouncedSearch,
  });
```

Wire the search `TextInput`:
```typescript
value={search}
onChangeText={setSearch}
```

Replace `campaigns.slice(0, 3)` in `FlatList data` with `campaigns ?? []`.

Add loading and error states in the `FlatList`:
```typescript
ListEmptyComponent={
  isLoading ? (
    <Text style={{ textAlign: 'center', color: colors.onSurfaceVariant, padding: 32, fontFamily: 'Manrope_500Medium' }}>Loading campaigns...</Text>
  ) : isError ? (
    <View style={{ alignItems: 'center', padding: 32, gap: 12 }}>
      <Text style={{ color: colors.onSurfaceVariant, fontFamily: 'Manrope_500Medium' }}>Failed to load campaigns</Text>
      <TouchableOpacity onPress={() => refetch()}><Text style={{ color: colors.primary, fontWeight: '700' }}>Retry</Text></TouchableOpacity>
    </View>
  ) : null
}
```

- [ ] **Step 2: Update `hope-card/app/(tabs)/explore.tsx`**

Remove:
```typescript
import { campaigns } from '@digdon/mock-data/campaigns';
```

Add:
```typescript
import { useCampaigns } from '../../hooks/useCampaigns';
```

Add state and hook in `ExploreScreen`:
```typescript
  const [search, setSearch] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const [activeCategory, setActiveCategory] = React.useState('All');

  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data: campaigns, isLoading, isError, refetch } = useCampaigns({
    category: activeCategory,
    search: debouncedSearch,
  });
```

Replace all references to the mock `campaigns` array with `campaigns ?? []`. Add the same empty/loading/error `ListEmptyComponent` as in home.tsx.

- [ ] **Step 3: Update `hope-card/app/modal.tsx`**

Remove:
```typescript
import { campaigns } from '@digdon/mock-data/campaigns';
```

Add:
```typescript
import { useLocalSearchParams } from 'expo-router';
import { useCampaign } from '../hooks/useCampaign';
```

In the screen function, replace the mock lookup:
```typescript
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: campaign, isLoading, isError } = useCampaign(id ?? '');
```

Add loading and error states before the main return:
```typescript
  if (isLoading) return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: colors.onSurfaceVariant, fontFamily: 'Manrope_500Medium' }}>Loading...</Text>
    </View>
  );

  if (isError || !campaign) return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: colors.onSurfaceVariant, fontFamily: 'Manrope_500Medium' }}>Campaign not found</Text>
    </View>
  );
```

Update all field references in the JSX: `campaign.image` → `campaign.cover_image_url`, `campaign.target` → `campaign.target_amount`, `campaign.raised` → `campaign.collected_amount`.

- [ ] **Step 4: Run typecheck**

```bash
cd hope-card && npm run typecheck
```
Expected: no errors

- [ ] **Step 5: Commit**

```bash
git add hope-card/app/(tabs)/home.tsx hope-card/app/(tabs)/explore.tsx hope-card/app/modal.tsx
git commit -m "feat(hope-card): wire campaign screens to backend API"
```

---

## Task 11: Wire profile and impact screens

**Files:**
- Modify: `hope-card/app/(tabs)/profile.tsx`
- Modify: `hope-card/app/(tabs)/impact.tsx`

- [ ] **Step 1: Wire `hope-card/app/(tabs)/profile.tsx`**

Add imports:
```typescript
import { useAuth } from '../../hooks/useAuth';
import { useProfile } from '../../hooks/useProfile';
import * as ImagePicker from 'expo-image-picker';
```

Add in the screen function (before existing state):
```typescript
  const { logout } = useAuth();
  const { profileQuery, update, uploadPhoto } = useProfile();
  const profile = profileQuery.data;

  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string | null>(null);

  // Sync form when profile loads
  React.useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name);
      setLastName(profile.last_name);
      setPhone(profile.phone ?? '');
    }
  }, [profile]);

  async function handleSave() {
    setSaving(true);
    setSaveError(null);
    try {
      await update.mutateAsync({ first_name: firstName, last_name: lastName, phone });
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function handlePickPhoto() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];
    const ext = asset.uri.split('.').pop() ?? 'jpg';
    await uploadPhoto.mutateAsync({
      uri: asset.uri,
      name: `photo.${ext}`,
      type: asset.mimeType ?? 'image/jpeg',
    });
  }
```

Replace hardcoded user name in the header with:
```typescript
{profile ? `${profile.first_name} ${profile.last_name}` : 'Loading...'}
```

Wire the name, phone, and email `TextInput`s to the state variables above. Wire the "Save" (or equivalent update) button to `handleSave`. Wire Sign Out button to `logout()`.

- [ ] **Step 2: Wire `hope-card/app/(tabs)/impact.tsx`**

Add imports:
```typescript
import { useProfile } from '../../hooks/useProfile';
```

Add in the screen function:
```typescript
  const { impactQuery } = useProfile();
  const impact = impactQuery.data;
  const TRAIN_LIMIT = 250000;
  const donatedAmount = impact?.total_donations_amount ?? 0;
  const donationsCount = impact?.total_donations_count ?? 0;
```

Replace the hardcoded donation total in the "Donations" tab with `donatedAmount` and `donationsCount`. The HOPECARD points/membership tier section (Gold Member, 12,840 pts, etc.) remains as static mock UI — do not change it.

- [ ] **Step 3: Run typecheck**

```bash
cd hope-card && npm run typecheck
```
Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add hope-card/app/(tabs)/profile.tsx hope-card/app/(tabs)/impact.tsx
git commit -m "feat(hope-card): wire profile and impact screens to backend API"
```

---

## Task 12: Wire cart, checkout, and history screens

**Files:**
- Modify: `hope-card/app/(tabs)/wallet.tsx`
- Modify: `hope-card/app/checkout.tsx`
- Modify: `hope-card/app/history.tsx`

- [ ] **Step 1: Wire `hope-card/app/(tabs)/wallet.tsx`**

Add imports:
```typescript
import { useCart } from '../../hooks/useCart';
import { useProfile } from '../../hooks/useProfile';
```

Add in the screen function:
```typescript
  const { cartQuery, updateItem, removeItem } = useCart();
  const { profileQuery } = useProfile();
  const cart = cartQuery.data;
  const profile = profileQuery.data;

  const TRAIN_LIMIT = 250000;
  const usedAmount = profile?.total_donations_amount ?? 0;
  const trainPct = usedAmount / TRAIN_LIMIT;
  const trainRemaining = TRAIN_LIMIT - usedAmount;

  const subtotal = (cart?.items ?? []).reduce(
    (sum, item) => sum + item.face_value * item.quantity,
    0,
  );
  const processingFee = Math.round(subtotal * 0.02);
  const total = subtotal + processingFee;
```

Replace hardcoded cart items with `cart?.items ?? []`. Wire quantity `+` button to `updateItem.mutate({ itemId: item.id, quantity: item.quantity + 1 })`. Wire `-` button to `updateItem.mutate({ itemId: item.id, quantity: item.quantity - 1 })` (guard against 0). Wire remove button to `removeItem.mutate(item.id)`.

Replace hardcoded TRAIN Law values with `usedAmount`, `trainPct`, `trainRemaining`. Replace hardcoded subtotal/fee/total with computed values.

Show loading state when `cartQuery.isLoading`.

- [ ] **Step 2: Wire `hope-card/app/checkout.tsx`**

Add imports:
```typescript
import { useCart } from '../hooks/useCart';
import { useProfile } from '../hooks/useProfile';
import { usePurchases } from '../hooks/usePurchases';
import * as WebBrowser from 'expo-web-browser';
```

Add in the screen function:
```typescript
  const { cartQuery } = useCart();
  const { profileQuery } = useProfile();
  const { checkout } = usePurchases();
  const cart = cartQuery.data;
  const profile = profileQuery.data;
  const [selectedMethod, setSelectedMethod] = React.useState<'gcash' | 'card' | 'bank' | 'maya' | 'bank_transfer'>('card');
  const [error, setError] = React.useState<string | null>(null);

  const TRAIN_LIMIT = 250000;
  const usedAmount = profile?.total_donations_amount ?? 0;
  const trainPct = usedAmount / TRAIN_LIMIT;

  const subtotal = (cart?.items ?? []).reduce(
    (sum, item) => sum + item.face_value * item.quantity,
    0,
  );
  const processingFee = Math.round(subtotal * 0.02);
  const total = subtotal + processingFee;

  async function handleCheckout() {
    setError(null);
    try {
      const res = await checkout.mutateAsync({ payment_method: selectedMethod });
      if (res.checkout_url) {
        await WebBrowser.openBrowserAsync(res.checkout_url);
      }
      router.replace('/confirmation');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Checkout failed');
    }
  }
```

Replace hardcoded order items with `cart?.items ?? []`. Replace hardcoded totals with computed values. Replace hardcoded TRAIN Law with `usedAmount` and `trainPct`. Wire "Complete Donation" button to `handleCheckout`. Wire payment method tabs to `setSelectedMethod`. Add error display.

- [ ] **Step 3: Wire `hope-card/app/history.tsx`**

Add imports:
```typescript
import { usePurchases } from '../hooks/usePurchases';
```

Add in the screen function:
```typescript
  const { history } = usePurchases();
  const purchases = history.data ?? [];
```

Replace the hardcoded history array with `purchases`. Map `Purchase` fields to the existing item card UI:
- Title: `purchase.hopecard.campaign.title`
- Date: `new Date(purchase.purchased_at).toLocaleDateString()`
- Amount: `₱${purchase.amount_paid.toLocaleString()}`
- Status: `purchase.status`

Add loading state when `history.isLoading`.

- [ ] **Step 4: Run typecheck**

```bash
cd hope-card && npm run typecheck
```
Expected: no errors

- [ ] **Step 5: Commit**

```bash
git add hope-card/app/(tabs)/wallet.tsx hope-card/app/checkout.tsx hope-card/app/history.tsx
git commit -m "feat(hope-card): wire cart, checkout, and history screens to backend API"
```

---

## Task 13: Wire notifications screen

**Files:**
- Modify: `hope-card/app/notifications.tsx`

- [ ] **Step 1: Wire `hope-card/app/notifications.tsx`**

Add imports:
```typescript
import { useNotifications } from '../hooks/useNotifications';
```

Add in the screen function:
```typescript
  const { notificationsQuery, markRead } = useNotifications();
  const notifications = notificationsQuery.data ?? [];
```

Replace the hardcoded notifications array with `notifications`. Map `DonorNotification` fields to the existing card UI:
- `notification.title`
- `notification.message`
- `notification.created_at` → `new Date(notification.created_at).toLocaleDateString()`
- `notification.is_read` → dim the card if true

When a notification card is tapped:
```typescript
onPress={() => markRead.mutate(notification.id)}
```

Add loading state when `notificationsQuery.isLoading`.

- [ ] **Step 2: Run typecheck**

```bash
cd hope-card && npm run typecheck
```
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add hope-card/app/notifications.tsx
git commit -m "feat(hope-card): wire notifications screen to backend API"
```

---

## Task 14: Verification — clean, typed, tested

- [ ] **Step 1: Verify no backend code in this repo**

```bash
cd hope-card && grep -r "NestJS\|@nestjs\|@Module\|@Controller\|@Injectable\|@Entity\|TypeORM\|createClient\|SUPABASE_SERVICE_ROLE" --include="*.ts" --include="*.tsx" .
```
Expected: no matches

- [ ] **Step 2: Verify no mock data imports in screen files**

```bash
cd hope-card && grep -r "mock-data" app/ --include="*.tsx"
```
Expected: no matches

- [ ] **Step 3: Run full test suite**

```bash
cd hope-card && npm test
```
Expected: all tests pass, coverage ≥ 80% for tracked files

- [ ] **Step 4: Run typecheck**

```bash
cd hope-card && npm run typecheck
```
Expected: no errors

- [ ] **Step 5: Commit final verification**

```bash
git add -A
git commit -m "feat(hope-card): complete backend wiring — all screens connected to hopecard-donor-service"
```
