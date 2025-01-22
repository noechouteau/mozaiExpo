import { StyleSheet, View,Text, Button, TextInput,Pressable, ImageBackground, Dimensions,Image } from 'react-native';
import { Link, router } from 'expo-router';
import { useFonts } from 'expo-font';
import Animated from 'react-native-reanimated';
import { HoldMenuProvider } from 'react-native-hold-menu';
import { HoldItem } from 'react-native-hold-menu';
import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import LightButton from '@/components/buttons/LightButton';
import CustomTextInput from '@/components/CustomTextInput';
import createUser from '@/controllers/Users';
import { Asset } from 'expo-asset';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import BackButton from '@/components/buttons/BackButton';
import { uploadPicture } from '@/database/aws/set';
import { updateDoc } from '@/database/firebase/set';
import { useUser } from '@/context/UsersContext';

const {width: screenWidth, height: screenHeight} = Dimensions.get('window');
const backgroundImage = require('../assets/images/bg_login_2.png');

export default function Profile() {

    const [selectedImage, setSelectedImage] = useState<any>(require('../assets/images/newUserBgPic.png'));
    const [user, setUser] = useState<any>();
    const [userName, setUserName] = useState<string>("");
    const { authInfos, userData, logout, updateUserData } = useUser();

    const setUserData = async () => {
        const jsonUser = await AsyncStorage.getItem('currentUser');
        setUser(jsonUser != null ? JSON.parse(jsonUser) : null);
        console.log("ahah")
        console.log(user);
    }

    const pickImageAsync = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 1,
        });
    
        if (!result.canceled && userData) {
            console.log(result.assets[0]," JJEJEJJEJEJJEJEJJEJE");
            let image = await Asset.loadAsync(result.assets[0].uri);
            console.log(image);
            setSelectedImage(image);

            await uploadPicture(image[0].localUri, userData.uid+"/"+userData.uid+"-profile-pic").then(async (res) => {
                console.log(res.Location, userData.name,userData.phone,userData.uid)
                await updateUserData({
                    picture: `${res.Location}?t=${Date.now()}`,
                }).then(() => {
                    console.log( "User data updated");
                })
            })
        }
    };

    useEffect(() => {
        setUserData();
    }, []);

    const onSignOut = async () => {
        await logout();
        await AsyncStorage.setItem("loggedIn", "false");
        router.replace("/animation");
        console.log("Sign out");
    }

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
              <View style={{alignSelf: 'flex-start',left:20,top:20}}>  
                <BackButton onPress={() => {router.replace("/home")}}  />
              </View>
  
              <View style={styles.titleContainer}>
                  <Pressable onPress={pickImageAsync}>
                      <Image source={{uri:userData?.picture}} style={{width: 150, height: 150, alignSelf: 'center', borderRadius:100}} />
                      <View style={{alignSelf: 'flex-end',top:-37,left:-5}}>  
                        <BackButton onPress={pickImageAsync} icon="pencil-outline" start={{x:0,y:0}} end={{x:0,y:0}}/>
                    </View>
                  </Pressable>
              </View>
  
              <View style={styles.formContainer}>
                  <CustomTextInput label="Username" onChangeText={(text:any) => setUserName(text)} />
  
                  <LightButton title="Sign out" onPress={() => onSignOut()} />
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
        height: 270,
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
        top: -100,
        display: 'flex',
        gap: 20,
    },
    text: {
        color: '#fff',
        fontSize: 16,
        margin: 0,
        padding:0
    }
});
