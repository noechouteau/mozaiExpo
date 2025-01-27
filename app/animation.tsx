import CustomTextInput from '@/components/CustomTextInput';
import LightButton from '@/components/buttons/LightButton';
import { useFonts } from 'expo-font';
import { SetStateAction, useEffect, useRef, useState } from 'react';
import { View, Button,Image,Text, Dimensions, TextInput, Pressable,StyleSheet } from 'react-native';
import Animated, { useSharedValue, withSpring,useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { useVideoPlayer, VideoSource, VideoView } from 'expo-video';
import auth from '@react-native-firebase/auth';
import { Redirect, usePathname, useRouter } from 'expo-router';
import GraytButton from '@/components/buttons/GrayButton';
import AsyncStorage from '@react-native-async-storage/async-storage';
import JoinModal from '@/components/JoinModal';
import { Gyroscope } from 'expo-sensors';
import { LinearGradient } from 'expo-linear-gradient';

const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

export default function Animation() {
    const opacity = useSharedValue(0);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [confirm, setConfirm]: any = useState(null);
    const [code, setCode] = useState('');
    const [gradientStart, setGradientStart] = useState({ x: 0.5, y: 0 });
    const [gradientEnd, setGradientEnd] = useState({ x: 0.5, y: 1 });
    const [dynamicBorderRadius, setDynamicBorderRadius] = useState(12); // Default border radius
    const [subscription, setSubscription]: any = useState(null);
    const router = useRouter();
    const pathname = usePathname();
    const [initializing, setInitializing] = useState(true);

    opacity.value = withTiming(1, {duration: 1000, easing: Easing.inOut(Easing.quad)});
    const [isJoinModalVisible, setJoinModalVisible] = useState<boolean>(false);

    const [loaded, error] = useFonts({
        'SFPRO': require('../assets/fonts/SFPRODISPLAYMEDIUM.otf'),
        "SFPROBOLD": require('../assets/fonts/SFPRODISPLAYBOLD.otf'),
    });

    useEffect(() => {
      if(pathname=="/firebaseauth/link") router.back();
    }, [pathname]);
    
    // Handle user state changes
    async function onAuthStateChanged(user:any) {
      const activeUser = await AsyncStorage.getItem("loggedIn");
      console.log(activeUser);
      if(activeUser && activeUser!="false" && activeUser!=""){
        router.replace("/home");
      }
      
      if (initializing) setInitializing(false);
    }
    
    useEffect(() => {
      // Start listening to the gyroscope
    //   const subscribe = Gyroscope.addListener((data) => {
    //     const { x, y } = data;

    //     // Map gyroscope values to gradient coordinates and dynamic border radius
    //     const newStartX = Math.max(0, Math.min(1, 0.5 + x / 2)); // Clamp between 0 and 1
    //     const newEndY = Math.max(0, Math.min(1, 0.5 + y / 2));
    //     const newBorderRadius = Math.max(8, Math.min(30, 12 + y * 10)); // Adjust radius dynamically

    //     setGradientStart({ x: newStartX, y: 0 });
    //     setGradientEnd({ x: 0.5, y: newEndY });
    //     setDynamicBorderRadius(newBorderRadius);
    //   });

    //   setSubscription(subscribe);

      // Handle user state changes
      const subscriber = auth().onAuthStateChanged(onAuthStateChanged);

      // Cleanup on unmount
      return () => {
        subscription?.remove();
        subscriber && subscriber();
      };
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
      console.log('Confirmation code entered:', code);
      try {
      console.log(confirm);
        await confirm.confirm(code);
        router.replace("/home");
    } catch (error) {
        console.log('Invalid code.');
    }
    }

      
    if (!confirm) {
      return (
          <View style={styles.container}>
            <View><JoinModal isVisible={isJoinModalVisible} onClose={() => setJoinModalVisible(false)} user={"guest"} /></View>
              <Image
                  source={require('../assets/images/login/bglogin.jpg')}
                  style={styles.backgroundImage}
              />
              <Image
                  source={require('../assets/images/login/circle.png')}
                  style={styles.logoOutside}
              />
              <Animated.View
                  style={{
                      width: '100%',
                      opacity: opacity,
                      height: '100%',
                      justifyContent: 'center',
                      alignItems: 'center',
                  }}
              >
                  {/* Login card */}
                  <View style={[styles.cardWrapper, { borderRadius: dynamicBorderRadius }]}>
                      <LinearGradient
                          colors={['#000000', '#DAEDBD', '#000000']}
                          style={[styles.cardBorder, { borderRadius: dynamicBorderRadius }]}
                          start={gradientStart}
                          end={gradientEnd}
                      >
                          <View style={[styles.card, { borderRadius: dynamicBorderRadius }]}>
                              <CustomTextInput
                                  placeholder="Phone number"
                                  placeholderTextColor="#CBCBCB"
                                  value={phoneNumber}
                                  onChangeText={(text: SetStateAction<string>) => setPhoneNumber(text)}
                              />
                              <LightButton onPress={() => signInWithPhoneNumber(phoneNumber)} title="Log in" />
                              <GraytButton onPress={() => setJoinModalVisible(true)} title="Continue as guest" />
                          </View>
                      </LinearGradient>
                  </View>
              </Animated.View>
          </View>
      );
  } else {
      return (
          <View style={styles.container}>
              <Animated.View
                  style={{
                      width: '100%',
                      opacity: opacity,
                      height: '100%',
                      justifyContent: 'center',
                      alignItems: 'center',
                  }}
              >
                  {/* Confirmation screen */}
                  <Image
                      source={require('../assets/images/mozailogo2.png')}
                      style={{ width: screenWidth, height: screenHeight / 2 }}
                  />
                  <View
                      style={{
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: screenWidth,
                          gap: 17,
                          height: screenHeight / 2,
                      }}
                  >
                      <CustomTextInput
                          label="Verification code"
                          value={code}
                          onChangeText={(text: SetStateAction<string>) => setCode(text)}
                      />
                      <LightButton title="Confirm Code" onPress={() => confirmCode()} />
                      <GraytButton onPress={() => setConfirm(null)} title="Take me back" />
                  </View>
              </Animated.View>
          </View>
      );
  }
}

const styles = StyleSheet.create({
  container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
  },
  backgroundImage: {
      width: screenWidth,
      height: screenHeight,
      position: 'absolute',
      resizeMode: 'cover',
      zIndex: -1,
  },
  cardWrapper: {
      overflow: 'hidden',
  },
  cardBorder: {
      padding: 2,
  },
  card: {
      padding: 30,
      backgroundColor: '#000000',
      alignItems: 'center',
      width: screenWidth / 1.15,
      position: 'relative',
  },
  logoOutside: {
      width: 190,
      height: 190,
      position: 'absolute',
      top: 180,
      left: (screenWidth - 190) / 2,
      zIndex: 10,
  },
  input: {
      marginTop: 20,
      borderWidth: 1,
      borderColor: '#FFFFFF',
      borderRadius: 8,
      width: '100%',
      padding: 10,
      color: '#FFFFFF',
  },
});
