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

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.status === 401) {
    _onUnauthorized?.();
    throw new ApiError(401, 'Invalid email or password. Please try again.');
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    // body.message can be a string or an object (e.g. ForbiddenException with { reason: ... })
    const rawMessage = body.message ?? body.error ?? res.statusText;
    const message = typeof rawMessage === 'object'
      ? JSON.stringify(rawMessage)
      : String(rawMessage);
    throw new ApiError(res.status, message);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
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

  return handleResponse<T>(res);
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

  return handleResponse<T>(res);
}
