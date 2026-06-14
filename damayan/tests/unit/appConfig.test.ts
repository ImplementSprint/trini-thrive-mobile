import getExpoConfig from '../../app.config';

const envKeys = [
  'EXPO_PUBLIC_APP_NAME',
  'EXPO_PUBLIC_APP_ENV',
  'EXPO_PUBLIC_API_BASE_URL',
  'EXPO_PUBLIC_SUPABASE_URL',
  'EXPO_PUBLIC_SUPABASE_ANON_KEY',
] as const;

describe('expo config', () => {
  const originalEnv = { ...process.env };

  function restoreEnv() {
    for (const key of envKeys) {
      if (originalEnv[key] === undefined) {
        delete process.env[key];
      } else if (key === 'EXPO_PUBLIC_APP_ENV') {
        process.env.EXPO_PUBLIC_APP_ENV = originalEnv[key] as NodeJS.ProcessEnv['EXPO_PUBLIC_APP_ENV'];
      } else {
        process.env[key] = originalEnv[key];
      }
    }
  }

  beforeEach(restoreEnv);

  afterAll(restoreEnv);

  it('uses Damayan defaults', () => {
    delete process.env.EXPO_PUBLIC_APP_NAME;
    delete process.env.EXPO_PUBLIC_APP_ENV;
    delete process.env.EXPO_PUBLIC_API_BASE_URL;

    const config = getExpoConfig();

    expect(config.name).toBe('Damayan Mobile');
    expect(config.slug).toBe('damayan-mobile');
    expect(config.android?.package).toBe('com.anonymous.damayanmobile');
    expect(config.ios?.bundleIdentifier).toBe('com.anonymous.damayanmobile');
    expect(config.extra?.environment).toBe('development');
    expect(config.extra?.apiBaseUrl).toBe('http://localhost:3001/api');
  });

  it('accepts configured runtime values', () => {
    process.env.EXPO_PUBLIC_APP_NAME = 'Damayan Staging';
    process.env.EXPO_PUBLIC_APP_ENV = 'staging';
    process.env.EXPO_PUBLIC_API_BASE_URL = 'https://api.example.test';

    const config = getExpoConfig();

    expect(config.name).toBe('Damayan Staging');
    expect(config.extra?.environment).toBe('staging');
    expect(config.extra?.apiBaseUrl).toBe('https://api.example.test');
  });
});
