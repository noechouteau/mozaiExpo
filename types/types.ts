import { DocumentReference, Timestamp } from "@firebase/firestore";

type User = {
    uid?: string;
    name: string;
    phone: string;
    picture: string;
    mosaiques: string[];
  };

type Reactions = {
    id?: string;
    position: [number, number];
    type: string;
    user: User;
}
type Image = {
    id?: string;
    date: Timestamp;
    height: number;
    width: number;
    informations: string;
    reactions: any[];
    url: string;
    user: DocumentReference;
}
type Mosaique = {
    id?: string;
    images: Image[];
    name: string;
    users: string[];
}
  
  export { User, Mosaique, Image, Reactions };