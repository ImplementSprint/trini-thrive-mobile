export interface Campaign {
  id: string;
  title: string;
  description: string;
  image: string;
  target: number;
  raised: number;
  category: string;
  impactScore?: number;
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
