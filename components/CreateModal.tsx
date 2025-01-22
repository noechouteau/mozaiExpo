import { Modal, View, Text, Pressable, StyleSheet, TextInput,Image, Dimensions, Animated } from 'react-native';
import React, { PropsWithChildren, useState } from 'react';
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
import BackButton from './buttons/BackButton';
import { LinearGradient } from 'expo-linear-gradient';
import { opacity } from 'react-native-reanimated/lib/typescript/Colors';

const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

type Props = PropsWithChildren<{
  isVisible: boolean;
  onClose: () => void;
  user: any;
}>;

export default function CreateModal({ isVisible, onClose, user }: Props) {
    const PlaceholderImage = require('@/assets/images/adaptive-icon.png');
    const [selectedImage, setSelectedImage] = useState<any>(PlaceholderImage);
    const [mosaicName, setMosaicName] = useState<string>("");
    const [errorDisplayed, setErrorDisplayed] = useState<boolean>(false);
    const [gradientStart, setGradientStart] = useState({ x: 0.2, y: 0 });
    const [gradientEnd, setGradientEnd] = useState({ x: 1.2, y: 1 });

    const pickImageAsync = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: false,
          quality: 1,
        });
    
        if (!result.canceled) {
          console.log(result.assets[0].uri);
          let image = await Asset.loadAsync(result.assets[0].uri);
          console.log(image);
          setSelectedImage(image);
          setErrorDisplayed(false);
        } else {
          setErrorDisplayed(true);
        }
      };

    async function createMosaic() {
        console.log("Create a mosaic");
        console.log(user)

        if(mosaicName.length < 1) {
          setErrorDisplayed(true);
          return;
        }
        const [{ localUri }] = await Asset.loadAsync(selectedImage)
        setErrorDisplayed(false);

        let id = Math.random().toString(36).substring(2, 9);
        while(id == "0000000" || id == "1111111" || id == "2222222" || id == "3333333" || id == "4444444" || id == "5555555" || id == "6666666" || id == "7777777" || id == "8888888" || id == "9999999") {
            id = Math.random().toString(36).substring(2, 9);
        }

        if(user.name == undefined) {
          user.name = "Test";
        }

        await updateDoc({collectionId:"mosaiques",docId:id, newDatas: {
            id: id,
            name: mosaicName,
            images : [],
            users: [user.uid],
        }}).then(() => {    
            console.log("Mosaic created - mosaic side");
        })
        await updateDoc({collectionId:"users", docId: user.id, newDatas: {
            mosaiques: [...user.mosaiques, doc(db, "mosaiques", id)],
        }}).then(async () => {
            console.log("Successfully created the mosaic - user side");
            router.replace("/mosaic");
            await AsyncStorage.setItem("activeMosaic", id);
            onClose();
        })
      }

  return (
    <Modal animationType="slide" transparent={true} visible={isVisible}>
      <Animated.View style={styles.modalContainer}>
          <View style={[styles.modalContent, { borderRadius: 24}]}>
              <LinearGradient
                  colors={['#000000', '#DAEDBD', '#000000']}
                  style={[styles.cardBorder, { borderRadius: 24 }]}
                  start={gradientStart}
                  end={gradientEnd}>
                    <View style={[styles.card, { borderRadius: 24 }]}>
                      <View style={{alignSelf: 'flex-start',}}>
                        <BackButton onPress={onClose} ></BackButton>
                      </View>
                      <CustomTextInput label="Give your Mosaic a name" placeholder="Enter a name for your mosaic" onChangeText={(text:any) => setMosaicName(text)} />
                      {errorDisplayed && <Text style={{color:"#7C061E"}}>Please give your mosaic a name !</Text>}
                      <LightButton title="Create" onPress={createMosaic} />

                    </View>
              </LinearGradient>
          </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
    modalContainer: {
        height: '100%',
        width: '100%',
        display: 'flex',
        justifyContent: "center",
        alignItems: 'center',
        position: 'absolute',
        zIndex: 10,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        overflow: 'hidden',
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
