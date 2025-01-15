import { StyleSheet, View,Text, Button, TextInput,Pressable,Image } from 'react-native';
import { Link, router } from 'expo-router';
import { getAuth } from "firebase/auth";
import { useFonts } from 'expo-font';
import Animated from 'react-native-reanimated';
import auth, { onAuthStateChanged } from '@react-native-firebase/auth';
import { PropsWithChildren, useEffect, useState } from 'react';
import { getDbDoc, queryDbDocsByField } from '@/database/firebase/read';
import LightButton from '@/components/LightButton';
import GraytButton from '@/components/GrayButton';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { Asset } from 'expo-asset';
import ConfirmModal from '@/components/ConfirmModal';
import { uploadPicture } from '@/database/aws/set';
import { updateDoc } from '@/database/firebase/set';
import { Timestamp } from 'firebase/firestore';

type Props = PropsWithChildren<{
  user: any;
  mosaicId?: string;
}>;

export default function Mosaic({ user, mosaicId }: Props) {
  
    const [isConfirmVisible, setConfirmVisible] = useState<boolean>(false);
    const [initializing, setInitializing] = useState(true);
    const [activeMosaic, setActiveMosaic] = useState<any>("");
    const [activeUser, setActiveUser] = useState<any>(user);
    const [assetsNumber, setAssetsNumber] = useState<number>(0);
    const [imagesToUpload, setImagesToUpload] = useState<any>();
    const [loaded, error] = useFonts({
    'SFPRO': require('../assets/fonts/SFPRODISPLAYMEDIUM.otf'),
    "SFPROBOLD": require('../assets/fonts/SFPRODISPLAYBOLD.otf'),
    });

    const getData = async () => {
      const tempActiveMosaic = await AsyncStorage.getItem("activeMosaic");
      setActiveMosaic(tempActiveMosaic);
      setActiveUser(await AsyncStorage.getItem("activeUser") ?? "");

      console.log(tempActiveMosaic);
      const mosaic = await queryDbDocsByField({ collectionId: "mosaiques", field: "id", value: tempActiveMosaic });
      console.log(mosaic);
      setActiveMosaic(mosaic[0]);
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
          
          const assetPromises = result.assets.map(asset => Asset.loadAsync(asset.uri));
          const images = await Promise.all(assetPromises);
          images.forEach(image => console.log(image));
          setImagesToUpload(images);

          setConfirmVisible(true);
        } else {
          alert('You did not select any image.');
        }
      };

      const confirmDelete = async (confirmation:boolean) => {
        console.log(confirmation);
        setConfirmVisible(false);
        if(!confirmation) return;
        const assetPromises = imagesToUpload.map((asset: any) => uploadPicture(asset[0].localUri, activeMosaic.id + "/"+activeUser+ "/"+ asset[0].uri.split("/").pop()));
        await Promise.all(assetPromises).then(async (res) => {
          console.log(res);
          const newImages = res.map((image: any) => ({
            date: new Timestamp(new Date().getTime() / 1000, 0),
            informations: "",
            reactions: [],
            url: image.Location,
            user: activeUser,
          }));
          await updateDoc({collectionId:"mosaiques",docId:activeMosaic.id, newDatas: {
            images: [...activeMosaic.images, ...newImages],
          }}).then(async () => {
            await getDbDoc({collectionId:"mosaiques",docId:activeMosaic.id}).then((mosaic:any) => {
              setActiveMosaic(mosaic);
              console.log("Images successfully uploaded");
            })
          })
        })
        
      }

  return (<View style={styles.container}>
    <ConfirmModal isVisible={isConfirmVisible} text={`Do you want to add ${assetsNumber} images to the mosaic ?`} onClose={(confirmation)=>(confirmDelete(confirmation))} user={user} />
    {/* <Text>{activeMosaic}</Text> */}
    {activeMosaic && activeMosaic.images ?
      activeMosaic.images.map((image: any) => (
        <View key={image.url+Math.random()*100}>
          <Image source={{ uri: image.url }} style={{ width: 50, height: 50 }} />
        </View>
      )) : null
    }

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