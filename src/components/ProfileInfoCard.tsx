import { Layout } from '@/constants/Layout';
import { Typography } from '@/constants/Typography';
import { useTheme } from '@/context/ThemeContext';
import { Cake, Mail, Phone, User } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface ProfileInfoCardProps {
    dob: string;
    gender: string;
    phone: string;
    email: string;
}

export default function ProfileInfoCard({ dob, gender, phone, email }: ProfileInfoCardProps) {
    const { colors, isDark } = useTheme();

    const renderItem = (icon: any, label: string, value: string, color: string, bg: string) => (
        <View style={styles.itemContainer}>
            <View style={[styles.iconCircle, { backgroundColor: bg }]}>
                {React.createElement(icon, { size: 20, color: color })}
            </View>
            <View>
                <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
                <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
            </View>
        </View>
    );

    const iconBg = isDark ? 'rgba(0,196,167,0.15)' : '#E0F2F1';

    return (
        <View style={[styles.container, { backgroundColor: colors.card }]}>
            {renderItem(Cake, 'DATE OF BIRTH', dob, '#00C4A7', iconBg)}
            {renderItem(User, 'GENDER', gender, '#00C4A7', iconBg)}
            {renderItem(Phone, 'PHONE', phone, '#00C4A7', iconBg)}
            {renderItem(Mail, 'EMAIL', email, '#00C4A7', iconBg)}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: Layout.borderRadius.xl,
        padding: Layout.spacing.l,
        marginBottom: Layout.spacing.l,
        ...Layout.shadows.soft,
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Layout.spacing.m,
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Layout.spacing.m,
    },
    label: {
        fontFamily: Typography.fontFamily.medium,
        fontSize: 10,
        textTransform: 'uppercase',
        marginBottom: 2,
    },
    value: {
        fontFamily: Typography.fontFamily.bold,
        fontSize: 14,
    },
});
