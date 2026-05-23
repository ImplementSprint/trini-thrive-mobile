import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, TextInput, ImageBackground } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors, spacing, borderRadius } from '@digdon/ui';
import { campaigns } from '@digdon/mock-data/campaigns';
import { SafeLayout } from '@/components/layout/SafeLayout';
import { MaterialSymbols } from '@/components/ui/MaterialSymbols';

export default function DonationModal() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const campaign = campaigns.find(c => c.id === id) || campaigns[0];

  const [selectedAmount, setSelectedAmount] = useState<number | null>(500);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const amounts = [
    { value: 50, points: 5 },
    { value: 100, points: 10 },
    { value: 250, points: 25 },
    { value: 500, points: 50 },
    { value: 750, points: 75 },
    { value: 1000, points: 100 },
  ];

  return (
    <SafeLayout>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Close Button Header */}
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
            <MaterialSymbols name="close" size={24} color={colors.onSurface} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Choose Impact</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* Campaign Hero Card */}
        <View style={styles.heroWrapper}>
          <ImageBackground
            source={{ uri: campaign.cover_image_url ?? undefined }}
            style={styles.heroBackground}
            imageStyle={{ borderRadius: 24 }}
          >
            <View style={styles.heroOverlay}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{campaign.category}</Text>
              </View>
              <Text style={styles.heroTitle}>{campaign.title}</Text>
            </View>
          </ImageBackground>
        </View>

        {/* Amount Selection */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeading}>Select Donation Amount</Text>
            <View style={styles.pointsNote}>
              <MaterialSymbols name="stars" size={14} color={colors.tertiary} fill />
              <Text style={styles.pointsNoteText}>Earn Status Points</Text>
            </View>
          </View>

          <View style={styles.amountGrid}>
            {amounts.map((item) => (
              <TouchableOpacity
                key={item.value}
                activeOpacity={0.7}
                style={[
                  styles.amountCard,
                  selectedAmount === item.value && styles.selectedCard
                ]}
                onPress={() => setSelectedAmount(item.value)}
              >
                <Text style={[
                  styles.amountValueText,
                  selectedAmount === item.value && styles.selectedAmountValue
                ]}>₱{item.value}</Text>
                <Text style={styles.pointsValueText}>+{item.points} PTS</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.customAmount}>
            <Text style={styles.customLabel}>Or enter custom amount</Text>
            <View style={[styles.inputBox, focusedInput === 'custom' && styles.inputBoxFocused]}>
              <Text style={styles.currency}>₱</Text>
              <TextInput
                style={styles.textInput}
                placeholder="5,000"
                placeholderTextColor={colors.onSurfaceVariant + '40'}
                keyboardType="number-pad"
                onChangeText={(text) => setSelectedAmount(Number(text))}
                onFocus={() => setFocusedInput('custom')}
                onBlur={() => setFocusedInput(null)}
              />
            </View>
          </View>
        </View>

        {/* TRAIN Law Compliance */}
        <View style={styles.complianceSection}>
          <View style={styles.complianceHeader}>
            <MaterialSymbols name="info" size={18} color={colors.tertiary} fill />
            <Text style={styles.complianceHeading}>TRAIN Law Compliance</Text>
          </View>
          <Text style={styles.complianceBody}>
            Donations to certified educational and environmental funds are 100% tax-deductible up to 10% of your taxable income for the year.
          </Text>
        </View>

        {/* Bottom Action */}
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={styles.primaryBtn}
            activeOpacity={0.9}
            onPress={() => router.back()}
          >
            <Text style={styles.primaryBtnText}>Add to Cart</Text>
            <MaterialSymbols name="arrow_forward" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceContainerLow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.onSurface,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  heroWrapper: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xl,
  },
  heroBackground: {
    height: 220,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  heroOverlay: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 24,
    gap: 8,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 100,
  },
  categoryText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: 'white',
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    lineHeight: 30,
  },
  section: {
    paddingHorizontal: spacing.md,
    gap: 20,
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.onSurface,
  },
  pointsNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.tertiaryContainer + '15',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  pointsNoteText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.tertiary,
  },
  amountGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  amountCard: {
    width: '31%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(27,28,27,0.05)',
  },
  selectedCard: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryContainer + '08',
  },
  amountValueText: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.onSurface,
  },
  selectedAmountValue: {
    color: colors.primary,
  },
  pointsValueText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.onSurfaceVariant,
    opacity: 0.6,
  },
  checkIndicator: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  customAmount: {
    gap: 12,
  },
  customLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.onSurfaceVariant,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 60,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputBoxFocused: {
    borderColor: colors.outlineFocus,
    borderWidth: 2,
  },
  currency: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.onSurface,
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: colors.onSurface,
  },
  impactMessage: {
    marginHorizontal: spacing.md,
    flexDirection: 'row',
    backgroundColor: colors.surfaceContainerLowest,
    padding: 20,
    borderRadius: 20,
    gap: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(27,28,27,0.03)',
    marginBottom: spacing.xl,
  },
  impactIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryContainer + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  impactText: {
    flex: 1,
    fontSize: 14,
    color: colors.onSurfaceVariant,
    lineHeight: 20,
    fontFamily: 'Manrope_500Medium',
  },
  boldText: {
    fontWeight: '800',
    color: colors.onSurface,
  },
  complianceSection: {
    paddingHorizontal: spacing.md,
    gap: 8,
    marginBottom: spacing.xl,
  },
  complianceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  complianceHeading: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.onSurface,
  },
  complianceBody: {
    fontSize: 12,
    color: colors.onSurfaceVariant,
    lineHeight: 18,
    opacity: 0.8,
  },
  actionSection: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.sm,
  },
  primaryBtn: {
    height: 64,
    backgroundColor: colors.primary,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 6,
  },
  primaryBtnText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '800',
  },
});
