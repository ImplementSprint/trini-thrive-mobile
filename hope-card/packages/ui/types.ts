export interface Campaign {
  id: string;
  title: string;
  description: string | null;
  cover_image_url: string | null;
  target_amount: number;
  collected_amount: number;
  progress_pct: number;
  category: string | null;
  status: string;
  end_date: string | null;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  balance: number;
  points: number;
  kindredStatus: 'Silver' | 'Gold' | 'Platinum';
}

export interface Transaction {
  id: string;
  type: 'donation' | 'reward';
  amount: number;
  points?: number;
  date: string;
  status: 'pending' | 'processed' | 'failed';
  campaignId?: string;
  campaignTitle?: string;
}
