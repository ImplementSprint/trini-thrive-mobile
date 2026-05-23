import { apiGet, apiPost, apiPut, apiPatch, apiDelete, apiUpload, setToken, ApiError, setUnauthorizedHandler } from '../../services/api';

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

describe('apiPut', () => {
  it('sends method PUT with JSON body and Content-Type header', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ updated: true }),
    });
    const result = await apiPut('/campaigns/1', { title: 'New Title' }, false);
    const call = (global.fetch as jest.Mock).mock.calls[0];
    expect(call[1].method).toBe('PUT');
    expect(call[1].headers['Content-Type']).toBe('application/json');
    expect(call[1].body).toBe(JSON.stringify({ title: 'New Title' }));
    expect(result).toEqual({ updated: true });
  });
});

describe('apiPatch', () => {
  it('sends method PATCH with JSON body and Content-Type header', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ patched: true }),
    });
    const result = await apiPatch('/campaigns/1', { status: 'active' }, false);
    const call = (global.fetch as jest.Mock).mock.calls[0];
    expect(call[1].method).toBe('PATCH');
    expect(call[1].headers['Content-Type']).toBe('application/json');
    expect(call[1].body).toBe(JSON.stringify({ status: 'active' }));
    expect(result).toEqual({ patched: true });
  });
});

describe('apiDelete', () => {
  it('sends method DELETE', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 204,
      json: async () => ({}),
    });
    const result = await apiDelete('/campaigns/1', false);
    const call = (global.fetch as jest.Mock).mock.calls[0];
    expect(call[1].method).toBe('DELETE');
    expect(result).toBeUndefined();
  });
});

describe('204 No Content', () => {
  it('returns undefined for a 204 response', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 204,
      json: async () => ({}),
    });
    const result = await apiGet('/some-endpoint', false);
    expect(result).toBeUndefined();
  });
});

describe('error fallback', () => {
  it('uses res.statusText when error body has no message property', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: async () => ({}),
    });
    await expect(apiGet('/campaigns', false)).rejects.toMatchObject({
      status: 500,
      message: 'Internal Server Error',
    });
  });

  it('uses res.statusText when error body JSON parse fails', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 503,
      statusText: 'Service Unavailable',
      json: async () => { throw new Error('not json'); },
    });
    await expect(apiGet('/campaigns', false)).rejects.toMatchObject({
      status: 503,
      message: 'Service Unavailable',
    });
  });
});

describe('default authenticated parameter', () => {
  it('apiPost uses authenticated=true by default and attaches token', async () => {
    setToken('my-token');
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({}),
    });
    await apiPost('/items', { name: 'test' });
    const call = (global.fetch as jest.Mock).mock.calls[0];
    expect(call[1].headers['Authorization']).toBe('Bearer my-token');
  });

  it('apiPut uses authenticated=true by default and attaches token', async () => {
    setToken('my-token');
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({}),
    });
    await apiPut('/items/1', { name: 'updated' });
    const call = (global.fetch as jest.Mock).mock.calls[0];
    expect(call[1].headers['Authorization']).toBe('Bearer my-token');
  });

  it('apiPatch uses authenticated=true by default and attaches token', async () => {
    setToken('my-token');
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({}),
    });
    await apiPatch('/items/1', { status: 'active' });
    const call = (global.fetch as jest.Mock).mock.calls[0];
    expect(call[1].headers['Authorization']).toBe('Bearer my-token');
  });

  it('apiDelete uses authenticated=true by default and attaches token', async () => {
    setToken('my-token');
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 204,
      json: async () => ({}),
    });
    await apiDelete('/items/1');
    const call = (global.fetch as jest.Mock).mock.calls[0];
    expect(call[1].headers['Authorization']).toBe('Bearer my-token');
  });
});

describe('apiUpload', () => {
  it('sends FormData without explicit Content-Type header', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ url: 'https://example.com/file.jpg' }),
    });
    const result = await apiUpload('/upload', { uri: 'file://photo.jpg', name: 'photo.jpg', type: 'image/jpeg' }, false);
    const call = (global.fetch as jest.Mock).mock.calls[0];
    expect(call[1].method).toBe('POST');
    expect(call[1].body).toBeInstanceOf(FormData);
    expect(call[1].headers['Content-Type']).toBeUndefined();
    expect(result).toEqual({ url: 'https://example.com/file.jpg' });
  });

  it('throws ApiError(401) and calls onUnauthorized handler on 401', async () => {
    const handler = jest.fn();
    setUnauthorizedHandler(handler);
    setToken('stale-token');
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 401, json: async () => ({}) });
    await expect(
      apiUpload('/upload', { uri: 'file://photo.jpg', name: 'photo.jpg', type: 'image/jpeg' })
    ).rejects.toMatchObject({ status: 401 });
    expect(handler).toHaveBeenCalled();
  });
});
