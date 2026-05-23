import React from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors, spacing, borderRadius } from '@digdon/ui';
import { SafeLayout } from '@/components/layout/SafeLayout';
import { HButton } from '@/components/ui/HButton';
import { MaterialSymbols } from '@/components/ui/MaterialSymbols';
import { useAuth } from '../hooks/useAuth';

function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  const masked = local[0] + '***' + (local.length > 1 ? local[local.length - 1] : '');
  return `${masked}@${domain}`;
}

export default function ForgotPasswordOTPScreen() {
  const router = useRouter();
  const [focusedOtp, setFocusedOtp] = React.useState<number | null>(null);
  const [otp, setOtp] = React.useState(['', '', '', '', '', '']);
  const inputRefs = React.useRef<(TextInput | null)[]>([]);
  const { verifyOtp, resetPassword } = useAuth();
  const { email } = useLocalSearchParams<{ email: string }>();
  const [step, setStep] = React.useState<'otp' | 'reset'>('otp');
  const [resetToken, setResetToken] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleVerifyOtp() {
    const otpString = otp.join('');
    if (otpString.length !== 6 || !email) return;
    setLoading(true);
    setError(null);
    try {
      const res = await verifyOtp(email, otpString);
      setResetToken(res.reset_token);
      setStep('reset');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword() {
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await resetPassword(resetToken, newPassword);
      router.replace('/(auth)/login');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Password reset failed');
    } finally {
      setLoading(false);
    }
  }

  const handleChangeText = (text: string, index: number) => {
    const cleanedText = text.replace(/[^0-9]/g, '');
    const newOtp = [...otp];
    newOtp[index] = cleanedText;
    setOtp(newOtp);

    if (cleanedText && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
      inputRefs.current[index - 1]?.focus();
    }
  };

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

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Verification Code</Text>
            <Text style={styles.subtitle}>
              Enter the 6-digit code sent to your email{'\n'}
              <Text style={styles.boldEmail}>{email ? maskEmail(email) : 'your email'}</Text>
            </Text>
          </View>

          {/* OTP Input Card */}
          {step === 'otp' && (
          <View style={styles.otpCard}>
            <View style={styles.otpRow}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <TextInput
                  key={i}
                  ref={(ref) => { inputRefs.current[i - 1] = ref; }}
                  style={[styles.otpInput, focusedOtp === i && styles.otpInputFocused]}
                  maxLength={1}
                  keyboardType="number-pad"
                  placeholder="0"
                  placeholderTextColor={colors.outlineVariant}
                  value={otp[i - 1]}
                  onChangeText={(text) => handleChangeText(text, i - 1)}
                  onKeyPress={(e) => handleKeyPress(e, i - 1)}
                  onFocus={() => setFocusedOtp(i)}
                  onBlur={() => setFocusedOtp(null)}
                />
              ))}
            </View>

            <View style={styles.timerSection}>
              <View style={styles.timerRow}>
                <MaterialSymbols name="schedule" size={16} color={colors.onSurfaceVariant} />
                <Text style={styles.timerText}>Resend code in <Text style={styles.primaryText}>00:54</Text></Text>
              </View>
              <TouchableOpacity>
                <Text style={styles.resendButton}>Resend Code</Text>
              </TouchableOpacity>
            </View>

            {error && (
              <Text style={{ color: 'red', fontSize: 13, textAlign: 'center', fontFamily: 'Manrope_500Medium', marginBottom: 8 }}>
                {error}
              </Text>
            )}
            <HButton
              title={loading ? 'Verifying...' : 'Verify & Continue'}
              onPress={handleVerifyOtp}
              disabled={loading}
              size="lg"
              icon={<MaterialSymbols name="arrow_forward" size={20} color={colors.onPrimaryContainer} />}
              style={styles.submitButton}
            />
          </View>
          )}

          {step === 'reset' && (
            <View style={{ gap: 16, marginTop: 24 }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: colors.onSurface, textAlign: 'center', fontFamily: 'PlusJakartaSans_700Bold' }}>
                Set New Password
              </Text>
              <TextInput
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="New password"
                secureTextEntry
                style={{ backgroundColor: colors.surfaceContainerHighest, borderRadius: 18, padding: 18, fontSize: 16, color: colors.onSurface, fontFamily: 'Manrope_500Medium' }}
              />
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm password"
                secureTextEntry
                style={{ backgroundColor: colors.surfaceContainerHighest, borderRadius: 18, padding: 18, fontSize: 16, color: colors.onSurface, fontFamily: 'Manrope_500Medium' }}
              />
              {error && <Text style={{ color: 'red', fontSize: 13, textAlign: 'center' }}>{error}</Text>}
              <HButton title={loading ? 'Resetting...' : 'Reset Password'} onPress={handleResetPassword} size="lg" disabled={loading} />
            </View>
          )}

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.footerItem}>
              <MaterialSymbols name="support_agent" size={18} color={colors.onSurfaceVariant} />
              <Text style={styles.footerItemText}>Get Help</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.footerItem} onPress={() => router.replace('/(auth)/login')}>
              <MaterialSymbols name="logout" size={18} color={colors.onSurfaceVariant} />
              <Text style={styles.footerItemText}>Sign Out</Text>
            </TouchableOpacity>
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
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.primary,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: spacing.md,
    lineHeight: 24,
    fontFamily: 'Manrope_500Medium',
  },
  boldEmail: {
    fontWeight: '700',
    color: colors.onSurface,
  },
  otpCard: {
    backgroundColor: 'white',
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(218, 193, 190, 0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 2,
    alignItems: 'center',
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: spacing.xl,
    width: '100%',
  },
  otpInput: {
    width: 44,
    height: 56,
    backgroundColor: colors.surfaceContainerHighest,
    borderRadius: borderRadius.sm,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    color: colors.onSurface,
    fontFamily: 'PlusJakartaSans_700Bold',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  otpInputFocused: {
    borderColor: colors.outlineFocus,
    borderWidth: 2,
  },
  timerSection: {
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timerText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.onSurfaceVariant,
  },
  primaryText: {
    color: colors.primary,
  },
  resendButton: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  submitButton: {
    width: '100%',
    height: 60,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xxl,
    gap: spacing.lg,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  footerItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.onSurfaceVariant,
  },
  divider: {
    width: 1,
    height: 16,
    backgroundColor: colors.outlineVariant,
  },
});
