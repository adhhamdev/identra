import { ArrowLeft, Camera, FileText, Image as ImageIcon } from "lucide-react-native";
import React, { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";

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
  const { uploadFile, takePhoto, pickImage, pickDocument, uploading } =
    useDocumentManagement();

  const [selectedType, setSelectedType] = useState<typeof DOC_TYPES[0] | null>(null);

  const handleUpload = async (method: UploadMethod) => {
    if (!selectedType) return;

    let result;
    if (method === 'camera') {
      result = await takePhoto();
    } else if (method === 'photo') {
      result = await pickImage();
    } else {
      result = await pickDocument();
    }

    if (result && result.uri) {
      await uploadFile(result.uri, {
        title: selectedType.label,
        type: selectedType.docType as unknown as DocumentType,
      });
      onClose?.();
    }
  };

  if (selectedType) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => setSelectedType(null)}
            style={[styles.backButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}
          >
            <ArrowLeft size={20} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>
            Add {selectedType.label}
          </Text>
        </View>

        <View style={styles.uploadOptions}>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            How would you like to upload your {selectedType.label.toLowerCase()}?
          </Text>

          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: selectedType.accent }]}
            onPress={() => handleUpload('camera')}
            disabled={uploading}
          >
            <View style={styles.primaryButtonIcon}>
              <Camera size={24} color="#000" />
            </View>
            <View style={styles.primaryButtonContent}>
              <Text style={styles.primaryButtonLabel}>Scan with Camera</Text>
              <Text style={styles.primaryButtonCaption}>Take a clear photo of your document</Text>
            </View>
            {uploading && <ActivityIndicator size="small" color="#000" />}
          </TouchableOpacity>

          <View style={styles.secondaryRow}>
            <TouchableOpacity
              style={[styles.secondaryButton, { backgroundColor: isDark ? colors.card : '#F0F0F0' }]}
              onPress={() => handleUpload('photo')}
              disabled={uploading}
            >
              <View style={styles.secondaryIcon}>
                <ImageIcon size={20} color={colors.text} />
              </View>
              <Text style={[styles.secondaryLabel, { color: colors.text }]}>Photo Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.secondaryButton, { backgroundColor: isDark ? colors.card : '#F0F0F0' }]}
              onPress={() => handleUpload('pdf')}
              disabled={uploading}
            >
              <View style={styles.secondaryIcon}>
                <FileText size={20} color={colors.text} />
              </View>
              <Text style={[styles.secondaryLabel, { color: colors.text }]}>PDF Document</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

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
              onPress={() => setSelectedType(option)}
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
  backButton: {
    padding: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  uploadOptions: {
    marginTop: Layout.spacing.s,
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
