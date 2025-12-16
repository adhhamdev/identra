import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import { Auth, getReactNativePersistence, initializeAuth } from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentSingleTabManager,
} from 'firebase/firestore';
import { Functions, getFunctions } from 'firebase/functions';
import { getStorage } from 'firebase/storage';
import { Platform } from 'react-native';

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
const isWeb = Platform.OS === 'web';

const db = isWeb
  ? getFirestore(app)
  : initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentSingleTabManager({}),
      }),
      experimentalAutoDetectLongPolling: true
    });

export { db };
export const storage = getStorage(app);
