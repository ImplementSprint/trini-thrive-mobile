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
    staleTime: 0,
    refetchOnWindowFocus: true,
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
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  return { profileQuery, update, uploadPhoto, impactQuery };
}
