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
  successUrl?: string;
  cancelUrl?: string;
};

export type CheckoutResponse = {
  checkout_url: string;
  purchase_id: string;
};

export function checkout(payload: CheckoutPayload): Promise<CheckoutResponse> {
  return apiPost<any>('/purchases/checkout', payload).then((res) => ({
    checkout_url: res.checkoutUrl ?? res.checkout_url,
    purchase_id: res.checkoutId ?? res.purchase_id,
  }));
}

export function getPurchaseHistory(): Promise<Purchase[]> {
  return apiGet<any>('/purchases').then((res) => (Array.isArray(res) ? res : res.purchases ?? []));
}
