import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors } from "@/constants/Colors";
import { Layout } from "@/constants/Layout";
import { Typography } from "@/constants/Typography";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";

export default function VerifyEmailScreen() {
  const router = useRouter();
  const { user, sendVerificationEmail, refreshUser, signOut, initializing } =
    useAuth();
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (initializing) return;
    if (!user) {
      router.replace("/(auth)/sign-in" as any);
      return;
    }

    if (user.emailVerified) {
      // Redirect to root, let the layout handle NIC check
      router.replace("/");
    }
  }, [user, initializing, router]);

  const handleResend = async () => {
    setStatus(null);
    setSending(true);
    try {
      await sendVerificationEmail();
      setStatus("Verification email sent.");
    } catch (err: any) {
      setStatus(err?.message ?? "Failed to send verification email.");
    } finally {
      setSending(false);
    }
  };

  const handleCheck = async () => {
    setStatus(null);
    setLoading(true);
    try {
      await refreshUser();

      const currentUser = auth.currentUser;
      if (currentUser?.emailVerified) {
        router.replace("/");
      } else {
        setStatus("Not verified yet. Please check your inbox and try again.");
      }
    } catch (err: any) {
      setStatus(err?.message ?? "Could not refresh verification status.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: Colors.light.background }]} edges={['top', 'bottom']}
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>Verify your email</Text>
        <Text style={styles.subtitle}>
          We’ve sent a verification link to {user?.email}. Please verify to
          continue.
        </Text>

        {status ? <Text style={styles.status}>{status}</Text> : null}

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleCheck}
          disabled={loading}
        >
          <Text style={styles.primaryButtonText}>
            {loading ? "Checking..." : "I have verified"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleResend}
          disabled={sending}
        >
          <Text style={styles.secondaryButtonText}>
            {sending ? "Sending..." : "Resend email"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkButton} onPress={signOut}>
          <Text style={styles.linkText}>Sign out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
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
    marginTop: 8,
    fontFamily: Typography.fontFamily.medium,
    fontSize: 16,
    color: Colors.light.textSecondary,
    lineHeight: 22,
  },
  status: {
    marginTop: 12,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.light.info,
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
  linkButton: {
    marginTop: Layout.spacing.m,
    alignItems: "center",
  },
  linkText: {
    color: Colors.light.tint,
    fontFamily: Typography.fontFamily.bold,
  },
});
