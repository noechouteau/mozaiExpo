import { StyleSheet, View,Text, Button, TextInput,Pressable, ImageBackground, Dimensions,Image } from 'react-native';
import { Link, router } from 'expo-router';
import { useFonts } from 'expo-font';
import Animated from 'react-native-reanimated';
import { HoldMenuProvider } from 'react-native-hold-menu';
import { HoldItem } from 'react-native-hold-menu';
import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import LightButton from '@/components/LightButton';
import CustomTextInput from '@/components/CustomTextInput';
import createUser from '@/controllers/Users';
import { Asset } from 'expo-asset';
import * as ImagePicker from 'expo-image-picker';

const {width: screenWidth, height: screenHeight} = Dimensions.get('window');
const backgroundImage = require('../assets/images/bg_login_2.png');

export default function Profile() {

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

  return (<HoldMenuProvider theme='dark' safeAreaInsets={{
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  }}>
  <StatusBar translucent/>
  <ImageBackground source={backgroundImage} resizeMode="cover" style={{ flex: 1, justifyContent: 'center', alignItems: 'center', width: screenWidth, height: screenHeight+45 }}>
  
   <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
              <Pressable style={{left:15,top:10, position:"absolute"}} onPress={() => {router.replace("/home")}}>
                  <Text style={[styles.text,{left:15,top:10, position:"absolute"}]}>X</Text>
              </Pressable>
  
              <View style={styles.titleContainer}>
                  <Pressable onPress={pickImageAsync}>
                      <Image source={selectedImage} style={{width: 150, height: 150, alignSelf: 'center', borderRadius:100}} />
                  </Pressable>
              </View>
  
              <View style={styles.formContainer}>
                  <CustomTextInput label="Username" style={styles.input} onChangeText={(text:any) => setUserName(text)} />
  
                  <LightButton title="Sign out" />
              </View>
          </View>
        </View>

  </ImageBackground>
  </HoldMenuProvider>
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
    }
});
