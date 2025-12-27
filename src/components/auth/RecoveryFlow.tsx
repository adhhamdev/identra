import { Typography } from "@/constants/Typography";
import { useSecurity } from "@/context/SecurityContext";
import * as crypto from "@/lib/crypto";
import * as Clipboard from 'expo-clipboard';
import { AlertTriangle, Check, ChevronRight, Copy, RefreshCw, Shield } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

interface RecoveryFlowProps {
    onComplete: () => void;
}

export default function RecoveryFlow({ onComplete }: RecoveryFlowProps) {
    const { initializeVault } = useSecurity();
    const [step, setStep] = useState<"intro" | "generate" | "verify">("intro");
    const [mnemonic, setMnemonic] = useState<string>("");
    const [words, setWords] = useState<string[]>([]);
    const [verificationIndexes, setVerificationIndexes] = useState<number[]>([]);
    const [verificationInput, setVerificationInput] = useState<{ [key: number]: string }>({});
    const [isInitializing, setIsInitializing] = useState(false);

    useEffect(() => {
        if (step === "generate") {
            const newMnemonic = crypto.generateMnemonic();
            setMnemonic(newMnemonic);
            setWords(newMnemonic.split(" "));
        }
    }, [step]);

    const handleStartGenerate = () => setStep("generate");

    const handleContinueToVerify = () => {
        // Select 3 random indexes for verification
        const indexes: number[] = [];
        while (indexes.length < 3) {
            const rand = Math.floor(Math.random() * 12);
            if (!indexes.includes(rand)) indexes.push(rand);
        }
        setVerificationIndexes(indexes.sort((a, b) => a - b));
        setStep("verify");
    };

    const handleComplete = async () => {
        // Check if all verification words match
        const isValid = verificationIndexes.every(
            (idx) => verificationInput[idx]?.toLowerCase().trim() === words[idx]
        );

        if (!isValid) {
            Alert.alert("Incorrect Words", "Please double-check the words from your recovery phrase.");
            return;
        }

        setIsInitializing(true);
        const success = await initializeVault(mnemonic);
        setIsInitializing(false);

        if (success) {
            onComplete();
        }
    };

    const copyToClipboard = async () => {
        await Clipboard.setStringAsync(mnemonic);
        Alert.alert("Copied", "Recovery phrase copied to clipboard. Please store it securely!");
    };

    if (step === "intro") {
        return (
            <View style={styles.container}>
                <Animated.View entering={FadeInDown.delay(200)} style={styles.content}>
                    <View style={styles.iconCircle}>
                        <Shield size={48} color="#00C4A7" strokeWidth={1.5} />
                    </View>
                    <Text style={styles.title}>Secure Your Vault</Text>
                    <Text style={styles.description}>
                        Identra is a bank-grade, zero-trust wallet. This means only YOU have the keys to your data.
                    </Text>

                    <View style={styles.warningBox}>
                        <AlertTriangle size={20} color="#FFB703" style={styles.warningIcon} />
                        <Text style={styles.warningText}>
                            If you lose your recovery phrase and your device, your data is lost forever. Identra cannot recover it for you.
                        </Text>
                    </View>

                    <View style={styles.bulletPoints}>
                        <Bullet text="12-word phrase to recover your keys" />
                        <Bullet text="Stored only on your device" />
                        <Bullet text="Encrypted with hardware-backed security" />
                    </View>
                </Animated.View>

                <TouchableOpacity style={styles.primaryButton} onPress={handleStartGenerate}>
                    <Text style={styles.primaryButtonText}>Get My Recovery Phrase</Text>
                    <ChevronRight size={20} color="#FFF" />
                </TouchableOpacity>
            </View>
        );
    }

    if (step === "generate") {
        return (
            <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                <Animated.View entering={FadeIn} style={styles.content}>
                    <Text style={styles.title}>Your Recovery Phrase</Text>
                    <Text style={styles.subtitle}>Write these 12 words down in order and store them in a safe place.</Text>

                    <View style={styles.phraseGrid}>
                        {words.map((word, index) => (
                            <View key={index} style={styles.wordChip}>
                                <Text style={styles.wordIndex}>{index + 1}</Text>
                                <Text style={styles.wordText}>{word}</Text>
                            </View>
                        ))}
                    </View>

                    <TouchableOpacity style={styles.copyButton} onPress={copyToClipboard}>
                        <Copy size={18} color="#6B7280" />
                        <Text style={styles.copyButtonText}>Copy to Clipboard</Text>
                    </TouchableOpacity>

                    <View style={styles.reminderBox}>
                        <Text style={styles.reminderTitle}>Pro-Tip:</Text>
                        <Text style={styles.reminderText}>Don't share this phrase with anyone. It gives full access to your identity vault.</Text>
                    </View>
                </Animated.View>

                <TouchableOpacity style={styles.primaryButton} onPress={handleContinueToVerify}>
                    <Text style={styles.primaryButtonText}>I've Written It Down</Text>
                    <Check size={20} color="#FFF" />
                </TouchableOpacity>
            </ScrollView>
        );
    }

    if (step === "verify") {
        return (
            <View style={styles.container}>
                <Animated.View entering={FadeIn} style={styles.content}>
                    <Text style={styles.title}>Confirm Phrase</Text>
                    <Text style={styles.subtitle}>Enter the following words from your phrase to confirm you've saved it.</Text>

                    {verificationIndexes.map((idx) => (
                        <View key={idx} style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Word #{idx + 1}</Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder={`Enter word #${idx + 1}`}
                                autoCapitalize="none"
                                autoCorrect={false}
                                value={verificationInput[idx] || ""}
                                onChangeText={(text) => setVerificationInput(prev => ({ ...prev, [idx]: text }))}
                            />
                        </View>
                    ))}

                    <TouchableOpacity
                        style={[styles.primaryButton, isInitializing && styles.buttonDisabled]}
                        onPress={handleComplete}
                        disabled={isInitializing}
                    >
                        {isInitializing ? (
                            <RefreshCw size={20} color="#FFF" style={styles.spin} />
                        ) : (
                            <>
                                <Text style={styles.primaryButtonText}>Initialize Secure Vault</Text>
                                <Shield size={20} color="#FFF" />
                            </>
                        )}
                    </TouchableOpacity>
                </Animated.View>
            </View>
        );
    }

    return null;
}

function Bullet({ text }: { text: string }) {
    return (
        <View style={styles.bullet}>
            <Check size={16} color="#00C4A7" />
            <Text style={styles.bulletText}>{text}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        backgroundColor: "#FFF",
        justifyContent: "space-between",
    },
    scrollContainer: {
        padding: 24,
        backgroundColor: "#FFF",
        minHeight: "100%",
        justifyContent: "space-between",
    },
    content: {
        alignItems: "center",
        paddingTop: 40,
    },
    iconCircle: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: "rgba(0, 196, 167, 0.08)",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 32,
    },
    title: {
        fontSize: 28,
        fontFamily: Typography.fontFamily.bold,
        color: "#111827",
        textAlign: "center",
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 16,
        fontFamily: Typography.fontFamily.regular,
        color: "#6B7280",
        textAlign: "center",
        marginBottom: 32,
        lineHeight: 24,
    },
    description: {
        fontSize: 16,
        fontFamily: Typography.fontFamily.regular,
        color: "#4B5563",
        textAlign: "center",
        lineHeight: 26,
        marginBottom: 32,
    },
    warningBox: {
        flexDirection: "row",
        backgroundColor: "#FFFBEB",
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#FEF3C7",
        marginBottom: 32,
    },
    warningIcon: {
        marginRight: 12,
        marginTop: 2,
    },
    warningText: {
        flex: 1,
        fontSize: 14,
        fontFamily: Typography.fontFamily.medium,
        color: "#92400E",
        lineHeight: 20,
    },
    bulletPoints: {
        width: "100%",
        gap: 16,
    },
    bullet: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    bulletText: {
        fontSize: 15,
        fontFamily: Typography.fontFamily.medium,
        color: "#374151",
    },
    phraseGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
        justifyContent: "center",
        marginBottom: 24,
    },
    wordChip: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F3F4F6",
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 8,
        minWidth: "30%",
    },
    wordIndex: {
        fontSize: 12,
        fontFamily: Typography.fontFamily.semiBold,
        color: "#9CA3AF",
        marginRight: 8,
    },
    wordText: {
        fontSize: 15,
        fontFamily: Typography.fontFamily.semiBold,
        color: "#1F2937",
    },
    copyButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        padding: 12,
        marginBottom: 32,
    },
    copyButtonText: {
        fontSize: 14,
        fontFamily: Typography.fontFamily.medium,
        color: "#6B7280",
    },
    reminderBox: {
        width: "100%",
        padding: 16,
        backgroundColor: "#F9FAFB",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    reminderTitle: {
        fontSize: 14,
        fontFamily: Typography.fontFamily.bold,
        color: "#374151",
        marginBottom: 4,
    },
    reminderText: {
        fontSize: 14,
        fontFamily: Typography.fontFamily.regular,
        color: "#6B7280",
        lineHeight: 20,
    },
    inputGroup: {
        width: "100%",
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        fontFamily: Typography.fontFamily.medium,
        color: "#374151",
        marginBottom: 8,
    },
    inputWrapper: {
        backgroundColor: "#F9FAFB",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 12,
        padding: 16,
    },
    inputText: {
        fontSize: 16,
        fontFamily: Typography.fontFamily.semiBold,
        color: "#111827",
    },
    textInput: {
        backgroundColor: "#F3F4F6",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        fontFamily: Typography.fontFamily.medium,
        color: "#111827",
    },
    primaryButton: {
        backgroundColor: "#00C4A7",
        paddingVertical: 18,
        borderRadius: 16,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 12,
        width: "100%",
        // Shadow for elevation
        shadowColor: "#00C4A7",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 8,
    },
    primaryButtonText: {
        color: "#FFF",
        fontSize: 17,
        fontFamily: Typography.fontFamily.bold,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    spin: {
        // Add rotation animation if needed
    }
});
