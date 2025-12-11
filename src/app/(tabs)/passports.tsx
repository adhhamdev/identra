import { CreditCard, MoreVertical, Plus } from 'lucide-react-native';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import PassportCard from '@/components/PassportCard';
import { Layout } from '@/constants/Layout';
import { Typography } from '@/constants/Typography';
import { useTheme } from '@/context/ThemeContext';

export default function PassportsScreen() {
    const { colors, isDark } = useTheme();

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.surface }]} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Passports</Text>
                <TouchableOpacity style={styles.iconButton}>
                    <MoreVertical size={24} color={colors.text} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <PassportCard
                    country="United States of America"
                    number="4829"
                    expires="09 / 29"
                    status="valid"
                    theme="navy"
                    flagUrl="https://flagcdn.com/w320/us.png"
                />
                <PassportCard
                    country="United Kingdom"
                    number="1234"
                    expires="05 / 26"
                    status="expiring"
                    theme="maroon"
                    flagUrl="https://flagcdn.com/w320/gb.png"
                />

                {/* Add Document Placeholder */}
                <TouchableOpacity style={[styles.addPlaceholder, {
                    borderColor: isDark ? colors.border : '#E0E0E0',
                    backgroundColor: isDark ? colors.card : '#F9F9F9'
                }]}>
                    <View style={[styles.addIconContainer, { backgroundColor: isDark ? colors.surface : '#EEE' }]}>
                        <CreditCard size={24} color={colors.textSecondary} />
                        <Plus size={12} color={colors.textSecondary} style={styles.plusBadge} />
                    </View>
                    <Text style={[styles.addText, { color: colors.textSecondary }]}>Add another document</Text>
                </TouchableOpacity>
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
    headerTitle: {
        fontFamily: Typography.fontFamily.bold,
        fontSize: 28,
    },
    iconButton: {
        padding: 4,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    addPlaceholder: {
        marginHorizontal: Layout.spacing.l,
        marginTop: Layout.spacing.m,
        height: 180,
        borderRadius: Layout.borderRadius.xl,
        borderWidth: 2,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
    },
    addIconContainer: {
        marginBottom: Layout.spacing.m,
        width: 48,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
    },
    plusBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
    },
    addText: {
        fontFamily: Typography.fontFamily.medium,
        fontSize: 16,
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
