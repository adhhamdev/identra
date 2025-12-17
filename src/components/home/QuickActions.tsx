import { Layout } from '@/constants/Layout';
import { Typography } from '@/constants/Typography';
import { useTheme } from '@/context/ThemeContext';
import { PlusCircle, Settings, Share2 } from 'lucide-react-native';
import React, { useCallback } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ActionItem {
    icon: any;
    label: string;
    color: string;
    bg: string;
    action?: string;
}

interface QuickActionsProps {
    onAddPress?: () => void;
}

export default function QuickActions({ onAddPress }: QuickActionsProps) {
    const { colors, isDark } = useTheme();

    const actions: ActionItem[] = [
        { icon: PlusCircle, label: 'Add', color: '#00C4A7', bg: isDark ? 'rgba(0,196,167,0.15)' : '#E0F7FA', action: 'add' },
        { icon: Settings, label: 'Manage', color: '#5C6BC0', bg: isDark ? 'rgba(92,107,192,0.15)' : '#E8EAF6', action: 'manage' },
        { icon: Share2, label: 'Share ID', color: '#FF7043', bg: isDark ? 'rgba(255,112,67,0.15)' : '#FBE9E7', action: 'share' },
    ];

    const handleActionPress = useCallback((action?: string) => {
        if (action === 'add') {
            onAddPress?.();
        }
    }, [onAddPress]);

    return (
        <View style={styles.container}>
            <Text style={[styles.title, { color: colors.text }]}>Quick Actions</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {actions.map((action, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.actionItem}
                        onPress={() => handleActionPress(action.action)}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.iconCircle, { backgroundColor: action.bg }]}>
                            <action.icon size={24} color={action.color} />
                        </View>
                        <Text style={[styles.label, { color: colors.textSecondary }]}>{action.label}</Text>
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
    title: {
        fontFamily: Typography.fontFamily.bold,
        fontSize: 18,
        paddingHorizontal: Layout.spacing.l,
        marginBottom: Layout.spacing.m,
    },
    scrollContent: {
        paddingHorizontal: Layout.spacing.l,
        gap: Layout.spacing.l,
    },
    actionItem: {
        alignItems: 'center',
        marginRight: Layout.spacing.m,
    },
    iconCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Layout.spacing.s,
    },
    label: {
        fontFamily: Typography.fontFamily.medium,
        fontSize: 12,
    },
});


