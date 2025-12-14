import {
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  onAuthStateChanged,
  reload,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithCredential,
  signInWithEmailAndPassword,
  updateProfile,
  User,
} from "firebase/auth";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Alert } from "react-native";

import { auth, db } from "@/lib/firebase";
import { UserProfile } from "@/types/user";
import AsyncStorage from "@react-native-async-storage/async-storage";

type AuthContextType = {
  user: User | null;
  userProfile: UserProfile | null;
  initializing: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogleTokens: (params: {
    idToken?: string;
    accessToken?: string;
  }) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [initializing, setInitializing] = useState(true);

  // Auth User Listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (nextUser: User | null) => {
      setUser(nextUser);
      if (!nextUser) {
        setUserProfile(null);
        setInitializing(false);
      } else {
        setInitializing(true);
      }
    });
    return () => unsub();
  }, []);

  // Firestore Profile Listener
  useEffect(() => {
    if (!user) return;

    const userDocRef = doc(db, "users", user.uid);
    const unsub = onSnapshot(
      userDocRef,
      (doc) => {
        if (doc.exists()) {
          setUserProfile(doc.data() as UserProfile);
        } else {
          setUserProfile(null);
        }
        setInitializing(false);
      },
      (error) => {
        console.error("Error fetching user profile:", error);
        setInitializing(false);
      }
    );

    return () => unsub();
  }, [user]);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email.trim(), password);
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const cred = await createUserWithEmailAndPassword(
      auth,
      email.trim(),
      password
    );

    // Update Auth Profile
    try {
      await updateProfile(cred.user, { displayName: fullName });
    } catch (err) {
      console.error("Failed to update auth profile", err);
    }

    // Create Firestore Profile
    try {
      await setDoc(
        doc(db, "users", cred.user.uid),
        {
          name: fullName,
          email: email.trim(),
          createdAt: new Date(),
        },
        { merge: true }
      );
    } catch (err) {
      console.error("Failed to create user document", err);
    }

    try {
      await sendEmailVerification(cred.user);
    } catch (err) {
      console.warn("Failed to send verification email", err);
      Alert.alert(
        "Verification",
        "Account created, but verification email could not be sent. Try again later."
      );
    }
  };

  const signInWithGoogleTokens = async ({
    idToken,
    accessToken,
  }: {
    idToken?: string;
    accessToken?: string;
  }) => {
    if (!idToken && !accessToken) {
      throw new Error("Missing Google tokens");
    }
    const credential = GoogleAuthProvider.credential(idToken, accessToken);
    await signInWithCredential(auth, credential);
  };

  const sendVerificationEmail = async () => {
    if (!auth.currentUser) return;
    await sendEmailVerification(auth.currentUser);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email.trim());
  };

  const refreshUser = async () => {
    if (!auth.currentUser) {
      setUser(null);
      return;
    }
    await reload(auth.currentUser);
    setUser(auth.currentUser);
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      await AsyncStorage.removeItem('user_session'); // Example cleanup
      // Clear potential secrets
      // await SecureStore.deleteItemAsync('user_pin'); 
      setUserProfile(null);
    } catch (error) {
      console.error("Sign out error", error);
    }
  };

  const value = useMemo(
    () => ({
      user,
      userProfile,
      initializing,
      signIn,
      signUp,
      signOut,
      signInWithGoogleTokens,
      sendVerificationEmail,
      sendPasswordResetEmail: resetPassword,
      refreshUser,
    }),
    [user, userProfile, initializing]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
