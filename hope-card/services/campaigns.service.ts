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
  if (params.limit != null) qs.set('limit', String(params.limit));
  if (params.category && params.category !== 'All') qs.set('category', params.category);
  if (params.search && params.search.trim().length > 0) qs.set('search', params.search.trim());
  const query = qs.toString();
  return apiGet<any>(`/campaigns${query ? `?${query}` : ''}`, true).then(
    (res) => (Array.isArray(res) ? res : res.campaigns ?? []),
  );
}

export function getCampaignById(id: string): Promise<Campaign> {
  return apiGet<any>(`/campaigns/${id}`, true).then((res) => res.campaign ?? res);
}

export function getCampaignPublic(id: string): Promise<Campaign> {
  return apiGet<any>(`/campaigns/public/${id}`, false).then((res) => res.campaign ?? res);
}
