import { Plus } from "lucide-react-native";
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

import AddCardSheet, { CardFormData } from "@/components/AddCardSheet";
import BankCard from "@/components/BankCard";
import { Layout } from "@/constants/Layout";
import { Typography } from "@/constants/Typography";
import { useBottomSheet } from "@/context/BottomSheetContext";
import { useModal } from "@/context/ModalContext";
import { useTheme } from "@/context/ThemeContext";
import { CardData, useCards } from "@/hooks/useCards";

export default function CardsScreen() {
  const { colors, isDark } = useTheme();
  const { present, dismiss } = useBottomSheet();
  const { showModal } = useModal(); // Use Global Modal
  const { cards, loading, addCard, deleteCard, updateCard } = useCards();

  const handleAddCard = useCallback(() => {
    present("add-card", {
      component: AddCardSheet,
      snapPoints: ["90%"],
      enablePanDownToClose: true,
      props: {
        onSave: async (data: CardFormData) => {
          dismiss();

          const cleanNum = data.cardNumber.replace(/\s/g, "");
          const last4 = cleanNum.slice(-4);
          const maskedNumber = `**** **** **** ${last4}`;

          await addCard({
            cardholderName: data.cardholderName,
            cardType: data.cardType || "Debit",
            maskedNumber: maskedNumber,
            expiryDate: data.expiryDate,
            network: data.network,
            theme: data.theme,
          });
        },
        onClose: () => dismiss(),
      },
    });
  }, [present, dismiss, addCard]);

  const handleEditCard = useCallback(
    (card: CardData) => {
      // Prepare initial data. Note: we don't have full number, so we pass maskedNumber?
      // AddCardSheet expects cardNumber. If we pass masked, validation will fail or it will save masked as full.
      // LIMITATION: We cannot edit the Card Number fully because we don't store it.
      // We will pass maskedNumber. User has to re-enter if they want to change it.
      // Or we treat it as visual only.
      // For now, let's pre-fill what we have.

      present("edit-card", {
        component: AddCardSheet,
        snapPoints: ["90%"],
        enablePanDownToClose: true,
        props: {
          initialData: {
            cardholderName: card.cardholderName,
            cardType: card.cardType,
            cardNumber: card.maskedNumber, // This might trigger "invalid" check if user doesn't touch it.
            expiryDate: card.expiryDate,
            cvv: "", // CVV not stored
            network: card.network,
            theme: card.theme as any,
          },
          onSave: async (data: CardFormData) => {
            dismiss();

            // If user updated number, mask it. If they left it masked, keep it.
            let maskedNumber = data.cardNumber;
            if (!data.cardNumber.includes("****")) {
              const cleanNum = data.cardNumber.replace(/\s/g, "");
              const last4 = cleanNum.slice(-4);
              maskedNumber = `**** **** **** ${last4}`;
            }

            await updateCard(card.id, {
              cardholderName: data.cardholderName,
              cardType: data.cardType,
              maskedNumber: maskedNumber,
              expiryDate: data.expiryDate,
              network: data.network,
              theme: data.theme,
            });
          },
          onClose: () => dismiss(),
        },
      });
    },
    [present, dismiss, updateCard]
  );

  const handleCardOptions = (card: CardData) => {
    showModal({
      title: `${card.network} ${card.cardType}`,
      message: "Choose an action for this card",
      actions: [
        {
          text: "Edit Card",
          onPress: () => {
            // Small timeout to allow modal to fade out before sheet comes up
            setTimeout(() => handleEditCard(card), 200);
            dismiss();
          },
        },
        {
          text: "Delete Card",
          style: "destructive",
          onPress: () => {
            // Confirm delete? Global modal usually is the confirmation.
            // But deleting immediately might be harsh.
            // Let's assume user knows what "Delete" means here.
            deleteCard(card.id);
            dismiss();
          },
        },
      ],
    });
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.surface }]}
      edges={["top"]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          My Bank Cards
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00C4A7" />
          </View>
        ) : cards.length === 0 ? (
          <View
            style={[
              styles.emptyContainer,
              { backgroundColor: isDark ? colors.card : "#F5F5F5" },
            ]}
          >
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No cards added yet.
            </Text>
            <Text
              style={[styles.emptySubtext, { color: colors.textSecondary }]}
            >
              Tap the + button to add your first card.
            </Text>
          </View>
        ) : (
          <>
            {cards.map((card) => (
              <BankCard
                key={card.id}
                cardholderName={card.cardholderName}
                cardType={card.cardType}
                cardNumber={card.maskedNumber}
                expiry={card.expiryDate}
                theme={card.theme}
                network={card.network}
                onLongPress={() => handleCardOptions(card)}
              />
            ))}
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
              {cards.length} card{cards.length !== 1 ? "s" : ""} linked
            </Text>
          </>
        )}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={handleAddCard}>
        <Plus size={32} color="#000" />
      </TouchableOpacity>
    </SafeAreaView>
  );
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
  title: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 28,
  },
  scrollContent: {
    paddingBottom: 100,
    minHeight: "80%",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 100,
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
    marginBottom: 8,
  },
  emptySubtext: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: 14,
    textAlign: "center",
  },
  footerText: {
    textAlign: "center",
    fontFamily: Typography.fontFamily.medium,
    marginTop: Layout.spacing.m,
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
    elevation: 5,
  },
});
