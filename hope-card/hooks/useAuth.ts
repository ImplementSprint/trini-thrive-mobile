import { useRouter } from 'expo-router';
import { useAuthContext } from '../context/AuthContext';
import * as authService from '../services/auth.service';

export function useAuth() {
  const { user, token, isLoading, saveToken, clearToken } = useAuthContext();
  const router = useRouter();

  async function login(email: string, password: string) {
    const res = await authService.login(email, password);
    await saveToken(res.access_token);
    return res;
  }

  async function register(payload: authService.RegisterPayload) {
    const res = await authService.register(payload);
    await saveToken(res.access_token);
    return res;
  }

  async function uploadIdDoc(file: { uri: string; name: string; type: string }) {
    return authService.uploadIdDocument(file);
  }

  async function verifyEmail(email: string, otp: string) {
    return authService.verifyEmail(email, otp);
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
    forgotPassword,
    verifyOtp,
    resetPassword,
    logout,
  };
}
