import { useUser } from "@/context/UsersContext";
import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, Pressable, View } from "react-native";
import { StyleSheet, Text } from "react-native";
import { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";


const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

export default function FRoundButton(props:any) {
      const [gradientStart, setGradientStart] = useState({ x: 0.3, y: 0 });
      const [gradientEnd, setGradientEnd] = useState({ x: 4.6, y: 2 });
      const [bgColor, setBgColor] = useState("#DAEDBD");

      const { selectedTheme } = useUser();
    useEffect(() => {
        if (selectedTheme === 'greenTheme') {
          setBgColor("#DAEDBD");
        } else if (selectedTheme === 'blueTheme') {
          setBgColor("#1100ff");
        } else if (selectedTheme === 'redTheme') {
          setBgColor("#F0265D");
        } else if (selectedTheme === 'beigeTheme') {
          setBgColor("#c19887");
        } else {
          setBgColor("#F94D20");
        }
      }, [selectedTheme]);
    const scaleAnim = useSharedValue(1); // Shared value for scale

    // Animated style for scaling
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scaleAnim.value }],
    }));

    const handlePressIn = () => {
      scaleAnim.value = withTiming(0.8, { duration: 100 }); // Scale down
    };

    const handlePressOut = () => {
      scaleAnim.value = withTiming(1, { duration: 100 }); // Scale back to normal

    };




    return (
        <Pressable
            onPress={props.onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={({ pressed }) => [
                {
                borderRadius: 50,
                 },
            ]}
        >
        <Animated.View style={[animatedStyle]}>
            <LinearGradient
            colors={["#000000", bgColor, "#000000"]}
            style={[styles.roundButton, props.style]}
            start={gradientStart}
            end={gradientEnd}
            >
            <Animated.View style={[animatedStyle,{ flex: 1, justifyContent: "center", alignItems: "center" }]}>
                { props.children?
                props.children
                :
                <Ionicons name={props.icon? props.icon :"add"} size={props.size? props.size :45} color="white" style={{width:props.size?props.size:45,height: props.size?props.size:45}} />
                }
            </Animated.View>
            </LinearGradient>
        </Animated.View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    roundButton: {
        position: "relative",
        backgroundColor:"#0e0e7e",
        borderRadius: 50,
        borderWidth: 1,
        borderColor: "#8D8E8C",
        fontSize: 20,
        transitionDuration: "0.4s",
        transitionProperty: "backgroundColor",
        width: 60,
        height: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        bottom: 0,
        zIndex: 1,
    },
});
