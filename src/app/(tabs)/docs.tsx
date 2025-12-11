import { BriefcaseMedical, Car, FileText, Globe, Plus, Search, Shield } from 'lucide-react-native';
import React from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CertificateCard from '@/components/CertificateCard';
import DocumentItem from '@/components/DocumentItem';
import { Layout } from '@/constants/Layout';
import { Typography } from '@/constants/Typography';
import { useTheme } from '@/context/ThemeContext';

export default function DocsScreen() {
    const { colors, isDark } = useTheme();

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.surface }]} edges={['top']}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Header */}
                <View style={styles.header}>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Docs & Certs</Text>
                </View>

                {/* Search Bar */}
                <View style={[styles.searchContainer, {
                    backgroundColor: isDark ? colors.card : '#FFF',
                    borderColor: isDark ? colors.border : '#F0F0F0'
                }]}>
                    <Search size={20} color={colors.textSecondary} style={styles.searchIcon} />
                    <TextInput
                        placeholder="Search documents..."
                        placeholderTextColor={colors.textSecondary}
                        style={[styles.searchInput, { color: colors.text }]}
                    />
                </View>

                {/* Identity Certificates Section */}
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Identity Certificates</Text>
                    <View style={[styles.badge, { backgroundColor: isDark ? 'rgba(0,150,136,0.2)' : '#E0F2F1' }]}>
                        <Text style={styles.badgeText}>2 Items</Text>
                    </View>
                </View>

                <CertificateCard
                    title="Driver's License"
                    subtitle="ID: D-4920-5822"
                    status="Valid"
                    expiry="12/2025"
                    icon={Car}
                    color="#4285F4"
                    previewImage="https://randomuser.me/api/portraits/men/32.jpg"
                />
                <CertificateCard
                    title="Passport"
                    subtitle="USA • P-9928102"
                    status="Valid"
                    expiry="08/2029"
                    icon={Globe}
                    color="#9C27B0"
                />

                {/* Other Documents Section */}
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Other Documents</Text>
                    <View style={[styles.badge, { backgroundColor: isDark ? 'rgba(0,150,136,0.2)' : '#E0F2F1' }]}>
                        <Text style={styles.badgeText}>3 Items</Text>
                    </View>
                </View>

                <View style={styles.gridRow}>
                    <DocumentItem
                        title="Vaccination Certificate"
                        subtitle="Updated 2mo ago"
                        icon={BriefcaseMedical}
                        iconColor="#F44336"
                        iconBg={isDark ? 'rgba(244,67,54,0.15)' : '#FFEBEE'}
                        type="grid"
                        isLocked
                    />
                    <DocumentItem
                        title="Insurance Policy"
                        subtitle="Renewal in 15d"
                        icon={Shield}
                        iconColor="#FFC107"
                        iconBg={isDark ? 'rgba(255,193,7,0.15)' : '#FFF8E1'}
                        type="grid"
                        isLocked
                    />
                </View>

                <DocumentItem
                    title="Tax Return 2023"
                    subtitle="PDF • 2.4 MB"
                    icon={FileText}
                    iconColor="#607D8B"
                    iconBg={isDark ? 'rgba(96,125,139,0.15)' : '#ECEFF1'}
                    type="list"
                />

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
    scrollContent: {
        paddingHorizontal: Layout.spacing.l,
        paddingBottom: 100,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingVertical: Layout.spacing.m,
    },
    headerTitle: {
        fontFamily: Typography.fontFamily.bold,
        fontSize: 28,
    },
    iconButton: {
        padding: 8,
        borderRadius: 20,
        ...Layout.shadows.soft,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: Layout.borderRadius.l,
        paddingHorizontal: Layout.spacing.m,
        height: 50,
        marginBottom: Layout.spacing.xl,
        borderWidth: 1,
    },
    searchIcon: {
        marginRight: Layout.spacing.s,
    },
    searchInput: {
        flex: 1,
        fontFamily: Typography.fontFamily.medium,
        fontSize: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Layout.spacing.m,
    },
    sectionTitle: {
        fontFamily: Typography.fontFamily.bold,
        fontSize: 18,
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeText: {
        fontFamily: Typography.fontFamily.bold,
        fontSize: 12,
        color: '#009688',
    },
    gridRow: {
        flexDirection: 'row',
        marginHorizontal: -Layout.spacing.xs,
        marginBottom: Layout.spacing.m,
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
