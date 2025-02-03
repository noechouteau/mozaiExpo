import { View, Text, Pressable, StyleSheet, Animated, Dimensions,Image } from 'react-native';
import React, { PropsWithChildren, useEffect, useRef, useState } from 'react';

import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useMosaic } from '@/context/MosaicContext';
import firestore from '@react-native-firebase/firestore';
import { useUser } from '@/context/UsersContext';
import GraytButton from './buttons/GrayButton';
import Modal from "react-native-modal";
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Clipboard from 'expo-clipboard';
import { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

type Props = PropsWithChildren<{
  isVisible: boolean;
  onClose: () => void;
  users: any;
  mosaicId?: string;
}>;

export default function MozaiInfosModal({ isVisible, onClose, users,mosaicId }: Props) {
    const [gradientStart, setGradientStart] = useState({ x: 0.2, y: 0 });
    const [gradientEnd, setGradientEnd] = useState({ x: 1.2, y: 1 });
    const router = useRouter();
    const [bgColor, setBgColor] = useState<string>("");
    const { selectedTheme } = useUser();
    const scaleAnim = useSharedValue(1); // Shared value for scale

    const backgroundColorAnim = useRef(new Animated.Value(0)).current;

    const backgroundColor = backgroundColorAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['#1A1A1A', '#454545'], // from white to blue
    });

    const handlePressIn = () => {
        Animated.timing(backgroundColorAnim, {
        toValue: 1, 
        duration: 75, // Duration in ms
        useNativeDriver: false, // Must be false for colors
        }).start();
    };

    const handlePressOut = () => {
        Animated.timing(backgroundColorAnim, {
        toValue: 0, 
        duration: 75,
        useNativeDriver: false,
        }).start();
    };

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
        console.log(mosaicId)
    } 

  return (
     <Modal animationIn="slideInDown" backdropColor={"#00000000"} animationOut="slideOutUp" onBackButtonPress={onClose} useNativeDriver hideModalContentWhileAnimating isVisible={isVisible}>
        <Pressable onPress={onClose} style={styles.modalContainer}>
            <Pressable style={{marginTop:65}}>
              <View style={[styles.modalContent, { borderRadius: 13}]}>
                  <LinearGradient
                      colors={['#000000', bgColor, '#000000']}
                      style={[styles.cardBorder, { borderRadius: 13 }]}
                      start={gradientStart}
                      end={gradientEnd}>
                        <View style={[styles.card, { borderRadius: 13 }]}>
                            <View style={{display: 'flex', flexDirection: 'row',justifyContent: 'center',alignItems: 'center',gap: 5,flexWrap: 'wrap',}}>
                            {users?.map((user:any, index:any) => {
                                console.log(users.length)
                                return (
                                <Image
                                    key={index}
                                    source={{ uri: user.picture || 'https://placehold.co/100x100' }}
                                    style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 50,
                                    }}
                                />
                                
                                );
                            }
                            )}
                            </View>
                          <Text style={styles.text}>Share your mosaic</Text>
                            <Pressable onPressIn={handlePressIn}onPressOut={handlePressOut} onPress={async() => {await Clipboard.setStringAsync(mosaicId?mosaicId.toLocaleUpperCase():"");}}>
                                <Animated.View style={[styles.copyArea, { backgroundColor:backgroundColor }]}>
                                    <Text style={styles.text}>{mosaicId?.toLocaleUpperCase()}</Text>
                                    <Ionicons name="copy-outline" size={20} color="white" />
                                </Animated.View>
                            </Pressable>
                          <GraytButton style={{display:"flex",width:220}} textStyle={{color:"#EE4266"}} onPress={joinMosaic}>
                                <Ionicons name="exit-outline" size={20} color="#EE4266" style={{width:20,height:20,position:'absolute',left:20,top:10}} />
                                <Text style={[{color: "#EE4266",fontFamily: "SFPRO", fontSize: 16,}]}>Leave mosaic</Text>
                            </GraytButton>
    
                        </View>
                  </LinearGradient>
                </View>
              </Pressable>
          </Pressable>
        </Modal>
  );
}

const styles = StyleSheet.create({
    modalContainer: {
        height: '100%',
        width: '100%',
        display: 'flex',
        justifyContent: "flex-start",
        alignItems: 'center',
        position: 'absolute',
        zIndex:10,
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
    text: {
        color: '#fff',
        // fontWeight: 'bold',
        fontFamily: 'SFRPRO',
        textAlign: 'center',
    },
    copyArea: {
        display: 'flex',
        flexDirection: 'row',
        borderWidth:1,
        borderColor: "#FFFFFF",
        borderRadius: 10,
        borderStyle: "dashed",
        backgroundColor:"#1A1A1A",
        padding: 10,
        gap: 8,
        width:220,
        alignItems: 'center',
        justifyContent: 'space-between',
    }
});
