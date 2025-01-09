import { updateDoc } from '@/database/firebase/set';
import {User} from '../types/types';

export default async function createUser(name: string, picture: string) {
    const user : User = {
        name: name,
        picture: picture,
        mosaiques: []
    }

    await updateDoc({newDatas: user, collectionId: "users", callback: (id) => {
        console.log("User created with id: ", id);
    }
    });

}