import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Share } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors, spacing, borderRadius } from '@digdon/ui';
import { SafeLayout } from '@/components/layout/SafeLayout';
import { MaterialSymbols } from '@/components/ui/MaterialSymbols';
import { useProfile } from '../hooks/useProfile';

export default function ConfirmationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ amount?: string; transactionId?: string; cause?: string }>();
  const { profileQuery } = useProfile();
  const profile = profileQuery.data;

  const buyerName = profile?.first_name || 'Generous Donor';
  const amountVal = params.amount ? Number(params.amount) : 10000;
  const transactionId = params.transactionId || '#HC-982341';
  const cause = params.cause || 'Rural Education Fund & Reforestation Project';

  const dateStr = React.useMemo(() => {
    return new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, []);

  async function handleShare() {
    try {
      await Share.share({
        message: `I just donated ₱${amountVal.toLocaleString()} to support "${cause}" via HOPECARD! Join me in making an impact! 🌟`,
      });
    } catch (error) {
      console.error('Error sharing impact:', error);
    }
  }

  return (
    <SafeLayout hideHeader>
      {/* Custom Header for Confirmation */}
      <View style={styles.modalHeader}>
        <View style={styles.headerLeft}>
          <Image 
            source={require('../assets/images/hopecard_logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.brandText}>HOPECARD</Text>
        </View>
        <TouchableOpacity onPress={() => router.replace('/(tabs)/home')} style={styles.closeBtn}>
          <MaterialSymbols name="close" size={24} color={colors.onSurface} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Success Celebration */}
        <View style={styles.celebrationSection}>
          <View style={styles.iconContainer}>
            {/* Blobs / Decorative circles */}
            <View style={[styles.blob, styles.blob1]} />
            <View style={[styles.blob, styles.blob2]} />
            
            <View style={styles.mainIconCircle}>
              <Image 
                source={require('../assets/images/hopecard_logo.png')} 
                style={{ width: 48, height: 48 }}
                resizeMode="contain"
              />
            </View>
          </View>

          <Text style={styles.successTitle}>Donation Successful!</Text>
          <Text style={styles.successMessage}>
            Thank you for your generosity, <Text style={styles.boldPrimary}>{buyerName}</Text>. Your contribution fuels stories that matter.
          </Text>
        </View>

        {/* Transaction Details Card */}
        <View style={styles.detailsCard}>
          <View style={styles.accentGlow} />
          <View style={styles.detailsTitleRow}>
            <View style={styles.accentBar} />
            <Text style={styles.detailsTitle}>Transaction Details</Text>
          </View>

          <View style={styles.detailsList}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Cause Supported</Text>
              <Text style={styles.detailValuePrimary}>{cause}</Text>
            </View>

            <View style={styles.detailItemRow}>
              <Text style={styles.detailLabel}>Amount</Text>
              <Text style={styles.amountText}>₱{amountVal.toLocaleString()}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailItemRow}>
              <Text style={styles.detailLabelSmall}>Transaction ID</Text>
              <Text style={styles.detailValueSmall}>{transactionId}</Text>
            </View>

            <View style={styles.detailItemRow}>
              <Text style={styles.detailLabelSmall}>Date</Text>
              <Text style={styles.detailValueSmall}>{dateStr}</Text>
            </View>
          </View>
        </View>

        {/* Visual Impact */}
        <View style={styles.impactSection}>
          <View style={styles.impactImageWrapper}>
            <Image 
              source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB4F4ziaG0nqvRN4iqeFgPi3jU3IArnD6AwPZ_AsYXtgIFov6ojCwFJ1BMEbGSJL16Ga_986o0GhyN9lOXKWU5jGuKf9s8DEb8NuSgbsfFgr0rCpEkhsy-xq1uizloHBcU293QQcm60A9e4tV5VvXEhqP4YmFl1-k2WXhtkoB_YFbigY8-wXEeKJh7BuEUk4q0rqNWYQYujdrfll0AELYEpVVztJlxjx8uSsCRUnA56cor3w5hsKZIvUueVAutpFCTWqea7nFJ_HE6M' }} 
              style={styles.impactImage} 
            />
            <View style={styles.impactOverlay} />
            <View style={styles.impactBadge}>
              <Text style={styles.impactBadgeText}>Direct Impact</Text>
            </View>
          </View>
          <View style={styles.impactTextWrapper}>
            <Text style={styles.impactQuote}>
              "This donation will provide essential school supplies for students."
            </Text>
          </View>
        </View>

        {/* Actions Cluster */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.receiptBtn} activeOpacity={0.8}>
            <MaterialSymbols name="download_for_offline" size={24} color={colors.onPrimaryContainer} />
            <Text style={styles.receiptBtnText}>Download E-Receipt</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.shareBtn} activeOpacity={0.8} onPress={handleShare}>
            <MaterialSymbols name="share" size={24} color={colors.secondary} />
            <Text style={styles.shareBtnText}>Share Your Impact</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Persistence Note - Footer for confirmation */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.backHomeBtn} onPress={() => router.replace('/(tabs)/home')}>
          <Text style={styles.backHomeText}>Back to Dashboard</Text>
        </TouchableOpacity>
      </View>
    </SafeLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 160,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: 'white',
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
    fontSize: 20,
    fontWeight: '900',
    color: '#F28D83',
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    letterSpacing: -1,
  },
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceContainerLow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  celebrationSection: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 32,
  },
  iconContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  blob: {
    position: 'absolute',
    borderRadius: 100,
  },
  blob1: {
    width: 140,
    height: 140,
    backgroundColor: colors.primaryContainer,
    opacity: 0.15,
  },
  blob2: {
    width: 120,
    height: 120,
    backgroundColor: colors.tertiaryFixed,
    opacity: 0.2,
  },
  mainIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  successTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.primary,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    textAlign: 'center',
    lineHeight: 38,
    marginBottom: 12,
  },
  successMessage: {
    fontSize: 16,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    fontFamily: 'Manrope_500Medium',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  boldPrimary: {
    fontWeight: '800',
    color: colors.primary,
  },
  detailsCard: {
    marginHorizontal: 24,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 24,
    padding: 24,
    overflow: 'hidden',
    marginBottom: 32,
  },
  accentGlow: {
    position: 'absolute',
    top: -64,
    right: -64,
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: 'rgba(205, 163, 54, 0.08)',
  },
  detailsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  accentBar: {
    width: 4,
    height: 24,
    backgroundColor: colors.secondaryContainer,
    borderRadius: 100,
  },
  detailsTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.onSurface,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  detailsList: {
    gap: 20,
  },
  detailItem: {
    gap: 4,
  },
  detailItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.onSurfaceVariant,
    width: '35%',
  },
  detailValuePrimary: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.primary,
    flex: 1,
    textAlign: 'right',
  },
  amountText: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.onSurface,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(135, 114, 112, 0.15)',
    marginVertical: 4,
  },
  detailLabelSmall: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(85, 66, 64, 0.7)',
  },
  detailValueSmall: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.onSurface,
  },
  impactSection: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 20,
    alignItems: 'center',
    marginBottom: 40,
  },
  impactImageWrapper: {
    flex: 1,
    height: 96,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.surfaceContainerLowest,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  impactImage: {
    width: '100%',
    height: '100%',
  },
  impactOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(252, 249, 248, 0.4)',
  },
  impactBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(255, 218, 214, 0.8)', // Primary Fixed 0.8
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },
  impactBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
  },
  impactTextWrapper: {
    flex: 1,
  },
  impactQuote: {
    fontSize: 14,
    color: colors.onSurfaceVariant,
    fontStyle: 'italic',
    lineHeight: 20,
    fontFamily: 'Manrope_500Medium',
  },
  actionsContainer: {
    paddingHorizontal: 24,
    gap: 16,
  },
  receiptBtn: {
    flexDirection: 'row',
    height: 64,
    backgroundColor: colors.primaryContainer,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: colors.primaryContainer,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 3,
  },
  receiptBtnText: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.onPrimaryContainer,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  shareBtn: {
    flexDirection: 'row',
    height: 64,
    backgroundColor: colors.secondary + '10',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  shareBtnText: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.secondary,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: 48,
    backgroundColor: colors.background,
  },
  backHomeBtn: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backHomeText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.outline,
    textDecorationLine: 'underline',
  },
});
