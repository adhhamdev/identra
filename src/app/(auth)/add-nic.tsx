import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Colors } from "@/constants/Colors";
import { Typography } from "@/constants/Typography";
import { useAuth } from "@/context/AuthContext";
import { functions } from "@/lib/firebase";
import { parseNIC, validateNIC } from "@/lib/nic";
import { httpsCallable } from "firebase/functions";

export default function AddNICScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [nic, setNic] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      // Call Cloud Function validateAndRegisterNIC
      const validateAndRegisterNIC = httpsCallable(
        functions,
        "validateAndRegisterNIC"
      );
      const result = await validateAndRegisterNIC({ nic: trimmedNic });

      if (result.data?.success) {
        const data = result.data.data;
        Alert.alert(
          "NIC Added",
          `Your NIC has been validated.\n\nDate of Birth: ${
            data.dob
          }\nGender: ${
            data.gender.charAt(0).toUpperCase() + data.gender.slice(1)
          }`,
          [
            {
              text: "OK",
              onPress: () => router.replace("/(tabs)/index"),
            },
          ]
        );
      } else {
        setError(
          result.data?.error || "Failed to register NIC. Please try again."
        );
      }
    } catch (err: any) {
      console.error("NIC registration error:", err);
      setError(err.message || "Failed to register NIC. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatNICInput = (text: string) => {
    // Remove spaces and convert to uppercase
    const cleaned = text.replace(/\s/g, "").toUpperCase();
    setNic(cleaned);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="card-outline" size={48} color={Colors.light.tint} />
          </View>
          <Text style={styles.title}>Add Your NIC</Text>
          <Text style={styles.subtitle}>
            Enter your National Identity Card number to verify your identity
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>NIC Number</Text>
            <TextInput
              style={[styles.input, error && styles.inputError]}
              value={nic}
              onChangeText={formatNICInput}
              placeholder="e.g., 981234567V or 199812345678"
              placeholderTextColor={Colors.light.tint}
              autoCapitalize="characters"
              autoCorrect={false}
              keyboardType="default"
              maxLength={12}
            />
            {error && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={16} color="#EF4444" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
            <Text style={styles.hint}>
              Enter your 10-digit old format (ending with V/X) or 12-digit new
              format NIC number
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading || !nic.trim()}
          >
            <Text
              style={[styles.buttonText, loading && styles.buttonTextDisabled]}
            >
              {loading ? "Validating..." : "Continue"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 48,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "rgba(0, 196, 167, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 28,
    color: Colors.light.text,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: 16,
    color: Colors.light.textSecondary,
    textAlign: "center",
    lineHeight: 24,
  },
  form: {
    width: "100%",
  },
  inputContainer: {
    marginBottom: 32,
  },
  label: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 16,
    color: Colors.light.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.light.text,
    backgroundColor: Colors.light.background,
  },
  inputError: {
    borderColor: "#EF4444",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 6,
  },
  errorText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: 14,
    color: "#EF4444",
    flex: 1,
  },
  hint: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: 13,
    color: Colors.light.tint,
    marginTop: 8,
    lineHeight: 18,
  },
  button: {
    backgroundColor: Colors.light.tint,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#D1D5DB",
  },
  buttonText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: 16,
    color: "white",
  },
  buttonTextDisabled: {
    color: "#9CA3AF",
  },
});
