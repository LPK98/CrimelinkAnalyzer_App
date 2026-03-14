/**
 * Media Upload Utility
 *
 * Handles uploading image and audio files to Firebase Storage.
 * Returns the download URL to store in Firestore message documents.
 * Only URLs (not raw files) are stored in Firestore.
 */

import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../../firebaseConfig";

/**
 * Convert a local file URI to a Blob using XMLHttpRequest.
 * This is the recommended approach for React Native — the fetch().blob()
 * pattern does NOT work reliably with Firebase Storage in RN.
 * @param {string} uri - Local file URI
 * @returns {Promise<Blob>}
 */
const uriToBlob = async (uri) => {
  try {
    const response = await fetch(uri);
    return await response.blob();
  } catch (error) {
    throw new Error("Failed to convert file to blob: " + error.message);
  }
};

/**
 * Determine MIME content type from folder name.
 * @param {string} folder - "images" or "audio"
 * @returns {string} MIME type
 */
const getContentType = (folder) => {
  if (folder === "images") return "image/jpeg";
  if (folder === "audio") return "audio/m4a";
  return "application/octet-stream";
};

/**
 * Upload a file to Firebase Storage and return its download URL.
 * Uses uploadBytes (NOT uploadBytesResumable) for React Native compatibility.
 * @param {string} uri - Local file URI (from image picker or audio recorder)
 * @param {string} folder - Storage folder name ("images" or "audio")
 * @returns {Promise<string>} The public download URL of the uploaded file
 */
export const uploadMedia = async (uri, folder) => {
  try {
    // Convert local file URI to blob via XHR (React Native compatible)
    const blob = await uriToBlob(uri);

    // Create a unique filename using timestamp
    const filename = `${folder}/${Date.now()}_${Math.random()
      .toString(36)
      .substring(7)}`;
    const storageRef = ref(storage, filename);

    // Set content type metadata so Storage knows the file type
    const metadata = { contentType: getContentType(folder) };

    // Upload using uploadBytes (resumable variant breaks in React Native)
    const snapshot = await uploadBytes(storageRef, blob, metadata);

    // Close / release the blob to free memory
    if (typeof blob.close === "function") {
      blob.close();
    }

    // Get and return the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error(`Error uploading ${folder} file:`, error);
    // Log the full server response if available
    if (error.serverResponse) {
      console.error("Server response:", error.serverResponse);
    }
    throw new Error(
      `Failed to upload ${folder === "images" ? "image" : "voice message"}. Please try again.`,
    );
  }
};

/**
 * Upload an image file to Firebase Storage
 * @param {string} uri - Local image URI
 * @returns {Promise<string>} Download URL
 */
export const uploadImage = (uri) => uploadMedia(uri, "images");

/**
 * Upload an audio file to Firebase Storage
 * @param {string} uri - Local audio URI
 * @returns {Promise<string>} Download URL
 */
export const uploadAudio = (uri) => uploadMedia(uri, "audio");
