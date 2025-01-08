import { DocumentReference, Timestamp } from "@firebase/firestore";

type User = {
    id: string;
    name: string;
    picture: string;
    mosaiques: DocumentReference[];
    archived?: [];
  };

type Reactions = {
    id: string;
    position: [number, number];
    type: string;
    user: User;
}
type Image = {
    id: string;
    date: Timestamp;
    informations: string;
    reactions: DocumentReference[];
    url: string;
    user: DocumentReference;
}
type Mosaique = {
    id: string;
    imageLifetime: number;
    images: Image[];
    name: string;
    theme: string;
    user: DocumentReference;
}
  
  export { User, Mosaique, Image, Reactions };