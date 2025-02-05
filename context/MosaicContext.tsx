import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import firestore from '@react-native-firebase/firestore';
import { Mosaique } from '@/types/types'; 
import { useUser } from './UsersContext';

interface MosaicContextType {
  mosaics: Mosaique[] | null; 
  updateMosaic: (mosaicId: string, updatedFields: Partial<Mosaique>) => Promise<void>;
  createMosaic: (newMosaic: Mosaique, customDocId: string) => Promise<void>;
  deleteMosaic: (mosaicId: string) => Promise<void>;
}

const MosaicContext = createContext<MosaicContextType | undefined>(undefined);

interface MosaicProviderProps {
  children: ReactNode;
}

export const MosaicProvider: React.FC<MosaicProviderProps> = ({ children }) => {
  const [mosaics, setMosaics] = useState<Mosaique[] | null>(null);
  const { userData } = useUser();

  const fetchMosaics = async () => {
    if (!userData?.uid) return;
  
    try {
      const mosaicsSnapshot = await firestore().collection('mosaiques').get();
  
      const mosaicsData: any[] = mosaicsSnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((mosaique:any) =>
          mosaique.users.some((user:any) => user.id === userData.uid) // Manually filter
        );
  
      setMosaics(mosaicsData);
    } catch (error) {
      console.error('Error fetching mosaics:', error);
    }
  };
  

  useEffect(() => {

    fetchMosaics();
  }, [userData]);

  useEffect(() => {
    console.log(mosaics)
  }, [mosaics]);

  const updateMosaic = async (mosaicId: string, updatedFields: Partial<Mosaique>): Promise<void> => {
    try {
      const mosaicRef = firestore().collection('mosaiques').doc(mosaicId);
      await mosaicRef.update(updatedFields);

      setMosaics((prevMosaics) =>
        prevMosaics
          ? prevMosaics.map((mosaic) =>
              mosaic.id === mosaicId ? { ...mosaic, ...updatedFields } : mosaic
            )
          : null
      );
    } catch (error) {
      console.error(`Error updating mosaic with ID ${mosaicId}:`, error);
    }
  };

  const createMosaic = async (newMosaic: Mosaique, customDocId: string): Promise<void> => {
    try {
      await firestore().collection('mosaiques').doc(customDocId).set(newMosaic);
      setMosaics((prevMosaics) => (prevMosaics ? [...prevMosaics, { ...newMosaic, id: customDocId }] : [{ ...newMosaic, id: customDocId }]));
    } catch (error) {
      console.error('Error creating mosaic:', error);
    }
  };

  const deleteMosaic = async (mosaicId: string): Promise<void> => {
    try {
      await firestore().collection('mosaiques').doc(mosaicId).delete();
      setMosaics((prevMosaics) =>
        prevMosaics ? prevMosaics.filter((mosaic) => mosaic.id !== mosaicId) : null
      );
    } catch (error) {
      console.error(`Error deleting mosaic with ID ${mosaicId}:`, error);
    }
  }

  const contextValue = useMemo(() => ({ mosaics, updateMosaic, createMosaic,deleteMosaic }), [mosaics]);

  return (
    <MosaicContext.Provider value={contextValue}>
      {children}
    </MosaicContext.Provider>
  );
};

export const useMosaic = (): MosaicContextType => {
  const context = useContext(MosaicContext);
  if (context === undefined) {
    throw new Error('useMosaic must be used within a MosaicProvider');
  }
  return context;
};
