import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { DOC_TYPES } from "@/constants";
import { Layout } from "@/constants/Layout";
import { Typography } from "@/constants/Typography";
import { useTheme } from "@/context/ThemeContext";
import { useDocumentManagement } from "@/hooks/useDocumentManagement";

type UploadMethod = "camera" | "photo" | "pdf";

interface AddDocsSheetProps {
  onClose?: () => void;
}

export default function AddDocsSheet({ onClose }: AddDocsSheetProps) {
  const { colors, isDark } = useTheme();
  const { uploadFile, takePhoto, pickImage, pickDocument } =
    useDocumentManagement();
  const [isProcessing, setIsProcessing] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Personal Docs & Certs
        </Text>
      </View>

      <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
        SELECT DOCUMENT TYPE
      </Text>

      <View style={styles.typeGrid}>
        {DOC_TYPES.map((option) => {
          return (
            <TouchableOpacity
              key={option.id}
              activeOpacity={0.85}
              style={[
                styles.typeItem,
                {
                  backgroundColor: isDark ? colors.card : "#F7F7F7",
                },
              ]}
            >
              <View
                style={[
                  styles.typeIcon,
                  {
                    backgroundColor: `${option.accent}1A`,
                  },
                ]}
              >
                <option.icon size={20} color={option.accent} />
              </View>
              <Text style={[styles.typeLabel, { color: colors.text }]}>
                {option.label}
              </Text>
              <Text
                style={[
                  styles.typeDescription,
                  { color: colors.textSecondary },
                ]}
                numberOfLines={2}
              >
                {option.description}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Layout.spacing.l,
    position: "relative",
  },
  title: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 20,
  },
  sectionLabel: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: 12,
    letterSpacing: 1,
    marginBottom: Layout.spacing.s,
  },
  typeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: Layout.spacing.l,
    gap: Layout.spacing.m,
  },
  typeItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: Layout.spacing.m,
    paddingHorizontal: Layout.spacing.m,
    borderRadius: Layout.borderRadius.m,
    minWidth: 160,
  },
  typeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Layout.spacing.s,
  },
  typeLabel: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 12,
  },
  typeDescription: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 12,
    marginTop: 2,
  },
  infoText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 13,
    marginBottom: Layout.spacing.m,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#00FFD1",
    borderRadius: Layout.borderRadius.l,
    padding: Layout.spacing.m,
    marginBottom: Layout.spacing.m,
  },
  primaryButtonIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: Layout.spacing.m,
  },
  primaryButtonContent: {
    flex: 1,
  },
  primaryButtonLabel: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 16,
    color: "#000",
  },
  primaryButtonCaption: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 12,
    color: "rgba(0,0,0,0.6)",
    marginTop: 2,
  },
  secondaryRow: {
    flexDirection: "row",
    gap: Layout.spacing.m,
  },
  secondaryButton: {
    flex: 1,
    borderRadius: Layout.borderRadius.l,
    paddingVertical: Layout.spacing.l,
    paddingHorizontal: Layout.spacing.m,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Layout.spacing.s,
    backgroundColor: "rgba(0,0,0,0.08)",
  },
  secondaryLabel: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 14,
  },
});
