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
