import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, TextInput, Dimensions, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, borderRadius } from '@digdon/ui';
import { SafeLayout } from '@/components/layout/SafeLayout';
import { MaterialSymbols } from '@/components/ui/MaterialSymbols';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useCart } from '../../hooks/useCart';
import { useProfile } from '../../hooks/useProfile';

export default function WalletScreen() {
  const router = useRouter();
  const { cartQuery, updateItem, removeItem } = useCart();
  const { profileQuery } = useProfile();
  const cart = cartQuery.data;
  const profile = profileQuery.data;

  const TRAIN_LIMIT = 250000;
  const usedAmount = profile?.total_donations_amount ?? 0;
  const trainPct = usedAmount / TRAIN_LIMIT;
  const trainRemaining = TRAIN_LIMIT - usedAmount;

  const subtotal = (cart?.items ?? []).reduce(
    (sum, item) => sum + item.face_value * item.quantity,
    0,
  );
  const processingFee = Math.round(subtotal * 0.02);
  const total = subtotal + processingFee;

  if (cartQuery.isLoading) {
    return (
      <SafeLayout>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </SafeLayout>
    );
  }

  return (
    <SafeLayout>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Editorial Header */}
        <View style={styles.header}>
          <Text style={styles.headerLabel}>YOUR SELECTION</Text>
          <Text style={styles.headerTitle}>Impact Basket</Text>
          <Text style={styles.headerSubtitle}>
            Every contribution is a seed of hope. Review your choices and see the ripple effect of your generosity.
          </Text>
        </View>

        {/* Cart Items Canvas */}
        <View style={styles.cartCanvas}>
          {(cart?.items ?? []).map((item) => (
            <CartItem
              key={item.id}
              title={item.campaign.title}
              desc=""
              amount={`₱${item.face_value.toLocaleString()}`}
              qty={String(item.quantity).padStart(2, '0')}
              image={item.campaign.cover_image_url ?? undefined}
              onIncrement={() => updateItem.mutate({ itemId: item.id, quantity: item.quantity + 1 })}
              onDecrement={() => updateItem.mutate({ itemId: item.id, quantity: Math.max(1, item.quantity - 1) })}
              onRemove={() => removeItem.mutate(item.id)}
            />
          ))}
          {(cart?.items ?? []).length === 0 && (
            <Text style={{ textAlign: 'center', color: colors.onSurfaceVariant, padding: 32, fontFamily: 'Manrope_500Medium' }}>Your cart is empty.</Text>
          )}
        </View>

        {/* Summary & Impact Canvas */}
        <View style={styles.summaryCanvas}>
          {/* TRAIN Law Credit Limit */}
          <View style={styles.taxCard}>
            <View style={styles.taxHeader}>
              <MaterialSymbols name="verified_user" size={24} color={colors.tertiary} fill />
              <Text style={styles.taxTitle}>TRAIN Law Credit</Text>
            </View>
            <View style={styles.taxStats}>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Annual Tax-Deductible Limit</Text>
                <Text style={styles.statLimit}>₱{TRAIN_LIMIT.toLocaleString()}</Text>
              </View>
              <ProgressBar progress={trainPct} height={10} />
              <Text style={styles.usageText}>
                ₱{usedAmount.toLocaleString()} <Text style={styles.activeUsage}>of ₱{TRAIN_LIMIT.toLocaleString()} used</Text>
              </Text>
            </View>
            <Text style={styles.taxNote}>
              You can claim up to 10% of your taxable income as a deduction for these donations.
            </Text>
          </View>

          {/* Checkout Summary */}
          <View style={styles.checkoutCard}>
            <Text style={styles.summaryTitle}>Impact Summary</Text>
            <View style={styles.summaryRows}>
              <View style={styles.summaryRow}>
                <Text style={styles.rowLabel}>Subtotal</Text>
                <Text style={styles.rowValue}>₱{subtotal.toLocaleString()}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.rowLabel}>Processing Fee</Text>
                <Text style={styles.rowValue}>₱{processingFee.toLocaleString()}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>₱{total.toLocaleString()}</Text>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.completeBtn} 
              activeOpacity={0.8}
              onPress={() => router.push('/checkout')}
            >
              <Text style={styles.completeBtnText}>Proceed to Payment</Text>
            </TouchableOpacity>

            <View style={styles.secureFooter}>
              <MaterialSymbols name="lock" size={16} color={colors.onSurfaceVariant} fill />
              <Text style={styles.secureText}>SECURE PHILANTHROPIC TRANSFER</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeLayout>
  );
}

function CartItem({ title, desc, amount, qty, image, onIncrement, onDecrement, onRemove }: any) {
  return (
    <View style={styles.cartItem}>
      <View style={styles.itemMainRow}>
        <Image source={{ uri: image }} style={styles.itemImage} />
        <View style={styles.itemContent}>
          <View style={styles.itemHeader}>
            <View style={styles.itemTitleGroup}>
              <Text style={styles.itemTitle}>{title}</Text>
              {!!desc && <Text style={styles.itemDesc} numberOfLines={1}>{desc}</Text>}
            </View>
            <Text style={styles.itemAmount}>{amount}</Text>
          </View>

          <View style={styles.itemActions}>
            <View style={styles.qtyControl}>
              <TouchableOpacity style={styles.qtyBtn} onPress={onDecrement}>
                <MaterialSymbols name="remove" size={20} color={colors.onSurfaceVariant} />
              </TouchableOpacity>
              <Text style={styles.qtyText}>{qty}</Text>
              <TouchableOpacity style={styles.qtyBtn} onPress={onIncrement}>
                <MaterialSymbols name="add" size={20} color={colors.onSurfaceVariant} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.removeBtn} onPress={onRemove}>
              <MaterialSymbols name="delete" size={18} color={colors.error} />
              <Text style={styles.removeText}>Remove</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 120,
    backgroundColor: colors.background,
  },
  header: {
    padding: 24,
    marginBottom: 8,
  },
  headerLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 40,
    fontWeight: '900',
    color: colors.onSurface,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    letterSpacing: -1,
    marginBottom: 16,
  },
  headerSubtitle: {
    fontSize: 18,
    color: colors.onSurfaceVariant,
    lineHeight: 28,
    fontFamily: 'Manrope_500Medium',
    maxWidth: '85%',
  },
  cartCanvas: {
    paddingHorizontal: 24,
    gap: 16,
    marginBottom: 32,
  },
  cartItem: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(27,28,27,0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 2,
  },
  itemMainRow: {
    flexDirection: 'row',
    gap: 16,
  },
  itemImage: {
    width: 100,
    height: 100,
    borderRadius: 16,
    backgroundColor: colors.surfaceContainerLow,
  },
  itemContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemTitleGroup: {
    flex: 1,
    paddingRight: 8,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.onSurface,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  itemDesc: {
    fontSize: 13,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  itemAmount: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary,
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 16,
    padding: 4,
  },
  qtyBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyText: {
    paddingHorizontal: 12,
    fontSize: 14,
    fontWeight: '800',
    color: colors.onSurface,
  },
  removeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    opacity: 0.6,
  },
  removeText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.error,
  },
  summaryCanvas: {
    paddingHorizontal: 24,
    gap: 24,
  },
  taxCard: {
    backgroundColor: '#FFF8F7',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#1b1c1b',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 30,
    elevation: 3,
    gap: 20,
    borderWidth: 1,
    borderColor: 'rgba(151, 69, 62, 0.05)',
  },
  taxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  taxTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.onSurface,
    letterSpacing: -0.5,
  },
  taxStats: {
    gap: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.onSurfaceVariant,
  },
  statLimit: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.onSurface,
  },
  usageText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.onSurface,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  activeUsage: {
    color: colors.primary,
  },
  taxNote: {
    fontSize: 12,
    color: colors.onSurfaceVariant,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  checkoutCard: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 24,
    padding: 24,
    gap: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.onSurface,
  },
  summaryRows: {
    gap: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowLabel: {
    fontSize: 15,
    color: colors.onSurfaceVariant,
    fontFamily: 'Manrope_500Medium',
  },
  rowValue: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.onSurface,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(218, 193, 190, 0.3)',
    marginVertical: 4,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  totalLabel: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.onSurface,
  },
  totalValue: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.primary,
  },
  completeBtn: {
    backgroundColor: colors.primaryContainer,
    borderRadius: 20,
    paddingVertical: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 4,
  },
  completeBtnText: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.onPrimaryContainer,
  },
  secureFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    opacity: 0.6,
  },
  secureText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.onSurfaceVariant,
    letterSpacing: 2,
  },
});

