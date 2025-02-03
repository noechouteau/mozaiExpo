import { db } from "@/db-configs/firebase";
import { deleteDoc, doc } from "firebase/firestore";

export const deleteDbDoc = async ({
  collection,
  docId,
}: {
  collection: string;
  docId: string;
}) => {
  const docRef = doc(db, collection, docId);
  await deleteDoc(docRef);
  return "Document successfully deleted!";
};
