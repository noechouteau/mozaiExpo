import { db } from "@/db-configs/firebase";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";

export const getDbDoc = async ({
  collectionId,
  docId,
}: {
  collectionId: string;
  docId: string;
}) => {
  const docRef = doc(db, collectionId, docId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    console.log("Document data:", docSnap.data());
    return docSnap.data();
  } else {
    console.log("No such document!");
    return null;
  }
};  

export const getDbDocs = async ({ collectionId }: { collectionId: string }) => {
  const collectionRef = collection(db, collectionId);
  const collectionSnap = await getDocs(collectionRef);
  const datas: any[] = [];
  if (collectionSnap.empty) return [];
  collectionSnap.forEach((doc) => {
    datas.push({
      id: doc.id,
      ...doc.data(),
    });
  });
  if (datas.length === 0) {
    console.log("No document in this collection");
    return [];
  }
  return datas;
};