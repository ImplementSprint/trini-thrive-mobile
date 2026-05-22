import { colors, borderRadius, spacing } from '@digdon/ui';
import { StyleSheet, Platform } from 'react-native';

export const Colors = {
  light: {
    text: colors.onSurface,
    background: colors.background,
    tint: colors.primary,
    icon: colors.onSurfaceVariant,
    tabIconDefault: colors.onSurfaceVariant,
    tabIconSelected: colors.primary,
  },
  dark: {
    text: colors.onSurface,
    background: colors.background,
    tint: colors.primary,
    icon: colors.onSurfaceVariant,
    tabIconDefault: colors.onSurfaceVariant,
    tabIconSelected: colors.primary,
  },
};

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 25 : 0,
  },
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    shadowColor: colors.onSurface,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  heading1: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.primary,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
  },
  body: {
    fontSize: 16,
    color: colors.onSurfaceVariant,
    fontFamily: 'Manrope_500Medium',
  }
});
