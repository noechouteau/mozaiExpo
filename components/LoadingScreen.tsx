import { StyleSheet, View,Text, Button, TextInput,Pressable, ImageBackground, Dimensions,Image, Animated, ActivityIndicator } from 'react-native';
import { Link, router } from 'expo-router';
import { HoldMenuProvider } from 'react-native-hold-menu';
import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import LightButton from '@/components/buttons/LightButton';
import CustomTextInput from '@/components/CustomTextInput';
import { Asset } from 'expo-asset';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import BackButton from '@/components/buttons/BackButton';
import { uploadPicture } from '@/database/aws/set';
import { updateDoc } from '@/database/firebase/set';
import { useUser } from '@/context/UsersContext';
import { LinearGradient } from 'expo-linear-gradient';

const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

const blue = require('../assets/images/blueTheme/bg_login_2.png');
const green = require('../assets/images/greenTheme/bg_login_2.png');
const red = require('../assets/images/redTheme/bg_login_2.png');
const orange = require('../assets/images/orangeTheme/bg_login_2.png');
const beige = require('../assets/images/beigeTheme/bg_login_2.png');

export default function LoadingScreen(props:any) {
    const {selectedTheme, changeTheme} = useUser();
    const [backgroundImage, setBackgroundImage] = useState<any>();
    const [bgColor, setBgColor] = useState<string>("#DAEDBD");

    useEffect(() => {
        if (selectedTheme === 'greenTheme') {
            setBackgroundImage(green);
            setBgColor("#DAEDBD");
        } else if (selectedTheme === 'blueTheme') {
            setBgColor("#1100ff");
            setBackgroundImage(blue);
        } else if (selectedTheme === 'redTheme') {
            setBackgroundImage(red);
            setBgColor("#F0265D");
        } else if (selectedTheme === 'beigeTheme') {
            setBackgroundImage(beige);
            setBgColor("#795749");
        } else {
            setBackgroundImage(orange);
            setBgColor("#F94D20");
        }
    }, [selectedTheme]);

    useEffect(() => {
        if(props.isVisible){
            console.log("Loading screen is visible")
        }
    }, [props.isVisible])

  return (<ImageBackground source={backgroundImage} style={[props.isVisible ? {display: 'flex'} : {display: 'none'},{width: '100%', height: '100%',zIndex: 900, position: 'absolute'}]}>
  <Animated.View style={[styles.container]}>
        <Text style={styles.text}>{props.text}</Text>
        <ActivityIndicator size="large" color={"#999999"} />
  </Animated.View>
  </ImageBackground>
  );
}

const styles = StyleSheet.create({
    container: {
        height: '100%',
        width: '100%',
        borderTopRightRadius: 18,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderTopLeftRadius: 18,
        position: 'absolute',
        zIndex: 905,
        gap:10
    },
    cardBorder: {
        padding: 3,
        height: 356,
        width: "85%",
        display: 'flex',
        top: screenHeight/2-296,
    },
    modalContent: {
        height: 350,
        width: "100%",
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
        top: screenHeight/2 -180,
        zIndex: 100,
    },
    formContainer: {
        display: 'flex',
        gap: 20,
        top:70,
    },
    text: {
        textAlign: "center",
        fontFamily: "Monrope",
        fontSize: 16,
        color: "#ffffff",
    }
});
