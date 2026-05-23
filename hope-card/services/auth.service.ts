import { apiPost, apiUpload } from './api';

export type AuthTokenResponse = {
  access_token: string;
  isNew?: boolean;
};

export type VerifyOtpResponse = {
  reset_token: string;
};

export type MessageResponse = {
  message: string;
};

export type RegisterPayload = {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  barangay: string;
  municipality: string;
  province: string;
  id_document_key?: string;
};

export type UploadIdDocumentResponse = {
  key: string;
};

export function login(email: string, password: string): Promise<AuthTokenResponse> {
  return apiPost<AuthTokenResponse>('/auth/login', { email, password }, false);
}

export function register(payload: RegisterPayload): Promise<AuthTokenResponse> {
  return apiPost<AuthTokenResponse>('/auth/register', payload, false);
}

export function verifyEmail(email: string, otp: string): Promise<MessageResponse> {
  return apiPost<MessageResponse>('/auth/verify-email', { email, otp }, true);
}

export function forgotPassword(email: string): Promise<MessageResponse> {
  return apiPost<MessageResponse>('/auth/forgot-password', { email }, false);
}

export function verifyOtp(email: string, otp: string): Promise<VerifyOtpResponse> {
  return apiPost<VerifyOtpResponse>('/auth/verify-otp', { email, otp }, false);
}

export function resetPassword(reset_token: string, new_password: string): Promise<MessageResponse> {
  return apiPost<MessageResponse>('/auth/reset-password', { reset_token, new_password }, false);
}

export function uploadIdDocument(
  file: { uri: string; name: string; type: string },
): Promise<UploadIdDocumentResponse> {
  return apiUpload<UploadIdDocumentResponse>('/auth/id-document', file, false);
}
