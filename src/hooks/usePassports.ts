import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';

import { useAuth } from '@/context/AuthContext';
import { useSecurity } from '@/context/SecurityContext';
import * as crypto from '@/lib/crypto';
import { db } from '@/lib/firebase';
import { PassportFormData, PassportRecord } from '@/types/passport';
import { getFlagUrl } from '@/utils/flags';

export function usePassports() {
  const { user } = useAuth();
  const { masterKey, isUnlocked } = useSecurity();
  const [passports, setPassports] = useState<PassportRecord[]>([]);
  const [decryptedPassports, setDecryptedPassports] = useState<
    PassportRecord[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const decryptAll = async () => {
      if (!isUnlocked || !masterKey) {
        setDecryptedPassports(passports);
        return;
      }

      const decrypted = await Promise.all(
        passports.map(async (p) => {
          if (!p.isEncrypted) return p;
          try {
            return {
              ...p,
              fullName: await crypto.decryptText(p.fullName, masterKey),
              passportNumber: await crypto.decryptText(
                p.passportNumber,
                masterKey
              ),
              dateOfBirth: await crypto.decryptText(p.dateOfBirth, masterKey),
              issueDate: await crypto.decryptText(p.issueDate, masterKey),
              expiryDate: await crypto.decryptText(p.expiryDate, masterKey),
              nationality: await crypto.decryptText(p.nationality, masterKey),
              countryCode: await crypto.decryptText(p.countryCode, masterKey),
            };
          } catch (err) {
            console.error('Failed to decrypt passport:', p.id, err);
            return p;
          }
        })
      );
      setDecryptedPassports(decrypted);
    };

    decryptAll();
  }, [passports, isUnlocked, masterKey]);

  useEffect(() => {
    if (!user) {
      setPassports([]);
      setLoading(false);
      return;
    }

    const collectionRef = collection(db, 'users', user.uid, 'passports');
    const q = query(collectionRef, orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((docSnap) => {
          const data = docSnap.data() as PassportFormData & {
            createdAt?: any;
            updatedAt?: any;
          };
          const formatted: PassportRecord = {
            id: docSnap.id,
            ...data,
            flagUrl: getFlagUrl(data.countryCode),
          };
          return formatted;
        });
        setPassports(docs);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching passports', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const addPassport = async (data: PassportFormData) => {
    if (!user) return;
    const shouldEncrypt = isUnlocked && !!masterKey;
    const collectionRef = collection(db, 'users', user.uid, 'passports');

    let finalData: any = { ...data, isEncrypted: shouldEncrypt };
    if (shouldEncrypt) {
      finalData.fullName = await crypto.encryptText(data.fullName, masterKey);
      finalData.passportNumber = await crypto.encryptText(
        data.passportNumber,
        masterKey
      );
      finalData.dateOfBirth = await crypto.encryptText(
        data.dateOfBirth,
        masterKey
      );
      finalData.issueDate = await crypto.encryptText(data.issueDate, masterKey);
      finalData.expiryDate = await crypto.encryptText(
        data.expiryDate,
        masterKey
      );
      finalData.nationality = await crypto.encryptText(
        data.nationality,
        masterKey
      );
      finalData.countryCode = await crypto.encryptText(
        data.countryCode,
        masterKey
      );
    }

    await addDoc(collectionRef, {
      ...finalData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  };

  const updatePassport = async (passportId: string, data: PassportFormData) => {
    if (!user) return;
    const docRef = doc(db, 'users', user.uid, 'passports', passportId);
    const shouldEncrypt = isUnlocked && !!masterKey;

    let finalData: any = { ...data, isEncrypted: shouldEncrypt };
    if (shouldEncrypt) {
      finalData.fullName = await crypto.encryptText(data.fullName, masterKey);
      finalData.passportNumber = await crypto.encryptText(
        data.passportNumber,
        masterKey
      );
      finalData.dateOfBirth = await crypto.encryptText(
        data.dateOfBirth,
        masterKey
      );
      finalData.issueDate = await crypto.encryptText(data.issueDate, masterKey);
      finalData.expiryDate = await crypto.encryptText(
        data.expiryDate,
        masterKey
      );
      finalData.nationality = await crypto.encryptText(
        data.nationality,
        masterKey
      );
      finalData.countryCode = await crypto.encryptText(
        data.countryCode,
        masterKey
      );
    }

    await updateDoc(docRef, {
      ...finalData,
      updatedAt: serverTimestamp(),
    });
  };

  const deletePassport = async (passportId: string) => {
    if (!user) return;
    const docRef = doc(db, 'users', user.uid, 'passports', passportId);
    await deleteDoc(docRef);
  };

  return {
    passports: decryptedPassports,
    loading,
    addPassport,
    updatePassport,
    deletePassport,
  };
}
