import { getCampaigns, getCampaignById, getCampaignPublic } from '../../services/campaigns.service';

jest.mock('../../services/api', () => ({ apiGet: jest.fn() }));
import { apiGet } from '../../services/api';

beforeEach(() => jest.clearAllMocks());

describe('getCampaigns', () => {
  it('calls /campaigns with no params when empty options', async () => {
    (apiGet as jest.Mock).mockResolvedValueOnce([]);
    await getCampaigns();
    expect(apiGet).toHaveBeenCalledWith('/campaigns', true);
  });

  it('appends limit and category query params', async () => {
    (apiGet as jest.Mock).mockResolvedValueOnce([]);
    await getCampaigns({ limit: 3, category: 'Health' });
    expect(apiGet).toHaveBeenCalledWith('/campaigns?limit=3&category=Health', true);
  });

  it('skips category param when value is "All"', async () => {
    (apiGet as jest.Mock).mockResolvedValueOnce([]);
    await getCampaigns({ category: 'All' });
    expect(apiGet).toHaveBeenCalledWith('/campaigns', true);
  });

  it('appends search param', async () => {
    (apiGet as jest.Mock).mockResolvedValueOnce([]);
    await getCampaigns({ search: 'health' });
    expect(apiGet).toHaveBeenCalledWith('/campaigns?search=health', true);
  });
});

describe('getCampaignById', () => {
  it('calls /campaigns/:id authenticated', async () => {
    (apiGet as jest.Mock).mockResolvedValueOnce({ id: '1' });
    await getCampaignById('1');
    expect(apiGet).toHaveBeenCalledWith('/campaigns/1', true);
  });
});

describe('getCampaignPublic', () => {
  it('calls /campaigns/public/:id unauthenticated', async () => {
    (apiGet as jest.Mock).mockResolvedValueOnce({ id: '1' });
    await getCampaignPublic('1');
    expect(apiGet).toHaveBeenCalledWith('/campaigns/public/1', false);
  });
});
