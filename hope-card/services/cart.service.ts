import { apiGet, apiPost, apiPatch, apiDelete } from './api';

export type CartItem = {
  id: string;
  cart_id: string;
  campaign_id: string;
  face_value: number;
  quantity: number;
  campaign: {
    id: string;
    title: string;
    cover_image_url: string | null;
  };
};

export type Cart = {
  id: string;
  items: CartItem[];
};

export function getCart(): Promise<Cart> {
  return apiGet<Cart>('/cart');
}

export function addToCart(
  campaign_id: string,
  face_value: number,
  quantity = 1,
): Promise<Cart> {
  return apiPost<Cart>('/cart/items', { campaign_id, face_value, quantity });
}

export function updateCartItem(itemId: string, quantity: number): Promise<Cart> {
  return apiPatch<Cart>(`/cart/items/${itemId}`, { quantity });
}

export function removeCartItem(itemId: string): Promise<Cart> {
  return apiDelete<Cart>(`/cart/items/${itemId}`);
}
