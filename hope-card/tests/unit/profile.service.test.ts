import { getProfile, updateProfile, uploadProfilePhoto, getProfileImpact } from '../../services/profile.service';

jest.mock('../../services/api', () => ({
  apiGet: jest.fn(),
  apiPut: jest.fn(),
  apiUpload: jest.fn(),
}));

import { apiGet, apiPut, apiUpload } from '../../services/api';

beforeEach(() => jest.clearAllMocks());

describe('getProfile', () => {
  it('calls apiGet /profile', async () => {
    (apiGet as jest.Mock).mockResolvedValueOnce({ id: '1' });
    await getProfile();
    expect(apiGet).toHaveBeenCalledWith('/profile');
  });
});

describe('updateProfile', () => {
  it('calls apiPut /profile with payload', async () => {
    (apiPut as jest.Mock).mockResolvedValueOnce({ id: '1' });
    const payload = { first_name: 'Jane', last_name: 'Doe' };
    await updateProfile(payload);
    expect(apiPut).toHaveBeenCalledWith('/profile', payload);
  });
});

describe('uploadProfilePhoto', () => {
  it('calls apiUpload /profile/photo authenticated', async () => {
    (apiUpload as jest.Mock).mockResolvedValueOnce({ key: 'k', url: 'u' });
    const file = { uri: 'file://x.jpg', name: 'x.jpg', type: 'image/jpeg' };
    await uploadProfilePhoto(file);
    expect(apiUpload).toHaveBeenCalledWith('/profile/photo', file, true);
  });
});

describe('getProfileImpact', () => {
  it('calls apiGet /profile/impact', async () => {
    (apiGet as jest.Mock).mockResolvedValueOnce({ total_donations_amount: 100, total_donations_count: 2 });
    await getProfileImpact();
    expect(apiGet).toHaveBeenCalledWith('/profile/impact');
  });
});
