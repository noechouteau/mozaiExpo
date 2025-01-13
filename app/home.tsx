import { StyleSheet, View,Text, Button, TextInput,Pressable } from 'react-native';
import { Link, router } from 'expo-router';
import { getAuth } from "firebase/auth";
import { useFonts } from 'expo-font';
import Animated from 'react-native-reanimated';
import auth, { onAuthStateChanged } from '@react-native-firebase/auth';
import { useEffect, useState } from 'react';
import { queryDbDocsByField } from '@/database/firebase/read';
import LightButton from '@/components/LightButton';
import GraytButton from '@/components/GrayButton';
import CreateModal from '@/components/CreateModal';
import JoinModal from '@/components/JoinModal';

export default function Home() {

    const [initializing, setInitializing] = useState(true);
    const [user, setUser]:any = useState();
    const [loaded, error] = useFonts({
    'SFPRO': require('../assets/fonts/SFPRODISPLAYMEDIUM.otf'),
    "SFPROBOLD": require('../assets/fonts/SFPRODISPLAYBOLD.otf'),
    });
    const [isCreateModalVisible, setCreateModalVisible] = useState<boolean>(false);
    const [isJoinModalVisible, setJoinModalVisible] = useState<boolean>(false);

    // Handle user state changes
    async function onAuthStateChanged(user:any) {
        console.log(user);
        if (initializing) setInitializing(false);
        await queryDbDocsByField({ collectionId: "users", field:"uid", value: user.uid }).then((res) => {
            console.log(res);
            setUser(res[0]);
        })
    }
      
      useEffect(() => {
        const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
        return subscriber; // unsubscribe on unmount
      }, []);

    function onLogout() {
        auth().signOut();
        router.replace("/");
    }

    const onCreateMosaic = () => {
      setCreateModalVisible(true);
    };
  
    const onCreateModalClose = () => {
      setCreateModalVisible(false);
    };

    const onJoinMosaic = () => {
      setJoinModalVisible(true);
    }

    const onJoinModalClose = () => {
      setJoinModalVisible(false);
    }


  return (<View style={styles.container}>
    <CreateModal isVisible={isCreateModalVisible} onClose={onCreateModalClose} user={user}>
        {/* A list of emoji component will go here */}
      </CreateModal>
    <JoinModal isVisible={isJoinModalVisible} onClose={onJoinModalClose} user={user}>
        {/* A list of emoji component will go here */}
      </JoinModal>
    <Text>Mosaic</Text>
    {user && <LightButton title="Create a mosaic" onPress={onCreateMosaic}/>}
    <LightButton title="Join a mosaic" onPress={onJoinMosaic}/>
    {user && <GraytButton title="Logout" onPress={onLogout}/>}
  </View>
    // <WebView
    //   source={{ uri: 'https://mozai-gallery.vercel.app/' }}
    // /> 
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
});