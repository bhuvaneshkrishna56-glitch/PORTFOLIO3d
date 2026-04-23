import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { deleteDoc, doc } from 'firebase/firestore';
import { db, storage } from '../firebase/firebase';

/**
 * Upload a file to Firebase Storage
 * Returns both the download URL and the storage path (needed for deletion)
 *
 * @param {File} file - The file to upload
 * @param {string} folder - Storage folder name (e.g. 'projects', 'certificates')
 * @param {function} [onProgress] - Optional callback receiving upload progress (0-100)
 * @returns {Promise<{ url: string, filePath: string }>}
 */
export const uploadFile = (file, folder, onProgress) => {
  return new Promise((resolve, reject) => {
    // Build a unique path: folder/timestamp_originalName
    const filePath = `${folder}/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, filePath);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        if (onProgress) onProgress(progress);
      },
      (error) => {
        // Upload failed
        reject(new Error(`Upload failed: ${error.message}`));
      },
      async () => {
        // Upload complete — get the public download URL
        try {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          resolve({ url, filePath });
        } catch (error) {
          reject(new Error(`Failed to get download URL: ${error.message}`));
        }
      }
    );
  });
};

/**
 * Delete an item from both Firebase Storage and Firestore
 * Handles the two-step process: remove file first, then remove document
 *
 * @param {string} collectionName - Firestore collection ('projects' or 'certificates')
 * @param {string} id - Firestore document ID
 * @param {string} filePath - Firebase Storage file path
 * @returns {Promise<{ success: boolean, error: string|null }>}
 */
export const deleteItem = async (collectionName, id, filePath) => {
  try {
    // Step 1: Delete the file from Firebase Storage
    if (filePath) {
      const storageRef = ref(storage, filePath);
      await deleteObject(storageRef);
    }

    // Step 2: Delete the document from Firestore
    await deleteDoc(doc(db, collectionName, id));

    return { success: true, error: null };
  } catch (error) {
    console.error(`Delete failed for ${collectionName}/${id}:`, error);
    return { success: false, error: error.message };
  }
};
