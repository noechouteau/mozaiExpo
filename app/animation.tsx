import CustomTextInput from "@/components/CustomTextInput";
import LightButton from "@/components/buttons/LightButton";
import { useFonts } from "expo-font";
import { SetStateAction, useEffect, useRef, useState } from "react";
import {
  View,
  Button,
  Image,
  Text,
  Dimensions,
  TextInput,
  Pressable,
  StyleSheet,
  ImageBackground,
} from "react-native";
import Animated, {
  useSharedValue,
  withSpring,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useVideoPlayer, VideoSource, VideoView } from "expo-video";
import auth from "@react-native-firebase/auth";
import { Redirect, usePathname, useRouter } from "expo-router";
import GraytButton from "@/components/buttons/GrayButton";
import AsyncStorage from "@react-native-async-storage/async-storage";
import JoinModal from "@/components/JoinModal";
import { Gyroscope } from "expo-sensors";
import { LinearGradient } from "expo-linear-gradient";
import NewUserModal from "@/components/NewUserModal";
import { useUser } from "@/context/UsersContext";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function Animation() {
  const opacity = useSharedValue(0);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [confirm, setConfirm]: any = useState(null);
  const [code, setCode] = useState("");
  const [gradientStart, setGradientStart] = useState({ x: 0.2, y: 0 });
  const [gradientEnd, setGradientEnd] = useState({ x: 1.2, y: 1 });
  const [dynamicBorderRadius, setDynamicBorderRadius] = useState(24); // Default border radius
  const [subscription, setSubscription]: any = useState(null);
  const router = useRouter();
  const pathname = usePathname();
  const [initializing, setInitializing] = useState(true);
  const { authInfos, userData, updateUserData } = useUser();

  const gradientStartX = useSharedValue(0.2);
  const gradientEndY = useSharedValue(1);

  opacity.value = withTiming(1, {
    duration: 1000,
    easing: Easing.inOut(Easing.quad),
  });
  const [isJoinModalVisible, setJoinModalVisible] = useState<boolean>(false);
  const [isNewUserModalVisible, setNewUserModalVisible] =
    useState<boolean>(true);

  const [loaded, error] = useFonts({
    SFPRO: require("../assets/fonts/SFPRODISPLAYMEDIUM.otf"),
    SFPROBOLD: require("../assets/fonts/SFPRODISPLAYBOLD.otf"),
  });

  useEffect(() => {
    if (pathname == "/firebaseauth/link") router.back();
  }, [pathname]);

  // Handle user state changes
  async function onAuthStateChanged(user: any) {
    const activeUser = await AsyncStorage.getItem("loggedIn");
    console.log(activeUser);
    if (activeUser && activeUser != "false" && activeUser != "") {
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

//   useEffect(() => {
//     // Abonnement au gyroscope pour obtenir l'orientation de l'appareil
//     const subscribe = Gyroscope.addListener((data) => {
//       const { x, y } = data;

//       const attenuationFactor = 0.001; 

//       // On mappe les valeurs de gyroscope pour ajuster les points du gradient
//       const newStartX = Math.max(0, Math.min(1, 0.5 +  x * attenuationFactor)); // Clamp entre 0 et 1
//       const newEndY = Math.max(0, Math.min(1, 0.5 + y * attenuationFactor)); // Clamp entre 0 et 1

//       // Mise à jour des coordonnées de départ et de fin du gradient
//       setGradientStart({ x: newStartX, y: 0 });
//       setGradientEnd({ x: 0.5, y: newEndY });
//     });

//     setSubscription(subscribe);

//     return () => {
//       // Nettoyage lors du démontage du composant
//       subscription?.remove();
//     };
//   }, []);

  async function signInWithPhoneNumber(phoneNumber: any) {
    try {
      const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
      setConfirm(confirmation);
    } catch (error) {
      console.error("Error signing in:", error);
      alert("Failed to send OTP. Please check the phone number.");
    }
  }

  async function confirmCode() {
    console.log("Confirmation code entered:", code);
    try {
      // console.log(userData);
      await AsyncStorage.setItem("activePhone", phoneNumber);
      if (authInfos) {
        await AsyncStorage.setItem("activeUser", authInfos.uid);
      }

      await confirm.confirm(code);
      router.replace("/home");
    } catch (error) {
      console.log("Invalid code.");
    }
  }

  if (!confirm) {
    return (
      <ImageBackground
      source={require('../assets/images/greenTheme/bg_login_2.png')}
      resizeMode="cover"
      style={styles.backgroundImage}
      >
      <View style={styles.container}>
        <View>
          <JoinModal
            isVisible={isJoinModalVisible}
            onClose={() => setJoinModalVisible(false)}
            user={"guest"}
          />
        </View>
        <Image
          source={require("../assets/images/login/circle.png")}
          style={styles.logoOutside}
        />
        <Animated.View
          style={{
            width: "100%",
            opacity: opacity,
            height: "100%",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {/* Login card */}
          <View
            style={[styles.cardWrapper, { borderRadius: dynamicBorderRadius }]}
          >
            <LinearGradient
              colors={["#000000", "#DAEDBD", "#000000"]}
              style={[styles.cardBorder, { borderRadius: 24 }]}
              start={gradientStart}
              end={gradientEnd}
            >
              <View
                style={[styles.card, { borderRadius: 24 }]}
              >
                <CustomTextInput
                  label="Log in"
                  placeholder="Phone Number"
                  placeholderTextColor="#CBCBCB"
                  value={phoneNumber}
                  onChangeText={(text: SetStateAction<string>) =>
                    setPhoneNumber(text)
                  }
                  style={{ marginBottom: 17 }}
                />
                <LightButton
                  onPress={() => signInWithPhoneNumber(phoneNumber)}
                  title="Log in"
                />
                <GraytButton
                  onPress={() => setJoinModalVisible(true)}
                  title="Continue as guest"
                  style={{ marginTop: 17 }}
                />
              </View>
            </LinearGradient>
          </View>
        </Animated.View>
      </View>
      </ImageBackground>
    );
  } else {
    return (
      <View style={styles.container}>
        <Animated.View
          style={{
            width: "100%",
            opacity: opacity,
            height: "100%",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {/* Confirmation screen */}
          <Image
            source={require("../assets/images/mozailogo2.png")}
            style={{ width: screenWidth, height: screenHeight / 2 }}
          />
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              width: screenWidth,
              gap: 17,
              height: screenHeight / 2,
            }}
          >
            <CustomTextInput
              label="Log in"
              value={code}
              onChangeText={(text: SetStateAction<string>) => setCode(text)}
              style={{ marginBottom: 17 }}
            />
            <LightButton title="Confirm Code" onPress={() => confirmCode()} />
            <GraytButton
              onPress={() => setConfirm(null)}
              title="Take me back"
              style={{ marginTop: 17 }}
            />
          </View>
        </Animated.View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
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
  backgroundImage: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 

  },
  cardWrapper: {
    overflow: "hidden",
    position: "absolute",
    top: screenHeight / 2 -130,

  },
  cardBorder: {
    padding: 2,
    display: 'flex',
    borderRadius: 24,
  },
  card: {
    padding: 36,
    paddingTop: 100,
    backgroundColor: "#000000",
    alignItems: "center",
    width: screenWidth / 1.15,
    position: "relative",
    height: 340,
  },
  logoOutside: {
    width: 190,
    height: 170,
    position: "absolute",
    top: screenHeight / 2 - 210,
    left: (screenWidth - 190) / 2,
    zIndex: 10,
    resizeMode: "contain",
    // overflow: "visible",
  },
  input: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#FFFFFF",
    borderRadius: 8,
    width: "100%",
    padding: 10,
    color: "#FFFFFF",
    }
    });
