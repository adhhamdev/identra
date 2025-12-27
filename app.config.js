module.exports = () => ({
  name: 'identra',
  slug: 'identra',
  version: '1.0.0',
  platforms: ['ios', 'android'],
  orientation: 'portrait',
  icon: './src/assets/images/icon.png',
  scheme: 'identra',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  splash: {
    image: './src/assets/images/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.adhham.identra',
    usesApplePay: true,
    GIDClientID:
      '883451725534-co8e9th0qhe1eoja5skj05fchbkhnsg3.apps.googleusercontent.com',
    googleServicesFile: './GoogleService-Info.plist',
  },
  android: {
    package: 'com.adhham.identra',
    adaptiveIcon: {
      foregroundImage: './src/assets/images/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    googleServicesFile: './google-services.json',
  },
  plugins: [
    'react-native-google-auth',
    // '@react-native-google-signin/google-signin',
    'expo-router',
    'expo-font',
    [
      'expo-camera',
      {
        cameraPermission: 'Allow $(PRODUCT_NAME) to access your camera.',
      },
    ],
    [
      'expo-local-authentication',
      {
        faceIDPermission: 'Allow $(PRODUCT_NAME) to use Face ID.',
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  owner: 'adhham',
  extra: {
    router: {},
    eas: {
      projectId: '9b9e5cbb-d099-4ba1-8746-e3a14ff1995a',
    },

    // Firebase Web (default)
    firebaseDefault: {
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    },

    // Android
    firebaseAndroid: {
      apiKey: process.env.FIREBASE_ANDROID_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      projectId: process.env.FIREBASE_PROJECT_ID,
      appId: process.env.FIREBASE_ANDROID_APP_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    },

    // iOS
    firebaseIos: {
      apiKey: process.env.FIREBASE_IOS_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      projectId: process.env.FIREBASE_PROJECT_ID,
      appId: process.env.FIREBASE_IOS_APP_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    },
    google: {
      webClientId:
        '883451725534-7otalels1iljo4h6hg0lb8pchnt0oust.apps.googleusercontent.com',
    },
  },
});
