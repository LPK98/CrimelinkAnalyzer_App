import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

import { storage } from "@/firebase";

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

const getContentType = (folder: "images" | "audio"): string => {
  if (folder === "images") return "image/jpeg";
  return "audio/m4a";
};

const uploadMedia = async (
  uri: string,
  folder: "images" | "audio",
): Promise<string> => {
  const blob = await uriToBlob(uri);

  try {
    const filename = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const storageRef = ref(storage, filename);

    const snapshot = await uploadBytes(storageRef, blob, {
      contentType: getContentType(folder),
    });

    return await getDownloadURL(snapshot.ref);
  } catch {
    throw new Error(
      `Failed to upload ${folder === "images" ? "image" : "voice message"}. Please try again.`,
    );
  } finally {
    if (typeof (blob as Blob & { close?: () => void }).close === "function") {
      (blob as Blob & { close: () => void }).close();
    }
  }
};

export const uploadImage = async (uri: string): Promise<string> => {
  return await uploadMedia(uri, "images");
};

export const uploadAudio = async (uri: string): Promise<string> => {
  return await uploadMedia(uri, "audio");
};
