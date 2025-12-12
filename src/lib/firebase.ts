import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import { Auth, getAuth, getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { Platform } from 'react-native';

type FirebaseExtraConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  appId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  measurementId?: string;
};

const extraConfig = Constants.expoConfig?.extra;

const firebaseConfig: FirebaseExtraConfig = {
  apiKey: extraConfig?.firebase?.apiKey ?? process.env.FIREBASE_API_KEY ?? '',
  authDomain: extraConfig?.firebase?.authDomain ?? process.env.FIREBASE_AUTH_DOMAIN ?? '',
  projectId: extraConfig?.firebase?.projectId ?? process.env.FIREBASE_PROJECT_ID ?? '',
  appId:
    Platform.OS === 'ios'
      ? (extraConfig?.firebase?.ios?.appId ?? process.env.FIREBASE_IOS_APP_ID ?? '')
      : (extraConfig?.firebase?.android?.appId ?? process.env.FIREBASE_ANDROID_APP_ID ?? ''),
  storageBucket: extraConfig?.firebase?.storageBucket ?? process.env.FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: extraConfig?.firebase?.messagingSenderId ?? process.env.FIREBASE_MESSAGING_SENDER_ID ?? '',
};

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  throw new Error('Firebase config is missing. Ensure .env is set or app.json extra is provided.');
}

function initializeFirebaseApp(): FirebaseApp {
  if (getApps().length > 0) {
    return getApp();
  }
  return initializeApp(firebaseConfig);
}

function initializeFirebaseAuth(app: FirebaseApp): Auth {
  if (Platform.OS === 'web') {
    const existing = getApps().length > 0 ? getAuth(app) : undefined;
    if (existing) return existing;
    return initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  }
    return getAuth(app);
}

export const app = initializeFirebaseApp();
export const auth = initializeFirebaseAuth(app);
