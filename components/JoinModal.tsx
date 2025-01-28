import { Modal, View, Text, Pressable, StyleSheet, TextInput,Image, Animated, Dimensions } from 'react-native';
import React, { PropsWithChildren, useEffect, useState } from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import LightButton from './buttons/LightButton';

import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import BackButton from './buttons/BackButton';
import CustomTextInput from './CustomTextInput';
import { useMosaic } from '@/context/MosaicContext';
import firestore from '@react-native-firebase/firestore';
import { useUser } from '@/context/UsersContext';

const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

type Props = PropsWithChildren<{
  isVisible: boolean;
  onClose: () => void;
  user: any;
}>;

export default function JoinModal({ isVisible, onClose, user }: Props) {
    const [errorDisplayed, setErrorDisplayed] = useState<boolean>(false);
    const [errorText, setErrorText] = useState<string>("");
    const [gradientStart, setGradientStart] = useState({ x: 0.2, y: 0 });
    const [gradientEnd, setGradientEnd] = useState({ x: 1.2, y: 1 });
    const [mosaicId, setMosaicId] = useState<string>("");
    const router = useRouter();
    const { mosaics, updateMosaic } = useMosaic();
    const [bgColor, setBgColor] = useState<string>("");
    const { selectedTheme } = useUser();

    useEffect(() => {
    if (selectedTheme === 'greenTheme') {
        setBgColor("#DAEDBD");
    } else if (selectedTheme === 'blueTheme') {
        setBgColor("#1100ff");
    } else if (selectedTheme === 'redTheme') {
        setBgColor("#F0265D");
    // } else if (selectedTheme === 'purpleTheme') {
    //   setBgColor("#761DA7");
    } else {
        setBgColor("#F94D20");
    }
    }, [selectedTheme]);
    
    const joinMosaic = async () => {
        if(mosaicId.length < 1) {
            setErrorText("Please enter a code!");
            setErrorDisplayed(true);
            return;
        }

        console.log(mosaicId)
        console.log(user)
        const mosaic = await firestore().collection("mosaiques").doc(mosaicId).get().then((doc) => doc.data());

        if(!mosaic) {
            console.log("AHHHHHHHHHHHHHHHH")
            setErrorText("This mosaic does not exist!");
            setErrorDisplayed(true);
        } else if (user && mosaic.users.some((userObj:any) => userObj.id === user.uid)) {
            setErrorText("You are already in this mosaic!");
            setErrorDisplayed(true);
        } else if (user && user != "guest"){
            console.log(user)
            setErrorDisplayed(false);
            const newUser = {id:user.uid, picture:user.picture}
            await updateMosaic(mosaicId, {
                users: [...mosaic.users, newUser],
            }).then(() => {
                console.log("Successfully joined the mosaic - mosaic side");
                router.replace("/mosaic");
                AsyncStorage.setItem("activeMosaic", mosaicId);
                onClose();
            })
        } else {
            setErrorDisplayed(false);
            await AsyncStorage.setItem("activeMosaic", mosaicId);
            router.replace("/mosaic");
            onClose();
        }
    } 

  return (
     <Modal animationType="fade" transparent={true} visible={isVisible}>
          <Animated.View style={styles.modalContainer}>
              <View style={[styles.modalContent, { borderRadius: 24}]}>
                  <LinearGradient
                      colors={['#000000', bgColor, '#000000']}
                      style={[styles.cardBorder, { borderRadius: 24 }]}
                      start={gradientStart}
                      end={gradientEnd}>
                        <View style={[styles.card, { borderRadius: 24 }]}>
                          <View style={{alignSelf: 'flex-start',}}>
                            <BackButton onPress={()=>{setErrorDisplayed(false);onClose()}} ></BackButton>
                          </View>
                          <CustomTextInput label="Mosaic code" placeholder="XXXXXX" onChangeText={(text:any) => setMosaicId(text)} />
                          {errorDisplayed && <Text style={{color:"#7C061E"}}>{errorText}</Text>}
                          <LightButton title="Join" onPress={joinMosaic} />
    
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
        backgroundColor: 'rgba(0,0,0,0.95)',
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
