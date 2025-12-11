import { Layout } from '@/constants/Layout';
import { Typography } from '@/constants/Typography';
import { useTheme } from '@/context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { CreditCard, Globe } from 'lucide-react-native';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface RecentItem {
    title: string;
    subtitle: string;
    icon: any;
    colors: [string, string];
}

export default function RecentItems() {
    const { colors: themeColors, isDark } = useTheme();

    const items: RecentItem[] = [
        {
            title: 'Passport',
            subtitle: 'USA • Expires 09/29',
            icon: Globe,
            colors: ['#1A2B3C', '#0F1724']
        },
        {
            title: 'Bank Card',
            subtitle: 'NeoBank •••• 8832',
            icon: CreditCard,
            colors: ['#0A4D5C', '#063844']
        },
    ];

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: themeColors.text }]}>Recently Viewed</Text>
                <TouchableOpacity>
                    <Text style={styles.viewAll}>View all</Text>
                </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {items.map((item, index) => (
                    <TouchableOpacity key={index} style={styles.card}>
                        <LinearGradient
                            colors={item.colors}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.cardGradient}
                        >
                            <View style={styles.cardIcon}>
                                <item.icon size={20} color="#FFF" />
                            </View>
                            <Text style={styles.cardTitle}>{item.title}</Text>
                            <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: Layout.spacing.l,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Layout.spacing.l,
        marginBottom: Layout.spacing.m,
    },
    title: {
        fontFamily: Typography.fontFamily.bold,
        fontSize: 18,
    },
    viewAll: {
        fontFamily: Typography.fontFamily.medium,
        fontSize: 14,
        color: '#00C4A7',
    },
    scrollContent: {
        paddingHorizontal: Layout.spacing.l,
    },
    card: {
        marginRight: Layout.spacing.m,
        borderRadius: Layout.borderRadius.l,
        overflow: 'hidden',
        ...Layout.shadows.soft,
    },
    cardGradient: {
        width: 160,
        height: 100,
        padding: Layout.spacing.m,
        justifyContent: 'space-between',
    },
    cardIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardTitle: {
        fontFamily: Typography.fontFamily.bold,
        fontSize: 14,
        color: '#FFF',
    },
    cardSubtitle: {
        fontFamily: Typography.fontFamily.medium,
        fontSize: 11,
        color: 'rgba(255,255,255,0.7)',
    },
});
