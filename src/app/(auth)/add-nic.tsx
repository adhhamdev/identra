import { useRouter } from "expo-router";
import {
  ArrowRight,
  IdCard,
  Lock,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Alert,
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

import { Colors } from "@/constants/Colors";
import { Typography } from "@/constants/Typography";
import { useAuth } from "@/context/AuthContext";
import { auth, functions } from "@/lib/firebase";
import { parseNIC, validateNIC } from "@/lib/nic";
import { validateAndRegisterNICResponse } from "@/types/functions";
import { httpsCallable } from "firebase/functions";

export default function AddNICScreen() {
  const router = useRouter();
  const { user, userProfile, refreshUser } = useAuth();
  const [nic, setNic] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userProfile?.nic_last4) {
      router.replace("/(tabs)" as any);
    }
  }, [userProfile, router]);

  const handleSubmit = async () => {
    setError(null);
    const trimmedNic = nic.trim().toUpperCase();

    if (!trimmedNic) {
      setError("Please enter your NIC number");
      return;
    }

    if (!validateNIC(trimmedNic)) {
      setError("Invalid NIC format. Please check and try again.");
      return;
    }

    const nicInfo = parseNIC(trimmedNic);
    if (!nicInfo) {
      setError("Failed to parse NIC. Please check the format.");
      return;
    }

    setLoading(true);
    try {
      if (auth.currentUser) {
        await auth.currentUser.reload();
        await auth.currentUser.getIdToken(true);
      }

      if (auth.currentUser?.emailVerified === false) {
        throw new Error(
          "Please verify your email address before continuing. Check your inbox."
        );
      }

      const validateAndRegisterNIC = httpsCallable(
        functions,
        "validateAndRegisterNIC"
      );
      const result = (await validateAndRegisterNIC({ nic: trimmedNic }))
        .data as validateAndRegisterNICResponse;

      if (result.success) {
        const data = result.data;
        Alert.alert(
          "NIC Added",
          `Your NIC has been validated.\n\nDate of Birth: ${data?.dob
          }\nGender: ${data?.gender
            ? data?.gender.charAt(0).toUpperCase() + data?.gender.slice(1)
            : "Unknown"
          }`,
          [
            {
              text: "OK",
              onPress: () => router.replace("/"),
            },
          ]
        );
      } else {
        setError(result?.error || "Failed to register NIC. Please try again.");
      }
    } catch (err: any) {
      console.error("NIC registration error:", err);
      setError(err.message || "Failed to register NIC. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatNICInput = (text: string) => {
    const cleaned = text.replace(/\s/g, "").toUpperCase();
    setNic(cleaned);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.headerBar}>
          <Text style={styles.headerTitle}>Add Your NIC</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.mainContent}>
            <Text style={styles.mainTitle}>Link your National ID</Text>

            {/* Input Section */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>NIC Number</Text>
              <View style={[styles.inputWrapper, { borderColor: "#E5E7EB" }]}>
                <TextInput
                  style={styles.input}
                  value={nic}
                  onChangeText={formatNICInput}
                  placeholder="e.g. 199012345678"
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="characters"
                  maxLength={12}
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit}
                  blurOnSubmit={true}
                />
                <IdCard size={24} color="#9CA3AF" />
              </View>
              {error && <Text style={styles.errorText}>{error}</Text>}
            </View>
          </View>
        </ScrollView>

        {/* Footer Section (Button + Security Text) */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.verifyButton, loading && { opacity: 0.7 }]}
            onPress={handleSubmit}
            disabled={loading || !nic.trim()}
          >
            <Text style={styles.verifyButtonText}>
              {loading ? "Verifying..." : "Verify & Continue"}
            </Text>
            {!loading && <ArrowRight size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />}
          </TouchableOpacity>

          <View style={styles.securityNote}>
            <Lock size={14} color="#9CA3AF" />
            <Text style={styles.securityText}>
              Your data is encrypted and stored locally
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB", // Light background from image
  },
  keyboardView: {
    flex: 1,
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center", // Centered since no back button
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  headerTitle: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: 18,
    color: "#111827",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  mainContent: {
    marginTop: 40,
    alignItems: "center",
  },
  mainTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 26,
    color: "#111827",
    marginBottom: 40,
    textAlign: "center",
  },
  inputContainer: {
    width: "100%",
  },
  label: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 14,
    color: "#111827",
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderRadius: 30, // Pill shape
    paddingHorizontal: 20, // More padding for pill shape
    height: 56,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: Typography.fontFamily.medium,
    color: "#1F2937",
    paddingRight: 10,
  },
  errorText: {
    color: "#EF4444",
    fontFamily: Typography.fontFamily.medium,
    fontSize: 14,
    marginTop: 8,
    marginLeft: 4,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  verifyButton: {
    backgroundColor: Colors.light.tint, // Green check
    borderRadius: 30, // Pill shape
    height: 56,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: Colors.light.tint,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  verifyButtonText: {
    color: "#FFFFFF",
    fontFamily: Typography.fontFamily.bold,
    fontSize: 16,
  },
  securityNote: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  securityText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: 12, // Small text
    color: "#9CA3AF",
  },
});
