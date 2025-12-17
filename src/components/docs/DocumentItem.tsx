import { Layout } from '@/constants/Layout';
import { Typography } from '@/constants/Typography';
import { useTheme } from '@/context/ThemeContext';
import { ChevronRight, Lock } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface DocumentItemProps {
    title: string;
    subtitle: string;
    icon: any;
    iconColor: string;
    iconBg: string;
    type: 'grid' | 'list';
    isLocked?: boolean;
    onShare?: () => void;
    onEdit?: () => void;
}

export default function DocumentItem({
    title,
    subtitle,
    icon: Icon,
    iconColor,
    iconBg,
    type,
    isLocked,
    onShare,
    onEdit,
}: DocumentItemProps) {
    const { colors } = useTheme();
    const lastTap = React.useRef<number>(0);

    const handlePress = () => {
        const now = Date.now();
        if (now - lastTap.current < 300) {
            onEdit?.();
        }
        lastTap.current = now;
    };

    if (type === 'grid') {
        return (
            <TouchableOpacity
                style={[styles.gridContainer, { backgroundColor: colors.card }]}
                onLongPress={onShare}
                onPress={handlePress}
                activeOpacity={0.7}
            >
                <View style={styles.gridHeader}>
                    <View style={[styles.iconCircle, { backgroundColor: iconBg }]}>
                        <Icon size={20} color={iconColor} />
                    </View>
                    {isLocked && <Lock size={16} color={colors.textSecondary} />}
                </View>
                <View style={styles.gridContent}>
                    <Text style={[styles.gridTitle, { color: colors.text }]} numberOfLines={2}>{title}</Text>
                    <Text style={[styles.gridSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
                </View>
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity
            style={[styles.listContainer, { backgroundColor: colors.card }]}
            onLongPress={onShare}
            onPress={handlePress}
            activeOpacity={0.7}
        >
            <View style={styles.listLeft}>
                <View style={[styles.iconCircle, { backgroundColor: iconBg }]}>
                    <Icon size={20} color={iconColor} />
                </View>
                <View>
                    <Text style={[styles.listTitle, { color: colors.text }]}>{title}</Text>
                    <Text style={[styles.listSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
                </View>
            </View>
            <ChevronRight size={20} color={colors.textSecondary} />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    gridContainer: {
        flex: 1,
        borderRadius: Layout.borderRadius.l,
        padding: Layout.spacing.m,
        margin: Layout.spacing.xs,
        ...Layout.shadows.soft,
        minHeight: 140,
        justifyContent: 'space-between',
    },
    gridHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    gridContent: {
        marginTop: Layout.spacing.m,
    },
    gridTitle: {
        fontFamily: Typography.fontFamily.bold,
        fontSize: 14,
        marginBottom: 4,
    },
    gridSubtitle: {
        fontFamily: Typography.fontFamily.medium,
        fontSize: 11,
    },
    listContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: Layout.borderRadius.l,
        padding: Layout.spacing.m,
        marginVertical: Layout.spacing.xs,
        ...Layout.shadows.soft,
    },
    listLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    listTitle: {
        fontFamily: Typography.fontFamily.bold,
        fontSize: 14,
    },
    listSubtitle: {
        fontFamily: Typography.fontFamily.medium,
        fontSize: 12,
        marginTop: 2,
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Layout.spacing.m,
    },
});
