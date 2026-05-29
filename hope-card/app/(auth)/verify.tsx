import React from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, borderRadius } from '@digdon/ui';
import { SafeLayout } from '@/components/layout/SafeLayout';
import { HButton } from '@/components/ui/HButton';
import { MaterialSymbols } from '@/components/ui/MaterialSymbols';
import { useAuth } from '../../hooks/useAuth';
import { useAuthContext } from '../../context/AuthContext';

function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  const masked = local[0] + '***' + (local.length > 1 ? local[local.length - 1] : '');
  return `${masked}@${domain}`;
}

const RESEND_COOLDOWN = 60;

export default function VerifyScreen() {
  const router = useRouter();
  const [focusedOtp, setFocusedOtp] = React.useState<number | null>(null);
  const [otp, setOtp] = React.useState(['', '', '', '', '', '']);
  const inputRefs = React.useRef<(TextInput | null)[]>([]);
  const { verifyEmail, resendOtp } = useAuth();
  const { user } = useAuthContext();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = React.useState<string | null>(null);
  const [countdown, setCountdown] = React.useState(RESEND_COOLDOWN);
  const [resending, setResending] = React.useState(false);

  // Countdown timer
  React.useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const pad = (n: number) => String(n).padStart(2, '0');

  async function handleVerify() {
    const otpString = otp.join('');
    if (otpString.length !== 6 || !user?.email) return;
    setLoading(true);
    setError(null);
    try {
      await verifyEmail(user.email, otpString);
      router.replace('/(tabs)/home');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Verification failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (!user?.email || countdown > 0 || resending) return;
    setResending(true);
    setError(null);
    setResendSuccess(null);
    try {
      await resendOtp(user.email);
      setResendSuccess('A new code has been sent to your email.');
      setCountdown(RESEND_COOLDOWN);
      setOtp(['', '', '', '', '', '']);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to resend code');
    } finally {
      setResending(false);
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
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <MaterialSymbols name="lock_person" size={32} color={colors.primary} />
          </View>
          <Text style={styles.title}>Verification Code</Text>
          <Text style={styles.subtitle}>
            Enter the 6-digit code sent to your email{'\n'}
            <Text style={styles.boldEmail}>{user?.email ? maskEmail(user.email) : 'your email'}</Text>
          </Text>
        </View>

        {/* OTP Input */}
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
            {countdown > 0 ? (
              <View style={styles.timerRow}>
                <MaterialSymbols name="schedule" size={16} color={colors.onSurfaceVariant} />
                <Text style={styles.timerText}>Resend code in <Text style={styles.primaryText}>00:{pad(countdown)}</Text></Text>
              </View>
            ) : (
              <Text style={styles.timerText}>Didn't receive a code?</Text>
            )}
            <TouchableOpacity onPress={handleResend} disabled={countdown > 0 || resending}>
              <Text style={[styles.resendButton, (countdown > 0 || resending) && { opacity: 0.4 }]}>
                {resending ? 'Sending...' : 'Resend Code'}
              </Text>
            </TouchableOpacity>
          </View>

          {resendSuccess && (
            <Text style={{ color: '#2E7D32', fontSize: 13, textAlign: 'center', fontFamily: 'Manrope_500Medium', marginBottom: 8 }}>
              {resendSuccess}
            </Text>
          )}
          {error && (
            <Text style={{ color: 'red', fontSize: 13, textAlign: 'center', fontFamily: 'Manrope_500Medium', marginBottom: 8 }}>
              {error}
            </Text>
          )}
          <HButton
            title={loading ? 'Verifying...' : 'Verify & Continue'}
            onPress={handleVerify}
            disabled={loading || otp.join('').length < 6}
            size="lg"
            icon={<MaterialSymbols name="arrow_forward" size={20} color={colors.onPrimaryContainer} />}
            style={styles.submitButton}
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.footerItem}>
            <MaterialSymbols name="support_agent" size={18} color={colors.onSurfaceVariant} />
            <Text style={styles.footerItemText}>Get Help</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={[styles.footerItem]} onPress={() => router.push('/(auth)/login')}>
            <MaterialSymbols name="logout" size={18} color={colors.onSurfaceVariant} />
            <Text style={styles.footerItemText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeLayout>
  );
}


const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    flexGrow: 1,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: 'rgba(242, 141, 131, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
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
