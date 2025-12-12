import {
  BriefcaseMedical,
  Car,
  Check,
  GraduationCap,
  LogOut,
  Plus,
  Settings,
} from "lucide-react-native";
import React from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import DocumentItem from "@/components/DocumentItem";
import IdentityStatusCard from "@/components/IdentityStatusCard";
import LinkedAccountCard from "@/components/LinkedAccountCard";
import ProfileInfoCard from "@/components/ProfileInfoCard";
import { Layout } from "@/constants/Layout";
import { Typography } from "@/constants/Typography";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

export default function MeScreen() {
  const { colors, isDark } = useTheme();
  const { signOut } = useAuth();

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
            <TouchableOpacity style={styles.iconButton}>
              <Settings size={24} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={handleSignOut}>
              <LogOut size={22} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View
            style={[styles.avatarContainer, { borderColor: colors.surface }]}
          >
            <Image
              source={{ uri: "https://randomuser.me/api/portraits/men/32.jpg" }}
              style={styles.avatar}
            />
            <View
              style={[styles.verifiedBadge, { borderColor: colors.surface }]}
            >
              <Check size={12} color="#FFF" strokeWidth={3} />
            </View>
          </View>
          <Text style={[styles.name, { color: colors.text }]}>Alex Doe</Text>
          <View
            style={[
              styles.verifiedTag,
              { backgroundColor: isDark ? "rgba(0,229,255,0.15)" : "#E0F7FA" },
            ]}
          >
            <Text style={styles.verifiedText}>Verified User</Text>
          </View>
        </View>

        {/* Profile Info */}
        <ProfileInfoCard
          dob="Jan 01, 1990"
          gender="Male"
          phone="+1 234 567 890"
          email="alex@example.com"
        />

        {/* My Identity */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            My Identity
          </Text>
          <TouchableOpacity>
            <Text style={styles.viewAll}>View all</Text>
          </TouchableOpacity>
        </View>
        <IdentityStatusCard />

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
