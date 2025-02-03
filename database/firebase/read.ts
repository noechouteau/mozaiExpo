import { db } from "@/db-configs/firebase";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import firestore from '@react-native-firebase/firestore';

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

export const queryDbDocsByField = async ({
  collectionId,
  field,
  value,
}: {
  collectionId: string;
  field: string;
  value: any;
}) => {
  try {
    const q = query(collection(db, collectionId), where(field, "==", value));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const results = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      console.log("Matching documents:", results);
      return results;
    } else {
      console.log("No matching documents found!");
      return [];
    }
  } catch (error) {
    console.error("Error querying documents by field:", error);
    throw error;
  }
};
