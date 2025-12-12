import { Link, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
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

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp, user, initializing } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initializing) return;
    if (user) {
      router.replace("/(auth)/verify-email");
    }
  }, [user, initializing, router]);

  const onSubmit = async () => {
    setError(null);
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await signUp(email, password);
      router.replace("/(auth)/verify-email");
    } catch (err: any) {
      setError(err?.message ?? "Failed to sign up");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      style={[styles.container, { backgroundColor: Colors.light.background }]}
    >
      <Text style={styles.title}>Create account</Text>
      <Text style={styles.subtitle}>Sign up with your email</Text>

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

        <Text style={[styles.label, { marginTop: 12 }]}>Confirm Password</Text>
        <TextInput
          placeholder="••••••••"
          value={confirm}
          onChangeText={setConfirm}
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
            {loading ? "Creating..." : "Create account"}
          </Text>
        </TouchableOpacity>

        <View style={styles.linksRow}>
          <Text style={styles.linkText}>Already have an account?</Text>
          <Link href="/(auth)/sign-in" style={styles.link}>
            Sign in
          </Link>
        </View>
      </View>
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
  error: {
    marginTop: 10,
    color: Colors.light.error,
    fontFamily: Typography.fontFamily.medium,
  },
});
