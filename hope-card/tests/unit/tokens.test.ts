import { colors, spacing, borderRadius } from '@digdon/ui';

describe('theme tokens', () => {
  it('exposes expected color scheme values', () => {
    expect(colors).toBeDefined();
    expect(colors.primary).toBe('#97453E');
    expect(colors.background).toBe('#FCF9F8');
    expect(colors.surface).toBe('#FCF9F8');
  });

  it('exposes spacing presets', () => {
    expect(spacing).toBeDefined();
    expect(spacing.sm).toBe(8);
    expect(spacing.md).toBe(16);
    expect(spacing.lg).toBe(24);
  });

  it('exposes borderRadius scale', () => {
    expect(borderRadius).toBeDefined();
    expect(borderRadius.sm).toBe(8);
    expect(borderRadius.md).toBe(16);
    expect(borderRadius.lg).toBe(24);
  });
});
