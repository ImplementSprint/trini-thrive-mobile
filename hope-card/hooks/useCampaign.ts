import { useQuery } from '@tanstack/react-query';
import { getCampaignPublic } from '../services/campaigns.service';

export function useCampaign(id: string) {
  return useQuery({
    queryKey: ['campaign', id],
    queryFn: () => getCampaignPublic(id),
    enabled: !!id,
  });
}
