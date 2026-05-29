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

function mapCartResponse(res: any): Cart {
  const cart = res.cart ?? res;
  if (cart && Array.isArray(cart.items)) {
    cart.items = cart.items.map((item: any) => ({
      ...item,
      campaign: item.campaign ?? {
        id: item.campaign_id,
        title: item.title ?? 'Campaign',
        cover_image_url: item.cover_image_url,
      },
    }));
  }
  return cart;
}

export function getCart(): Promise<Cart> {
  return apiGet<any>('/cart').then(mapCartResponse);
}

export function addToCart(
  campaign_id: string,
  face_value: number,
  quantity = 1,
): Promise<Cart> {
  return apiPost<any>('/cart/items', { campaign_id, face_value, quantity }).then(mapCartResponse);
}

export function updateCartItem(itemId: string, quantity: number): Promise<Cart> {
  return apiPatch<any>(`/cart/items/${itemId}`, { quantity }).then(mapCartResponse);
}

export function removeCartItem(itemId: string): Promise<Cart> {
  return apiDelete<any>(`/cart/items/${itemId}`).then(mapCartResponse);
}

export function clearCart(): Promise<Cart> {
  return apiDelete<any>('/cart/clear').then(mapCartResponse);
}
