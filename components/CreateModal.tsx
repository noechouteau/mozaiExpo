import { Modal, View, Text, Pressable, StyleSheet, TextInput,Image } from 'react-native';
import React, { PropsWithChildren, useState } from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
// import * as ImagePicker from 'expo-image-picker';
import LightButton from './LightButton';
import CustomTextInput from './CustomTextInput';
import { uploadPicture } from '@/database/aws/set';
import { updateDoc } from '@/database/firebase/set';
import { Asset } from 'expo-asset';
import { DocumentReference, doc } from 'firebase/firestore';
import { db } from '@/db-configs/firebase';

type Props = PropsWithChildren<{
  isVisible: boolean;
  onClose: () => void;
  user: any;
}>;

export default function CreateModal({ isVisible, onClose, user }: Props) {
    const PlaceholderImage = require('@/assets/images/adaptive-icon.png');
    const [selectedImage, setSelectedImage] = useState<any>(PlaceholderImage);
    const [mosaicName, setMosaicName] = useState<string>("");
    const [mosaicDescription, setMosaicDescription] = useState<string>("");

    const pickImageAsync = async () => {
        console.log("a")
        // let result = await ImagePicker.launchImageLibraryAsync({
        //   mediaTypes: ['images'],
        //   allowsEditing: true,
        //   quality: 1,
        // });
    
        // if (!result.canceled) {
        //   setSelectedImage(result.assets[0].uri);
        // } else {
        //   alert('You did not select any image.');
        // }
      };

    async function createMosaic() {
        console.log("Create a mosaic");
        console.log(user)

        if(mosaicName.length < 1) {
          alert("Please enter a name for your mosaic");
          return;
        }
        const [{ localUri }] = await Asset.loadAsync(selectedImage)

        await uploadPicture(localUri, user.name+ "/"+mosaicName+"-icon").then(async (res) => {
            console.log(res);
            let id = Math.random().toString(36).substring(2, 9);
            while(id == "0000000" || id == "1111111" || id == "2222222" || id == "3333333" || id == "4444444" || id == "5555555" || id == "6666666" || id == "7777777" || id == "8888888" || id == "9999999") {
                id = Math.random().toString(36).substring(2, 9);
            }
            await updateDoc({collectionId:"mosaiques",docId:id, newDatas: {
                id: id,
                name: mosaicName,
                images : [],
                users: [doc(db, "users", user.uid)],
                icon: res.Location,
            }}).then(() => {    
                console.log("Mosaic created");
            })
        })
      }

  return (
    <Modal animationType="slide" transparent={true} visible={isVisible}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
            <View style={styles.titleContainer}>
            <Text style={styles.title}>Create a mosaic</Text>
            <Pressable onPress={onClose}>
                <MaterialIcons name="close" color="#fff" size={22} />
            </Pressable>
            </View>
            <Text>Mosaic name</Text>
            <CustomTextInput placeholder="Enter a name for your mosaic" onChangeText={(text:any) => setMosaicName(text)} />
            <Text>Mosaic icon</Text>
            <Pressable onPress={pickImageAsync}>
                <Image source={selectedImage} style={{width:100, height:100}}/>
            </Pressable>
            <LightButton title="Create" onPress={createMosaic} />

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
    modalContainer: {
        height: '100%',
        width: '100%',
        borderTopRightRadius: 18,
        display: 'flex',
        justifyContent: "center",
        alignItems: 'center',
        borderTopLeftRadius: 18,
        position: 'absolute',
        zIndex: 10,
    },
    modalContent: {
        height: "45%",
        width: "90%",
        backgroundColor: '#464C55',
    },
    titleContainer: {
        height: '16%',
        backgroundColor: '#464C55',
        borderTopRightRadius: 10,
        borderTopLeftRadius: 10,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    title: {
        color: '#fff',
        fontSize: 16,
    },
});
