import { WebView } from 'react-native-webview';
import Constants from 'expo-constants';
import { StyleSheet, View,Text, Button } from 'react-native';
import { getDbDoc, getDbDocs } from '@/database/firebase/read';
import { getPictures } from '@/database/aws/read';
import { uploadPicture } from '@/database/aws/set';
import { Asset } from 'expo-asset';
import * as FileSystem from "expo-file-system";


export default function Index() {

  const getMosaic = async () => {
    console.log("getMosaic");
    await getDbDoc({ collectionId: "mosaiques", docId:"0"  }).then(async (mosaic) => {
      console.log("ahh")
      if(mosaic){
        await getDbDoc({ collectionId: "users", docId: mosaic.users[0].id }).then((user) => {
          console.log(user)
        })
      }
    })
    await getPictures();
    try {
      const [{ localUri }] = await Asset.loadAsync(require('../assets/images/splash-icon.png'));

      if(localUri){
        const fileData = await FileSystem.readAsStringAsync(localUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
          
      // Convert Base64 string to Buffer
      const blob = await fetch(localUri).then((response) => response.blob());

      const key = "image.jpg";
      const result = await uploadPicture(blob, key);
      console.log("Upload successful:", result);
      }
    } catch (error) {
      console.error("Failed to upload image:", error);
    }
  }

  getMosaic();

  return (<View>
    <Text>Test</Text>
    <Button title="Get Mosaic" onPress={getMosaic} />
  </View>
    // <WebView
    //   source={{ uri: 'https://mozai-gallery.vercel.app/' }}
    // /> 
  );
}