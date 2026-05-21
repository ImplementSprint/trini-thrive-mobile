import { campaigns } from '@digdon/mock-data';

describe('mockData campaigns', () => {
  it('defines an array of mock campaigns', () => {
    expect(campaigns).toBeDefined();
    expect(Array.isArray(campaigns)).toBe(true);
    expect(campaigns.length).toBe(3);

    const firstCampaign = campaigns[0];
    expect(firstCampaign.id).toBe('1');
    expect(firstCampaign.title).toBe('Empower a New Generation of Scholars');
    expect(firstCampaign.target).toBe(25000);
    expect(firstCampaign.raised).toBe(20500);
    expect(firstCampaign.category).toBe('Education');
  });
});
