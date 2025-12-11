import { Layout } from '@/constants/Layout';
import { Typography } from '@/constants/Typography';
import { MoreVertical, ShieldCheck } from 'lucide-react-native';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface CertificateCardProps {
    title: string;
    subtitle: string;
    status: 'Valid' | 'Expired';
    expiry: string;
    icon: any; // Lucide icon component
    color: string; // Background color for icon circle
    previewImage?: string; // Optional preview image URL
}

export default function CertificateCard({
    title,
    subtitle,
    status,
    expiry,
    icon: Icon,
    color,
    previewImage,
}: CertificateCardProps) {
    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <View style={[styles.iconCircle, { backgroundColor: color }]}>
                        <Icon size={20} color="#FFF" />
                    </View>
                    <View>
                        <Text style={styles.title}>{title}</Text>
                        <Text style={styles.subtitle}>{subtitle}</Text>
                    </View>
                </View>
                <TouchableOpacity>
                    <MoreVertical size={20} color="#AAA" />
                </TouchableOpacity>
            </View>

            {/* Status Row */}
            <View style={styles.statusRow}>
                <View style={styles.statusBadge}>
                    <ShieldCheck size={12} color="#008000" style={{ marginRight: 4 }} />
                    <Text style={styles.statusText}>{status}</Text>
                </View>
                <Text style={styles.expiryText}>Expires {expiry}</Text>
            </View>

            {/* Preview Area */}
            <TouchableOpacity style={styles.previewArea}>
                {previewImage ? (
                    <Image source={{ uri: previewImage }} style={styles.previewImage} resizeMode="cover" />
                ) : (
                    <View style={styles.placeholderPreview}>
                        <View style={styles.placeholderContent} />
                    </View>
                )}
                <View style={styles.tapOverlay}>
                    <Text style={styles.tapText}>TAP TO VIEW</Text>
                </View>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#F5E6D3', // Beige/Peach background
        borderRadius: Layout.borderRadius.xl,
        padding: Layout.spacing.m,
        marginBottom: Layout.spacing.m,
        ...Layout.shadows.soft,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: Layout.spacing.m,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Layout.spacing.m,
    },
    title: {
        fontFamily: Typography.fontFamily.bold,
        fontSize: 16,
        color: '#333',
    },
    subtitle: {
        fontFamily: Typography.fontFamily.medium,
        fontSize: 12,
        color: '#888',
        marginTop: 2,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Layout.spacing.m,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginRight: Layout.spacing.m,
    },
    statusText: {
        fontFamily: Typography.fontFamily.bold,
        fontSize: 12,
        color: '#008000',
    },
    expiryText: {
        fontFamily: Typography.fontFamily.medium,
        fontSize: 12,
        color: '#008000', // Matching the green theme from image
    },
    previewArea: {
        height: 100,
        borderRadius: Layout.borderRadius.l,
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#D7CCC8', // Darker beige placeholder
    },
    previewImage: {
        width: '100%',
        height: '100%',
    },
    placeholderPreview: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderContent: {
        width: '60%',
        height: '60%',
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: 8,
    },
    tapOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: Layout.spacing.s,
        backgroundColor: 'rgba(0,0,0,0.1)', // Subtle gradient overlay effect
    },
    tapText: {
        fontFamily: Typography.fontFamily.bold,
        fontSize: 10,
        color: '#FFF',
        letterSpacing: 1,
    },
});
