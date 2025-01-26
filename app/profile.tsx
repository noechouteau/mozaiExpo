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
import { LinearGradient } from 'expo-linear-gradient';

const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

const blue = require('../assets/images/blueTheme/bg_login_2.png');
const green = require('../assets/images/greenTheme/bg_login_2.png');
const red = require('../assets/images/redTheme/bg_login_2.png');
const orange = require('../assets/images/orangeTheme/bg_login_2.png');

export default function Profile() {

    const [gradientStart, setGradientStart] = useState({ x: 0.2, y: 0 });
    const [gradientEnd, setGradientEnd] = useState({ x: 1.2, y: 1 });
    const [userName, setUserName] = useState<string>("");
    const {selectedTheme, changeTheme} = useUser();
    const {userData, logout, updateUserData } = useUser();
    const [backgroundImage, setBackgroundImage] = useState<any>();
    const [bgColor, setBgColor] = useState<string>("");

    const setUserData = async () => {
        if(userData){
            setUserName(userData.name);
        }

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

    useEffect(() => {
        console.log("testingshit");
        if (selectedTheme === 'greenTheme') {
            setBackgroundImage(green);
            setBgColor("#DAEDBD");
        } else if (selectedTheme === 'blueTheme') {
            setBgColor("#1100ff");
            setBackgroundImage(blue);
        } else if (selectedTheme === 'redTheme') {
            setBackgroundImage(red);
            setBgColor("#F0265D");
            // } else if (selectedTheme === 'purpleTheme') {
        //     backgroundImage = require('../assets/images/purpleTheme/bg_login_2.png');
        } else {
            setBackgroundImage(orange);
            setBgColor("#F94D20");
        }
    }, [selectedTheme]);


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
        <LinearGradient
            colors={['#000000', bgColor, '#000000']}
            style={[styles.cardBorder, { borderRadius: 24 }]}
            start={gradientStart}
            end={gradientEnd}>
          <View style={styles.modalContent}>
              <View style={{alignSelf: 'flex-start',left:20,top:20}}>  
                <BackButton onPress={() => {updateUserData({name:userName});
                    router.replace("/home")}}  />
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
                <CustomTextInput label="Username" value={userName} onChangeText={(text:any) => setUserName(text)} style={{width:screenWidth/1.55}}/>
                  
                    <View style={{display:"flex",gap:10}}>
                        <Text style={styles.text}>Theme</Text>
                        <View style={{display:"flex",flexDirection:"row",gap:10,width:200,height:25}}>

                            <Pressable onPress={() => changeTheme("greenTheme")}>
                            <View style={[{width:25,height:25,backgroundColor:"#bdda92",borderRadius:50}, selectedTheme=="greenTheme" ? {borderWidth:1,borderColor:"#ffffffff"}:{}]}></View>
                            </Pressable>

                            <Pressable onPress={() => changeTheme("redTheme")}>
                            <View style={[{width:25,height:25,backgroundColor:"#F0265D",borderRadius:50}, selectedTheme=="redTheme" ? {borderWidth:1,borderColor:"#ffffffff"}:{}]}></View>
                            </Pressable>

                            <Pressable onPress={() => changeTheme("blueTheme")}>
                            <View style={[{width:25,height:25,backgroundColor:"#1100ff",borderRadius:50}, selectedTheme=="blueTheme" ? {borderWidth:1,borderColor:"#ffffffff"}:{}]}></View>
                            </Pressable>

                            <Pressable onPress={() => changeTheme("orangeTheme")}>
                                <View style={[{width:25,height:25,backgroundColor:"#F94D20",borderRadius:50}, selectedTheme=="orangeTheme" ? {borderWidth:1,borderColor:"#ffffffff"}:{}]}></View>
                            </Pressable>
                        </View>
                    </View>

                  <LightButton title="Sign out" onPress={() => onSignOut()} />
              </View>
          </View>
        </LinearGradient>
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
    cardBorder: {
        padding: 3,
        height: 356,
        width: "85%",
        display: 'flex',
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
        top:-80
    },
    formContainer: {
        top: -100,
        display: 'flex',
        gap: 20,
    },
    text: {
        color: '#fff',
        // fontWeight: 'bold',
        fontFamily: 'SFPROBOLD',
        textAlign: 'left',
        fontSize: 16,
    }
});
