import { Layout } from "@/constants/Layout";
import { Typography } from "@/constants/Typography";
import { useTheme } from "@/context/ThemeContext";
import React from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

export interface ModalAction {
  text: string;
  style?: "default" | "cancel" | "destructive";
  onPress?: () => void | Promise<void>;
  closeOnPress?: boolean;
}

interface ModernModalProps {
  visible: boolean;
  title: string;
  message?: string;
  actions: ModalAction[];
  onDismiss?: () => void;
}

export default function ActionModal({
  visible,
  title,
  message,
  actions,
  onDismiss,
}: ModernModalProps) {
  const { colors, isDark } = useTheme();

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onDismiss}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={onDismiss}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.dialog,
                {
                  backgroundColor: isDark ? "#1E1E1E" : "#FFFFFF",
                  borderColor: isDark ? "#333" : "transparent",
                  borderWidth: isDark ? 1 : 0,
                },
              ]}
            >
              <View style={styles.content}>
                <Text style={[styles.title, { color: colors.text }]}>
                  {title}
                </Text>
                {message && (
                  <Text
                    style={[styles.message, { color: colors.textSecondary }]}
                  >
                    {message}
                  </Text>
                )}
              </View>

              <View style={styles.actions}>
                {actions.map((action, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.button,
                      index < actions.length - 1 && styles.borderBottom,
                      { borderBottomColor: isDark ? "#333" : "#F0F0F0" },
                    ]}
                    onPress={() => {
                      if (action.closeOnPress !== false) {
                        onDismiss?.();
                      }
                      const result = action.onPress?.();
                      if (
                        result &&
                        typeof result === "object" &&
                        "then" in result
                      ) {
                        (result as Promise<void>).catch((err) =>
                          console.error("Modal action error", err)
                        );
                      }
                    }}
                  >
                    <Text
                      style={[
                        styles.buttonText,
                        action.style === "destructive" &&
                          styles.destructiveText,
                        action.style === "cancel" && styles.cancelText,
                        !action.style && { color: "#007AFF" }, // Default blue
                      ]}
                    >
                      {action.text}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  dialog: {
    width: "85%",
    maxWidth: 340,
    borderRadius: 20,
    overflow: "hidden",
    ...Layout.shadows.soft,
    elevation: 10,
  },
  content: {
    padding: 24,
    alignItems: "center",
  },
  title: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 18,
    textAlign: "center",
    marginBottom: 8,
  },
  message: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  actions: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(128,128,128,0.2)",
  },
  button: {
    height: 52,
    justifyContent: "center",
    alignItems: "center",
  },
  borderBottom: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  buttonText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: 17,
  },
  destructiveText: {
    color: "#FF3B30",
  },
  cancelText: {
    color: "#8E8E93",
    fontFamily: Typography.fontFamily.bold,
  },
});
