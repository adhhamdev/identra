import { Layout } from '@/constants/Layout';
import { Typography } from '@/constants/Typography';
import { LinearGradient } from 'expo-linear-gradient';
import { AlertTriangle, Check, Wifi } from 'lucide-react-native';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

export type PassportTheme = 'navy' | 'maroon';
export type PassportStatus = 'valid' | 'expiring';

interface PassportCardProps {
    country: string;
    number: string;
    expires: string;
    status: PassportStatus;
    theme: PassportTheme;
    flagUrl: string; // URL for the flag image
}

export default function PassportCard({
    country,
    number,
    expires,
    status,
    theme,
    flagUrl,
}: PassportCardProps) {
    const getThemeStyles = () => {
        switch (theme) {
            case 'navy':
                return {
                    background: ['#0A1930', '#050B15'], // Dark Navy
                    accentColor: '#00C4A7', // Teal for Valid
                };
            case 'maroon':
                return {
                    background: ['#3E1015', '#2A0A0E'], // Dark Maroon
                    accentColor: '#FF9500', // Orange for Expiring
                };
            default:
                return {
                    background: ['#0A1930', '#050B15'],
                    accentColor: '#00C4A7',
                };
        }
    };

    const themeStyles = getThemeStyles();

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={themeStyles.background as [string, string]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.card}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.label}>PASSPORT</Text>
                        <Text style={styles.country}>{country}</Text>
                    </View>
                    <View style={styles.flagContainer}>
                        <Image source={{ uri: flagUrl }} style={styles.flag} />
                    </View>
                </View>

                {/* Details */}
                <View style={styles.detailsRow}>
                    <View style={styles.detailItem}>
                        <Text style={styles.label}>NUMBER</Text>
                        <Text style={styles.value}>•••• {number}</Text>
                    </View>
                    <View style={styles.detailItem}>
                        <Text style={styles.label}>EXPIRES</Text>
                        <Text style={styles.value}>{expires}</Text>
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    {status === 'valid' ? (
                        <View style={[styles.statusBadge, { backgroundColor: 'rgba(0, 196, 167, 0.2)' }]}>
                            <Check size={12} color="#00C4A7" strokeWidth={3} />
                            <Text style={[styles.statusText, { color: '#00C4A7' }]}>VALID</Text>
                        </View>
                    ) : (
                        <View style={[styles.statusBadge, { backgroundColor: 'rgba(255, 149, 0, 0.2)' }]}>
                            <AlertTriangle size={12} color="#FF9500" strokeWidth={3} />
                            <Text style={[styles.statusText, { color: '#FF9500' }]}>EXPIRING SOON</Text>
                        </View>
                    )}

                    <Wifi size={20} color="rgba(255,255,255,0.5)" style={{ transform: [{ rotate: '90deg' }] }} />
                </View>
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...Layout.shadows.soft,
        marginHorizontal: Layout.spacing.l,
        marginBottom: Layout.spacing.l,
        borderRadius: Layout.borderRadius.l,
        overflow: 'hidden',
    },
    card: {
        padding: Layout.spacing.l,
        height: 200,
        justifyContent: 'space-between',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    label: {
        fontFamily: Typography.fontFamily.medium,
        fontSize: 11,
        color: 'rgba(255,255,255,0.5)',
        letterSpacing: 1,
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    country: {
        fontFamily: Typography.fontFamily.bold,
        fontSize: 22,
        color: '#FFF',
        width: '80%', // Prevent overlap with flag
    },
    flagContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    flag: {
        width: 24,
        height: 16,
        borderRadius: 2,
    },
    detailsRow: {
        flexDirection: 'row',
        marginTop: Layout.spacing.m,
    },
    detailItem: {
        marginRight: Layout.spacing.xl,
    },
    value: {
        fontFamily: Typography.fontFamily.medium,
        fontSize: 18,
        color: '#FFF',
        letterSpacing: 1,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    statusText: {
        fontFamily: Typography.fontFamily.bold,
        fontSize: 12,
        marginLeft: 6,
    },
});
