import { Layout } from '@/constants/Layout';
import { Typography } from '@/constants/Typography';
import { LinearGradient } from 'expo-linear-gradient';
import { Wifi } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface LinkedAccountCardProps {
    bankName: string; // e.g. "VISA"
    accountType: string;
    number: string;
    balance: string;
    theme: 'blue' | 'dark';
}

export default function LinkedAccountCard({ bankName, accountType, number, balance, theme }: LinkedAccountCardProps) {
    const getThemeStyles = () => {
        switch (theme) {
            case 'blue':
                return ['#2962FF', '#0091EA']; // Blue gradient
            case 'dark':
                return ['#263238', '#102027']; // Dark gradient
            default:
                return ['#2962FF', '#0091EA'];
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={getThemeStyles() as [string, string]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.card}
            >
                <View style={styles.header}>
                    <Text style={styles.bankName}>{bankName}</Text>
                    <Wifi size={20} color="rgba(255,255,255,0.7)" style={{ transform: [{ rotate: '90deg' }] }} />
                </View>

                <View style={styles.footer}>
                    <View>
                        <Text style={styles.accountType}>{accountType}</Text>
                        <Text style={styles.number}>•••• {number}</Text>
                    </View>
                    <View>
                        <Text style={styles.balanceLabel}>Balance</Text>
                        <Text style={styles.balance}>{balance}</Text>
                    </View>
                </View>
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginRight: Layout.spacing.m,
        ...Layout.shadows.soft,
    },
    card: {
        width: 260,
        height: 150,
        borderRadius: Layout.borderRadius.l,
        padding: Layout.spacing.l,
        justifyContent: 'space-between',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    bankName: {
        fontFamily: Typography.fontFamily.bold, // Italic often used for Visa
        fontStyle: 'italic',
        fontSize: 20,
        color: '#FFF',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    accountType: {
        fontFamily: Typography.fontFamily.medium,
        fontSize: 10,
        color: 'rgba(255,255,255,0.7)',
        marginBottom: 4,
    },
    number: {
        fontFamily: Typography.fontFamily.bold,
        fontSize: 16,
        color: '#FFF',
        letterSpacing: 2,
    },
    balanceLabel: {
        fontFamily: Typography.fontFamily.medium,
        fontSize: 10,
        color: 'rgba(255,255,255,0.7)',
        textAlign: 'right',
        marginBottom: 2,
    },
    balance: {
        fontFamily: Typography.fontFamily.bold,
        fontSize: 16,
        color: '#FFF',
    },
});
