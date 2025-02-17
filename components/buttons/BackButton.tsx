import { useUser } from "@/context/UsersContext";
import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import { Dimensions, Pressable, View } from "react-native";
import { StyleSheet } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function BackButton(props: any) {
  const [gradientStart, setGradientStart] = useState(props.start? props.start :{ x: 0.5, y: 0 });
  const [gradientEnd, setGradientEnd] = useState(props.end? props.end :{ x: 4.6, y: 2 });
  const scaleAnim = useSharedValue(1); // Shared value for scale
  const [bgColor, setBgColor] = useState("#DAEDBD");
  const { selectedTheme } = useUser();

  useEffect(() => {
    console.log(selectedTheme);
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

  // Animated style for scaling
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnim.value }],
  }));

  const handlePressIn = () => {
    scaleAnim.value = withTiming(0.8, { duration: 100 }); // Scale down
  };

  const handlePressOut = () => {
    scaleAnim.value = withTiming(1, { duration: 100 }); // Scale back to normal
    props.onPress();
  };

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={({ pressed }) => [
        {
          borderRadius: 90,
          width: 30,
          height:30,
        },
      ]}
    >
      <Animated.View style={[animatedStyle, { width: 40, }]}>
        <LinearGradient
          colors={["#000000", bgColor, "#000000"]}
          style={styles.backButton}
          start={gradientStart}
          end={gradientEnd}
        >
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            { !props.icon ?
                <Ionicons name="chevron-back-outline" size={15} color="white" /> :
                <Ionicons name={props.icon} size={15} color="white" />
            }
          </View>
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backButton: {
    borderRadius: 90,
    width: 30,
    height: 30,
    textAlign: "center",
    borderWidth: 1,
    borderColor: "#ffffff50",

  },
  buttonText: {
    textAlign: "center",
    fontFamily: "SFPRO",
    margin: 0,
    fontSize: 18,
    color: "#ffffff",
  },
});
