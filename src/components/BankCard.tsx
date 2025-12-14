import { Layout } from '@/constants/Layout';
import { Typography } from '@/constants/Typography';
import { LinearGradient } from 'expo-linear-gradient';
import { Wifi } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export type CardTheme = 'dark' | 'teal' | 'light' | 'purple' | 'blue' | 'orange' | string;

interface BankCardProps {
    cardholderName: string;
    cardType: string;
    cardNumber: string; // Last 4 digits or masked
    balance?: string;
    expiry?: string;
    theme: CardTheme;
    network: string;
    onPress?: () => void;
    onLongPress?: () => void;
}

export default function BankCard({
    cardholderName,
    cardType,
    cardNumber,
    balance,
    expiry,
    theme,
    network,
    onPress,
    onLongPress,
}: BankCardProps) {
    const lastTap = React.useRef<number>(0);

    const handlePress = () => {
        onPress?.();
    };

    const getThemeStyles = () => {
        switch (theme) {
            case 'dark':
                return {
                    background: ['#1A1F2C', '#12141A'],
                    textColor: '#FFF',
                    secondaryColor: '#A0A0A0',
                };
            case 'teal':
                return {
                    background: ['#00E5CC', '#00C4A7'],
                    textColor: '#000',
                    secondaryColor: 'rgba(0,0,0,0.6)',
                };
            case 'light':
                return {
                    background: ['#FFFFFF', '#F9F9F9'],
                    textColor: '#000',
                    secondaryColor: '#888',
                    borderColor: '#E0E0E0',
                };
            case 'purple':
                return {
                    background: ['#9C27B0', '#7B1FA2'],
                    textColor: '#FFF',
                    secondaryColor: '#E1BEE7',
                };
            case 'blue':
                return {
                    background: ['#2196F3', '#1976D2'],
                    textColor: '#FFF',
                    secondaryColor: '#BBDEFB',
                };
            case 'orange':
                return {
                    background: ['#FF9800', '#F57C00'],
                    textColor: '#FFF',
                    secondaryColor: '#FFE0B2',
                };
            default:
                return {
                    background: ['#1A1F2C', '#12141A'],
                    textColor: '#FFF',
                    secondaryColor: '#A0A0A0',
                };
        }
    };

    const themeStyles = getThemeStyles();

    return (
        <TouchableOpacity
            style={[styles.container, theme === 'light' && { borderWidth: 1, borderColor: themeStyles.borderColor }]}
            onPress={handlePress}
            onLongPress={onLongPress}
            activeOpacity={0.9}
        >
            <LinearGradient
                colors={themeStyles.background as [string, string]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.card}
            >
                {/* Header: Network + Contactless */}
                <View style={styles.header}>
                    <Text style={[styles.networkTitle, { color: themeStyles.textColor }]}>{network}</Text>
                    <Wifi size={24} color={themeStyles.textColor} style={{ transform: [{ rotate: '90deg' }] }} />
                </View>

                {/* Chip */}
                <View style={[styles.chip, theme === 'teal' ? { backgroundColor: 'rgba(0,0,0,0.1)' } : {}]} />

                {/* Number */}
                <View style={styles.numberContainer}>
                    {/* Show visual dots for masked part? */}
                    {/* Assuming input is masked like **** **** **** 1234 */}
                    <Text style={[styles.number, { color: themeStyles.textColor }]}>{cardNumber}</Text>
                </View>

                {/* Footer: Details */}
                <View style={styles.footer}>
                    <View>
                        <Text style={[styles.label, { color: themeStyles.secondaryColor }]}>Cardholder Name</Text>
                        <Text style={[styles.value, { color: themeStyles.textColor }]}>{cardholderName || 'John Doe'}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={[styles.label, { color: themeStyles.secondaryColor }]}>Expires</Text>
                        <Text style={[styles.value, { color: themeStyles.textColor }]}>{expiry || 'MM/YY'}</Text>
                    </View>
                </View>
                <Text style={[styles.cardType, { color: themeStyles.secondaryColor }]}>{cardType}</Text>
            </LinearGradient>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        ...Layout.shadows.soft,
        marginHorizontal: Layout.spacing.l,
        marginBottom: Layout.spacing.l,
        borderRadius: 16, // More rounded
        overflow: 'hidden',
    },
    card: {
        padding: 24, // More padding
        height: 220, // Taller
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    networkTitle: {
        fontFamily: Typography.fontFamily.bold, // Italic often used for Visa
        fontStyle: 'italic',
        fontSize: 22,
    },
    chip: {
        width: 44,
        height: 32,
        borderRadius: 6,
        backgroundColor: '#E0C157',
        alignSelf: 'flex-start',
        marginBottom: 20,
    },
    numberContainer: {
        marginBottom: 'auto',
    },
    number: {
        fontFamily: Typography.fontFamily.medium,
        fontSize: 22,
        letterSpacing: 2,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: 8,
    },
    label: {
        fontSize: 10,
        fontFamily: Typography.fontFamily.medium,
        textTransform: 'uppercase',
        marginBottom: 2,
    },
    value: {
        fontSize: 16,
        fontFamily: Typography.fontFamily.semiBold,
    },
    cardType: {
        position: 'absolute',
        bottom: 24,
        right: 24, // Or center?
        fontSize: 12,
        fontFamily: Typography.fontFamily.medium,
        alignSelf: 'flex-end',
        display: 'none' // Hidden for now, cleaner look
    }
});
