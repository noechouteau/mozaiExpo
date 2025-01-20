import { Modal, View, Text, Pressable, StyleSheet, TextInput,Image } from 'react-native';
import React, { act, PropsWithChildren, useState } from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';
import LightButton from './LightButton';
import CustomTextInput from './CustomTextInput';
import { uploadPicture } from '@/database/aws/set';
import { updateDoc } from '@/database/firebase/set';
import { Asset } from 'expo-asset';
import { DocumentReference, doc } from 'firebase/firestore';
import { db } from '@/db-configs/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

type Props = PropsWithChildren<{
  isVisible: boolean;
  onClose: () => void;
  user: any;
}>;

export default function NewUserModal({ isVisible, onClose, user }: Props) {

    const [selectedImage, setSelectedImage] = useState<any>(require('../assets/images/newUserBgPic.png'));
    const [userName, setUserName] = useState<string>("");

    const pickImageAsync = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 1,
        });
    
        if (!result.canceled) {
            console.log(result.assets[0].uri);
            let image = await Asset.loadAsync(result.assets[0].uri);
            console.log(image);
            setSelectedImage(image);
        } else {
            alert('You did not select any image.');
        }
    };

    const createUser = async () => {
        let activeUser = await AsyncStorage.getItem("activeUser");
        let phone = await AsyncStorage.getItem("activePhone");

        if(activeUser == null) return

        console.log("ahah")
        const [{ localUri }] = await Asset.loadAsync(selectedImage)

        await uploadPicture(localUri, activeUser+"/"+activeUser+"-profile-pic").then(async (res) => {
            console.log(res.Location, activeUser,phone,userName)
            await updateDoc({collectionId:"users", docId: activeUser, newDatas: {
                name: userName,
                picture: res.Location,
                uid: activeUser,
                phone: phone,
                mosaiques: [],
            }}).then(() => {
                console.log("User created");
                onClose();
            })
        })
        
    }

  return (
    <Modal animationType="slide" transparent={true} visible={isVisible}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
            <Pressable onPress={onClose} style={{left:15,top:10, position:"absolute"}}>
                <Text style={[styles.text,{left:15,top:10, position:"absolute"}]}>X</Text>
            </Pressable>

            <View style={styles.titleContainer}>
                <Pressable onPress={pickImageAsync}>
                    <Image source={selectedImage} style={{width: 150, height: 150, alignSelf: 'center', borderRadius:100}} />
                </Pressable>
                <Text style={[styles.text]}>Profile Picture</Text>
            </View>

            <View style={styles.formContainer}>
                <CustomTextInput label="Username" style={styles.input} onChangeText={(text:any) => setUserName(text)} />

                <LightButton title="Create account" onPress={createUser} />
            </View>
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
        height: 290,
        width: "85%",
        borderRadius: 20,
        backgroundColor: '#000',
        display: 'flex',
        alignItems: 'center',
        boxShadow: '0px 0px 10px #464B3F',
    },
    titleContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        flexDirection: 'column',
        top:-80
    },
    formContainer: {
        top: -60,
        display: 'flex',
        gap: 20,
    },
    input:{
        display: 'flex',
        gap: 10,
    },
    text: {
        color: '#fff',
        fontSize: 16,
        margin: 0,
        padding:0
    },
    
});
