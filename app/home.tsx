import { StyleSheet, View, Text, Button, TextInput, Pressable, Image } from 'react-native';
import { Link, router } from 'expo-router';
import { getAuth } from "firebase/auth";
import { useFonts } from 'expo-font';
import Animated from 'react-native-reanimated';
import auth from '@react-native-firebase/auth';
import { useEffect, useState } from 'react';
import { getDbDoc, queryDbDocsByField } from '@/database/firebase/read';
import LightButton from '@/components/LightButton';
import GraytButton from '@/components/GrayButton';
import CreateModal from '@/components/CreateModal';
import JoinModal from '@/components/JoinModal';
import { HoldItem, HoldMenuProvider } from 'react-native-hold-menu';
import ConfirmModal from '@/components/ConfirmModal';
import { deleteDbDoc } from '@/database/firebase/delete';
import { updateDoc } from '@/database/firebase/set';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Home() {
    const [initializing, setInitializing] = useState(true);
    const [user, setUser]: any = useState();
    const [userMosaics, setUserMosaics] = useState([
      { id: '1', name: 'Item 1',icon:"" },
      { id: '2', name: 'Item 2',icon:"" },
      { id: '3', name: 'Item 3',icon:"" },
    ]);
  
    const [loaded, error] = useFonts({
        'SFPRO': require('../assets/fonts/SFPRODISPLAYMEDIUM.otf'),
        "SFPROBOLD": require('../assets/fonts/SFPRODISPLAYBOLD.otf'),
    });
    const [isCreateModalVisible, setCreateModalVisible] = useState<boolean>(false);
    const [isJoinModalVisible, setJoinModalVisible] = useState<boolean>(false);
    const [isConfirmDeleteModalVisible, setConfirmDeleteModalVisible] = useState<boolean>(false);
    const [mosaiqueToDelete, setMosaiqueToDelete] = useState("");

    const MenuItems = [
      { text: 'Actions', icon: 'home', isTitle: true, onPress: () => {} },
      { text: 'Rename', icon: 'edit', onPress: () => {} },
      { text: 'Quit', icon: 'trash', isDestructive: true, onPress: (mosaiqueId:any) => {setMosaiqueToDelete(mosaiqueId);setConfirmDeleteModalVisible(true)} },
    ];

    // Handle user state changes
    async function onAuthStateChanged(newUserAuth: any) {
        if (initializing) setInitializing(false);

        await queryDbDocsByField({ collectionId: "users", field: "uid", value: newUserAuth.uid }).then(async (res: any) => {
            console.log(res);
            await AsyncStorage.setItem("activeUser", res[0].uid);

            const mosaicPromises = res[0].mosaiques.map((mosaique: any) =>
                getDbDoc({ collectionId: "mosaiques", docId: mosaique.id })
            );

            const allMosaiques = await Promise.all(mosaicPromises);
            setUserMosaics(allMosaiques);
            setUser(res[0]);
        });
    }

    useEffect(() => {
        const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
        return subscriber; // unsubscribe on unmount
    }, []);

    function onLogout() {
        auth().signOut();
        router.replace("/");
    }

    async function confirmDelete(confirmation: boolean){
      setConfirmDeleteModalVisible(false)
      if(confirmation){
        console.log(mosaiqueToDelete)
        await deleteDbDoc({ collection: "mosaiques", docId: mosaiqueToDelete }).then(async () => {
          user.mosaiques = user.mosaiques.filter((mosaique: any) => mosaique.id !== mosaiqueToDelete);
          setUser(user);
          setUserMosaics(userMosaics.filter((mosaique: any) => mosaique.id !== mosaiqueToDelete));
          if(user.uid == "1qcL9cle0mXLbPfWHQtCAVCdww63") {
            user.uid = "0"
          }
          await updateDoc({ collectionId: "users", docId: user.uid, newDatas: {
            mosaiques: user.mosaiques
          }}).then(() => {
            console.log("User updated");
            user.uid = "1qcL9cle0mXLbPfWHQtCAVCdww63"
          });
        });
        }
    }

    return (<HoldMenuProvider theme='dark' safeAreaInsets={{
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    }}>
        <View style={styles.container}>
            <CreateModal isVisible={isCreateModalVisible} onClose={() => setCreateModalVisible(false)} user={user} />
            <JoinModal isVisible={isJoinModalVisible} onClose={() => setJoinModalVisible(false)} user={user} />
            <ConfirmModal isVisible={isConfirmDeleteModalVisible} text={"Are you sure you want to delete this mosaic?"} onClose={(confirmation)=>(confirmDelete(confirmation))} user={user} />
            <Text>Mosaic</Text>

            {user?.mosaiques && user.mosaiques.length > 0 ? (
              <View style={styles.mosaiquesContainer}>
                {userMosaics
                  .filter((mosaique: any) => mosaique !== null && mosaique !== undefined) // Avoid null/undefined
                  .map((mosaique: any) => (
                    <HoldItem items={MenuItems} hapticFeedback="Heavy" key={mosaique?.id} 
                    actionParams={{
                      Quit: [mosaique.id],
                    }}>
                      <Pressable style={styles.mosaicTag}  key={mosaique?.id} onPress={() => router.replace("/mosaic")}>
                        <Image
                          source={{ uri: mosaique?.icon || 'https://placehold.co/100x100' }}
                          style={{ width: 50, height: 50 }}
                        />
                        <Text style={styles.mosaicText}>{mosaique?.name || 'Unnamed Mosaic'}</Text>
                      </Pressable>
                    </HoldItem>
                  ))}
              </View>
            ) : (
              <Text style={{ color: '#FFF', marginTop: 20 }}>No mosaics found. Create or join one!</Text>
            )} 


            {user && <LightButton title="Create a mosaic" onPress={() => setCreateModalVisible(true)} />}
            <LightButton title="Join a mosaic" onPress={() => setJoinModalVisible(true)} />
            {user && <GraytButton title="Logout" onPress={onLogout} />}
        </View>
    </HoldMenuProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#262626',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
    },
    mosaiquesContainer: {
        marginVertical: 20,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    mosaicTag: {
        backgroundColor: '#444',
        borderRadius: 8,
        paddingVertical: 5,
        paddingHorizontal: 10,
        margin: 5,
    },
    mosaicText: {
        color: '#FFFFFF',
        fontSize: 16,
    },
});
