import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import firestore from '@react-native-firebase/firestore';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { User } from '@/types/types';

// Define the context state shape
interface UserContextType {
  authInfos: FirebaseAuthTypes.User | null; // Authenticated user
  userData: User | null; // Firestore user data
  logout: () => Promise<void>;
  updateUserData: (newData: Partial<User>) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode; 
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [authInfos, setUser] = useState<FirebaseAuthTypes.User | null>(null); // Auth user
  const [userData, setUserData] = useState<User | null>(null); // Firestore user data

  useEffect(() => {
    const unsubscribeAuth = auth().onAuthStateChanged((authUser) => {
      setUser(authUser);
    });

    return () => unsubscribeAuth(); // Clean up on unmount
  }, []);

  useEffect(() => {
    if (authInfos) {

      if(authInfos.uid == "1qcL9cle0mXLbPfWHQtCAVCdww63"){
        const unsubscribeFirestore = firestore()
        .collection('users')
        .doc("0")
        .onSnapshot((docSnapshot) => {
          setUserData(docSnapshot.exists ? docSnapshot.data() as User : null);
        });

      return () => unsubscribeFirestore(); // Clean up Firestore listener
      }

      const unsubscribeFirestore = firestore()
        .collection('users')
        .doc(authInfos.uid)
        .onSnapshot((docSnapshot) => {
          setUserData(docSnapshot.exists ? docSnapshot.data() as User : null);
        });

      return () => unsubscribeFirestore(); // Clean up Firestore listener

    }
  }, [authInfos]);

  const logout = async () => {
    try {
      await auth().signOut(); // Sign out from Firebase
      setUser(null); // Clear the user state
      setUserData(null); // Clear the user data
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const updateUserData = async (newData: Partial<User>) => {
    if (!authInfos) {
      throw new Error('No user is signed in');
    }

    try {
      const userDocRef = firestore().collection('users').doc(authInfos.uid);
      await userDocRef.update(newData); // Update only the specified fields
      console.log('User data successfully updated:', newData);
    } catch (error) {
      console.error('Error updating user data:', error);
      throw error; // Re-throw error for handling in the component
    }
  };

  const contextValue = useMemo(() => ({ authInfos, userData, logout,updateUserData }), [authInfos, userData]);

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook for consuming the UserContext
export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
