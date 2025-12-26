import * as Keychain from 'react-native-keychain';

/**
 * Stores the Master Key in the hardware-backed keychain, gated by Biometrics.
 */
export async function storeMasterKey(key: Uint8Array): Promise<boolean> {
  try {
    const keyString = Buffer.from(key).toString('base64');

    await Keychain.setGenericPassword('master_key', keyString, {
      service: 'com.adhham.identra.vault',
      accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY_OR_DEVICE_PASSCODE,
      accessible: Keychain.ACCESSIBLE.WHEN_PASSCODE_SET_THIS_DEVICE_ONLY,
      authenticationPrompt: {
        title: 'Unlock Vault',
        subtitle: 'Identification required to access your private keys',
        description: 'Please authenticate to proceed',
        cancel: 'Cancel',
      },
      storage: Keychain.STORAGE_TYPE.AES as any,
    });
    return true;
  } catch (error) {
    console.error('Keychain store error:', error);
    return false;
  }
}

/**
 * Retrieves the Master Key from the keychain.
 * This will trigger a Biometric prompt.
 */
export async function getMasterKey(): Promise<Uint8Array | null> {
  try {
    const credentials = await Keychain.getGenericPassword({
      service: 'com.adhham.identra.vault',
      authenticationPrompt: {
        title: 'Unlock Vault',
        subtitle: 'Identification required',
        description: 'Please authenticate to access your vault',
      },
    });

    if (credentials) {
      return new Uint8Array(Buffer.from(credentials.password, 'base64'));
    }
    return null;
  } catch (error) {
    console.error('Keychain get error:', error);
    return null;
  }
}

/**
 * Checks if a Master Key is already stored.
 */
export async function hasMasterKeyStored(): Promise<boolean> {
  try {
    const credentials = await Keychain.getGenericPassword({
      service: 'com.adhham.identra.vault',
      // Don't prompt for auth just to check presence if possible,
      // but Keychain usually requires auth for any access to protected items.
      // We might need to store a "hasKey" flag in standard SecureStore.
    });
    return !!credentials;
  } catch (error) {
    return false;
  }
}

/**
 * Purges the Master Key (used on account delete or reset).
 */
export async function purgeMasterKey(): Promise<void> {
  try {
    await Keychain.resetGenericPassword({
      service: 'com.adhham.identra.vault',
    });
  } catch (error) {
    console.error('Keychain reset error:', error);
  }
}
