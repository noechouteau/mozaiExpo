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
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function Mosaic() {

    const [initializing, setInitializing] = useState(true);
    const [activeMosaic, setActiveMosaic] = useState<string | null>("");
    const [user, setUser]:any = useState();
    const [loaded, error] = useFonts({
    'SFPRO': require('../assets/fonts/SFPRODISPLAYMEDIUM.otf'),
    "SFPROBOLD": require('../assets/fonts/SFPRODISPLAYBOLD.otf'),
    });

    // Handle user state changes
    async function onAuthStateChanged(user:any) {
        if (initializing) setInitializing(false);
        setUser(user);
    }
      
      useEffect(() => {
        getActiveMosaic();
        const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
        return subscriber; // unsubscribe on unmount
      }, []);

    const getActiveMosaic = async () => {
        const tempActiveMosaic = await AsyncStorage.getItem("activeMosaic");
        setActiveMosaic(tempActiveMosaic);
    }


  return (<View style={styles.container}>
    <Text>Mosaic</Text>
    <LightButton onPress={() => router.replace("/home")} title="Home" />
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