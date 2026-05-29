import { useRouter } from 'expo-router';
import { useAuthContext } from '../context/AuthContext';
import * as authService from '../services/auth.service';

export function useAuth() {
  const { user, token, isLoading, saveToken, clearToken } = useAuthContext();
  const router = useRouter();

  async function login(email: string, password: string) {
    const res = await authService.login(email, password);
    if (res.token || res.access_token) {
      await saveToken(res.token ?? res.access_token!);
    } else {
      throw new Error('Authentication response is missing the token');
    }
    return res;
  }

  async function register(payload: authService.RegisterPayload) {
    const res = await authService.register(payload);
    if (res.token || res.access_token) {
      await saveToken(res.token ?? res.access_token!);
    } else {
      throw new Error('Registration response is missing the token');
    }
    return res;
  }

  async function uploadIdDoc(file: { uri: string; name: string; type: string }) {
    return authService.uploadIdDocument(file);
  }

  async function verifyEmail(email: string, otp: string) {
    return authService.verifyEmail(email, otp);
  }

  async function resendOtp(email: string) {
    return authService.resendOtp(email);
  }

  async function forgotPassword(email: string) {
    return authService.forgotPassword(email);
  }

  async function verifyOtp(email: string, otp: string) {
    return authService.verifyOtp(email, otp);
  }

  async function resetPassword(reset_token: string, new_password: string) {
    return authService.resetPassword(reset_token, new_password);
  }

  async function logout() {
    await clearToken();
    router.replace('/(auth)/login');
  }

  return {
    user,
    token,
    isLoading,
    login,
    register,
    uploadIdDoc,
    verifyEmail,
    resendOtp,
    forgotPassword,
    verifyOtp,
    resetPassword,
    logout,
  };
}
