import CustomTextInput from '@/components/CustomTextInput';
import LightButton from '@/components/LightButton';
import { useFonts } from 'expo-font';
import { SetStateAction, useEffect, useRef, useState } from 'react';
import { View, Button,Image,Text, Dimensions, TextInput, Pressable,StyleSheet } from 'react-native';
import Animated, { useSharedValue, withSpring,useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { useVideoPlayer, VideoSource, VideoView } from 'expo-video';
import auth from '@react-native-firebase/auth';
import { Redirect, usePathname, useRouter } from 'expo-router';
import GraytButton from '@/components/GrayButton';
import AsyncStorage from '@react-native-async-storage/async-storage';

const {width: screenWidth, height: screenHeight} = Dimensions.get('window');
const videoBG = require('../assets/noir_BG.mp4');

export default function Animation() {
    const opacity = useSharedValue(0);
    let [loginButtonBG, setLoginButtonBG] = useState("#fbfbfc");
    const [phoneNumber, setPhoneNumber] = useState('');
    // If null, no SMS has been sent
    const [confirm, setConfirm]:any = useState(null);
    // verification code (OTP - One-Time-Passcode)
    const [code, setCode] = useState('');

    const [initializing, setInitializing] = useState(true);
    const [user, setUser]:any = useState();
    const pathname = usePathname();
    const router = useRouter();

    opacity.value = withTiming(1, {duration: 1000, easing: Easing.inOut(Easing.quad)});
      
    const [loaded, error] = useFonts({
        'SFPRO': require('../assets/fonts/SFPRODISPLAYMEDIUM.otf'),
        "SFPROBOLD": require('../assets/fonts/SFPRODISPLAYBOLD.otf'),
    });

    useEffect(() => {
      if(pathname=="/firebaseauth/link") router.back();
    }, [pathname]);
    
    // Handle user state changes
    function onAuthStateChanged(user:any) {
      
      console.log(user);
      if (initializing) setInitializing(false);
    }
    
    useEffect(() => {
      const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
      return subscriber; // unsubscribe on unmount
    }, []);


    async function signInWithPhoneNumber(phoneNumber:any) {
        try {
          const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
          setConfirm(confirmation);
        } catch (error) {
          console.error("Error signing in:", error);
          alert("Failed to send OTP. Please check the phone number.");
        }
      }

    async function confirmCode() {
      console.log("ere")
    try {
      console.log(confirm);
        await confirm.confirm(code);
        router.replace("/home");
    } catch (error) {
        console.log('Invalid code.');
    }
    }

      

    const player = useVideoPlayer(videoBG, player => {
        player.loop = true;
        player.play();
      });
      
      if(!confirm){
        return ( <View style={styles.container}>
            <Animated.View
              style={{
                width:"100%",
                opacity: opacity,
                height: "100%",
                justifyContent: 'center',
                display: 'flex',
                alignItems: 'center',
                
              }}
            >
                <View style={{zIndex:-2,width:"100%",height:"100%",position:"absolute", backgroundColor:"#00000099"}}></View>
                <VideoView player={player} allowsFullscreen style={{zIndex:-3,width:"100%",height:"100%",position:"absolute"}} />
                
                <Image source={require('../assets/images/mozailogo2.png')} style={{width: screenWidth/1.,height:screenHeight/2}}/>
                <View style={{display: 'flex',alignItems: 'center',justifyContent: 'center',width: screenWidth, gap: 17, height: screenHeight/2}}>
                    <CustomTextInput label="Phone number" placeholder="XX XX XX XX XX" value={phoneNumber} onChangeText={(text: SetStateAction<string>) => setPhoneNumber(text)} />
        
                    <View style={{display: 'flex',alignItems: 'center',bottom:"-11%",width: screenWidth, gap: 17}}>
                        <LightButton onPress={() => signInWithPhoneNumber(phoneNumber)} title="Log in"/>
                        <GraytButton onPress={() => router.replace("/home")} title="Continue as guest"/>
                    </View>
                </View>
            </Animated.View>
            
            </View>
          );
      } else {
        return(<View style={styles.container}>
            <Animated.View
              style={{
                width:"100%",
                opacity: opacity,
                height: "100%",
                justifyContent: 'center',
                display: 'flex',
                alignItems: 'center',
                
              }}
            >
                {/* <VideoView player={player} allowsFullscreen style={{zIndex:10,width:"100%",height:"100%"}} /> */}
                <Image source={require('../assets/images/mozailogo2.png')} style={{width: screenWidth/1.,height:screenHeight/2}}/>
                <View style={{display: 'flex',alignItems: 'center',justifyContent: 'center',width: screenWidth, gap: 17, height: screenHeight/2}}>
                    <CustomTextInput label="Verification code" value={code} onChangeText={(text: SetStateAction<string>) => setCode(text)} />
                    <LightButton title="Confirm Code" onPress={() => confirmCode()} />
                    <GraytButton onPress={() => setConfirm(null)} title="Take me back"/>
                </View>
            </Animated.View>
            
            </View>

        )
      }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
      },
      text: {
        color: '#fff',
        // fontWeight: 'bold',
        fontFamily: 'SFPROBOLD',
        width: screenWidth/1.3,
        textAlign: 'left',
        fontSize: 17,
      },
      input: {
        borderRadius: 12,
        borderColor: "#fff",
        borderWidth: 1,
        fontSize: 15,
        color: "#fff",
        padding: 15,
        width: screenWidth/1.3,

      },
});

