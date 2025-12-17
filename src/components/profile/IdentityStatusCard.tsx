import { Layout } from '@/constants/Layout';
import { Typography } from '@/constants/Typography';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowRight, ScanLine } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function IdentityStatusCard() {
    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#1A2B3C', '#0F1724']} // Dark gradient
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.card}
            >
                {/* Background Image Placeholder - In a real app, this would be a specific image asset */}
                <View style={styles.bgPlaceholder}>
                    {/* Simulating the lock image with a placeholder or icon if needed, but using text for now or just the gradient */}
                </View>

                <View style={styles.content}>
                    <View style={styles.iconContainer}>
                        {/* Placeholder for the fingerprint/ID icon */}
                        <ScanLine size={20} color="#FFF" />
                    </View>
                    <Text style={styles.title}>National Identity Card</Text>
                    <Text style={styles.number}>•••• 4321</Text>
                </View>

                <View style={styles.footer}>
                    <View>
                        <Text style={styles.statusLabel}>Status</Text>
                        <View style={styles.statusRow}>
                            <View style={styles.statusDot} />
                            <Text style={styles.statusValue}>Active</Text>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.detailsButton}>
                        <Text style={styles.detailsText}>Details</Text>
                        <ArrowRight size={16} color="#000" />
                    </TouchableOpacity>
                </View>

                {/* Floating Scan Button */}
                <View style={styles.scanButton}>
                    <ScanLine size={20} color="#000" />
                </View>

            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...Layout.shadows.soft,
        marginBottom: Layout.spacing.l,
    },
    card: {
        borderRadius: Layout.borderRadius.xl,
        padding: Layout.spacing.l,
        height: 200,
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
    },
    bgPlaceholder: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.3,
        // Add background image logic here if available
    },
    content: {
        alignItems: 'flex-start',
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Layout.spacing.s,
    },
    title: {
        fontFamily: Typography.fontFamily.medium,
        fontSize: 14,
        color: '#FFF',
        marginBottom: 4,
    },
    number: {
        fontFamily: Typography.fontFamily.bold,
        fontSize: 20,
        color: '#FFF',
        letterSpacing: 2,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    statusLabel: {
        fontFamily: Typography.fontFamily.medium,
        fontSize: 12,
        color: '#888',
        marginBottom: 4,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#00E676', // Green
        marginRight: 6,
    },
    statusValue: {
        fontFamily: Typography.fontFamily.bold,
        fontSize: 14,
        color: '#FFF',
    },
    detailsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#00FFD1', // Bright Teal
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    detailsText: {
        fontFamily: Typography.fontFamily.bold,
        fontSize: 12,
        color: '#000',
        marginRight: 4,
    },
    scanButton: {
        position: 'absolute',
        bottom: 20,
        right: 20, // Adjust based on design, it overlaps the button in the image slightly or is separate
        // In the image it looks like it's part of the button or a separate floating element. 
        // Let's position it as a separate element for now if it's the scan icon.
        // Actually looking closely at the image, the scan icon is part of a larger teal shape or button.
        // I'll stick to the "Details" button for now and maybe add the scan icon as a separate overlay if needed.
        // The image shows a large teal button with a scan icon. Let's adjust.
        display: 'none', // Hiding for now to match the "Details" button approach, or I can make the Details button look like the image.
    },
});
