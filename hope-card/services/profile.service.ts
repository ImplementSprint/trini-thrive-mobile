import { apiGet, apiPatch, apiUpload } from './api';

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
  return apiGet<any>('/profile').then((res) => res.profile ?? res);
}

export function updateProfile(payload: UpdateProfilePayload): Promise<DonorProfile> {
  return apiPatch<DonorProfile>('/profile', payload);
}

export function uploadProfilePhoto(
  file: { uri: string; name: string; type: string },
): Promise<UploadPhotoResponse> {
  return apiUpload<UploadPhotoResponse>('/profile/photo', file, true);
}

export function getProfileImpact(): Promise<ProfileImpact> {
  return apiGet<any>('/profile/impact').then((res) => {
    if (res.stats) {
      return {
        ...res,
        total_donations_amount: res.stats.total_donations_amount,
        total_donations_count: res.stats.total_donations_count,
        hopecards_donated: res.stats.hopecards_donated,
      };
    }
    return res;
  });
}
