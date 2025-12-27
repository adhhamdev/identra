import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import { CustomProvider, initializeAppCheck } from 'firebase/app-check';
import { Auth, getReactNativePersistence, initializeAuth } from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
  memoryLocalCache,
} from 'firebase/firestore';
import { Functions, getFunctions } from 'firebase/functions';
import { getStorage } from 'firebase/storage';
import { Platform } from 'react-native';

// Import Expo App Integrity for native attestation
import * as AppIntegrity from '@expo/app-integrity';

type FirebaseConfigGroup = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  appId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
};

const extra = Constants.expoConfig?.extra;

// Select platform-specific config exactly how you want it
const platformConfig: FirebaseConfigGroup =
  Platform.OS === 'ios'
    ? extra?.firebaseIos
    : Platform.OS === 'android'
    ? extra?.firebaseAndroid
    : extra?.firebaseDefault;

// Merge fallback config (web uses default)
const firebaseConfig = {
  apiKey: platformConfig.apiKey,
  authDomain: platformConfig.authDomain,
  projectId: platformConfig.projectId,
  appId: platformConfig.appId,
  storageBucket: platformConfig.storageBucket,
  messagingSenderId: platformConfig.messagingSenderId,
};

// Validate to avoid silent failures
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  throw new Error(
    '❌ Firebase config is missing. Ensure environment variables are set correctly in app.config.js / EAS secrets.'
  );
}

function initFirebaseApp(): FirebaseApp {
  if (getApps().length > 0) return getApp();
  return initializeApp(firebaseConfig);
}

function initFirebaseAuth(app: FirebaseApp): Auth {
  return initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}

function initFirebaseFunctions(app: FirebaseApp): Functions {
  // Use asia-south1 because you picked it for Sri Lanka latency
  return getFunctions(app, 'asia-south1');
}

export const app = initFirebaseApp();
export const auth = initFirebaseAuth(app);
export const functions = initFirebaseFunctions(app);

// Initialize App Check with Expo App Integrity
// This implementation uses a CustomProvider to bridge Expo's native attestation with Firebase.
if (Platform.OS !== 'web') {
  const customProvider = new CustomProvider({
    getToken: async () => {
      try {
        if (__DEV__) {
          // In development, return a debug token.
          // Note: In a real-world scenario, you might want to fetch this from an env var
          // or use a specific debug token registered in Firebase Console.
          return {
            token: process.env.FIREBASE_APP_CHECK_DEBUG_TOKEN || '', // Replace with your actual debug token if needed
            expireTimeMillis: Date.now() + 60 * 60 * 1000,
          };
        }

        let attestationToken = '';

        if (Platform.OS === 'android') {
          // Play Integrity for Android
          // Your project number: 883451725534
          await AppIntegrity.prepareIntegrityTokenProviderAsync('883451725534');
          const requestHash = Math.random().toString(36).substring(7);
          attestationToken = await AppIntegrity.requestIntegrityCheckAsync(
            requestHash
          );
        } else if (Platform.OS === 'ios') {
          // App Attest for iOS
          // Note: AppAttest is part of @expo/app-integrity for iOS
          const keyId = await AppIntegrity.generateKeyAsync();
          const challenge = Math.random().toString(36).substring(7);
          attestationToken = await AppIntegrity.generateAssertionAsync(
            keyId,
            challenge
          );
        }

        return {
          token: attestationToken,
          expireTimeMillis: Date.now() + 60 * 60 * 1000,
        };
      } catch (error) {
        console.error('App Check CustomProvider Error:', error);
        throw error;
      }
    },
  });

  initializeAppCheck(app, {
    provider: customProvider,
    isTokenAutoRefreshEnabled: true,
  });
}

const isWeb = Platform.OS === 'web';

const db = isWeb
  ? getFirestore(app)
  : initializeFirestore(app, {
      localCache: memoryLocalCache(),
      experimentalAutoDetectLongPolling: true,
    });

export { db };
export const storage = getStorage(app);
