import {
  collection,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';

import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';

export interface DocumentData {
  id: string;
  title: string;
  type: string;
  storagePath: string;
  downloadUrl: string;
  createdAt: Timestamp;
  issuedDate?: string;
  expiryDate?: string;
  notes?: string;
}

export function useDocuments() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setDocuments([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'users', user.uid, 'documents'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as DocumentData[];
        setDocuments(docs);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching documents:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  return { documents, loading };
}
