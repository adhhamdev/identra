import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
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
import { db, storage } from '@/lib/firebase';

export function useDocumentManagement() {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);

  const uploadFile = async (
    uri: string,
    metadata: { title: string; type: DocumentType }
  ) => {
    if (!user) return;
    setUploading(true);

    try {
      // 1. Create a blob from the URI
      const response = await fetch(uri);
      const blob = await response.blob();

      // 2. Upload to Firebase Storage
      const filename = `${Date.now()}_${Math.random()
        .toString(36)
        .substring(7)}`;
      const storagePath = `users/${user.uid}/documents/${filename}`;
      const storageRef = ref(storage, storagePath);

      await uploadBytes(storageRef, blob);
      const downloadUrl = await getDownloadURL(storageRef);

      // 3. Save Metadata to Firestore
      await addDoc(collection(db, 'users', user.uid, 'documents'), {
        title: metadata.title,
        type: metadata.type,
        storagePath: storagePath,
        downloadUrl: downloadUrl, // Optional: Cache it for read perf
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
      await updateDoc(docRef, {
        ...updates,
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

  return {
    uploading,
    uploadFile,
    pickDocument,
    takePhoto,
    pickImage,
    updateDocument,
    deleteDocument,
  };
}
