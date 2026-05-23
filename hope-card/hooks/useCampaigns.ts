import { useQuery } from '@tanstack/react-query';
import { getCampaigns, CampaignListParams } from '../services/campaigns.service';

export function useCampaigns(params: CampaignListParams = {}) {
  return useQuery({
    queryKey: ['campaigns', params],
    queryFn: () => getCampaigns(params),
  });
}
