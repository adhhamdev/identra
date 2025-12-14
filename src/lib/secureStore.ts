import * as SecureStore from 'expo-secure-store';

export async function save(key: string, value: string) {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch (e) {
    console.error('SecureStore save error', e);
  }
}

export async function getValueFor(key: string) {
  try {
    return await SecureStore.getItemAsync(key);
  } catch (e) {
    console.error('SecureStore get error', e);
    return null;
  }
}

export async function remove(key: string) {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch (e) {
    console.error('SecureStore delete error', e);
  }
}
