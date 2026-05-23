import { getCart, addToCart, updateCartItem, removeCartItem } from '../../services/cart.service';

jest.mock('../../services/api', () => ({
  apiGet: jest.fn(),
  apiPost: jest.fn(),
  apiPatch: jest.fn(),
  apiDelete: jest.fn(),
}));

import { apiGet, apiPost, apiPatch, apiDelete } from '../../services/api';

beforeEach(() => jest.clearAllMocks());

describe('getCart', () => {
  it('calls apiGet /cart', async () => {
    (apiGet as jest.Mock).mockResolvedValueOnce({ id: '1', items: [] });
    await getCart();
    expect(apiGet).toHaveBeenCalledWith('/cart');
  });
});

describe('addToCart', () => {
  it('calls apiPost /cart/items with campaign_id, face_value, quantity', async () => {
    (apiPost as jest.Mock).mockResolvedValueOnce({ id: '1', items: [] });
    await addToCart('campaign-1', 500, 2);
    expect(apiPost).toHaveBeenCalledWith('/cart/items', { campaign_id: 'campaign-1', face_value: 500, quantity: 2 });
  });

  it('defaults quantity to 1', async () => {
    (apiPost as jest.Mock).mockResolvedValueOnce({ id: '1', items: [] });
    await addToCart('campaign-1', 500);
    expect(apiPost).toHaveBeenCalledWith('/cart/items', { campaign_id: 'campaign-1', face_value: 500, quantity: 1 });
  });
});

describe('updateCartItem', () => {
  it('calls apiPatch /cart/items/:id with quantity', async () => {
    (apiPatch as jest.Mock).mockResolvedValueOnce({ id: '1', items: [] });
    await updateCartItem('item-1', 3);
    expect(apiPatch).toHaveBeenCalledWith('/cart/items/item-1', { quantity: 3 });
  });
});

describe('removeCartItem', () => {
  it('calls apiDelete /cart/items/:id', async () => {
    (apiDelete as jest.Mock).mockResolvedValueOnce({ id: '1', items: [] });
    await removeCartItem('item-1');
    expect(apiDelete).toHaveBeenCalledWith('/cart/items/item-1');
  });
});
