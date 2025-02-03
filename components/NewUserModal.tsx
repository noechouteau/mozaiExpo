import { Modal, View, Text, Pressable, StyleSheet, TextInput,Image, Dimensions } from 'react-native';
import React, { act, PropsWithChildren, useEffect, useState } from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';
import LightButton from './buttons/LightButton';
import CustomTextInput from './CustomTextInput';
import { uploadPicture } from '@/database/aws/set';
import { updateDoc } from '@/database/firebase/set';
import { Asset } from 'expo-asset';
import { DocumentReference, doc } from 'firebase/firestore';
import { db } from '@/db-configs/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Back } from 'gsap-rn';
import BackButton from './buttons/BackButton';
import { useUser } from '@/context/UsersContext';
import { User } from '@/types/types';
import { LinearGradient } from 'expo-linear-gradient';
import LoadingScreen from './LoadingScreen';

type Props = PropsWithChildren<{
  isVisible: boolean;
  onClose: () => void;
}>;
const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

export default function NewUserModal({ isVisible, onClose }: Props) {

    const [selectedImage, setSelectedImage] = useState<any>(require('../assets/images/newUserBgPic.png'));
    const [userName, setUserName] = useState<string>("");
    const [gradientStart, setGradientStart] = useState({ x: 0.2, y: 0 });
    const [gradientEnd, setGradientEnd] = useState({ x: 1.2, y: 1 });
    const [errorDisplayed, setErrorDisplayed] = useState<boolean>(false);
    const {selectedTheme, createUser,changeTheme} = useUser();
    const [loadingVisible, setLoadingVisible] = useState<boolean>(false);

    useEffect(() => {
        async function setGreenTheme() {
            const loggedInUser = await AsyncStorage.getItem("loggedIn");
            if(loggedInUser == "true") return
            changeTheme("greenTheme");
        }
        setGreenTheme();
    }, [])

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
        }
    };

    const onCreateClick = async () => {
        let activeUser = await AsyncStorage.getItem("activeUser");
        let phone = await AsyncStorage.getItem("activePhone");

        if(userName.trim() == ""){
            setErrorDisplayed(true);
            return
        }

        if(!activeUser || !phone) return

        const [{ localUri }] = await Asset.loadAsync(selectedImage)
        setLoadingVisible(true);

        await uploadPicture(localUri, activeUser+"/"+activeUser+"-profile-pic").then(async (res) => {
            console.log(res.Location, activeUser,phone,userName)
            const newUser: User =
            {
                name: userName,
                picture: `${res.Location}?t=${Date.now()}`,
                uid: activeUser,
                phone: phone,
                mosaiques: []
            }
            await createUser(newUser).then(() => {
<<<<<<< HEAD
                console.log("User created");
                setLoadingVisible(false);
=======
>>>>>>> 04d9cfdbece832f3750cfa371b070d837708cc57
                onClose();
            })
        })

    }

  return (
    <Modal animationType="fade" transparent={true} visible={isVisible}>
    <LoadingScreen text={"Creating account..."} isVisible={loadingVisible}></LoadingScreen>
      <View style={styles.modalContainer}>
        <View style={[styles.modalContent,errorDisplayed? {height: 310} : {height: 270}]}>
                <LinearGradient
                    colors={['#000000', "#DAEDBD", '#000000']}
                    style={[styles.cardBorder, { borderRadius: 24 }]}
                    start={gradientStart}
                    end={gradientEnd}>
                <View style={[styles.card, errorDisplayed? {height: 310} : {height: 270},{ borderRadius: 24 }]}>

                    <View style={styles.titleContainer}>
                        <Pressable onPress={pickImageAsync}>
                            <Image source={selectedImage} style={{width: 150, height: 150, alignSelf: 'center', borderRadius:100}} />
                        </Pressable>
                        <Text style={[styles.text]}>Profile Picture</Text>
                    </View>

                    <View style={styles.formContainer}>
                        <CustomTextInput label="Username" style={styles.input} onChangeText={(text:any) => {setErrorDisplayed(false);setUserName(text)}} />
                        {errorDisplayed && <Text style={{color:"#7C061E",textAlign:"center"}}>Please enter a username</Text>}

                        <LightButton title="Create account" onPress={onCreateClick} />
                    </View>
                </View>
            </LinearGradient>
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
        zIndex: 10,
        backgroundColor: 'rgba(0,0,0,0.8)',
    },
    modalContent: {
        width: "85%",
        borderRadius: 20,
        backgroundColor: '#000',
        display: 'flex',
        alignItems: 'center',
    },
    titleContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        flexDirection: 'column',
        top:-50
    },
    formContainer: {
        top: -50,
        display: 'flex',
        gap: 20,
        textAlign: 'center',
    },
    input:{
        display: 'flex',
    },
    text: {
        color: '#fff',
        fontSize: 16,
        margin: 0,
        padding:0
    },
    cardBorder: {
        padding: 2,
        display: 'flex',
    },
    card: {
        padding: 22,
        backgroundColor: '#000000',
        display: 'flex',
        gap: 15,
        alignItems: 'center',
        width: screenWidth / 1.15,
        justifyContent: 'center',
    },
});
