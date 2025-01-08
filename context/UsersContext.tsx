import { FC, createContext, useEffect, useState } from "react";
import { collection, doc, onSnapshot } from "firebase/firestore";
// import { Post, Posts, User } from "@/types/types";
import {db} from "@/db-configs/firebase";
import { router, usePathname } from "expo-router";

type ContextType = {
  children: JSX.Element | JSX.Element[];
};

const UsersContext = createContext<{
  users: any;
  setUsers: React.Dispatch<React.SetStateAction<any>>;
}>({
  users: null,
  setUsers: () => {},
});

const UsersContextProvider: FC<ContextType> = ({ children }) => {
  const [users, setUsers] = useState<any>(null);

  const getAllUsers = async () => {
    try {
      const collectionPost = collection(db, "users");

      onSnapshot(collectionPost, (snapshot) => {
        const users: any = [];
        snapshot.forEach((doc) => {
          users.push(doc.data() as any);
        });
        setUsers(users);
      });
    } catch (e) {
      console.error("Erreur lors de la récupération des users:", e);
    }
  };

  useEffect(() => {
    getAllUsers();
  }, []);


  return (
    <UsersContext.Provider
      value={{
        users,
        setUsers,
      }}
    >
      {children}
    </UsersContext.Provider>
  );
};

export { UsersContext, UsersContextProvider };