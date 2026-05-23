import { apiGet } from './api';

export type Campaign = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  target_amount: number;
  collected_amount: number;
  progress_pct: number;
  cover_image_url: string | null;
  status: string;
  end_date: string | null;
};

export type CampaignListParams = {
  limit?: number;
  category?: string;
  search?: string;
};

export function getCampaigns(params: CampaignListParams = {}): Promise<Campaign[]> {
  const qs = new URLSearchParams();
  if (params.limit) qs.set('limit', String(params.limit));
  if (params.category && params.category !== 'All') qs.set('category', params.category);
  if (params.search) qs.set('search', params.search);
  const query = qs.toString();
  return apiGet<Campaign[]>(`/campaigns${query ? `?${query}` : ''}`, true);
}

export function getCampaignById(id: string): Promise<Campaign> {
  return apiGet<Campaign>(`/campaigns/${id}`, true);
}

export function getCampaignPublic(id: string): Promise<Campaign> {
  return apiGet<Campaign>(`/campaigns/public/${id}`, false);
}
