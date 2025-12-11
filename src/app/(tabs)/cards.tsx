import { Plus } from 'lucide-react-native';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import BankCard from '@/components/BankCard';
import { Layout } from '@/constants/Layout';
import { Typography } from '@/constants/Typography';
import { useTheme } from '@/context/ThemeContext';

export default function CardsScreen() {
    const { colors, isDark } = useTheme();

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.surface }]} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text }]}>My Bank Cards</Text>
            </View>


            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <BankCard
                    bankName="NeoBank"
                    cardType="Platinum Debit"
                    cardNumber="8832"
                    balance="$12,450.00"
                    theme="dark"
                    network="Visa"
                />
                <BankCard
                    bankName="Global Trust"
                    cardType="Checking Account"
                    cardNumber="1029"
                    theme="teal"
                    network="Mastercard"
                />
                <BankCard
                    bankName="Freelance Debit"
                    cardType="Business"
                    cardNumber="5541"
                    expiry="09/28"
                    theme="light"
                    network="Visa"
                />

                <Text style={[styles.footerText, { color: colors.textSecondary }]}>3 cards linked</Text>
            </ScrollView>

            {/* FAB */}
            <TouchableOpacity style={styles.fab}>
                <Plus size={32} color="#000" />
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Layout.spacing.l,
        paddingVertical: Layout.spacing.m,
    },
    title: {
        fontFamily: Typography.fontFamily.bold,
        fontSize: 28,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    footerText: {
        textAlign: 'center',
        fontFamily: Typography.fontFamily.medium,
        marginTop: Layout.spacing.m,
    },
    fab: {
        position: 'absolute',
        bottom: Layout.spacing.xl,
        right: Layout.spacing.xl,
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#00FFD1',
        justifyContent: 'center',
        alignItems: 'center',
        ...Layout.shadows.soft,
        shadowColor: '#00FFD1',
        shadowOpacity: 0.4,
        shadowRadius: 12,
    },
});
