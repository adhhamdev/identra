import { Link, useRouter } from "expo-router";
import {
    ChevronLeft,
    KeyRound,
    Mail,
} from "lucide-react-native";
import React, { useState } from "react";
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

export default function ForgotPasswordScreen() {
    const router = useRouter();
    const { sendPasswordResetEmail } = useAuth();

    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleReset = async () => {
        setError(null);
        if (!email.trim() || !email.includes("@")) {
            setError("Please enter a valid email address");
            return;
        }

        setLoading(true);
        try {
            await sendPasswordResetEmail(email);
            Alert.alert(
                "Email Sent",
                "If an account exists with this email, you will receive a password reset link shortly.",
                [{ text: "OK", onPress: () => router.push("/(auth)/sign-in") }]
            );
        } catch (err: any) {
            if (err.code === "auth/user-not-found") {
                Alert.alert(
                    "Email Sent",
                    "If an account exists with this email, you will receive a password reset link shortly.",
                    [{ text: "OK", onPress: () => router.push("/(auth)/sign-in") }]
                );
            } else {
                setError(err?.message || "Failed to send reset email.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardView}
            >
                {/* Header */}
                <View style={styles.headerBar}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <ChevronLeft size={28} color="#000" />
                    </TouchableOpacity>
                </View>

                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Icon + Title */}
                    <View style={styles.topSection}>
                        <View style={styles.iconCircle}>
                            <KeyRound size={32} color="#00C4A7" strokeWidth={2.5} />
                        </View>
                        <Text style={styles.title}>Forgot Password?</Text>
                        <Text style={styles.subtitle}>
                            Don't worry, it happens. Please enter the email address linked to
                            your account.
                        </Text>
                    </View>

                    {/* Form */}
                    <View style={styles.formContainer}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Email Address</Text>
                            <View style={styles.inputWrapper}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="name@example.com"
                                    placeholderTextColor="#9CA3AF"
                                    value={email}
                                    onChangeText={setEmail}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                    returnKeyType="go"
                                    onSubmitEditing={handleReset}
                                />
                                <Mail size={20} color={Colors.light.tint} />
                            </View>
                        </View>

                        {error && <Text style={styles.errorText}>{error}</Text>}

                        <TouchableOpacity
                            style={[styles.button, loading && styles.buttonDisabled]}
                            onPress={handleReset}
                            disabled={loading}
                        >
                            <Text style={styles.buttonText}>
                                {loading ? "Sending..." : "Send Reset Link"}
                            </Text>
                        </TouchableOpacity>

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>Remember password? </Text>
                            <Link href="/(auth)/sign-in" asChild>
                                <TouchableOpacity>
                                    <Text style={styles.footerLink}>Log in</Text>
                                </TouchableOpacity>
                            </Link>
                        </View>
                    </View>
                </ScrollView>

                {/* Bottom Support Link */}
                <View style={styles.bottomFooter}>
                    <Text style={styles.supportText}>Having trouble? </Text>
                    <TouchableOpacity>
                        <Text style={styles.supportLink}>Contact Support</Text>
                    </TouchableOpacity>
                </View>

            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F9FAFB",
    },
    keyboardView: {
        flex: 1,
    },
    headerBar: {
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    backButton: {
        padding: 4,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: 20,
        alignItems: "center",
    },
    topSection: {
        alignItems: "center",
        marginBottom: 40,
        maxWidth: 280,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "#E0F7F3",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 24,
        borderWidth: 4,
        borderColor: "#F0FDF9",
    },
    title: {
        fontFamily: Typography.fontFamily.bold,
        fontSize: 26,
        color: "#111827",
        marginBottom: 12,
        textAlign: "center",
    },
    subtitle: {
        fontFamily: Typography.fontFamily.regular,
        fontSize: 15,
        color: "#6B7280",
        textAlign: "center",
        lineHeight: 22,
    },
    formContainer: {
        width: "100%",
    },
    inputGroup: {
        marginBottom: 24,
    },
    label: {
        fontFamily: Typography.fontFamily.medium,
        fontSize: 14,
        color: "#111827",
        marginBottom: 8,
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 52,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    input: {
        flex: 1,
        fontSize: 15,
        fontFamily: Typography.fontFamily.medium,
        color: "#1F2937",
        paddingRight: 12,
    },
    errorText: {
        color: "#EF4444",
        fontFamily: Typography.fontFamily.medium,
        fontSize: 14,
        marginBottom: 16,
        textAlign: "center",
    },
    button: {
        backgroundColor: Colors.light.tint,
        borderRadius: 24, // Rounded
        height: 52,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 24,
        shadowColor: Colors.light.tint,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: "#FFFFFF",
        fontFamily: Typography.fontFamily.bold,
        fontSize: 16,
    },
    footer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },
    footerText: {
        color: "#4B5563",
        fontFamily: Typography.fontFamily.medium,
        fontSize: 14,
    },
    footerLink: {
        color: Colors.light.tint,
        fontFamily: Typography.fontFamily.bold,
        fontSize: 14,
    },
    bottomFooter: {
        position: 'absolute',
        bottom: 20,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    supportText: {
        color: "#9CA3AF",
        fontFamily: Typography.fontFamily.regular,
        fontSize: 13,
    },
    supportLink: {
        color: "#6B7280",
        fontFamily: Typography.fontFamily.medium,
        fontSize: 13,
    }
});
