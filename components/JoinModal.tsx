import { Modal, View, Text, Pressable, StyleSheet, TextInput,Image, Animated, Dimensions } from 'react-native';
import React, { PropsWithChildren, useState } from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import LightButton from './buttons/LightButton';

import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import BackButton from './buttons/BackButton';
import CustomTextInput from './CustomTextInput';
import { useMosaic } from '@/context/MosaicContext';
import firestore from '@react-native-firebase/firestore';

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

    const joinMosaic = async () => {
        if(mosaicId.length < 1) {
            setErrorText("Please enter a code!");
            setErrorDisplayed(true);
            return;
        }

        if(mosaics) {
            console.log(mosaicId)
            const mosaic = await firestore().collection("mosaiques").doc(mosaicId).get().then((doc) => doc.data());

            if(!mosaic) {
                setErrorText("This mosaic does not exist!");
                setErrorDisplayed(true);
                return;
            } else if (mosaic.users.includes(user.uid)) {
                setErrorText("You are already in this mosaic!");
                setErrorDisplayed(true);
                return;
            } else if (user){
                setErrorDisplayed(false);
                await updateMosaic(mosaicId, {
                    users: [...mosaic.users, user.uid],
                }).then(() => {
                    console.log("Successfully joined the mosaic - mosaic side");
                    router.replace("/mosaic");
                    AsyncStorage.setItem("activeMosaic", mosaicId);
                    onClose();
                })
            } else {
                setErrorDisplayed(false);
                router.replace("/mosaic");
                AsyncStorage.setItem("activeMosaic", mosaicId);
                onClose();
            }
        }
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
