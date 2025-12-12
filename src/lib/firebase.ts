import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import { Auth, getAuth, getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { Platform } from 'react-native';

const extraConfig = Constants.expoConfig?.extra;

const firebaseConfig =
  (Platform.OS === 'ios'
    ? extraConfig?.firebase?.ios
    : extraConfig?.firebase?.android) ?? extraConfig?.firebase?.default;

if (!firebaseConfig) {
  throw new Error('Firebase config is missing in expo.extra.firebase');
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
