import { useRouter } from "expo-router";
import { Check, LogOut, Settings } from "lucide-react-native";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import ProfileInfoCard from "@/components/profile/ProfileInfoCard";
import { Layout } from "@/constants/Layout";
import { Typography } from "@/constants/Typography";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import {
  BriefcaseMedical,
  Car,
  GraduationCap,
  Plus,
} from "lucide-react-native";

import DocumentItem from "@/components/docs/DocumentItem";
import LinkedAccountCard from "@/components/profile/LinkedAccountCard";

export default function MeScreen() {
  const { colors, isDark } = useTheme();
  const { signOut, user, userProfile, initializing } = useAuth();
  const router = useRouter();

  const profileMeta = useMemo(() => {
    if (!user && !userProfile) {
      return null;
    }
    return {
      name: userProfile?.name || user?.displayName || "User",
      email: userProfile?.email || user?.email || "Not provided",
      gender: userProfile?.gender
        ? userProfile.gender.charAt(0).toUpperCase() +
          userProfile.gender.slice(1)
        : "Unknown",
      birthYear: userProfile?.birth_year,
      dob: userProfile?.dob
        ? new Date(userProfile.dob).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
          })
        : "Not set",
      phone: userProfile?.phone || "Not linked",
      nicLast4: userProfile?.nic_last4 || "----",
      nicAddedAt: userProfile?.nic_added_at,
      isVerified: Boolean(userProfile?.nic_last4),
      avatar:
        user?.photoURL || "https://randomuser.me/api/portraits/men/32.jpg",
    };
  }, [user, userProfile]);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err: any) {
      Alert.alert("Sign out failed", err?.message ?? "Please try again.");
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.surface }]}
      edges={["top"]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Profile
          </Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => router.push("/settings" as any)}
            >
              <Settings size={24} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={handleSignOut}>
              <LogOut size={22} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {initializing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.tint} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Loading your profile…
            </Text>
          </View>
        ) : (
          <>
            {/* Profile Header */}
            <View style={styles.profileHeader}>
              <View
                style={[
                  styles.avatarContainer,
                  { borderColor: colors.surface },
                ]}
              >
                <Image
                  source={{ uri: profileMeta?.avatar }}
                  style={styles.avatar}
                />
                {profileMeta?.isVerified && (
                  <View
                    style={[
                      styles.verifiedBadge,
                      { borderColor: colors.surface },
                    ]}
                  >
                    <Check size={12} color="#FFF" strokeWidth={3} />
                  </View>
                )}
              </View>
              <Text style={[styles.name, { color: colors.text }]}>
                {profileMeta?.name ?? "User"}
              </Text>
              <View
                style={[
                  styles.verifiedTag,
                  {
                    backgroundColor: profileMeta?.isVerified
                      ? isDark
                        ? "rgba(0,229,255,0.15)"
                        : "#E0F7FA"
                      : isDark
                      ? "rgba(255,255,255,0.08)"
                      : "#F0F0F0",
                  },
                ]}
              >
                <Text style={styles.verifiedText}>
                  {profileMeta?.isVerified
                    ? "Verified User"
                    : "Verification Pending"}
                </Text>
              </View>
            </View>

            {/* Profile Info */}
            <ProfileInfoCard
              dob={profileMeta?.dob ?? "Not set"}
              gender={profileMeta?.gender ?? "Unknown"}
              phone={profileMeta?.phone ?? "Not linked"}
              email={profileMeta?.email ?? "Not provided"}
            />

            {/* Linked Accounts */}
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Linked Accounts
              </Text>
              <TouchableOpacity
                style={[
                  styles.addButton,
                  { backgroundColor: isDark ? colors.card : "#FFF" },
                ]}
              >
                <Plus size={16} color="#00C4A7" />
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.horizontalScroll}
            >
              <LinkedAccountCard
                bankName="VISA"
                accountType="Savings Account"
                number="4242"
                balance="$12,450.00"
                theme="blue"
              />
              <LinkedAccountCard
                bankName="Mastercard"
                accountType="Business"
                number="8832"
                balance="$5,200.00"
                theme="dark"
              />
            </ScrollView>

            {/* Documents */}
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Documents
              </Text>
            </View>
            <DocumentItem
              title="COVID Vaccination"
              subtitle="Added on Dec 12, 2023"
              icon={BriefcaseMedical}
              iconColor="#2962FF"
              iconBg={isDark ? "rgba(41,98,255,0.15)" : "#E3F2FD"}
              type="list"
            />
            <DocumentItem
              title="Driving License"
              subtitle="Exp: 05/2028"
              icon={Car}
              iconColor="#FFC107"
              iconBg={isDark ? "rgba(255,193,7,0.15)" : "#FFF8E1"}
              type="list"
            />
            <DocumentItem
              title="University Degree"
              subtitle="Bachelor of Science"
              icon={GraduationCap}
              iconColor="#9C27B0"
              iconBg={isDark ? "rgba(156,39,176,0.15)" : "#F3E5F5"}
              type="list"
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Layout.spacing.l,
    paddingBottom: Layout.spacing.xl,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Layout.spacing.m,
    marginBottom: Layout.spacing.l,
  },
  headerTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 28,
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  iconButton: {
    padding: 4,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Layout.spacing.xl,
    gap: Layout.spacing.m,
  },
  loadingText: {
    fontFamily: Typography.fontFamily.medium,
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: Layout.spacing.xl,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: Layout.spacing.s,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
  },
  verifiedBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#00E5FF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
  },
  name: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 22,
    marginBottom: 4,
  },
  verifiedTag: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verifiedText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 12,
    color: "#006064",
  },
  identitySummary: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: Layout.spacing.l,
    borderRadius: Layout.borderRadius.l,
    borderWidth: 1,
  },
  identityLabel: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 12,
    letterSpacing: 1,
  },
  identityValue: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 16,
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Layout.spacing.l,
    marginBottom: Layout.spacing.m,
  },
  sectionTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 18,
  },
  viewAll: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 14,
    color: "#00C4A7",
  },
  addButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    ...Layout.shadows.soft,
  },
  horizontalScroll: {
    marginHorizontal: -Layout.spacing.l,
    paddingHorizontal: Layout.spacing.l,
    marginBottom: Layout.spacing.m,
  },
});
