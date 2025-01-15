import { StyleSheet, View,Text, Button, TextInput,Pressable } from 'react-native';
import { Link, router } from 'expo-router';
import { getAuth } from "firebase/auth";
import { useFonts } from 'expo-font';
import Animated from 'react-native-reanimated';
import auth, { onAuthStateChanged } from '@react-native-firebase/auth';
import { PropsWithChildren, useEffect, useState } from 'react';
import { queryDbDocsByField } from '@/database/firebase/read';
import LightButton from '@/components/LightButton';
import GraytButton from '@/components/GrayButton';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { Asset } from 'expo-asset';
import ConfirmModal from '@/components/ConfirmModal';

type Props = PropsWithChildren<{
  user: any;
  mosaicId?: string;
}>;

export default function Mosaic({ user, mosaicId }: Props) {
  
    const [isConfirmVisible, setConfirmVisible] = useState<boolean>(false);
    const [initializing, setInitializing] = useState(true);
    const [activeMosaic, setActiveMosaic] = useState<string>("");
    const [activeUser, setActiveUser] = useState<any>(user);
    const [assetsNumber, setAssetsNumber] = useState<number>(0);
    const [loaded, error] = useFonts({
    'SFPRO': require('../assets/fonts/SFPRODISPLAYMEDIUM.otf'),
    "SFPROBOLD": require('../assets/fonts/SFPRODISPLAYBOLD.otf'),
    });

    const getData = async () => {
      try {
        setActiveMosaic(await AsyncStorage.getItem("activeMosaic") ?? "");
        setActiveUser(await AsyncStorage.getItem("activeUser") ?? "");
      } catch (e) {
        console.log(e);
      }
    };

    useEffect(() => {
      getData();
    }, []);


    const pickImageAsync = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsMultipleSelection:true,
          allowsEditing: false,
          quality: 1,
        });
    
        if (!result.canceled) {
          setAssetsNumber(result.assets.length);
          console.log(result.assets[0].uri);
          let image = await Asset.loadAsync(result.assets[0].uri);
          setConfirmVisible(true);
          console.log(image);
        } else {
          alert('You did not select any image.');
        }
      };

      const confirmDelete = (confirmation:boolean) => {
        console.log(confirmation);
      }

  return (<View style={styles.container}>
    <ConfirmModal isVisible={isConfirmVisible} text={"Do you want to add"+{assetsNumber}+"images to the mosaic ?"} onClose={(confirmation)=>(confirmDelete(confirmation))} user={user} />
    <Text>{activeMosaic}</Text>
    <Text>{activeUser}</Text>
    <LightButton onPress={() => router.replace("/home")} title="Home" />
    <LightButton onPress={pickImageAsync} title="+" />
    
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