import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  ViewStyle, 
  TextStyle 
} from 'react-native';
import { colors, borderRadius, spacing } from '@digdon/ui';

interface HButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const HButton: React.FC<HButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
}) => {
  const getVariantStyle = () => {
    switch (variant) {
      case 'primary':
        return { backgroundColor: colors.primaryContainer };
      case 'secondary':
        return { backgroundColor: colors.surfaceContainerHighest };
      case 'outline':
        return { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.outlineVariant };
      case 'ghost':
        return { backgroundColor: 'transparent' };
      default:
        return { backgroundColor: colors.primaryContainer };
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'primary':
        return colors.onPrimaryContainer;
      case 'secondary':
        return colors.onSurface;
      case 'outline':
        return colors.primary;
      case 'ghost':
        return colors.primary;
      default:
        return colors.onPrimaryContainer;
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        getVariantStyle(),
        size === 'sm' && styles.sm,
        size === 'lg' && styles.lg,
        disabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <>
          {icon}
          <Text style={[styles.text, { color: getTextColor() }, textStyle]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  sm: {
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  lg: {
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  text: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
});
