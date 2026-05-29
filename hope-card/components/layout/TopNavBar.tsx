import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { colors, spacing } from '@digdon/ui';
import { MaterialSymbols } from '../ui/MaterialSymbols';
import { useRouter } from 'expo-router';
import { useCart } from '../../hooks/useCart';

export const TopNavBar = () => {
  const router = useRouter();
  const { cartQuery } = useCart();
  const cart = cartQuery.data;
  const itemCount = (cart?.items ?? []).reduce((sum, item) => sum + item.quantity, 0);

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <Image 
          source={require('../../assets/images/hopecard_logo.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.brandText}>HOPECARD</Text>
      </View>
      
      <View style={styles.right}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/wallet')}>
          <View style={styles.cartContainer}>
            <MaterialSymbols name="shopping_cart" size={24} color={colors.primary} fill />
            {itemCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{itemCount}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/notifications')}>
          <MaterialSymbols name="notifications" size={24} color={colors.primary} fill />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 70,
    backgroundColor: colors.background,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.03)',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logo: {
    width: 32,
    height: 32,
  },
  brandText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#F28D83',
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    letterSpacing: -1,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.secondary,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: colors.background,
  },
  badgeText: {
    color: 'white',
    fontSize: 9,
    fontWeight: '900',
  },
});
