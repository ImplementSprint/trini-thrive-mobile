import { Colors, globalStyles } from '@/constants/theme';

describe('theme', () => {
  it('exposes Colors object with light and dark profiles', () => {
    expect(Colors).toBeDefined();
    expect(Colors.light).toBeDefined();
    expect(Colors.dark).toBeDefined();
    expect(Colors.light.tint).toBe('#97453E');
    expect(Colors.dark.tint).toBe('#97453E');
  });

  it('defines globalStyles', () => {
    expect(globalStyles).toBeDefined();
    expect(globalStyles.container).toBeDefined();
    expect(globalStyles.safeArea).toBeDefined();
    expect(globalStyles.card).toBeDefined();
    expect(globalStyles.heading1).toBeDefined();
    expect(globalStyles.body).toBeDefined();
  });
});
