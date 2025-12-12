import * as Google from "expo-auth-session/providers/google";
import { Link, useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useMemo, useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Colors } from "@/constants/Colors";
import { Layout } from "@/constants/Layout";
import { Typography } from "@/constants/Typography";
import { useAuth } from "@/context/AuthContext";
import Constants from "expo-constants";

WebBrowser.maybeCompleteAuthSession();

type Extra = {
  google?: {
    webClientId?: string;
    iosClientId?: string;
    androidClientId?: string;
  };
};

export default function SignInScreen() {
  const router = useRouter();
  const { signIn, signInWithGoogleTokens, user, initializing } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const googleConfig = useMemo(() => {
    const extra = Constants.expoConfig?.extra as Extra | undefined;
    return {
      webClientId: extra?.google?.webClientId,
      iosClientId: extra?.google?.iosClientId,
      androidClientId: extra?.google?.androidClientId,
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
        signInWithGoogleTokens({
          idToken: idToken ?? undefined,
          accessToken: accessToken ?? undefined,
        }).catch((err) => setError(err?.message ?? "Google sign-in failed"));
      }
    }
  }, [response, signInWithGoogleTokens]);

  useEffect(() => {
    if (initializing) return;
    if (!user) return;
    const isPasswordUser = user.providerData.some(
      (p) => p.providerId === "password"
    );
    if (isPasswordUser && !user.emailVerified) {
      router.replace("/(auth)/verify-email");
    } else {
      router.replace("/(tabs)");
    }
  }, [user, initializing, router]);

  const onSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      await signIn(email, password);
      router.replace("/(tabs)");
    } catch (err: any) {
      setError(err?.message ?? "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  const canUseGoogle =
    !!googleConfig.androidClientId ||
    !!googleConfig.iosClientId ||
    (Platform.OS === "web" && googleConfig.webClientId);

  const handleGoogle = async () => {
    setError(null);
    const result = await promptAsync();
    if (result?.type === "dismiss") return;
  };

  return (
    <View
      style={[styles.container, { backgroundColor: Colors.light.background }]}
    >
      <Text style={styles.title}>Welcome back</Text>
      <Text style={styles.subtitle}>Sign in to continue</Text>

      <View style={styles.form}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          placeholder="you@example.com"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
        />

        <Text style={[styles.label, { marginTop: 12 }]}>Password</Text>
        <TextInput
          placeholder="••••••••"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={onSubmit}
          disabled={loading}
        >
          <Text style={styles.primaryButtonText}>
            {loading ? "Signing in..." : "Sign In"}
          </Text>
        </TouchableOpacity>

        <View style={styles.linksRow}>
          <Text style={styles.linkText}>No account?</Text>
          <Link href="/(auth)/sign-up" style={styles.link}>
            Sign up
          </Link>
        </View>
      </View>

      <View style={styles.dividerRow}>
        <View style={styles.divider} />
        <Text style={styles.dividerText}>or</Text>
        <View style={styles.divider} />
      </View>

      <TouchableOpacity
        style={[styles.secondaryButton, !canUseGoogle && styles.disabledButton]}
        onPress={handleGoogle}
        disabled={!request || !canUseGoogle}
      >
        <Text style={styles.secondaryButtonText}>Continue with Google</Text>
      </TouchableOpacity>
      {!canUseGoogle ? (
        <Text style={styles.info}>
          Add Google client IDs in app.json extra.google
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Layout.spacing.l,
    paddingTop: Layout.spacing.xl,
  },
  title: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 28,
    color: Colors.light.text,
  },
  subtitle: {
    marginTop: 6,
    fontFamily: Typography.fontFamily.medium,
    fontSize: 16,
    color: Colors.light.textSecondary,
  },
  form: {
    marginTop: Layout.spacing.xl,
  },
  label: {
    fontFamily: Typography.fontFamily.medium,
    color: Colors.light.textSecondary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.light.surface,
    borderRadius: Layout.borderRadius.m,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: Typography.fontFamily.medium,
    borderWidth: 1,
    borderColor: Colors.light.border,
    color: Colors.light.text,
  },
  primaryButton: {
    marginTop: Layout.spacing.l,
    backgroundColor: Colors.light.tint,
    paddingVertical: 14,
    borderRadius: Layout.borderRadius.m,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#fff",
    fontFamily: Typography.fontFamily.bold,
    fontSize: 16,
  },
  secondaryButton: {
    marginTop: Layout.spacing.m,
    borderColor: Colors.light.border,
    borderWidth: 1,
    paddingVertical: 14,
    borderRadius: Layout.borderRadius.m,
    alignItems: "center",
    backgroundColor: Colors.light.surface,
  },
  secondaryButtonText: {
    color: Colors.light.text,
    fontFamily: Typography.fontFamily.medium,
    fontSize: 15,
  },
  disabledButton: {
    opacity: 0.5,
  },
  linksRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  linkText: {
    color: Colors.light.textSecondary,
    fontFamily: Typography.fontFamily.medium,
  },
  link: {
    color: Colors.light.tint,
    fontFamily: Typography.fontFamily.bold,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Layout.spacing.l,
    gap: 8,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.light.border,
  },
  dividerText: {
    color: Colors.light.textSecondary,
    fontFamily: Typography.fontFamily.medium,
  },
  error: {
    marginTop: 10,
    color: Colors.light.error,
    fontFamily: Typography.fontFamily.medium,
  },
  info: {
    marginTop: 6,
    color: Colors.light.textSecondary,
    fontFamily: Typography.fontFamily.medium,
    fontSize: 13,
    textAlign: "center",
  },
});
