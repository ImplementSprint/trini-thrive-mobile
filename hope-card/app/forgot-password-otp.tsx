import React from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing } from '@digdon/ui';
import { SafeLayout } from '@/components/layout/SafeLayout';
import { HButton } from '@/components/ui/HButton';
import { MaterialSymbols } from '@/components/ui/MaterialSymbols';

export default function ForgotPasswordOTPScreen() {
  const router = useRouter();
  const [focusedOtp, setFocusedOtp] = React.useState<number | null>(null);

  return (
    <SafeLayout hideHeader>
      <View style={styles.outerContainer}>
        {/* Floating Decor Elements */}
        <View style={styles.decorTop} />
        <View style={styles.decorBottom} />

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Back Button for Modal */}
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <MaterialSymbols name="close" size={24} color={colors.onSurface} strokeWidth={2} />
          </TouchableOpacity>

          <View style={styles.mainContent}>
            {/* Titles */}
            <Text style={styles.title}>Verification Code</Text>
            <Text style={styles.subtitle}>
              Enter the 6-digit code sent to your email{' '}
              <Text style={styles.boldEmail}>h***y@hopecard.org</Text>
            </Text>

            {/* OTP Input Section */}
            <View style={styles.otpGrid}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <TextInput
                  key={i}
                  style={[styles.otpInput, focusedOtp === i && styles.otpInputFocused]}
                  maxLength={1}
                  keyboardType="number-pad"
                  placeholder="0"
                  placeholderTextColor={colors.onSurfaceVariant + '40'}
                  onFocus={() => setFocusedOtp(i)}
                  onBlur={() => setFocusedOtp(null)}
                />
              ))}
            </View>

            {/* Resend Action */}
            <View style={styles.resendContainer}>
              <Text style={styles.resendLabel}>Didn't receive the code?</Text>
              <TouchableOpacity>
                <Text style={styles.resendLink}>Resend code in 00:54</Text>
              </TouchableOpacity>
            </View>

            {/* Verify Button */}
            <HButton 
              title="Verify & Continue" 
              onPress={() => router.replace('/(tabs)/home')} // End of flow
              size="lg"
              style={styles.verifyButton}
            />

            {/* Secondary Global Actions */}
            <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.actionItem}>
                <MaterialSymbols name="help" size={20} color={colors.onSurfaceVariant} fill />
                <Text style={styles.actionText}>Get Help</Text>
              </TouchableOpacity>
              <View style={styles.actionDivider} />
              <TouchableOpacity style={styles.actionItem} onPress={() => router.replace('/(auth)/login')}>
                <MaterialSymbols name="logout" size={20} color={colors.onSurfaceVariant} />
                <Text style={styles.actionText}>Sign Out</Text>
              </TouchableOpacity>
            </View>

            {/* Security Note */}
            <View style={styles.securityNote}>
              <MaterialSymbols name="verified_user" size={16} color={colors.secondary} fill />
              <Text style={styles.securityText}>SECURE 256-BIT ENCRYPTION</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeLayout>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#FCF9F8',
  },
  decorTop: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: colors.primary + '08',
  },
  decorBottom: {
    position: 'absolute',
    bottom: -80,
    left: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.secondary + '05',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 60,
    flexGrow: 1,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 20,
  },
  mainContent: {
    alignItems: 'center',
    width: '100%',
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primaryContainer + '1A', // 10% opacity
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.secondary,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: 'Manrope_500Medium',
    paddingHorizontal: 20,
    marginBottom: 48,
  },
  boldEmail: {
    fontWeight: '700',
    color: colors.onSurface,
  },
  otpGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(218, 193, 190, 0.15)',
  },
  otpInput: {
    width: 40,
    height: 64,
    textAlign: 'center',
    fontSize: 32,
    fontWeight: '800',
    color: colors.primaryContainer,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  otpInputFocused: {
    borderColor: colors.outlineFocus,
    borderWidth: 2,
  },
  resendContainer: {
    alignItems: 'center',
    gap: 4,
    marginBottom: 48,
  },
  resendLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.onSurfaceVariant,
    fontFamily: 'Manrope_500Medium',
  },
  resendLink: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.secondary,
    fontFamily: 'PlusJakartaSans_700Bold',
    textDecorationLine: 'underline',
  },
  verifyButton: {
    width: '100%',
    height: 64,
    borderRadius: 18,
    backgroundColor: colors.primaryContainer,
    shadowColor: colors.primaryContainer,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    marginTop: 64,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.onSurfaceVariant,
    fontFamily: 'Manrope_500Medium',
  },
  actionDivider: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.outlineVariant + '4D', // 30% opacity
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surfaceContainerLow,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 99,
    marginTop: 32,
    borderWidth: 1,
    borderColor: 'rgba(218, 193, 190, 0.1)',
  },
  securityText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.onSurfaceVariant,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
});
