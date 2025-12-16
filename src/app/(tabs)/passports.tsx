import AddPassportSheet from "@/components/AddPassportSheet";
import PassportCard from "@/components/PassportCard";
import { Layout } from "@/constants/Layout";
import { Typography } from "@/constants/Typography";
import { useBottomSheet } from "@/context/BottomSheetContext";
import { useModal } from "@/context/ModalContext";
import { useTheme } from "@/context/ThemeContext";
import { usePassports } from "@/hooks/usePassports";
import { PassportRecord } from "@/types/passport";
import { MoreVertical, Plus } from "lucide-react-native";
import React, { useCallback } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PassportsScreen() {
  const { colors, isDark } = useTheme();
  const { present, dismiss } = useBottomSheet();
  const { showModal } = useModal();
  const { passports, loading, addPassport, updatePassport, deletePassport } =
    usePassports();

  const handleAddPassport = useCallback(() => {
    present("add-passport", {
      component: AddPassportSheet,
      snapPoints: ["92%"],
      enablePanDownToClose: true,
      props: {
        onSave: async (data: any) => {
          await addPassport(data);
          dismiss();
        },
        onClose: () => dismiss(),
      },
    });
  }, [present, dismiss, addPassport]);

  const handleEditPassport = useCallback(
    (record: PassportRecord) => {
      present(`edit-passport-${record.id}`, {
        component: AddPassportSheet,
        snapPoints: ["92%"],
        enablePanDownToClose: true,
        props: {
          initialData: record,
          onSave: async (data: any) => {
            await updatePassport(record.id, data);
            dismiss();
          },
          onClose: () => dismiss(),
        },
      });
    },
    [present, dismiss, updatePassport]
  );

  const handlePassportOptions = (record: PassportRecord) => {
    showModal({
      title: record.fullName || "Passport",
      message: "Choose an action for this passport",
      actions: [
        {
          text: "Edit Passport",
          onPress: () => {
            setTimeout(() => handleEditPassport(record), 200);
            dismiss();
          },
        },
        {
          text: "Delete Passport",
          style: "destructive",
          onPress: async () => {
            await deletePassport(record.id);
            dismiss();
          },
        },
      ],
    });
  };

  const renderPassportCard = (passport: PassportRecord) => {
    const expires = formatExpiry(passport.expiryDate);
    return (
      <PassportCard
        key={passport.id}
        country={passport.nationality}
        number={passport.passportNumber.slice(-4)}
        expires={expires}
        status={determineStatus(passport.expiryDate)}
        theme={determineTheme(passport.nationality)}
        flagUrl={passport.flagUrl || "https://flagcdn.com/w320/us.png"}
        onLongPress={() => handlePassportOptions(passport)}
      />
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.surface }]}
      edges={["top"]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Passports
        </Text>
        <TouchableOpacity style={styles.iconButton}>
          <MoreVertical size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00C4A7" />
          </View>
        ) : passports.length === 0 ? (
          <View
            style={[
              styles.emptyContainer,
              { backgroundColor: isDark ? colors.card : "#F5F5F5" },
            ]}
          >
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No passports added yet
            </Text>
            <Text
              style={[styles.emptySubtext, { color: colors.textSecondary }]}
            >
              Tap the + button to add your first passport.
            </Text>
          </View>
        ) : (
          <>
            {passports.map(renderPassportCard)}
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
              {passports.length} passport{passports.length === 1 ? "" : "s"}{" "}
              saved
            </Text>
          </>
        )}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={handleAddPassport}>
        <Plus size={32} color="#000" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

function formatExpiry(value?: string) {
  if (!value) return "-- / --";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-- / --";
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear().toString().slice(-2);
  return `${month} / ${year}`;
}

function determineStatus(value?: string) {
  if (!value) return "valid";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "valid";
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  const days = diff / (1000 * 60 * 60 * 24);
  return days <= 90 ? "expiring" : "valid";
}

function determineTheme(nationality?: string) {
  if (!nationality) return "navy";
  return nationality.length % 2 === 0 ? "maroon" : "navy";
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 80,
  },
  emptyContainer: {
    marginHorizontal: Layout.spacing.l,
    marginTop: Layout.spacing.xl,
    padding: Layout.spacing.xl,
    borderRadius: Layout.borderRadius.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 18,
  },
  emptySubtext: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 14,
    textAlign: "center",
  },
  footerText: {
    textAlign: "center",
    fontFamily: Typography.fontFamily.medium,
    marginTop: Layout.spacing.l,
  },
  fab: {
    position: "absolute",
    bottom: Layout.spacing.xl,
    right: Layout.spacing.xl,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#00FFD1",
    justifyContent: "center",
    alignItems: "center",
    ...Layout.shadows.soft,
    shadowColor: "#00FFD1",
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
});
