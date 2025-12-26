import { FileText, Image as ImageIcon, Link, QrCode, ShieldCheck } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { Layout } from "@/constants/Layout";
import { Typography } from "@/constants/Typography";
import { useSecurity } from "@/context/SecurityContext";
import { useTheme } from "@/context/ThemeContext";
import { useDocumentManagement } from "@/hooks/useDocumentManagement";

interface ShareDocumentSheetProps {
    document: any;
    onClose: () => void;
}

export default function ShareDocumentSheet({
    document,
    onClose,
}: ShareDocumentSheetProps) {
    const { colors, isDark } = useTheme();
    const { decryptAndShare } = useDocumentManagement();
    const { isUnlocked, unlockVault } = useSecurity();

    const handleAction = async (action: string) => {
        if (!isUnlocked) {
            const success = await unlockVault();
            if (!success) return;
        }

        // Use the common secure share flow for all formats in MVP
        await decryptAndShare(document);
        onClose();
    };

    if (!document) return null;

    return (
        <View style={styles.contentContainer}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: colors.text }]}>
                    Share {document?.title || "Document"}
                </Text>
            </View>

            {/* Actions List */}
            <View style={styles.actionsContainer}>

                <TouchableOpacity style={[styles.actionButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#FFFFFF', borderColor: isDark ? 'transparent' : '#F0F0F0', borderWidth: 1 }]} onPress={() => handleAction('link')}>
                    <View style={[styles.actionIcon, { backgroundColor: '#E0F2F1' }]}>
                        <Link size={20} color="#009688" />
                    </View>
                    <View style={styles.actionTextContainer}>
                        <Text style={[styles.actionTitle, { color: colors.text }]}>Generate Secure Link</Text>
                        <Text style={[styles.actionSubtitle, { color: colors.textSecondary }]}>Best for temporary access</Text>
                    </View>
                    <Link size={16} color={colors.textSecondary} style={{ opacity: 0 }} />
                    {/* Right arrow placeholder if needed, design shows simple chevron or nothing? Design shows ChevronRight usually. */}
                </TouchableOpacity>

                <TouchableOpacity style={[styles.actionButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#FFFFFF', borderColor: isDark ? 'transparent' : '#F0F0F0', borderWidth: 1 }]} onPress={() => handleAction('image')}>
                    <View style={[styles.actionIcon, { backgroundColor: '#E0F2F1' }]}>
                        <ImageIcon size={20} color="#009688" />
                    </View>
                    <View style={styles.actionTextContainer}>
                        <Text style={[styles.actionTitle, { color: colors.text }]}>Share as Image</Text>
                        <Text style={[styles.actionSubtitle, { color: colors.textSecondary }]}>.PNG format</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.actionButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#FFFFFF', borderColor: isDark ? 'transparent' : '#F0F0F0', borderWidth: 1 }]} onPress={() => handleAction('pdf')}>
                    <View style={[styles.actionIcon, { backgroundColor: '#E0F2F1' }]}>
                        <FileText size={20} color="#009688" />
                    </View>
                    <View style={styles.actionTextContainer}>
                        <Text style={[styles.actionTitle, { color: colors.text }]}>Share as PDF</Text>
                        <Text style={[styles.actionSubtitle, { color: colors.textSecondary }]}>Best for printing</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.actionButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#FFFFFF', borderColor: isDark ? 'transparent' : '#F0F0F0', borderWidth: 1 }]} onPress={() => handleAction('qr')}>
                    <View style={[styles.actionIcon, { backgroundColor: '#E0F2F1' }]}>
                        <QrCode size={20} color="#009688" />
                    </View>
                    <View style={styles.actionTextContainer}>
                        <Text style={[styles.actionTitle, { color: colors.text }]}>Show QR Code</Text>
                        <Text style={[styles.actionSubtitle, { color: colors.textSecondary }]}>For in-person verification</Text>
                    </View>
                </TouchableOpacity>

            </View>

            {/* Secure Badge */}
            <View style={[styles.secureBadge, { backgroundColor: 'rgba(0, 196, 167, 0.1)' }]}>
                <ShieldCheck size={14} color="#00C4A7" style={{ marginRight: 6 }} />
                <Text style={styles.secureText}>END-TO-END ENCRYPTED</Text>
            </View>

            {/* Cancel Button */}
            <TouchableOpacity style={[styles.cancelButton, { borderColor: colors.border }]} onPress={onClose}>
                <Text style={[styles.cancelText, { color: colors.text }]}>Cancel</Text>
            </TouchableOpacity>

        </View>
    );
}

const styles = StyleSheet.create({
    contentContainer: {
        paddingBottom: 40,
        alignItems: 'center',
    },
    header: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: Layout.spacing.l,
        width: '100%',
    },
    headerTitle: {
        fontFamily: Typography.fontFamily.bold,
        fontSize: 18
    },
    iconButton: {
        padding: 4,
    },
    actionsContainer: {
        width: '100%',
        marginBottom: Layout.spacing.l,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Layout.spacing.m,
        borderRadius: Layout.borderRadius.xl,
        marginBottom: Layout.spacing.m
    },
    actionIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Layout.spacing.m,
    },
    actionTextContainer: {
        flex: 1,
    },
    actionTitle: {
        fontFamily: Typography.fontFamily.bold,
        fontSize: 16,
        marginBottom: 2,
    },
    actionSubtitle: {
        fontFamily: Typography.fontFamily.medium,
        fontSize: 12,
    },
    secureBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginBottom: Layout.spacing.l,
    },
    secureText: {
        fontFamily: Typography.fontFamily.bold,
        fontSize: 10,
        color: '#00C4A7',
        letterSpacing: 0.5,
    },
    cancelButton: {
        width: '100%',
        paddingVertical: 14,
        borderRadius: 30,
        borderWidth: 1,
        alignItems: 'center',
    },
    cancelText: {
        fontFamily: Typography.fontFamily.bold,
        fontSize: 16,
    },
});
