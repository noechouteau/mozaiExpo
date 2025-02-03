import CustomTextInput from "@/components/CustomTextInput";
import LightButton from "@/components/buttons/LightButton";
import { useFonts } from "expo-font";
import { SetStateAction, PropsWithChildren, useEffect, useRef, useState } from "react";
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
import BackButton from "@/components/buttons/BackButton";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

type Props = PropsWithChildren<{
  isVisible: boolean;
  onClose: () => void;
  user: any;
}>;

export default function Animation({onClose}: Props) {
  const opacity = useSharedValue(0);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [confirm, setConfirm]: any = useState(null);
  const [code, setCode] = useState("");
  const [gradientStart, setGradientStart] = useState({ x: 0.7, y: 0 });
  const [gradientEnd, setGradientEnd] = useState({ x: 0.3, y: 1 });
  const [dynamicBorderRadius, setDynamicBorderRadius] = useState(24); // Default border radius
  const [subscription, setSubscription]: any = useState(null);
  const router = useRouter();
  const pathname = usePathname();
  const [initializing, setInitializing] = useState(true);
  const { authInfos, userData, updateUserData } = useUser();
  const [errorDisplayed, setErrorDisplayed] = useState<boolean>(false);

  const slowFactor = 0.0001;

  opacity.value = withTiming(1, {
    duration: 10 * slowFactor, // Durée multipliée par le facteur
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

  const gradientStartX = useSharedValue(0.1);
  const gradientEndY = useSharedValue(0.1);
  // gradientStartY.value = withTiming(1, {
  //   duration: 1500 * slowFactor,
  //   easing: Easing.inOut(Easing.cubic),
  // });
  
  useEffect(() => {
    const slowFactor = 0.1; // Réduit l'impact des mouvements
    const smoothingFactor = 0.5; // Lisser les transitions
  
    let currentStartX = 0.9; 
    let currentEndY = 0.8;
  
    const subscribe = Gyroscope.addListener(({ x, y }) => {
      // Calcul des nouvelles valeurs avec le slowFactor
      const targetStartX = Math.max(0, Math.min(1, 0.5 + x * slowFactor));
      const targetEndY = Math.max(0, Math.min(1, 0.5 + y * slowFactor));
  
      // Interpolation douce pour lisser le mouvement
      currentStartX += (targetStartX - currentStartX) * smoothingFactor;
      currentEndY += (targetEndY - currentEndY) * smoothingFactor;
  
      // Mise à jour du gradient
      setGradientStart({ x: currentStartX, y: 0 });
      setGradientEnd({ x: 1.0, y: currentEndY });
    });
  
    Gyroscope.setUpdateInterval(10); // Réduire la fréquence à 10 updates/sec
  
    return () => {
      subscribe?.remove();
    };
  }, []);

  async function signInWithPhoneNumber(phoneNumber: any) {
    try {
      console.log(userData,"userdataa")
      const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
      setConfirm(confirmation);
    } catch (error) {
      console.error("Error signing in:", error);
      alert("Failed to send OTP. Please check the phone number.");
    }
  }

  async function confirmCode() {
    console.log("Confirmation code entered:", code);
    await AsyncStorage.setItem("mustLoad", "true");
    try {
      console.log(authInfos);
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
            style={[styles.cardWrapper2, { borderRadius: dynamicBorderRadius }]}
          >
            <LinearGradient
              colors={["#000000", "#DAEDBD", "#000000"]}
              style={[styles.cardBorder, { borderRadius: 24 }]}
              start={gradientStart}
              end={gradientEnd}
            >
              <View
                style={[styles.card2, { borderRadius: 24 }]}
              >
                <View style={{alignSelf: 'flex-start', marginBottom: 30}}>
                        <BackButton onPress={()=>{
                          setErrorDisplayed(false);
                        setConfirm(null);}} > 
                        </BackButton>
                </View>
            <CustomTextInput
              label="Log in"
              placeholder="XXXXXX"
              value={code}
              onChangeText={(text: SetStateAction<string>) => setCode(text)}
              style={{ marginBottom: 17 }}
            />
            <LightButton title="Log in" onPress={() => confirmCode()} />
          </View>
            </LinearGradient>
          </View>
        </Animated.View>
      </View>
      </ImageBackground>
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
  cardWrapper2: {
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
  card2: {
    padding: 36,
    paddingTop: 36,
    backgroundColor: "#000000",
    alignItems: "center",
    width: screenWidth / 1.15,
    position: "relative",
    height: 270,
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

