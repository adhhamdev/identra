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
import { db } from '@/lib/firebase';

export interface CardData {
  id: string;
  cardholderName: string;
  cardType: string;
  maskedNumber: string; // Stored as "**** **** **** 1234" usually or just last 4
  expiryDate: string; // MM/YY
  network: string;
  theme: string; // Allow flexible strings for new themes
  createdAt: Timestamp;
}

export function useCards() {
  const { user } = useAuth();
  const [cards, setCards] = useState<CardData[]>([]);
  const [loading, setLoading] = useState(true);

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
  const addCard = async (data: Omit<CardData, 'id' | 'createdAt'>) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'users', user.uid, 'cards'), {
        ...data,
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
      await updateDoc(cardRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
      return true;
    } catch (error) {
      console.error('Error updating card:', error);
      Alert.alert('Error', 'Failed to update card.');
      return false;
    }
  };

  return { cards, loading, addCard, deleteCard, updateCard };
}
