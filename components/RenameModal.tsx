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
}>;

export default function RenameModal({ isVisible, onClose }: Props) {
    const [errorDisplayed, setErrorDisplayed] = useState<boolean>(false);
    const [errorText, setErrorText] = useState<string>("");
    const [gradientStart, setGradientStart] = useState({ x: 0.2, y: 0 });
    const [gradientEnd, setGradientEnd] = useState({ x: 1.2, y: 1 });
    const [newName, setNewName] = useState<string>("");
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

    const renameMosaic = async () => {
        const mosaique = await AsyncStorage.getItem("activeMosaic");
        console.log(mosaique, newName)
        if(newName.length < 1) {
            setErrorText("Please enter a new name !");
            setErrorDisplayed(true);
            return;
        } else if (newName.length > 14) {
            setErrorText("Name is too long !");
            setErrorDisplayed(true);
            return;
        }

        if(mosaique){
            updateMosaic(mosaique, {
                name: newName,
            }).then(() => {
                setErrorDisplayed(false);
                onClose();
            })
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
                          <CustomTextInput label="Rename your Mosaic" placeholder="New name" onChangeText={(text:any) => setNewName(text)} />
                          {errorDisplayed && <Text style={{color:"#EE4266"}}>{errorText}</Text>}
                          <LightButton title="Rename" onPress={renameMosaic} />

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
