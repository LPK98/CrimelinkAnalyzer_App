import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../firebase";

/**
 * Convert a local file URI to a Blob using XMLHttpRequest.
 * This is the recommended approach for React Native — the fetch().blob()
 * pattern does NOT work reliably with Firebase Storage in RN.
 */
const uriToBlob = (uri: string): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
      resolve(xhr.response as Blob);
    };
    xhr.onerror = () => {
      reject(new Error("Failed to convert file to blob"));
    };
    xhr.responseType = "blob";
    xhr.open("GET", uri, true);
    xhr.send(null);
  });
};

/**
 * Determine MIME content type from folder name.
 */
const getContentType = (folder: string): string => {
  if (folder === "images") return "image/jpeg";
  if (folder === "audio") return "audio/m4a";
  return "application/octet-stream";
};

/**
 * Upload a file to Firebase Storage and return its download URL.
 */
const uploadMedia = async (uri: string, folder: string): Promise<string> => {
  try {
    const blob = await uriToBlob(uri);

    const filename = `${folder}/${Date.now()}_${Math.random()
      .toString(36)
      .substring(7)}`;
    const storageRef = ref(storage, filename);

    const metadata = { contentType: getContentType(folder) };
    const snapshot = await uploadBytes(storageRef, blob, metadata);

    // Release the blob to free memory
    if (typeof (blob as any).close === "function") {
      (blob as any).close();
    }

    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error: any) {
    console.error(`Error uploading ${folder} file:`, error);
    throw new Error(
      `Failed to upload ${folder === "images" ? "image" : "voice message"}. Please try again.`,
    );
  }
};

/**
 * Upload an image file to Firebase Storage.
 * @returns Download URL string
 */
export const uploadImage = (uri: string): Promise<string> =>
  uploadMedia(uri, "images");

/**
 * Upload an audio file to Firebase Storage.
 * @returns Download URL string
 */
export const uploadAudio = (uri: string): Promise<string> =>
  uploadMedia(uri, "audio");
