import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, borderRadius, spacing } from '@digdon/ui';

interface HCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'elevated' | 'flat' | 'outline';
}

export const HCard: React.FC<HCardProps> = ({ 
  children, 
  style, 
  variant = 'elevated' 
}) => {
  return (
    <View style={[
      styles.card,
      variant === 'elevated' && styles.elevated,
      variant === 'outline' && styles.outline,
      style
    ]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceContainerLowest,
    padding: spacing.md,
    overflow: 'hidden',
  },
  elevated: {
    shadowColor: colors.onSurface,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  outline: {
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  }
});
