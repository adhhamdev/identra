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
} from "firebase/firestore";
import { useEffect, useState } from "react";

import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { PassportFormData, PassportRecord } from "@/types/passport";
import { getFlagUrl } from "@/utils/flags";

export function usePassports() {
  const { user } = useAuth();
  const [passports, setPassports] = useState<PassportRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setPassports([]);
      setLoading(false);
      return;
    }

    const collectionRef = collection(db, "users", user.uid, "passports");
    const q = query(collectionRef, orderBy("createdAt", "desc"));
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
        console.error("Error fetching passports", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const addPassport = async (data: PassportFormData) => {
    if (!user) return;
    const collectionRef = collection(db, "users", user.uid, "passports");
    await addDoc(collectionRef, {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  };

  const updatePassport = async (passportId: string, data: PassportFormData) => {
    if (!user) return;
    const docRef = doc(db, "users", user.uid, "passports", passportId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  };

  const deletePassport = async (passportId: string) => {
    if (!user) return;
    const docRef = doc(db, "users", user.uid, "passports", passportId);
    await deleteDoc(docRef);
  };

  return {
    passports,
    loading,
    addPassport,
    updatePassport,
    deletePassport,
  };
}
