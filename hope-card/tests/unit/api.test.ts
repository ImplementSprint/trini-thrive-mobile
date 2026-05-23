import { apiGet, apiPost, setToken, ApiError, setUnauthorizedHandler } from '../../services/api';

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
