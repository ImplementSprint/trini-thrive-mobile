import { checkout, getPurchaseHistory } from '../../services/purchases.service';

jest.mock('../../services/api', () => ({
  apiGet: jest.fn(),
  apiPost: jest.fn(),
}));

import { apiGet, apiPost } from '../../services/api';

beforeEach(() => jest.clearAllMocks());

describe('checkout', () => {
  it('calls apiPost /purchases/checkout with payment method', async () => {
    (apiPost as jest.Mock).mockResolvedValueOnce({ checkout_url: 'https://pay.example.com', purchase_id: 'p1' });
    const result = await checkout({ payment_method: 'card' });
    expect(apiPost).toHaveBeenCalledWith('/purchases/checkout', { payment_method: 'card' });
    expect(result.purchase_id).toBe('p1');
  });
});

describe('getPurchaseHistory', () => {
  it('calls apiGet /purchases', async () => {
    (apiGet as jest.Mock).mockResolvedValueOnce([]);
    await getPurchaseHistory();
    expect(apiGet).toHaveBeenCalledWith('/purchases');
  });
});
