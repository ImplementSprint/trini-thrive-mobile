import { useRouter, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from "react-native";
import { AuthShell, authStyles } from "@/src/components/auth-shell";
import { API_BASE } from "@/src/lib/api";
import { COLORS } from "@/src/theme";

export function ResetPasswordScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email?: string }>();

  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [otpError, setOtpError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  const validate = () => {
    let valid = true;

    if (!otp.trim()) {
      setOtpError("OTP is required.");
      valid = false;
    } else if (otp.trim().length !== 6) {
      setOtpError("OTP must be exactly 6 digits.");
      valid = false;
    } else {
      setOtpError(null);
    }

    if (!newPassword) {
      setPasswordError("Password is required.");
      valid = false;
    } else if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      valid = false;
    } else {
      setPasswordError(null);
    }

    if (!confirmPassword) {
      setConfirmError("Please confirm your password.");
      valid = false;
    } else if (newPassword !== confirmPassword) {
      setConfirmError("Passwords do not match.");
      valid = false;
    } else {
      setConfirmError(null);
    }

    return valid;
  };

  const handleResetPassword = async () => {
    setError(null);
    setSuccess(null);

    if (!validate()) {
      return;
    }

    const targetEmail = email?.trim() || "";
    if (!targetEmail) {
      setError("Email address is missing. Please restart the password reset process.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: targetEmail,
          otp: otp.trim(),
          newPassword: newPassword,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.message || "Failed to reset password.");
        return;
      }

      setSuccess("Password reset successful! You can now log in.");
      setTimeout(() => {
        router.replace("/login" as any);
      }, 2000);
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="RESET PASSWORD"
      subtitle={`Enter the 6-digit OTP code sent to ${email || "your email"} and your new password.`}
      footer={
        <>
          <Text style={{ fontSize: 11 }}>Back to </Text>
          <TouchableOpacity onPress={() => router.replace("/login" as any)}>
            <Text style={{ fontSize: 11, fontWeight: "700", color: COLORS.primaryDark }}>
              Login
            </Text>
          </TouchableOpacity>
        </>
      }
    >
      {error ? (
        <View style={authStyles.alertError}>
          <Text style={authStyles.alertTextError}>{error}</Text>
        </View>
      ) : null}

      {success ? (
        <View style={[authStyles.alertError, { backgroundColor: "#e6f4ea", borderColor: "#34a853" }]}>
          <Text style={[authStyles.alertTextError, { color: "#137333" }]}>{success}</Text>
        </View>
      ) : null}

      <View style={authStyles.field}>
        <TextInput
          value={otp}
          onChangeText={(text) => {
            setOtp(text);
            if (otpError) setOtpError(null);
          }}
          placeholder="6-Digit OTP"
          placeholderTextColor="#666"
          keyboardType="number-pad"
          maxLength={6}
          style={[authStyles.input, otpError ? authStyles.inputError : null]}
          editable={!loading}
        />
        {otpError ? <Text style={authStyles.errorText}>{otpError}</Text> : null}
      </View>

      <View style={authStyles.field}>
        <View style={[authStyles.passwordBox, passwordError ? authStyles.inputError : null]}>
          <TextInput
            value={newPassword}
            onChangeText={(text) => {
              setNewPassword(text);
              if (passwordError) setPasswordError(null);
            }}
            placeholder="New Password"
            placeholderTextColor="#666"
            secureTextEntry={!showPassword}
            style={authStyles.passwordInput}
            editable={!loading}
          />
          <TouchableOpacity onPress={() => setShowPassword((current) => !current)}>
            <Text style={authStyles.toggle}>{showPassword ? "Hide" : "Show"}</Text>
          </TouchableOpacity>
        </View>
        {passwordError ? <Text style={authStyles.errorText}>{passwordError}</Text> : null}
      </View>

      <View style={authStyles.field}>
        <View style={[authStyles.passwordBox, confirmError ? authStyles.inputError : null]}>
          <TextInput
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              if (confirmError) setConfirmError(null);
            }}
            placeholder="Confirm Password"
            placeholderTextColor="#666"
            secureTextEntry={!showConfirmPassword}
            style={authStyles.passwordInput}
            editable={!loading}
          />
          <TouchableOpacity onPress={() => setShowConfirmPassword((current) => !current)}>
            <Text style={authStyles.toggle}>{showConfirmPassword ? "Hide" : "Show"}</Text>
          </TouchableOpacity>
        </View>
        {confirmError ? <Text style={authStyles.errorText}>{confirmError}</Text> : null}
      </View>

      <TouchableOpacity
        style={[authStyles.submit, loading ? authStyles.submitDisabled : null]}
        onPress={handleResetPassword}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={COLORS.white} />
        ) : (
          <Text style={authStyles.submitText}>Reset Password</Text>
        )}
      </TouchableOpacity>
    </AuthShell>
  );
}
