import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

import { useAuth } from '@/context/AuthContext';
import { useSecurity } from '@/context/SecurityContext';
import * as crypto from '@/lib/crypto';
import { db } from '@/lib/firebase';

export interface CardData {
  id: string;
  cardholderName: string; // Will be encrypted if isEncrypted is true
  cardType: string;
  maskedNumber: string; // Plaintext for display
  cardNumber?: string; // Full number (encrypted)
  expiryDate: string; // MM/YY (encrypted if isEncrypted is true)
  network: string;
  theme: string;
  isEncrypted?: boolean;
  createdAt: Timestamp;
}

export function useCards() {
  const { user } = useAuth();
  const { masterKey, isUnlocked } = useSecurity();
  const [cards, setCards] = useState<CardData[]>([]);
  const [loading, setLoading] = useState(true);

  // Decrypt cards when masterKey becomes available or cards change
  const [decryptedCards, setDecryptedCards] = useState<CardData[]>([]);

  useEffect(() => {
    const decryptAll = async () => {
      if (!isUnlocked || !masterKey) {
        setDecryptedCards(cards);
        return;
      }

      const decrypted = await Promise.all(
        cards.map(async (card) => {
          if (!card.isEncrypted) return card;
          try {
            return {
              ...card,
              cardholderName: await crypto.decryptText(
                card.cardholderName,
                masterKey
              ),
              cardNumber: card.cardNumber
                ? await crypto.decryptText(card.cardNumber, masterKey)
                : undefined,
              expiryDate: await crypto.decryptText(card.expiryDate, masterKey),
            };
          } catch (err) {
            console.error('Failed to decrypt card:', card.id, err);
            return card;
          }
        })
      );
      setDecryptedCards(decrypted);
    };

    decryptAll();
  }, [cards, isUnlocked, masterKey]);

  // Fetch Cards
  useEffect(() => {
    if (!user) {
      setCards([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'users', user.uid, 'cards'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as CardData[];
        setCards(docs);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching cards:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Actions
  const addCard = async (
    data: Omit<CardData, 'id' | 'createdAt' | 'isEncrypted'>
  ) => {
    if (!user) return;

    // Check if we should encrypt (Yes, by default now)
    const shouldEncrypt = isUnlocked && !!masterKey;

    try {
      let finalData = { ...data, isEncrypted: shouldEncrypt };

      if (shouldEncrypt) {
        finalData.cardholderName = await crypto.encryptText(
          data.cardholderName,
          masterKey
        );
        finalData.expiryDate = await crypto.encryptText(
          data.expiryDate,
          masterKey
        );
        if (data.cardNumber) {
          finalData.cardNumber = await crypto.encryptText(
            data.cardNumber,
            masterKey
          );
        }
      }

      await addDoc(collection(db, 'users', user.uid, 'cards'), {
        ...finalData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return true;
    } catch (error) {
      console.error('Error adding card:', error);
      Alert.alert('Error', 'Failed to add card. Please try again.');
      return false;
    }
  };

  const deleteCard = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'cards', id));
      Alert.alert('Success', 'Card removed successfully.');
    } catch (error) {
      console.error('Error deleting card:', error);
      Alert.alert('Error', 'Failed to remove card.');
    }
  };

  const updateCard = async (id: string, data: Partial<CardData>) => {
    if (!user) return;
    try {
      const cardRef = doc(db, 'users', user.uid, 'cards', id);

      let finalData = { ...data };
      if (isUnlocked && !!masterKey) {
        if (data.cardholderName)
          finalData.cardholderName = await crypto.encryptText(
            data.cardholderName,
            masterKey
          );
        if (data.expiryDate)
          finalData.expiryDate = await crypto.encryptText(
            data.expiryDate,
            masterKey
          );
        if (data.cardNumber)
          finalData.cardNumber = await crypto.encryptText(
            data.cardNumber,
            masterKey
          );
      }

      await updateDoc(cardRef, {
        ...finalData,
        updatedAt: serverTimestamp(),
      });
      return true;
    } catch (error) {
      console.error('Error updating card:', error);
      Alert.alert('Error', 'Failed to update card.');
      return false;
    }
  };

  return { cards: decryptedCards, loading, addCard, deleteCard, updateCard };
}
