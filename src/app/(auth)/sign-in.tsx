import * as Google from "expo-auth-session/providers/google";
import Constants from "expo-constants";
import { Link, useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import {
  Chrome,
  Eye,
  EyeOff,
  Fingerprint,
  Lock,
  User,
  Wallet
} from "lucide-react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Typography } from "@/constants/Typography";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

WebBrowser.maybeCompleteAuthSession();

export default function SignInScreen() {
  const router = useRouter();
  const { signIn, signInWithGoogleTokens, user, initializing } = useAuth();
  const { colors, isDark } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const passwordRef = useRef<TextInput>(null);

  // Google Configuration
  const googleConfig = useMemo(() => {
    const extra = Constants.expoConfig?.extra;
    return {
      webClientId: extra?.google?.webClientId ?? "",
      iosClientId: extra?.google?.iosClientId ?? "",
      androidClientId: extra?.google?.androidClientId ?? "",
    };
  }, []);

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: googleConfig.webClientId,
    iosClientId: googleConfig.iosClientId,
    androidClientId: googleConfig.androidClientId,
    selectAccount: true,
  });

  useEffect(() => {
    if (response?.type === "success") {
      const { idToken, accessToken } = response.authentication ?? {};
      if (idToken || accessToken) {
        signInWithGoogleTokens({ idToken, accessToken }).catch((err) =>
          setError(err?.message ?? "Google sign-in failed")
        );
      }
    }
  }, [response]);

  useEffect(() => {
    if (initializing) return;
    if (!user) return;

    const isOAuthUser = user.providerData.some(
      (p) => p.providerId !== "password"
    );

    if (user.emailVerified || isOAuthUser) {
      router.replace("/");
    } else {
      router.replace("/(auth)/verify-email");
    }
  }, [user, initializing]);

  const onSubmit = async () => {
    setError(null);

    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password);
    } catch (err: any) {
      setError(err?.message ?? "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    const result = await promptAsync();
    if (result?.type === "dismiss") return;
  };

  const canUseGoogle =
    (Platform.OS === "android" && googleConfig.androidClientId) ||
    (Platform.OS === "ios" && googleConfig.iosClientId) ||
    (Platform.OS === "web" && googleConfig.webClientId);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? colors.background : "#F4F9F8" }]} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Wallet size={32} color="#00C4A7" />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>Welcome Back</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Sign in to access your wallet
            </Text>
          </View>

          {/* Form Section */}
          <View style={styles.form}>
            {/* Email Input */}
            <View style={[styles.inputContainer, { backgroundColor: isDark ? colors.card : "#FFF" }]}>
              <User size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                placeholder="Email"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                submitBehavior="submit"
                style={[styles.input, { color: colors.text }]}
              />
            </View>

            {/* Password Input */}
            <View style={[styles.inputContainer, { backgroundColor: isDark ? colors.card : "#FFF", marginTop: 16 }]}>
              <Lock size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                ref={passwordRef}
                placeholder="Password"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                returnKeyType="go"
                onSubmitEditing={onSubmit}
                style={[styles.input, { color: colors.text }]}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                {showPassword ? (
                  <EyeOff size={20} color="#9CA3AF" />
                ) : (
                  <Eye size={20} color="#9CA3AF" />
                )}
              </TouchableOpacity>
            </View>

            {/* Forgot Password */}
            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={() => router.push("/(auth)/forgot-password")}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Error Message */}
            {error ? <Text style={styles.error}>{error}</Text> : null}

            {/* Login Button */}
            <TouchableOpacity
              style={styles.loginButton}
              onPress={onSubmit}
              disabled={loading}
            >
              <Text style={styles.loginButtonText}>
                {loading ? "Logging in..." : "Log In"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Social Login Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Buttons */}
          <View style={styles.socialRow}>
            <TouchableOpacity style={styles.socialButton}>
              <Fingerprint size={24} color="#00C4A7" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.socialButton, !canUseGoogle && { opacity: 0.5 }]}
              onPress={handleGoogle}
              disabled={!request || !canUseGoogle}
            >
              <Chrome size={24} color="#EA4335" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.socialButton}>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: isDark ? '#FFF' : '#000' }}></Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
              Don't have an account?{" "}
            </Text>
            <Link href="/(auth)/sign-up" asChild>
              <TouchableOpacity>
                <Text style={styles.signUpText}>Sign up</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  iconContainer: {
    width: 64,
    height: 64,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  title: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 28,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 16,
  },
  form: {
    width: "100%",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 30, // Highly rounded corners as per design
    paddingHorizontal: 20,
    height: 56,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontFamily: Typography.fontFamily.medium,
    fontSize: 16,
    height: "100%",
  },
  eyeIcon: {
    padding: 4,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginTop: 12,
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: "#00C4A7",
    fontFamily: Typography.fontFamily.bold,
    fontSize: 14,
  },
  error: {
    color: "#FF5252",
    fontFamily: Typography.fontFamily.medium,
    textAlign: "center",
    marginBottom: 16,
  },
  loginButton: {
    backgroundColor: "#00C4A7",
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#00C4A7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontFamily: Typography.fontFamily.bold,
    fontSize: 18,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 32,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E7EB",
  },
  dividerText: {
    marginHorizontal: 16,
    color: "#9CA3AF",
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: 12,
    letterSpacing: 1,
  },
  socialRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    marginBottom: 32,
  },
  socialButton: {
    width: 56,
    height: 56,
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: "auto",
  },
  footerText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 14,
  },
  signUpText: {
    color: "#00C4A7",
    fontFamily: Typography.fontFamily.bold,
    fontSize: 14,
  },
});
