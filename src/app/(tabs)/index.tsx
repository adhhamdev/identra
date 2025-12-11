import { Bell, ShieldCheck } from 'lucide-react-native';
import React, { useCallback } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AddDocumentSheet from '@/components/AddDocumentSheet';
import NICCard from '@/components/NICCard';
import QuickActions from '@/components/QuickActions';
import RecentItems from '@/components/RecentItems';
import { Layout } from '@/constants/Layout';
import { Typography } from '@/constants/Typography';
import { useBottomSheet } from '@/context/BottomSheetContext';
import { useTheme } from '@/context/ThemeContext';

export default function HomeScreen() {
  const { colors, isDark } = useTheme();
  const { present, dismiss } = useBottomSheet();

  const handleAddPress = useCallback(() => {
    present('add-document', {
      component: AddDocumentSheet,
      snapPoints: ['74%'],
      props: {
        onDocumentTypeSelect: (type: string) => {
          console.log('Selected document type:', type);
          dismiss();
        },
        onUploadMethodSelect: (method: string) => {
          console.log('Selected upload method:', method);
          dismiss();
        },
      },
    });
  }, [present, dismiss]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.surface }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={[styles.avatarContainer, { borderColor: colors.border }]}>
              <Image
                source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }}
                style={styles.avatar}
              />
            </View>
            <View style={[styles.secureBadge, { backgroundColor: isDark ? 'rgba(0,196,167,0.2)' : '#E8F5E9' }]}>
              <ShieldCheck size={14} color="#00C4A7" />
              <Text style={styles.secureText}>Secure</Text>
            </View>
          </View>
          <TouchableOpacity style={[styles.bellButton, { backgroundColor: isDark ? colors.card : '#FFF' }]}>
            <Bell size={22} color={colors.text} />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
        </View>

        {/* Greeting */}
        <View style={styles.greetingContainer}>
          <Text style={[styles.greeting, { color: colors.textSecondary }]}>Good Morning,</Text>
          <Text style={[styles.name, { color: colors.text }]}>Alex.</Text>
        </View>

        {/* NIC Card */}
        <NICCard />

        {/* Quick Actions */}
        <QuickActions onAddPress={handleAddPress} />

        {/* Recent Items */}
        <RecentItems />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Layout.spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.l,
    paddingVertical: Layout.spacing.m,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    overflow: 'hidden',
    marginRight: Layout.spacing.s,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  secureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  secureText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 12,
    color: '#00C4A7',
    marginLeft: 4,
  },
  bellButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF5252',
  },
  greetingContainer: {
    paddingHorizontal: Layout.spacing.l,
    marginBottom: Layout.spacing.l,
  },
  greeting: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 16,
  },
  name: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 28,
  },
});

