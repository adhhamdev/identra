import { Layout } from '@/constants/Layout';
import { Typography } from '@/constants/Typography';
import { LinearGradient } from 'expo-linear-gradient';
import { Wifi } from 'lucide-react-native'; // Wifi for contactless
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export type CardTheme = 'dark' | 'teal' | 'light';

interface BankCardProps {
    bankName: string;
    cardType: string;
    cardNumber: string; // Last 4 digits
    balance?: string;
    expiry?: string;
    theme: CardTheme;
    network: 'Visa' | 'Mastercard';
}

export default function BankCard({
    bankName,
    cardType,
    cardNumber,
    balance,
    expiry,
    theme,
    network,
}: BankCardProps) {
    const getThemeStyles = () => {
        switch (theme) {
            case 'dark':
                return {
                    background: ['#1A1F2C', '#12141A'], // Dark Navy/Black
                    textColor: '#FFF',
                    secondaryColor: '#A0A0A0',
                    accentColor: '#FFF',
                };
            case 'teal':
                return {
                    background: ['#00E5CC', '#00C4A7'], // Bright Teal
                    textColor: '#000',
                    secondaryColor: 'rgba(0,0,0,0.6)',
                    accentColor: '#000',
                };
            case 'light':
                return {
                    background: ['#FFFFFF', '#F9F9F9'], // White
                    textColor: '#000',
                    secondaryColor: '#888',
                    accentColor: '#000',
                    borderColor: '#E0E0E0',
                };
            default:
                return {
                    background: ['#1A1F2C', '#12141A'],
                    textColor: '#FFF',
                    secondaryColor: '#A0A0A0',
                    accentColor: '#FFF',
                };
        }
    };

    const themeStyles = getThemeStyles();

    return (
        <View style={[styles.container, theme === 'light' && { borderWidth: 1, borderColor: themeStyles.borderColor }]}>
            <LinearGradient
                colors={themeStyles.background as [string, string]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.card}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={[styles.bankName, { color: themeStyles.textColor }]}>{bankName}</Text>
                        <Text style={[styles.cardType, { color: themeStyles.secondaryColor }]}>{cardType}</Text>
                    </View>
                    <Wifi size={24} color={themeStyles.textColor} style={{ transform: [{ rotate: '90deg' }] }} />
                </View>

                {/* Chip */}
                <View style={[styles.chip, theme === 'teal' ? { backgroundColor: 'rgba(0,0,0,0.1)' } : {}]} />

                {/* Number */}
                <View style={styles.numberContainer}>
                    <Text style={[styles.dots, { color: themeStyles.textColor }]}>**** **** ****</Text>
                    <Text style={[styles.number, { color: themeStyles.textColor }]}>{cardNumber}</Text>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <View>
                        {balance ? (
                            <Text style={[styles.balance, { color: themeStyles.textColor }]}>{balance}</Text>
                        ) : (
                            <Text style={[styles.expiry, { color: themeStyles.secondaryColor }]}>Exp {expiry}</Text>
                        )}
                        {balance && theme === 'teal' && <Text style={[styles.cardType, { color: themeStyles.secondaryColor }]}>Checking Account</Text>}
                    </View>

                    <Text style={[styles.network, { color: themeStyles.textColor }]}>{network.toUpperCase()}</Text>
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
        overflow: 'hidden', // Ensure gradient respects border radius
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
    bankName: {
        fontFamily: Typography.fontFamily.bold,
        fontSize: 18,
        marginBottom: 4,
    },
    cardType: {
        fontFamily: Typography.fontFamily.medium,
        fontSize: 12,
    },
    chip: {
        width: 40,
        height: 28,
        borderRadius: 6,
        backgroundColor: '#E0C157', // Gold chip color
        marginTop: Layout.spacing.m,
    },
    numberContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: Layout.spacing.s,
    },
    dots: {
        fontFamily: Typography.fontFamily.bold,
        fontSize: 18,
        marginRight: Layout.spacing.m,
        letterSpacing: 2,
    },
    number: {
        fontFamily: Typography.fontFamily.medium, // Monospace-ish
        fontSize: 20,
        letterSpacing: 2,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    balance: {
        fontFamily: Typography.fontFamily.medium,
        fontSize: 16,
    },
    expiry: {
        fontFamily: Typography.fontFamily.medium,
        fontSize: 14,
    },
    network: {
        fontFamily: Typography.fontFamily.bold, // Italic often used for Visa
        fontStyle: 'italic',
        fontSize: 16,
    },
});
