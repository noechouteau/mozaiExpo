import { db } from "@/db-configs/firebase";
import { addDoc, collection, doc, setDoc } from "firebase/firestore";

export type SetDoc = {
  newDatas: any;
  collectionId: string;
  callback?: (id: string) => void;
  docId?: string;
};

export const updateDoc = async ({
  newDatas,
  collectionId,
  callback,
  docId,
}: SetDoc) => {
  if (!docId) {
    const docRef = await addDoc(collection(db, collectionId), newDatas);
    callback && callback(docRef.id);
    return docRef.id;
  } else {
    const docRef = doc(db, collectionId, docId);
    await setDoc(docRef, newDatas, { merge: true })
      .then(() => {
        callback && callback(docRef.id);
      })
      .catch((err) => console.log(err));
  }
};
