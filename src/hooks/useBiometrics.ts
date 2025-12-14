import * as LocalAuthentication from 'expo-local-authentication';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

export function useBiometrics() {
  const [isCompatible, setIsCompatible] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [biometryType, setBiometryType] =
    useState<LocalAuthentication.AuthenticationType | null>(null);

  useEffect(() => {
    (async () => {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      setIsCompatible(compatible);

      const enrolled = await LocalAuthentication.isEnrolledAsync();
      setIsEnrolled(enrolled);

      const types =
        await LocalAuthentication.supportedAuthenticationTypesAsync();
      if (
        types.includes(
          LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION
        )
      ) {
        setBiometryType(
          LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION
        );
      } else if (
        types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)
      ) {
        setBiometryType(LocalAuthentication.AuthenticationType.FINGERPRINT);
      } else if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
        setBiometryType(LocalAuthentication.AuthenticationType.IRIS);
      }
    })();
  }, []);

  const authenticate = async (
    promptMessage: string = 'Authenticate to view'
  ): Promise<boolean> => {
    // If not compatible or Enrolled, we default to "True" or "False" depending on policy.
    // MVP Policy: If no secure hardware, allow access (or blocking it completely).
    // PRD says: "Optionally, allow users to secure the app behind biometrics".
    // We'll block if hardware exists but auth fails. Allow if no hardware (for simulators).

    if (!isCompatible || !isEnrolled) {
      if (__DEV__) {
        console.warn('Biometrics not available (Dev mode: Allowing)');
        return true;
      }
      Alert.alert(
        'Security',
        'Biometric authentication is not set up on this device.'
      );
      return false;
    }

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage,
        fallbackLabel: 'Enter PIN', // iOS only
        disableDeviceFallback: false, // Allow PIN
        cancelLabel: 'Cancel',
      });

      if (result.success) {
        return true;
      } else {
        Alert.alert('Authentication Failed', 'Could not verify identity.');
        return false;
      }
    } catch (e) {
      console.error('Biometric error', e);
      return false;
    }
  };

  return { isCompatible, isEnrolled, biometryType, authenticate };
}
