import React from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing } from '@digdon/ui';
import { SafeLayout } from '@/components/layout/SafeLayout';
import { HButton } from '@/components/ui/HButton';
import { MaterialSymbols } from '@/components/ui/MaterialSymbols';
import { useAuth } from '../hooks/useAuth';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [focusedInput, setFocusedInput] = React.useState<string | null>(null);
  const { forgotPassword } = useAuth();
  const [email, setEmail] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSend() {
    if (!email) return;
    setLoading(true);
    setError(null);
    try {
      await forgotPassword(email);
      setSent(true);
      router.push({ pathname: '/forgot-password-otp', params: { email } });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeLayout hideHeader>
      <View style={styles.outerContainer}>
        {/* Floating Decor Elements (Consistency with Login/Signup) */}
        <View style={styles.decorTop} />
        <View style={styles.decorBottom} />

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Back Button for Modal */}
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <MaterialSymbols name="close" size={24} color={colors.onSurface} />
          </TouchableOpacity>

          {/* Typography Cluster */}
          <View style={styles.header}>
            <Text style={styles.title}>Forgot Password</Text>
            <Text style={styles.subtitle}>
              Enter your registered email address and we'll send you a link to reset your password.
            </Text>
          </View>

          {/* Form Section */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View style={[styles.inputWrapper, focusedInput === 'email' && styles.inputWrapperFocused]}>
                <TextInput
                  style={styles.input}
                  placeholder="yourname@email.com"
                  placeholderTextColor={colors.outlineVariant}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => setFocusedInput('email')}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>
            </View>

            {error && (
              <Text style={{ color: 'red', fontSize: 13, textAlign: 'center', fontFamily: 'Manrope_500Medium' }}>
                {error}
              </Text>
            )}
            <HButton
              title={loading ? 'Sending...' : 'Send Reset Link'}
              onPress={handleSend}
              disabled={loading}
              size="lg"
              style={styles.submitButton}
            />
          </View>

          {/* Footer Action */}
          <View style={styles.footer}>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.backToSignIn}>Back to Sign In</Text>
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
    paddingHorizontal: 32,
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
    marginBottom: 40,
  },
  header: {
    marginBottom: 40,
    gap: 12,
  },
  title: {
    fontSize: 40,
    fontWeight: '900',
    color: colors.onSurface,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    letterSpacing: -1,
    lineHeight: 48,
  },
  subtitle: {
    fontSize: 16,
    color: colors.onSurfaceVariant,
    fontFamily: 'Manrope_500Medium',
    lineHeight: 24,
    opacity: 0.8,
  },
  form: {
    gap: 32,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.onSurface,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 18,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
    borderWidth: 1,
    borderColor: 'rgba(218, 193, 190, 0.2)',
  },
  inputWrapperFocused: {
    borderColor: colors.outlineFocus,
    borderWidth: 2,
  },
  input: {
    flex: 1,
    paddingVertical: 20,
    color: colors.onSurface,
    fontSize: 16,
    fontFamily: 'Manrope_500Medium',
  },
  submitButton: {
    height: 64,
    borderRadius: 32,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 5,
  },
  footer: {
    marginTop: 'auto',
    alignItems: 'center',
    paddingTop: 40,
  },
  backToSignIn: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.secondary,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
});
