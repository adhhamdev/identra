import { Layout } from "@/constants/Layout";
import { Typography } from "@/constants/Typography";
import { useTheme } from "@/context/ThemeContext";
import { useBiometrics } from "@/hooks/useBiometrics"; // Import useBiometrics
import { File, Paths } from "expo-file-system";
import {
  AlertTriangle,
  Calendar,
  MoreVertical,
  ShieldCheck,
} from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface CertificateCardProps {
  title: string;
  subtitle: string;
  status: "Valid" | "Expired";
  expiry: string;
  icon: any; // Lucide icon component
  color: string; // Background color for icon circle
  previewImage?: string; // Optional preview image URL
  onShare?: () => void;
  onEdit?: () => void;
}

export default function CertificateCard({
  title,
  subtitle,
  status,
  expiry,
  icon: Icon,
  color,
  previewImage,
  onShare,
  onEdit
}: CertificateCardProps) {
  const { colors, isDark } = useTheme();
  const lastTap = useRef<number | null>(null);
  // Biometrics hooks
  const { authenticate } = useBiometrics();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const isValid = status === "Valid";
  const statusColor = isValid ? colors.success : colors.error;
  const statusBg = isValid ? colors.badgeSuccess : colors.badgeError;
  const [imageUri, setImageUri] = useState<string | null>(null);

  useEffect(() => {
    const cacheImage = async () => {
      if (!previewImage) {
        setImageUri(null);
        return;
      }

      try {
        const filename =
          previewImage.split("%2F").pop()?.split("?")[0] || "doc_image.jpg";

        const file = new File(Paths.cache, filename);

        if (file.exists) {
          setImageUri(file.uri);
        } else {
          try {
            const response = await fetch(previewImage);
            if (response.ok) {
              const buffer = await response.arrayBuffer();
              file.write(new Uint8Array(buffer));
              setImageUri(file.uri);
            } else {
              setImageUri(previewImage);
            }
          } catch (writeError) {
            console.error("Download failed, using remote URL", writeError);
            setImageUri(previewImage);
          }
        }
      } catch (e) {
        console.error("Cache check failed, using remote URL", e);
        setImageUri(previewImage);
      }
    };

    cacheImage();
  }, [previewImage]);

  const handlePress = async () => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;

    const lastTime = lastTap.current;
    if (lastTime && now - lastTime < DOUBLE_PRESS_DELAY) {
      onEdit?.();
      return;
    }

    lastTap.current = now;

    if (isAuthenticated) {
      // Already unlocked
      return;
    }
    const success = await authenticate("Authenticate to view document");
    if (success) {
      setIsAuthenticated(true);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onLongPress={onShare}
      onPress={handlePress}
      style={[
        styles.container,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View
            style={[
              styles.iconCircle,
              {
                backgroundColor: isDark
                  ? "rgba(255,255,255,0.08)"
                  : "rgba(0,0,0,0.04)",
              },
            ]}
          >
            <View style={[styles.iconInner, { backgroundColor: color }]}>
              <Icon size={20} color="#FFF" />
            </View>
          </View>
          <View>
            <Text
              style={[styles.title, { color: colors.text }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {title}
            </Text>
            <Text
              style={[styles.subtitle, { color: colors.textSecondary }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {subtitle}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={[
            styles.menuButton,
            {
              backgroundColor: isDark
                ? "rgba(255,255,255,0.06)"
                : "rgba(0,0,0,0.04)",
            },
          ]}
        >
          <MoreVertical size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Status Row */}
      <View style={styles.statusRow}>
        <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
          {isValid ? (
            <ShieldCheck
              size={12}
              color={statusColor}
              style={{ marginRight: 6 }}
            />
          ) : (
            <AlertTriangle
              size={12}
              color={statusColor}
              style={{ marginRight: 6 }}
            />
          )}
          <Text style={[styles.statusText, { color: statusColor }]}>
            {status}
          </Text>
        </View>
        <View style={styles.expiryRight}>
          <Calendar
            size={14}
            color={colors.textSecondary}
            style={{ marginRight: 6 }}
          />
          <Text
            style={[styles.expiryText, { color: colors.textSecondary }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            Expires {expiry}
          </Text>
        </View>
      </View>

      {/* Preview Area */}
      <TouchableOpacity
        style={[
          styles.previewArea,
          {
            backgroundColor: isDark
              ? "rgba(255,255,255,0.06)"
              : "rgba(0,0,0,0.04)",
            borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
          },
        ]}
        activeOpacity={0.9}
        onPress={handlePress}
      >
        {isAuthenticated && imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={styles.previewImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderPreview}>
            {!isAuthenticated ? (
              <View style={{ alignItems: 'center' }}>
                <View style={[styles.iconCircle, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', marginBottom: 8 }]}>
                  <ShieldCheck size={24} color={colors.tint} />
                </View>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Tap to Unlock</Text>
              </View>
            ) : (
              <View
                style={[
                  styles.placeholderContent,
                  {
                    backgroundColor: isDark
                      ? "rgba(255,255,255,0.08)"
                      : "rgba(0,0,0,0.06)",
                  },
                ]}
              />
            )}
          </View>
        )}
        <View
          style={[
            styles.tapOverlay,
            {
              backgroundColor: isDark ? "rgba(0,0,0,0.35)" : "rgba(0,0,0,0.25)",
            },
          ]}
        >
          <Text style={styles.tapText}>{isAuthenticated ? "VIEW" : "LOCKED"}</Text>
        </View>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: Layout.borderRadius.xl,
    padding: Layout.spacing.m,
    marginBottom: Layout.spacing.m,
    ...Layout.shadows.soft,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Layout.spacing.m,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: Layout.spacing.s,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Layout.spacing.m,
  },
  iconInner: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
  },
  menuButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 16,
  },
  subtitle: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 12,
    marginTop: 2,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Layout.spacing.m,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statusText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 12,
  },
  expiryRight: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
    marginLeft: Layout.spacing.m,
  },
  expiryText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 12,
  },
  previewArea: {
    height: 112,
    borderRadius: Layout.borderRadius.l,
    overflow: "hidden",
    position: "relative",
    borderWidth: 1,
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  placeholderPreview: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderContent: {
    width: "60%",
    height: "60%",
    borderRadius: 8,
  },
  tapOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Layout.spacing.m,
    paddingVertical: Layout.spacing.s,
  },
  tapText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 10,
    color: "#FFF",
    letterSpacing: 1,
  },
});
