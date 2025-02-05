import { Modal, View, Text, Pressable, StyleSheet, TextInput,Image, Dimensions, Animated } from 'react-native';
import React, { PropsWithChildren, useEffect, useState } from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import LightButton from './buttons/LightButton';

import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useUser } from '@/context/UsersContext';
import BackButton from './buttons/BackButton';
import GraytButton from './buttons/GrayButton';

type Props = PropsWithChildren<{
  isVisible: boolean;
  text: string;
  onClose: (confirm: boolean) => void;
  user: any;
}>;
const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

export default function ConfirmModal({ isVisible,text, onClose, user }: Props) {
    const [mosaicId, setMosaicId] = useState<string>("");
    const router = useRouter();
    const [gradientStart, setGradientStart] = useState({ x: 0.2, y: 0 });
    const [gradientEnd, setGradientEnd] = useState({ x: 1.2, y: 1 });
    const [bgColor, setBgColor] = useState<string>("");
    const { selectedTheme } = useUser();

    useEffect(() => {
    if (selectedTheme === 'greenTheme') {
        setBgColor("#DAEDBD");
    } else if (selectedTheme === 'blueTheme') {
        setBgColor("#1100ff");
    } else if (selectedTheme === 'redTheme') {
        setBgColor("#F0265D");
    } else if (selectedTheme === 'beigeTheme') {
        setBgColor("#795749");
    } else {
        setBgColor("#F94D20");
    }
    }, [selectedTheme]);
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
                          <BackButton onPress={()=>{onClose(false)}} ></BackButton>
                        </View>
                        <Text style={styles.text}>{text}</Text>
                        <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly', width: screenWidth/1.15}}>
                          <GraytButton title="No" onPress={()=>(onClose(false))} style={{width:screenWidth/2.7}}/>
                          <LightButton title="Yes" onPress={()=>(onClose(true))} style={{width:screenWidth/2.7}}/>
                        </View>
              
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
  text: {
    color: '#fff',
    // fontWeight: 'bold',
    fontFamily: 'SFPROBOLD',
    textAlign: 'left',
    fontSize: 16,
  },
});
