import { apiGet, apiPost } from './api';

export type Purchase = {
  id: string;
  hopecard_id: string;
  amount_paid: number;
  payment_method: string;
  status: string;
  purchased_at: string;
  hopecard: {
    card_code: string;
    campaign: { title: string };
  };
};

export type CheckoutPayload = {
  payment_method: 'gcash' | 'card' | 'bank' | 'maya' | 'bank_transfer';
};

export type CheckoutResponse = {
  checkout_url: string;
  purchase_id: string;
};

export function checkout(payload: CheckoutPayload): Promise<CheckoutResponse> {
  return apiPost<CheckoutResponse>('/purchases/checkout', payload);
}

export function getPurchaseHistory(): Promise<Purchase[]> {
  return apiGet<Purchase[]>('/purchases');
}
