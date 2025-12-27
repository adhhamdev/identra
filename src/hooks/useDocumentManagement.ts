import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from 'firebase/storage';
import { useState } from 'react';
import { Alert } from 'react-native';

import { useAuth } from '@/context/AuthContext';
import { useSecurity } from '@/context/SecurityContext';
import * as crypto from '@/lib/crypto';
import { db, storage } from '@/lib/firebase';

export function useDocumentManagement() {
  const { user } = useAuth();
  const { masterKey, isUnlocked } = useSecurity();
  const [uploading, setUploading] = useState(false);

  const uploadFile = async (
    uri: string,
    metadata: { title: string; type: DocumentType },
    customFolder?: string
  ) => {
    if (!user) return;
    setUploading(true);

    try {
      // 1. Create a blob from the URI and convert to Uint8Array
      const response = await fetch(uri);
      const blob = await response.blob();

      let uploadData: Blob | Uint8Array = blob;
      const shouldEncrypt = isUnlocked && !!masterKey;

      if (shouldEncrypt) {
        // Convert Blob to ArrayBuffer then to Uint8Array
        const arrayBuffer = await new Promise<ArrayBuffer>(
          (resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as ArrayBuffer);
            reader.onerror = reject;
            reader.readAsArrayBuffer(blob);
          }
        );

        const uint8 = new Uint8Array(arrayBuffer);
        uploadData = await crypto.encryptFile(uint8, masterKey);
      }

      // 2. Upload to Firebase Storage
      const filename = `${Date.now()}_${Math.random()
        .toString(36)
        .substring(7)}`;

      const folder =
        customFolder ||
        (metadata.type as any).toLowerCase().replace(/\s+/g, '_');
      const storagePath = `users/${user.uid}/${folder}/${filename}`;
      const storageRef = ref(storage, storagePath);

      // If encrypted, we upload as a Uint8Array (binary), otherwise as Blob
      await uploadBytes(storageRef, uploadData);
      const downloadUrl = await getDownloadURL(storageRef);

      // 3. Save Metadata to Firestore (Metadata fields like Title are also encrypted if vault is unlocked)
      let finalTitle = metadata.title;
      if (shouldEncrypt) {
        finalTitle = await crypto.encryptText(metadata.title, masterKey);
      }

      await addDoc(collection(db, 'users', user.uid, 'documents'), {
        title: finalTitle,
        type: metadata.type,
        storagePath: storagePath,
        downloadUrl: downloadUrl,
        isEncrypted: shouldEncrypt,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      Alert.alert('Success', 'Document uploaded successfully!');
    } catch (error: any) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'Failed to upload document. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled) return null;
      return result.assets[0];
    } catch (error) {
      console.error('Document picker error:', error);
      return null;
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission denied',
          'We need camera permissions to scan documents.'
        );
        return null;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });

      if (result.canceled) return null;
      return result.assets[0];
    } catch (error) {
      console.error('Camera error:', error);
      return null;
    }
  };

  const updateDocument = async (docId: string, updates: any) => {
    if (!user) return;
    setUploading(true);
    try {
      const docRef = doc(db, 'users', user.uid, 'documents', docId);
      let finalUpdates = { ...updates };

      if (isUnlocked && !!masterKey) {
        if (updates.title)
          finalUpdates.title = await crypto.encryptText(
            updates.title,
            masterKey
          );
        if (updates.issuedDate)
          finalUpdates.issuedDate = await crypto.encryptText(
            updates.issuedDate,
            masterKey
          );
        if (updates.expiryDate)
          finalUpdates.expiryDate = await crypto.encryptText(
            updates.expiryDate,
            masterKey
          );
        if (updates.notes)
          finalUpdates.notes = await crypto.encryptText(
            updates.notes,
            masterKey
          );
      }

      await updateDoc(docRef, {
        ...finalUpdates,
        updatedAt: serverTimestamp(),
      });
      Alert.alert('Success', 'Document updated successfully');
    } catch (error) {
      console.error('Update error', error);
      Alert.alert('Error', 'Failed to update document');
    } finally {
      setUploading(false);
    }
  };

  const deleteDocument = async (docId: string) => {
    if (!user) return;
    setUploading(true);
    try {
      const docRef = doc(db, 'users', user.uid, 'documents', docId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        // Delete from Firestore
        await deleteDoc(docRef);

        // Delete from Storage if path exists
        if (data.storagePath) {
          const storageRef = ref(storage, data.storagePath);
          await deleteObject(storageRef).catch((e) =>
            console.log('Storage delete skipped/failed', e)
          );
        }
      }
      Alert.alert('Success', 'Document deleted');
    } catch (error) {
      console.error('Delete error', error);
      Alert.alert('Error', 'Failed to delete document');
    } finally {
      setUploading(false);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });

      if (result.canceled) return null;
      return result.assets[0];
    } catch (error) {
      console.error('Image picker error:', error);
      return null;
    }
  };

  const decryptAndShare = async (docData: {
    storagePath: string;
    downloadUrl: string;
    title: string;
    type: string;
    isEncrypted?: boolean;
  }) => {
    if (!user) return;

    // 1. Biometric check/Unlock check
    if (!isUnlocked || !masterKey) {
      Alert.alert(
        'Vault Locked',
        'Please unlock your secure vault to access this document.'
      );
      return;
    }

    setUploading(true);
    try {
      // 2. Fetch the file
      const response = await fetch(docData.downloadUrl);
      const arrayBuffer = await response.arrayBuffer();
      let fileData = new Uint8Array(arrayBuffer);

      // 3. Decrypt if needed
      if (docData.isEncrypted) {
        fileData = await crypto.decryptFile(fileData, masterKey);
      }

      // 4. Save to temporary directory
      const extension = docData.type === 'PDF' ? 'pdf' : 'jpg';
      const tempPath = `${FileSystem.cacheDirectory}${docData.title.replace(
        /\s+/g,
        '_'
      )}_decrypted.${extension}`;

      // Convert Uint8Array to base64 for FileSystem
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]); // Remove data:application/octet-stream;base64,
        };
        reader.readAsDataURL(new Blob([fileData]));
      });

      await FileSystem.writeAsStringAsync(tempPath, base64, {
        encoding: 'base64',
      });

      // 5. Share with warning
      Alert.alert(
        'Secure Export',
        'This document will be decrypted and shared outside Identra. You are responsible for its security once shared.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Decrypt & Share',
            onPress: async () => {
              await Sharing.shareAsync(tempPath);
              // Optional: Cleanup temp file after a delay
              setTimeout(() => {
                FileSystem.deleteAsync(tempPath, { idempotent: true }).catch(
                  () => {}
                );
              }, 5000);
            },
          },
        ]
      );
    } catch (error) {
      console.error('Decryption/Sharing error:', error);
      Alert.alert('Error', 'Failed to decrypt or share the document.');
    } finally {
      setUploading(false);
    }
  };

  return {
    uploading,
    uploadFile,
    pickDocument,
    takePhoto,
    pickImage,
    updateDocument,
    deleteDocument,
    decryptAndShare,
  };
}
