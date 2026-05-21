import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, borderRadius } from '@digdon/ui';
import { SafeLayout } from '@/components/layout/SafeLayout';
import { MaterialSymbols } from '@/components/ui/MaterialSymbols';
import { ProgressBar } from '@/components/ui/ProgressBar';

export default function CheckoutScreen() {
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState('card');
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  return (
    <SafeLayout hideHeader>
      {/* Custom Header for Modal */}
      <View style={styles.modalHeader}>
        <View style={styles.headerLeft}>
          <Image
            source={require('../assets/images/hopecard_logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.brandText}>HOPECARD</Text>
        </View>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <MaterialSymbols name="close" size={24} color={colors.onSurface} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>


        {/* Order Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Order Summary</Text>

          <View style={styles.itemsList}>
            <SummaryItem qty="01x" title="Rural Education Fund" price="₱5,000" />
            <SummaryItem qty="02x" title="Reforestation Project" price="₱5,000" />

            <View style={styles.subtotalRow}>
              <Text style={styles.subtotalLabel}>Subtotal</Text>
              <Text style={styles.subtotalPrice}>₱10,000</Text>
            </View>
            <View style={styles.feeRow}>
              <Text style={styles.feeLabel}>Processing Fee</Text>
              <Text style={styles.feeValue}>₱0</Text>
            </View>
          </View>

          <View style={styles.totalBox}>
            <View>
              <Text style={styles.totalTag}>Total Donation</Text>
              <Text style={styles.taxLegislation}>Tax-deductible under RA 10963</Text>
            </View>
            <Text style={styles.totalAmount}>₱10,000</Text>
          </View>

          {/* TRAIN Law Compliance */}
          <View style={styles.trainCompliance}>
            <View style={styles.trainHeader}>
              <View style={styles.trainLabelRow}>
                <MaterialSymbols name="verified_user" size={16} color={colors.primary} fill />
                <Text style={styles.trainLabel}>TRAIN Law Limit Usage</Text>
              </View>
              <Text style={styles.trainPercent}>4.00%</Text>
            </View>
            <ProgressBar progress={0.04} height={10} />
            <View style={styles.limitRow}>
              <Text style={styles.limitText}>₱10,000 used</Text>
              <Text style={styles.limitText}>₱250,000 Annual Limit</Text>
            </View>
          </View>
        </View>

        {/* Payment Methods */}
        <View style={styles.paymentMethods}>
          <Text style={styles.paymentTitle}>Select Payment Method</Text>
          <View style={styles.methodsGrid}>
            <MethodBtn
              id="card"
              icon="credit_card"
              label="Credit/Debit"
              selected={selectedMethod === 'card'}
              onPress={setSelectedMethod}
            />
            <MethodBtn
              id="wallet"
              icon="account_balance_wallet"
              label="Digital Wallet"
              selected={selectedMethod === 'wallet'}
              onPress={setSelectedMethod}
            />
            <MethodBtn
              id="bank"
              icon="account_balance"
              label="Bank Transfer"
              selected={selectedMethod === 'bank'}
              onPress={setSelectedMethod}
            />
          </View>
        </View>

        {/* Payment Form */}
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Card Number</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.formInput}
                value="•••• •••• •••• 4421"
                editable={false}
              />
              <MaterialSymbols name="lock" size={20} color={colors.primary} fill />
            </View>
          </View>

          <View style={styles.formRow}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Expiry Date</Text>
              <TextInput 
                style={[styles.formInput, focusedInput === 'expiry' && styles.formInputFocused]} 
                placeholder="MM/YY" 
                placeholderTextColor={colors.outlineVariant}
                onFocus={() => setFocusedInput('expiry')}
                onBlur={() => setFocusedInput(null)}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>CVV</Text>
              <TextInput 
                style={[styles.formInput, focusedInput === 'cvv' && styles.formInputFocused]} 
                placeholder="•••" 
                placeholderTextColor={colors.outlineVariant} 
                secureTextEntry
                onFocus={() => setFocusedInput('cvv')}
                onBlur={() => setFocusedInput(null)}
              />
            </View>
          </View>

          <View style={styles.securityNote}>
            <MaterialSymbols name="info" size={18} color={colors.primary} fill />
            <Text style={styles.securityText}>
              Your payment information is encrypted and secured by PCIDSS standards. We do not store your full card details.
            </Text>
          </View>
        </View>

        {/* CTA */}
        <View style={styles.ctaContainer}>
          <TouchableOpacity
            style={styles.completeBtn}
            activeOpacity={0.8}
            onPress={() => router.push('/confirmation')}
          >
            <Text style={styles.completeBtnText}>Complete Donation</Text>
          </TouchableOpacity>
          <Text style={styles.legalNote}>
            By clicking "Complete Donation", you agree to our Terms of Service and Privacy Policy. Your contribution is tax-deductible under RA 10963.
          </Text>
        </View>
      </ScrollView>
    </SafeLayout>
  );
}

function SummaryItem({ qty, title, price }: any) {
  return (
    <View style={styles.summaryItem}>
      <Text style={styles.itemTitle}>
        <Text style={styles.qtyText}>{qty} </Text>
        {title}
      </Text>
      <Text style={styles.itemPrice}>{price}</Text>
    </View>
  );
}

function MethodBtn({ id, icon, label, selected, onPress }: any) {
  return (
    <TouchableOpacity
      style={[styles.methodBtn, selected && styles.methodBtnSelected]}
      onPress={() => onPress(id)}
    >
      <MaterialSymbols
        name={icon}
        size={24}
        color={selected ? colors.primary : colors.outline}
        fill={selected}
      />
      <Text style={[styles.methodLabel, selected && styles.methodLabelSelected]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.lg,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logo: {
    width: 28,
    height: 28,
  },
  brandText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#F28D83',
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    letterSpacing: -1,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceContainerLow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    paddingVertical: 32,
    position: 'relative',
  },
  track: {
    position: 'absolute',
    top: 48,
    left: 60,
    right: 60,
    height: 2,
    backgroundColor: colors.surfaceContainerHigh,
    zIndex: -1,
  },
  stepItem: {
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 8,
    gap: 8,
  },
  stepDone: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.secondaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepActive: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: colors.primaryFixed,
  },
  stepPending: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceContainerHigh,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepActiveText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '800',
  },
  stepPendingText: {
    color: colors.outline,
    fontSize: 14,
    fontWeight: '800',
  },
  stepLabelDone: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.outline,
    textTransform: 'uppercase',
  },
  stepLabelActive: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
    textTransform: 'uppercase',
  },
  stepLabelPending: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.outline,
    textTransform: 'uppercase',
  },
  summaryCard: {
    marginHorizontal: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(27,28,27,0.05)',
    shadowColor: '#1b1c1b',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.04,
    shadowRadius: 40,
    elevation: 3,
    gap: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.outline,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  itemsList: {
    gap: 12,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  qtyText: {
    color: colors.primary,
    fontWeight: '900',
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.onSurfaceVariant,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.onSurface,
  },
  subtotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(218, 193, 190, 0.2)',
  },
  subtotalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.onSurfaceVariant,
  },
  subtotalPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.onSurface,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  feeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.onSurfaceVariant,
  },
  feeValue: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primary,
  },
  totalBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(151, 69, 62, 0.05)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(151, 69, 62, 0.1)',
  },
  totalTag: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
    textTransform: 'uppercase',
  },
  taxLegislation: {
    fontSize: 9,
    fontWeight: '600',
    color: colors.outline,
  },
  totalAmount: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.primary,
  },
  trainCompliance: {
    gap: 12,
  },
  trainHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trainLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  trainLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.onSurfaceVariant,
    textTransform: 'uppercase',
  },
  trainPercent: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.primary,
  },
  limitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  limitText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.outline,
  },
  paymentMethods: {
    paddingHorizontal: 20,
    marginTop: 32,
    gap: 16,
  },
  paymentTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.onSurface,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  methodsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  methodBtn: {
    flex: 1,
    backgroundColor: colors.surfaceContainerLow,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    gap: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  methodBtnSelected: {
    backgroundColor: 'white',
    borderColor: colors.primary,
  },
  methodLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.outline,
    textAlign: 'center',
  },
  methodLabelSelected: {
    color: colors.onSurface,
  },
  formContainer: {
    marginHorizontal: 20,
    marginTop: 32,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 20,
    padding: 24,
    gap: 20,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.outlineVariant,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    paddingLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(218, 193, 190, 0.2)',
  },
  formInput: {
    flex: 1,
    height: 56,
    fontSize: 16,
    fontWeight: '600',
    color: colors.onSurface,
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  formInputFocused: {
    borderColor: colors.outlineFocus,
    borderWidth: 2,
  },
  formRow: {
    flexDirection: 'row',
    gap: 16,
  },
  securityNote: {
    flexDirection: 'row',
    backgroundColor: 'rgba(151, 69, 62, 0.08)',
    padding: 12,
    borderRadius: 12,
    gap: 12,
    alignItems: 'flex-start',
  },
  securityText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '600',
    color: colors.onPrimaryFixedVariant,
    lineHeight: 16,
  },
  ctaContainer: {
    paddingHorizontal: 20,
    marginTop: 32,
    gap: 16,
  },
  completeBtn: {
    height: 64,
    backgroundColor: colors.primaryContainer,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primaryContainer,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 4,
  },
  completeBtnText: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.onPrimaryContainer,
  },
  legalNote: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.outlineVariant,
    fontWeight: '600',
    lineHeight: 18,
  }
});
