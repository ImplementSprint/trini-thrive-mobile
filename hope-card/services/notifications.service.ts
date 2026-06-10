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
