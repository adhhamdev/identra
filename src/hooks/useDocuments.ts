import {
  collection,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';

import { useAuth } from '@/context/AuthContext';
import { useSecurity } from '@/context/SecurityContext';
import * as crypto from '@/lib/crypto';
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
  isEncrypted?: boolean;
}

export function useDocuments() {
  const { user } = useAuth();
  const { masterKey, isUnlocked } = useSecurity();
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [decryptedDocs, setDecryptedDocs] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const decryptAll = async () => {
      if (!isUnlocked || !masterKey) {
        setDecryptedDocs(documents);
        return;
      }

      const decrypted = await Promise.all(
        documents.map(async (doc) => {
          if (!doc.isEncrypted) return doc;
          try {
            return {
              ...doc,
              title: await crypto.decryptText(doc.title, masterKey),
              issuedDate: doc.issuedDate
                ? await crypto.decryptText(doc.issuedDate, masterKey)
                : undefined,
              expiryDate: doc.expiryDate
                ? await crypto.decryptText(doc.expiryDate, masterKey)
                : undefined,
              notes: doc.notes
                ? await crypto.decryptText(doc.notes, masterKey)
                : undefined,
            };
          } catch (err) {
            console.error('Failed to decrypt document:', doc.id, err);
            return doc;
          }
        })
      );
      setDecryptedDocs(decrypted);
    };

    decryptAll();
  }, [documents, isUnlocked, masterKey]);

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

  return { documents: decryptedDocs, loading };
}
