import React from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Image, Dimensions, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, borderRadius } from '@digdon/ui';
import { SafeLayout } from '@/components/layout/SafeLayout';
import { HButton } from '@/components/ui/HButton';
import { MaterialSymbols } from '@/components/ui/MaterialSymbols';
import { useAuth } from '../../hooks/useAuth';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

const { width } = Dimensions.get('window');

export default function SignUpScreen() {
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);
  const [focusedInput, setFocusedInput] = React.useState<string | null>(null);
  const [agreed, setAgreed] = React.useState(false);
  const { uploadIdDoc, register } = useAuth();
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [barangay, setBarangay] = React.useState('');
  const [municipality, setMunicipality] = React.useState('');
  const [province, setProvince] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [idDocKey, setIdDocKey] = React.useState<string | null>(null);
  const [idPreviewUri, setIdPreviewUri] = React.useState<string | null>(null);
  const [idUploading, setIdUploading] = React.useState(false);
  const [idError, setIdError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handlePickIdDocument() {
    setIdError(null);
    // Show action sheet to pick from camera or files
    Alert.alert(
      'Upload Valid ID',
      'Choose how to provide your ID',
      [
        {
          text: 'Take Photo',
          onPress: async () => {
            const permission = await ImagePicker.requestCameraPermissionsAsync();
            if (!permission.granted) {
              setIdError('Camera permission denied. Please enable it in Settings.');
              return;
            }
            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              quality: 0.85,
              allowsEditing: true,
            });
            if (!result.canceled && result.assets[0]) {
              const asset = result.assets[0];
              await doUpload({ uri: asset.uri, name: `id_${Date.now()}.jpg`, type: 'image/jpeg' }, asset.uri);
            }
          },
        },
        {
          text: 'Choose from Gallery',
          onPress: async () => {
            const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permission.granted) {
              setIdError('Photo library permission denied. Please enable it in Settings.');
              return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              quality: 0.85,
              allowsEditing: true,
            });
            if (!result.canceled && result.assets[0]) {
              const asset = result.assets[0];
              await doUpload({ uri: asset.uri, name: `id_${Date.now()}.jpg`, type: 'image/jpeg' }, asset.uri);
            }
          },
        },
        {
          text: 'Choose File (PDF)',
          onPress: async () => {
            const result = await DocumentPicker.getDocumentAsync({
              type: ['image/jpeg', 'image/png', 'application/pdf'],
            });
            if (!result.canceled && result.assets?.[0]) {
              const asset = result.assets[0];
              await doUpload(
                { uri: asset.uri, name: asset.name, type: asset.mimeType ?? 'application/octet-stream' },
                asset.uri,
              );
            }
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ],
    );
  }

  async function doUpload(file: { uri: string; name: string; type: string }, previewUri: string) {
    setIdUploading(true);
    setIdError(null);
    try {
      const res = await uploadIdDoc(file);
      setIdDocKey(res.key);
      setIdPreviewUri(previewUri);
    } catch (e: unknown) {
      setIdError(e instanceof Error ? e.message : 'Failed to upload ID. Please try again.');
      setIdPreviewUri(null);
      setIdDocKey(null);
    } finally {
      setIdUploading(false);
    }
  }

  async function handleRegister() {
    setLoading(true);
    setError(null);
    try {
      await register({
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        barangay,
        municipality,
        province,
        id_document_key: idDocKey ?? undefined,
      });
      router.push('/(auth)/verify');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeLayout hideHeader>
      <View style={styles.outerContainer}>
        {/* Floating Decor Elements */}
        <View style={styles.decorTop} />
        <View style={styles.decorBottom} />

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Logo Header (Centered) */}
          <View style={styles.header}>
            <Image 
              source={require('../../assets/images/hopecard_logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <View style={styles.headerText}>
              <Text style={styles.title}>HOPECARD</Text>
              <Text style={styles.subtitle}>Start your impact journey today and become part of a compassionate community.</Text>
            </View>
          </View>

          {/* Tab Toggle */}
          <View style={styles.tabContainer}>
            <TouchableOpacity 
              style={styles.tab}
              onPress={() => router.push('/(auth)/login')}
            >
              <Text style={styles.tabText}>Login</Text>
            </TouchableOpacity>
            <View style={[styles.tab, styles.activeTab]}>
              <Text style={[styles.tabText, styles.activeTabText]}>Sign Up</Text>
            </View>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <InputGroup label="First Name" icon="person" placeholder="Evelyn" value={firstName} onChangeText={setFirstName} focusedInput={focusedInput} setFocusedInput={setFocusedInput} inputId="firstName" />
            <InputGroup label="Last Name" icon="person" placeholder="Harper" value={lastName} onChangeText={setLastName} focusedInput={focusedInput} setFocusedInput={setFocusedInput} inputId="lastName" />
            <InputGroup label="Email Address" icon="mail" placeholder="name@example.com" keyboardType="email-address" value={email} onChangeText={setEmail} focusedInput={focusedInput} setFocusedInput={setFocusedInput} inputId="email" />
            <InputGroup label="Barangay" icon="location" placeholder="Enter barangay" value={barangay} onChangeText={setBarangay} focusedInput={focusedInput} setFocusedInput={setFocusedInput} inputId="barangay" />
            <InputGroup label="Municipality" icon="location" placeholder="Enter municipality" value={municipality} onChangeText={setMunicipality} focusedInput={focusedInput} setFocusedInput={setFocusedInput} inputId="municipality" />
            <InputGroup label="Province" icon="location" placeholder="Enter province" value={province} onChangeText={setProvince} focusedInput={focusedInput} setFocusedInput={setFocusedInput} inputId="province" />
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Password<Text style={styles.asterisk}> *</Text></Text>
              </View>
              <View style={[styles.inputWrapper, focusedInput === 'password' && styles.inputWrapperFocused]}>
                <MaterialSymbols 
                  name="lock" 
                  size={20} 
                  color={colors.outline} 
                  style={styles.inputIcon} 
                />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={colors.outlineVariant}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setFocusedInput('password')}
                  onBlur={() => setFocusedInput(null)}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <MaterialSymbols 
                    name={showPassword ? "visibility_off" : "visibility"} 
                    size={20} 
                    color={colors.onSurfaceVariant} 
                  />
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.fileUpload}>
              <Text style={styles.label}>Valid ID<Text style={styles.asterisk}> *</Text></Text>
              <TouchableOpacity
                style={[styles.uploadButton, !!idDocKey && styles.uploadButtonSuccess, !!idError && styles.uploadButtonError]}
                onPress={handlePickIdDocument}
                disabled={idUploading}
              >
                {idUploading ? (
                  <>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text style={[styles.uploadText, { color: colors.primary }]}>Uploading...</Text>
                  </>
                ) : idDocKey ? (
                  <>
                    <MaterialSymbols name="check_circle" size={20} color="#2E7D32" />
                    <Text style={[styles.uploadText, { color: '#2E7D32', fontWeight: '700' }]}>ID Uploaded ✓</Text>
                  </>
                ) : (
                  <>
                    <MaterialSymbols name="upload_file" size={20} color={colors.onSurfaceVariant} />
                    <Text style={styles.uploadText}>Upload ID (Photo, JPG, PNG or PDF)</Text>
                  </>
                )}
              </TouchableOpacity>
              {idPreviewUri && !idUploading && (
                <Image source={{ uri: idPreviewUri }} style={styles.idPreview} resizeMode="cover" />
              )}
              {idError && (
                <Text style={{ color: '#D32F2F', fontSize: 12, fontFamily: 'Manrope_500Medium', marginTop: 4 }}>
                  {idError}
                </Text>
              )}
            </View>

            {error && (
              <Text style={{ color: 'red', fontSize: 13, textAlign: 'center', fontFamily: 'Manrope_500Medium' }}>
                {error}
              </Text>
            )}
            <HButton
              title={loading ? 'Creating account...' : 'Sign Up'}
              onPress={handleRegister}
              size="lg"
              style={styles.submitButton}
              disabled={!agreed || loading}
            />
          </View>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={styles.dividerText}>Or continue with</Text>
            <View style={styles.line} />
          </View>

          {/* Social Logins */}
          <View style={styles.socialGrid}>
            <TouchableOpacity style={styles.socialButton}>
              <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2991/2991148.png' }} style={styles.socialIcon} />
              <Text style={styles.socialButtonText}>Continue with Google</Text>
            </TouchableOpacity>
          </View>

          {/* Legal Note with Checkbox */}
          <TouchableOpacity 
            style={styles.checkboxContainer} 
            onPress={() => setAgreed(!agreed)}
            activeOpacity={0.7}
          >
            <MaterialSymbols 
              name={agreed ? "check_box" : "check_box_outline_blank"} 
              size={24} 
              color={agreed ? colors.primary : colors.outline} 
            />
            <Text style={styles.checkboxText}>
              By continuing, you agree to Hopecard's <Text style={styles.link}>Terms of Service</Text> and <Text style={styles.link}>Privacy Policy</Text>.<Text style={styles.asterisk}> *</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Support Help Trigger */}
        <TouchableOpacity style={styles.supportFab}>
          <MaterialSymbols name="help" size={24} color={colors.primary} fill />
        </TouchableOpacity>
      </View>
    </SafeLayout>
  );
}

function InputGroup({ label, icon, focusedInput, setFocusedInput, inputId, ...props }: any) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}<Text style={styles.asterisk}> *</Text></Text>
      <View style={[styles.inputWrapper, focusedInput === inputId && styles.inputWrapperFocused]}>
        {icon && (
          <MaterialSymbols 
            name={icon} 
            size={20} 
            color={colors.outline} 
            style={styles.inputIcon} 
          />
        )}
        <TextInput 
          style={styles.input}
          placeholderTextColor={colors.outlineVariant}
          onFocus={() => setFocusedInput(inputId)}
          onBlur={() => setFocusedInput(null)}
          {...props}
        />
      </View>
    </View>
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
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 80,
    height: 80,
  },
  headerText: {
    alignItems: 'center',
    marginTop: 16,
    gap: 8,
  },
  title: {
    fontSize: 42,
    fontWeight: '900',
    color: '#F28D83',
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    letterSpacing: -2,
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: 15,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    fontFamily: 'Manrope_500Medium',
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F6F3F2',
    borderRadius: 18,
    padding: 6,
    marginBottom: 40,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 14,
  },
  activeTab: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.onSurfaceVariant,
  },
  activeTabText: {
    color: colors.primary,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.onSurfaceVariant,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerHighest,
    borderRadius: 18,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputWrapperFocused: {
    borderColor: colors.outlineFocus,
    borderWidth: 2,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 18,
    color: colors.onSurface,
    fontSize: 16,
    fontFamily: 'Manrope_500Medium',
  },
  fileUpload: {
    gap: 8,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surfaceContainerHighest,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(218, 193, 190, 0.3)',
  },
  uploadButtonSuccess: {
    borderColor: '#2E7D32',
    borderStyle: 'solid',
    backgroundColor: '#E8F5E9',
  },
  uploadButtonError: {
    borderColor: '#D32F2F',
    borderStyle: 'solid',
  },
  idPreview: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  uploadText: {
    flex: 1,
    fontSize: 14,
    color: colors.outlineVariant,
    fontFamily: 'Manrope_500Medium',
  },
  submitButton: {
    marginTop: 8,
    paddingVertical: 20,
    borderRadius: 18,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 5,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 32,
    gap: 16,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: colors.outlineVariant,
    opacity: 0.2,
  },
  dividerText: {
    fontSize: 11,
    color: colors.outline,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  socialGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(218, 193, 190, 0.15)',
    backgroundColor: 'white',
  },
  socialIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  socialButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.onSurface,
  },
  footerText: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.outline,
    marginTop: 40,
    lineHeight: 18,
    fontFamily: 'Manrope_500Medium',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 40,
    paddingHorizontal: 4,
  },
  checkboxText: {
    flex: 1,
    fontSize: 12,
    color: colors.outline,
    lineHeight: 18,
    fontFamily: 'Manrope_500Medium',
  },
  link: {
    color: colors.primary,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  asterisk: {
    color: '#D32F2F',
    fontWeight: 'bold',
  },
  supportFab: {
    position: 'absolute',
    bottom: 30,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  }
});
