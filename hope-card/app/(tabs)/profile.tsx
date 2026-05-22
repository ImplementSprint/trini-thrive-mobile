import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, borderRadius } from '@digdon/ui';
import { SafeLayout } from '@/components/layout/SafeLayout';
import { MaterialSymbols } from '@/components/ui/MaterialSymbols';

export default function ProfileScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('Alex Rivera');
  const [mobile, setMobile] = useState('+1 (555) 123-4567');
  const [email, setEmail] = useState('alex.rivera@impactmail.org');
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  return (
    <SafeLayout>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Simple Header */}
        <View style={styles.header}>
          <Text style={styles.userName}>Alex Rivera</Text>
          <Text style={styles.memberSince}>Impact Member since 2022</Text>
        </View>

        <View style={styles.content}>
          {/* Personal Information */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Personal Information</Text>
            <View style={styles.card}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <TextInput 
                  style={[styles.input, focusedInput === 'fullName' && styles.inputFocused]} 
                  value={fullName} 
                  onChangeText={setFullName}
                  onFocus={() => setFocusedInput('fullName')}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Mobile Number</Text>
                <TextInput 
                  style={[styles.input, focusedInput === 'mobile' && styles.inputFocused]} 
                  value={mobile} 
                  onChangeText={setMobile}
                  keyboardType="phone-pad"
                  onFocus={() => setFocusedInput('mobile')}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <TextInput 
                  style={[styles.input, focusedInput === 'email' && styles.inputFocused]} 
                  value={email} 
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onFocus={() => setFocusedInput('email')}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>
              <TouchableOpacity style={styles.updateBtn} activeOpacity={0.8}>
                <Text style={styles.updateBtnText}>Update Profile</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Account & Security */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Account & Security</Text>
            <View style={styles.card}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Current Password</Text>
                <TextInput 
                  style={[styles.input, focusedInput === 'currentPassword' && styles.inputFocused]} 
                  placeholder="••••••••" 
                  secureTextEntry
                  placeholderTextColor={colors.onSurfaceVariant + '40'}
                  onFocus={() => setFocusedInput('currentPassword')}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>New Password</Text>
                <TextInput 
                  style={[styles.input, focusedInput === 'newPassword' && styles.inputFocused]} 
                  placeholder="••••••••" 
                  secureTextEntry
                  placeholderTextColor={colors.onSurfaceVariant + '40'}
                  onFocus={() => setFocusedInput('newPassword')}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>
              <TouchableOpacity style={styles.securityBtn} activeOpacity={0.8}>
                <Text style={styles.securityBtnText}>Save New Password</Text>
              </TouchableOpacity>
            </View>
          </View>


          {/* Legal & Support */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Legal & Support</Text>
            <View style={styles.menuCard}>
              <LegalItem 
                title="Privacy Policy" 
                imageSource={require('../../assets/images/privacy_policy.png')} 
              />
              <View style={styles.divider} />
              <LegalItem 
                title="Terms of Service" 
                imageSource={require('../../assets/images/terms_of_service.png')} 
              />
            </View>
          </View>

          {/* Sign Out */}
          <TouchableOpacity 
            style={styles.signOutBtn} 
            activeOpacity={0.8}
            onPress={() => router.replace('/(auth)/login')}
          >
            <MaterialSymbols name="logout" size={24} color="white" />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>

          {/* Version Info */}
          <Text style={styles.versionInfo}>HOPECARD v2.4.1 (Build 1082)</Text>
        </View>
      </ScrollView>
    </SafeLayout>
  );
}

function LegalItem({ title, icon, imageSource }: any) {
  return (
    <TouchableOpacity style={styles.menuItem}>
      <Text style={styles.legalTitle}>{title}</Text>
      {imageSource ? (
        <Image source={imageSource} style={styles.legalIcon} resizeMode="contain" />
      ) : (
        <MaterialSymbols name={icon} size={24} color={colors.primaryContainer} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 120,
    backgroundColor: colors.background,
  },
  header: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 40,
    gap: 4,
  },
  userName: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.primary,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
  },
  memberSince: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.onSurfaceVariant + 'B3',
    fontFamily: 'Manrope_500Medium',
  },
  content: {
    paddingHorizontal: 24,
    gap: 32,
  },
  section: {
    gap: 16,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.onSurfaceVariant + 'B3',
    textTransform: 'uppercase',
    letterSpacing: 2,
    paddingHorizontal: 8,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    gap: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.04,
    shadowRadius: 20,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(27,28,27,0.05)',
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.onSurfaceVariant + '99',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginLeft: 4,
  },
  input: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 16,
    height: 52,
    paddingHorizontal: 16,
    fontSize: 14,
    fontWeight: '600',
    color: colors.onSurface,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputFocused: {
    borderColor: colors.outlineFocus,
    borderWidth: 2,
  },
  updateBtn: {
    backgroundColor: colors.primaryContainer + '20',
    borderRadius: 16,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primaryContainer + '30',
    marginTop: 8,
  },
  updateBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.onPrimaryContainer,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  securityBtn: {
    backgroundColor: colors.secondary + '10',
    borderRadius: 16,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.secondary + '20',
    marginTop: 8,
  },
  securityBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.secondary,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  menuCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.04,
    shadowRadius: 20,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(27,28,27,0.05)',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  menuIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.primaryContainer + '1A', // 10% opacity
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.onSurface,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  menuItemValue: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.onSurfaceVariant,
    fontFamily: 'Manrope_500Medium',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(218, 193, 190, 0.15)',
    marginHorizontal: 20,
  },
  legalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.onSurface,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  legalIcon: {
    width: 24,
    height: 24,
    tintColor: colors.primaryContainer,
  },
  signOutBtn: {
    backgroundColor: colors.secondary,
    borderRadius: 20,
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 4,
    marginTop: 8,
  },
  signOutText: {
    fontSize: 18,
    fontWeight: '800',
    color: 'white',
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  versionInfo: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.onSurfaceVariant + '66', // 40% opacity
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginTop: 8,
    marginBottom: 40,
  },
});
