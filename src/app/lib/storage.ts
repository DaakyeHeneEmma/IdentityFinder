import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import app from "./firebaseConfig";

export const storage = getStorage(app);

export async function uploadFile(file: File, userId: string): Promise<string> {
  const fileName = `${userId}_${Date.now()}_${file.name}`;
  const storageRef = ref(storage, `report-cards/${fileName}`);

  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);

  return downloadURL;
}
