import { Layout } from '@/constants/Layout';
import { Typography } from '@/constants/Typography';
import { LinearGradient } from 'expo-linear-gradient';
import { Check } from 'lucide-react-native'; // Using FileText as placeholder for ID icon if needed, or just text
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

export default function NICCard() {
    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#00C4A7', '#00A890']} // Gradient based on accent color
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.card}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.badge}>
                        <Check size={14} color="#FFF" strokeWidth={3} />
                    </View>
                    <Text style={styles.headerTitle}>NATIONAL ID</Text>
                    <View style={styles.iconContainer}>
                        {/* Placeholder for the top right icon in the image */}
                        <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>ID</Text>
                    </View>
                </View>

                {/* Content */}
                <View style={styles.content}>
                    <Image
                        source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }} // Placeholder image
                        style={styles.photo}
                    />
                    <View style={styles.details}>
                        <View>
                            <Text style={styles.label}>NAME</Text>
                            <Text style={styles.value}>Alex Morgan</Text>
                        </View>
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <View>
                        <Text style={styles.label}>ID NUMBER</Text>
                        <Text style={styles.valueMono}>9876 •••• 1234</Text>
                    </View>
                    <View>
                        <Text style={styles.label}>EXP DATE</Text>
                        <Text style={styles.value}>12/28</Text>
                    </View>
                </View>
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...Layout.shadows.soft,
        marginHorizontal: Layout.spacing.m,
        marginVertical: Layout.spacing.m,
        borderRadius: Layout.borderRadius.l,
    },
    card: {
        borderRadius: Layout.borderRadius.l,
        padding: Layout.spacing.l,
        height: 220, // Approximate height
        justifyContent: 'space-between',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    badge: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Layout.spacing.s,
    },
    headerTitle: {
        fontFamily: Typography.fontFamily.semiBold,
        fontSize: 14,
        color: '#FFF',
        letterSpacing: 0.5,
        flex: 1,
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: Layout.spacing.m,
    },
    photo: {
        width: 60,
        height: 60,
        borderRadius: Layout.borderRadius.m,
        marginRight: Layout.spacing.m,
        backgroundColor: '#DDD',
    },
    details: {
        flex: 1,
        justifyContent: 'center',
    },
    label: {
        fontFamily: Typography.fontFamily.medium,
        fontSize: 11,
        color: 'rgba(255,255,255,0.7)',
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    value: {
        fontFamily: Typography.fontFamily.bold,
        fontSize: 18,
        color: '#FFF',
    },
    valueMono: {
        fontFamily: Typography.fontFamily.medium, // Ideally monospace, but Inter works
        fontSize: 16,
        color: '#FFF',
        letterSpacing: 1,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginTop: Layout.spacing.m,
    },
});
