import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface MaterialSymbolsProps {
  name: string;
  size?: number;
  color?: string;
  fill?: boolean;
  style?: any;
  strokeWidth?: number;
}

// Simple wrapper for icons to simulate Material Symbols
export const MaterialSymbols: React.FC<MaterialSymbolsProps> = ({ 
  name, 
  size = 24, 
  color = 'black',
  fill = false,
  style,
  ...props
}) => {
  // Mapping some common Material Symbols to MaterialCommunityIcons
  const iconMap: Record<string, any> = {
    'home': 'home',
    'favorite': 'heart',
    'account_balance_wallet': 'wallet',
    'person': 'account',
    'close': 'close',
    'lock_person': 'lock',
    'schedule': 'clock-outline',
    'arrow_forward': 'arrow-right',
    'support_agent': 'headphones',
    'logout': 'logout',
    'verified_user': 'check-decagram',
    'verified': 'check-decagram',
    'shopping_cart': 'cart',
    'notifications': 'bell',
    'auto_awesome': 'auto-fix',
    'add_circle': 'plus-circle',
    'redeem': 'gift',
    'medical_services': 'medical-bag',
    'school': 'school',
    'eco': 'leaf',
    'share': 'share-variant',
    'search': 'magnify',
    'stars': 'star',
    'edit': 'pencil',
    'fingerprint': 'fingerprint',
    'history': 'history',
    'receipt_long': 'receipt',
    'credit_card': 'credit-card',
    'dark_mode': 'weather-night',
    'language': 'earth',
    'forest': 'forest',
    'payments': 'cash-multiple',
    'check_circle': 'check-circle',
    'account_balance': 'bank',
    'wallet': 'wallet-outline',
    'currency_bitcoin': 'bitcoin',
    'remove': 'minus',
    'add': 'plus',
    'volunteer_activism': 'heart-multiple',
    'public': 'earth',
  };

  const iconName = iconMap[name] || 'help-circle';
  const finalIconName = fill && !iconName.endsWith('-outline') ? iconName : iconName;

  return (
    <MaterialCommunityIcons 
      name={finalIconName} 
      size={size} 
      color={color} 
    />
  );
};
