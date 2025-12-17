import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  Laptop,
  Lock,
  LogOut,
  ScanFace,
  ShieldCheck,
  Smartphone,
  Trash2,
} from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Layout } from "@/constants/Layout";
import { Typography } from "@/constants/Typography";
import { useTheme } from "@/context/ThemeContext";

export default function SettingsScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();

  const [faceIdEnabled, setFaceIdEnabled] = useState(true);
  const [allowScreenshots, setAllowScreenshots] = useState(false);
  const [clipboardAutoClear, setClipboardAutoClear] = useState(true);

  const cardStyle = useMemo(
    () => [
      styles.card,
      {
        backgroundColor: isDark ? colors.card : "#FFFFFF",
        borderColor: isDark ? "rgba(255,255,255,0.08)" : "#F0F0F0",
      },
    ],
    [colors, isDark]
  );

  const sectionLabelColor = useMemo(
    () => ({
      color: isDark ? colors.textSecondary : "#96A0AA",
    }),
    [colors, isDark]
  );

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.surface }]}
      edges={["top"]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={[
              styles.backButton,
              { backgroundColor: isDark ? colors.card : "#FFFFFF" },
            ]}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <ChevronLeft size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Settings
          </Text>
          <View style={{ width: 44 }} />
        </View>

        <Text style={[styles.sectionLabel, sectionLabelColor]}>
          APP LOCK & SECURITY
        </Text>
        <View style={cardStyle}>
          <SettingToggleRow
            icon={ScanFace}
            label="Enable Face ID"
            value={faceIdEnabled}
            onChange={setFaceIdEnabled}
            colors={colors}
          />
          <Divider />
          <SettingValueRow
            icon={Clock3}
            label="Auto-lock Timer"
            value="Immediately"
            colors={colors}
          />
          <Divider />
          <SettingNavigationRow
            icon={Lock}
            label="Change Password"
            colors={colors}
          />
        </View>

        <LinearGradient
          colors={isDark ? ["#0E3F36", "#062823"] : ["#DDF8F2", "#C7F0E5"]}
          style={styles.infoCard}
        >
          <View style={styles.infoIcon}>
            <ShieldCheck size={20} color={isDark ? "#7DF7D9" : "#00C4A7"} />
          </View>
          <View style={styles.infoTextWrapper}>
            <Text style={styles.infoTitle}>Your data is encrypted</Text>
            <Text style={styles.infoBody}>
              All your personal information, cards, and documents are secured
              with AES-256 military-grade encryption.
            </Text>
          </View>
        </LinearGradient>

        <Text style={[styles.sectionLabel, sectionLabelColor]}>
          PRIVACY CONTROLS
        </Text>
        <View style={cardStyle}>
          <SettingToggleRow
            icon={CheckCircle2}
            label="Allow Screenshots"
            caption="Reduces app security"
            value={allowScreenshots}
            onChange={setAllowScreenshots}
            colors={colors}
          />
          <Divider />
          <SettingToggleRow
            icon={ClipboardCheck}
            label="Clipboard Auto-clear"
            value={clipboardAutoClear}
            onChange={setClipboardAutoClear}
            colors={colors}
          />
        </View>

        <Text style={[styles.sectionLabel, sectionLabelColor]}>
          STORAGE & CACHE
        </Text>
        <View style={cardStyle}>
          <SettingValueRow
            icon={AlertTriangle}
            label="Clear Document Previews"
            value="12 MB"
            showChevron={false}
            colors={colors}
          />
          <Divider />
          <SettingValueRow
            icon={Trash2}
            label="Clear Temporary Files"
            value="48 MB"
            showChevron={false}
            colors={colors}
          />
        </View>

        <Text style={[styles.sectionLabel, sectionLabelColor]}>
          ACTIVE SESSIONS
        </Text>
        <View style={cardStyle}>
          <SessionRow
            icon={Smartphone}
            title="iPhone 15 Pro"
            subtitle="This device • Just now"
            highlight
            colors={colors}
          />
          <Divider />
          <SessionRow
            icon={Laptop}
            title="MacBook Air"
            subtitle="London, UK • 2 hours ago"
            colors={colors}
          />
        </View>

        <TouchableOpacity style={styles.signOutAllButton} activeOpacity={0.85}>
          <LogOut size={18} color="#FF3B30" />
          <Text style={styles.signOutAllText}>Sign out from all devices</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <View style={styles.footerBadge}>
            <ShieldCheck size={16} color="#00C4A7" />
          </View>
          <View style={styles.footerTextWrapper}>
            <Text style={[styles.footerTitle, { color: colors.textSecondary }]}>
              SecureWallet v2.4.0
            </Text>
            <Text
              style={[styles.footerSubtext, { color: colors.textSecondary }]}
            >
              ID: 8829-AFX-22
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingToggleRow({
  icon,
  label,
  caption,
  value,
  onChange,
  colors,
}: {
  icon: any;
  label: string;
  caption?: string;
  value: boolean;
  onChange: (next: boolean) => void;
  colors: any;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <View style={styles.iconPill}>
          {React.createElement(icon, { size: 20, color: "#00C4A7" })}
        </View>
        <View>
          <Text style={[styles.rowLabel, { color: colors.text }]}>{label}</Text>
          {caption ? (
            <Text style={[styles.rowCaption, { color: colors.textSecondary }]}>
              {caption}
            </Text>
          ) : null}
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        thumbColor="#FFFFFF"
        trackColor={{ false: "#CED3D8", true: "#00C4A7" }}
      />
    </View>
  );
}

function SettingValueRow({
  icon,
  label,
  value,
  showChevron = true,
  colors,
}: {
  icon: any;
  label: string;
  value: string;
  showChevron?: boolean;
  colors: any;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <View style={styles.iconPill}>
          {React.createElement(icon, { size: 20, color: "#00C4A7" })}
        </View>
        <Text style={[styles.rowLabel, { color: colors.text }]}>{label}</Text>
      </View>
      <View style={styles.rowRight}>
        <Text style={[styles.valueText, { color: colors.textSecondary }]}>
          {value}
        </Text>
        {showChevron ? (
          <ChevronRight size={18} color={colors.textSecondary} />
        ) : null}
      </View>
    </View>
  );
}

function SettingNavigationRow({
  icon,
  label,
  colors,
}: {
  icon: any;
  label: string;
  colors: any;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <View style={styles.iconPill}>
          {React.createElement(icon, { size: 20, color: "#00C4A7" })}
        </View>
        <Text style={[styles.rowLabel, { color: colors.text }]}>{label}</Text>
      </View>
      <ChevronRight size={18} color={colors.textSecondary} />
    </View>
  );
}

function SessionRow({
  icon,
  title,
  subtitle,
  highlight,
  colors,
}: {
  icon: any;
  title: string;
  subtitle: string;
  highlight?: boolean;
  colors: any;
}) {
  return (
    <View style={styles.sessionRow}>
      <View style={styles.rowLeft}>
        <View style={styles.iconPill}>
          {React.createElement(icon, { size: 20, color: "#00C4A7" })}
        </View>
        <View>
          <Text style={[styles.rowLabel, { color: colors.text }]}>{title}</Text>
          <Text
            style={[
              styles.sessionSubtitle,
              { color: highlight ? "#00C4A7" : colors.textSecondary },
            ]}
          >
            {subtitle}
          </Text>
        </View>
      </View>
      {!highlight ? (
        <Text style={[styles.sessionSubtitle, { color: colors.textSecondary }]}>
          Active
        </Text>
      ) : null}
    </View>
  );
}

const Divider = () => <View style={styles.divider} />;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Layout.spacing.l,
    paddingBottom: Layout.spacing.xl * 1.5,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Layout.spacing.l,
    marginTop: Layout.spacing.s,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    ...Layout.shadows.soft,
  },
  headerTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 20,
  },
  sectionLabel: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 12,
    letterSpacing: 1,
    marginBottom: 8,
  },
  card: {
    borderRadius: Layout.borderRadius.l,
    borderWidth: 1,
    paddingHorizontal: Layout.spacing.m,
    paddingVertical: Layout.spacing.s,
    marginBottom: Layout.spacing.l,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Layout.spacing.s,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Layout.spacing.s,
    flex: 1,
  },
  iconPill: {
    width: 42,
    height: 42,
    borderRadius: 16,
    backgroundColor: "rgba(0,196,167,0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  rowLabel: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 16,
  },
  rowCaption: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: 12,
    marginTop: 2,
  },
  rowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  valueText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 14,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(0,0,0,0.08)",
  },
  infoCard: {
    flexDirection: "row",
    padding: Layout.spacing.m,
    borderRadius: Layout.borderRadius.l,
    alignItems: "flex-start",
    gap: Layout.spacing.s,
    marginBottom: Layout.spacing.l,
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.05)",
    justifyContent: "center",
    alignItems: "center",
  },
  infoTextWrapper: {
    flex: 1,
  },
  infoTitle: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: 16,
    color: "#032B22",
    marginBottom: 4,
  },
  infoBody: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: 14,
    color: "#134137",
    lineHeight: 20,
  },
  sessionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Layout.spacing.s,
  },
  sessionSubtitle: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 13,
    marginTop: 2,
  },
  signOutAllButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: Layout.spacing.m,
    borderRadius: Layout.borderRadius.m,
    borderWidth: 1,
    borderColor: "#FFB4AE",
    backgroundColor: "rgba(255,59,48,0.08)",
    marginBottom: Layout.spacing.l,
  },
  signOutAllText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 15,
    color: "#FF3B30",
  },
  footer: {
    alignItems: "center",
    gap: 6,
  },
  footerBadge: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "rgba(0,196,167,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  footerTextWrapper: {
    alignItems: "center",
  },
  footerTitle: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 14,
  },
  footerSubtext: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: 12,
  },
});
