import { getNotifications, markNotificationRead } from '../../services/notifications.service';

jest.mock('../../services/api', () => ({
  apiGet: jest.fn(),
  apiPatch: jest.fn(),
}));

import { apiGet, apiPatch } from '../../services/api';

beforeEach(() => jest.clearAllMocks());

describe('getNotifications', () => {
  it('calls apiGet /notifications', async () => {
    (apiGet as jest.Mock).mockResolvedValueOnce([]);
    await getNotifications();
    expect(apiGet).toHaveBeenCalledWith('/notifications');
  });
});

describe('markNotificationRead', () => {
  it('calls apiPatch /notifications/:id/read with empty body', async () => {
    (apiPatch as jest.Mock).mockResolvedValueOnce(undefined);
    await markNotificationRead('notif-1');
    expect(apiPatch).toHaveBeenCalledWith('/notifications/notif-1/read', {});
  });
});
