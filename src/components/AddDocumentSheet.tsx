import { Layout } from "@/constants/Layout";
import { Typography } from "@/constants/Typography";
import { useTheme } from "@/context/ThemeContext";
import {
  Baby,
  Camera,
  ChevronRight,
  CreditCard,
  FileText,
  FolderOpen,
  Globe,
  Image,
} from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface DocumentType {
  icon: any;
  label: string;
  id: string;
}

export interface AddDocumentSheetProps {
  onDocumentTypeSelect?: (type: string) => void;
  onUploadMethodSelect?: (method: string) => void;
  onClose?: () => void;
}

const documentTypes: DocumentType[] = [
  { icon: FileText, label: "NIC", id: "nic" },
  { icon: Globe, label: "Passport", id: "passport" },
  { icon: CreditCard, label: "Bank Card", id: "bank_card" },
  { icon: Baby, label: "Birth Cert", id: "birth_cert" },
  { icon: FolderOpen, label: "Other", id: "other" },
];

/**
 * AddDocumentSheet - Content component for the add document bottom sheet
 *
 * This is a pure content component designed to be used with the BottomSheetProvider.
 * Usage:
 * ```tsx
 * const { present } = useBottomSheet();
 * present('add-document', {
 *   component: AddDocumentSheet,
 *   snapPoints: ['70%'],
 *   props: { onDocumentTypeSelect: handleSelect }
 * });
 * ```
 */
export default function AddDocumentSheet({
  onDocumentTypeSelect,
  onUploadMethodSelect,
  onClose,
}: AddDocumentSheetProps) {
  const { colors, isDark } = useTheme();

  const handleDocumentTypeSelect = (type: string) => {
    onDocumentTypeSelect?.(type);
  };

  const handleUploadMethodSelect = (method: string) => {
    onUploadMethodSelect?.(method);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Add New Document
        </Text>
      </View>

      {/* Document Types Section */}
      <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
        SELECT DOCUMENT TYPE
      </Text>
      <View style={styles.documentTypesGrid}>
        {documentTypes.map((type) => (
          <TouchableOpacity
            key={type.id}
            style={[
              styles.documentTypeItem,
              { backgroundColor: isDark ? colors.card : "#F5F5F5" },
            ]}
            onPress={() => handleDocumentTypeSelect(type.id)}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.documentTypeIcon,
                { backgroundColor: isDark ? "#2A2A2A" : "#FFF" },
              ]}
            >
              <type.icon size={24} color={colors.text} />
            </View>
            <Text style={[styles.documentTypeLabel, { color: colors.text }]}>
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Upload Methods Section */}
      <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
        UPLOAD METHOD
      </Text>

      {/* Primary Camera Option */}
      <TouchableOpacity
        style={styles.primaryUploadButton}
        onPress={() => handleUploadMethodSelect("camera")}
        activeOpacity={0.8}
      >
        <View style={styles.primaryUploadIcon}>
          <Camera size={24} color="#000" />
        </View>
        <View style={styles.primaryUploadText}>
          <Text style={styles.primaryUploadLabel}>Scan with Camera</Text>
          <Text style={styles.primaryUploadSubtitle}>
            Best for physical documents
          </Text>
        </View>
        <ChevronRight size={20} color="#000" />
      </TouchableOpacity>

      {/* Secondary Upload Options */}
      <View style={styles.secondaryUploadRow}>
        <TouchableOpacity
          style={[
            styles.secondaryUploadButton,
            { backgroundColor: isDark ? colors.card : "#F5F5F5" },
          ]}
          onPress={() => handleUploadMethodSelect("photo")}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.secondaryUploadIcon,
              { backgroundColor: isDark ? "#2A2A2A" : "#FFF" },
            ]}
          >
            <Image size={24} color={colors.text} />
          </View>
          <Text style={[styles.secondaryUploadLabel, { color: colors.text }]}>
            Upload Photo
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.secondaryUploadButton,
            { backgroundColor: isDark ? colors.card : "#F5F5F5" },
          ]}
          onPress={() => handleUploadMethodSelect("pdf")}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.secondaryUploadIcon,
              { backgroundColor: isDark ? "#2A2A2A" : "#FFF" },
            ]}
          >
            <FileText size={24} color={colors.text} />
          </View>
          <Text style={[styles.secondaryUploadLabel, { color: colors.text }]}>
            Upload PDF
          </Text>
        </TouchableOpacity>
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
  closeButton: {
    position: "absolute",
    right: 0,
    padding: 4,
  },
  sectionLabel: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: 12,
    letterSpacing: 1,
    marginBottom: Layout.spacing.m,
  },
  documentTypesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: Layout.spacing.l,
    gap: Layout.spacing.m,
  },
  documentTypeItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: Layout.spacing.m,
    paddingHorizontal: Layout.spacing.m,
    borderRadius: Layout.borderRadius.m,
    minWidth: 80,
  },
  documentTypeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Layout.spacing.s,
  },
  documentTypeLabel: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 12,
  },
  primaryUploadButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#00FFD1",
    borderRadius: Layout.borderRadius.l,
    padding: Layout.spacing.m,
    marginBottom: Layout.spacing.m,
  },
  primaryUploadIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: Layout.spacing.m,
  },
  primaryUploadText: {
    flex: 1,
  },
  primaryUploadLabel: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 16,
    color: "#000",
  },
  primaryUploadSubtitle: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 12,
    color: "rgba(0,0,0,0.6)",
    marginTop: 2,
  },
  secondaryUploadRow: {
    flexDirection: "row",
    gap: Layout.spacing.m,
    marginBottom: Layout.spacing.l,
  },
  secondaryUploadButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: Layout.spacing.l,
    borderRadius: Layout.borderRadius.l,
  },
  secondaryUploadIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Layout.spacing.s,
  },
  secondaryUploadLabel: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 14,
  },
  cancelButton: {
    alignItems: "center",
    paddingVertical: Layout.spacing.m,
    borderRadius: Layout.borderRadius.l,
  },
});
