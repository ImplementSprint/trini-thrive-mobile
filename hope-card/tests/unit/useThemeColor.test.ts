import { useThemeColor } from '@/hooks/use-theme-color';
import { useColorScheme } from '@/hooks/use-color-scheme';

jest.mock('@/hooks/use-color-scheme', () => ({
  useColorScheme: jest.fn(),
}));

jest.mock('@/constants/theme', () => ({
  Colors: {
    light: {
      text: '#light-text',
    },
    dark: {
      text: '#dark-text',
    },
  },
}));

describe('useThemeColor hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns color from props if provided', () => {
    (useColorScheme as jest.Mock).mockReturnValue('light');
    const color = useThemeColor({ light: '#custom-light' }, 'text');
    expect(color).toBe('#custom-light');
  });

  it('returns active theme default color if prop is omitted', () => {
    (useColorScheme as jest.Mock).mockReturnValue('light');
    const color = useThemeColor({}, 'text');
    expect(color).toBe('#light-text');
  });

  it('falls back to light mode if useColorScheme returns null', () => {
    (useColorScheme as jest.Mock).mockReturnValue(null);
    const color = useThemeColor({}, 'text');
    expect(color).toBe('#light-text');
  });
});
