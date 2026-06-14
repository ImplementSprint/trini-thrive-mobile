import { darkTheme, fonts, lightTheme, roleColors, theme } from '../../theme';

describe('theme tokens', () => {
  it('exports stable Damayan colors and fonts', () => {
    expect(theme).toBe(lightTheme);
    expect(lightTheme.primary).toBe('#2E7D32');
    expect(darkTheme.primary).toBe('#81C784');
    expect(roleColors).toEqual({
      site_manager: '#FFB300',
      citizen: '#004D40',
    });
    expect(fonts.black).toMatchObject({
      fontFamily: 'Poppins, -apple-system, sans-serif',
      fontWeight: '900',
    });
  });
});
