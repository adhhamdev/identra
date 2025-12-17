import {
  BriefcaseMedical,
  Car,
  FileText,
  Globe,
  Plus,
  Search,
  Shield,
} from "lucide-react-native";
import React, { useCallback } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AddDocsSheet from "@/components/docs/AddDocsSheet";
import CertificateCard from "@/components/docs/CertificateCard";
import DocumentItem from "@/components/docs/DocumentItem";
import EditDocumentSheet from "@/components/docs/EditDocumentSheet";
import ShareDocumentSheet from "@/components/docs/ShareDocumentSheet";
import { Layout } from "@/constants/Layout";
import { Typography } from "@/constants/Typography";
import { useBottomSheet } from "@/context/BottomSheetContext";
import { useTheme } from "@/context/ThemeContext";
import { useDocumentManagement } from "@/hooks/useDocumentManagement";
import { useDocuments } from "@/hooks/useDocuments";

export default function DocsScreen() {
  const { colors, isDark } = useTheme();
  const { present } = useBottomSheet();
  const { documents, loading } = useDocuments();
  const { updateDocument, deleteDocument } = useDocumentManagement();

  const handleEdit = (doc: any) => {
    present("edit-document", {
      component: EditDocumentSheet,
      snapPoints: ["68%"],
      props: {
        document: doc,
        onSave: updateDocument,
        onDelete: deleteDocument,
      },
    });
  };

  const handleShare = (doc: any) => {
    present("share-document", {
      component: ShareDocumentSheet,
      snapPoints: ["68%"],
      props: {
        document: doc,
      },
    });
  };

  const handleAddDoc = useCallback(() => {
    present("add-docs", {
      component: AddDocsSheet,
      snapPoints: ["50%"],
    });
  }, [present]);

  // Group documents (NIC/Passport/DL -> Certificates, Others -> Other)
  const certificates = documents.filter((doc) =>
    ["NIC", "Passport", "Driver's License"].includes(doc.type)
  );

  const otherDocs = documents.filter(
    (doc) => !["NIC", "Passport", "Driver's License"].includes(doc.type)
  );

  const getIcon = (type: string) => {
    switch (type) {
      case "NIC":
        return Shield;
      case "Passport":
        return Globe;
      case "Driver's License":
        return Car;
      case "Bank Card":
        return FileText;
      case "Certificate":
        return BriefcaseMedical;
      default:
        return FileText;
    }
  };

  const getColor = (type: string, isIcon: boolean = false) => {
    // Simple color mapping
    switch (type) {
      case "NIC":
        return "#009688";
      case "Passport":
        return "#9C27B0";
      case "Driver's License":
        return "#4285F4";
      case "Bank Card":
        return "#FFC107";
      default:
        return "#607D8B";
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
            Docs & Certs
          </Text>
        </View>

        {/* Search Bar */}
        <View
          style={[
            styles.searchContainer,
            {
              backgroundColor: isDark ? colors.card : "#FFF",
              borderColor: isDark ? colors.border : "#F0F0F0",
            },
          ]}
        >
          <Search
            size={20}
            color={colors.textSecondary}
            style={styles.searchIcon}
          />
          <TextInput
            placeholder="Search documents..."
            placeholderTextColor={colors.textSecondary}
            style={[styles.searchInput, { color: colors.text }]}
          />
        </View>

        {/* Identity Certificates Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Identity Certificates
          </Text>
          <View
            style={[
              styles.badge,
              { backgroundColor: isDark ? "rgba(0,150,136,0.2)" : "#E0F2F1" },
            ]}
          >
            <Text style={styles.badgeText}>{certificates.length} Items</Text>
          </View>
        </View>

        {certificates.map((doc) => (
          <CertificateCard
            key={doc.id}
            title={doc.type}
            subtitle={doc.title}
            status="Valid" // Hardcoded for MVP
            expiry={doc.expiryDate || "No Expiry"}
            icon={getIcon(doc.type)}
            color={getColor(doc.type)}
            previewImage={doc.downloadUrl}
            onEdit={() => handleEdit(doc)}
            onShare={() => handleShare(doc)}
          />
        ))}

        {/* Other Documents Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Other Documents
          </Text>
          <View
            style={[
              styles.badge,
              { backgroundColor: isDark ? "rgba(0,150,136,0.2)" : "#E0F2F1" },
            ]}
          >
            <Text style={styles.badgeText}>{otherDocs.length} Items</Text>
          </View>
        </View>

        <View style={styles.gridRow}>
          {otherDocs.map((doc) => (
            <DocumentItem
              key={doc.id}
              title={doc.title}
              subtitle={
                doc.createdAt?.toDate().toLocaleDateString() || "Just now"
              }
              icon={getIcon(doc.type)}
              iconColor={getColor(doc.type)}
              iconBg={
                isDark ? `${getColor(doc.type)}20` : `${getColor(doc.type)}20`
              }
              type="grid"
              onEdit={() => handleEdit(doc)}
              onShare={() => handleShare(doc)}
            />
          ))}
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={handleAddDoc}>
        <Plus size={32} color="#000" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Layout.spacing.l,
    paddingBottom: 100,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: Layout.spacing.m,
  },
  headerTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 28,
  },
  iconButton: {
    padding: 8,
    borderRadius: 20,
    ...Layout.shadows.soft,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: Layout.borderRadius.l,
    paddingHorizontal: Layout.spacing.m,
    height: 50,
    marginBottom: Layout.spacing.xl,
    borderWidth: 1,
  },
  searchIcon: {
    marginRight: Layout.spacing.s,
  },
  searchInput: {
    flex: 1,
    fontFamily: Typography.fontFamily.medium,
    fontSize: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Layout.spacing.m,
  },
  sectionTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 18,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 12,
    color: "#009688",
  },
  gridRow: {
    flexDirection: "row",
    marginHorizontal: -Layout.spacing.xs,
    marginBottom: Layout.spacing.m,
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
