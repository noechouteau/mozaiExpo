import { useUser } from "@/context/UsersContext";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, ImageBackground, Pressable } from "react-native";
import { StyleSheet, Text } from "react-native";


const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

export default function LightButton(props:any) {
    const backgroundColor = useRef(new Animated.Value(0)).current; // Animated value for the color
    const [gradientStart, setGradientStart] = useState({ x: 0, y: 0 });
    const [gradientEnd, setGradientEnd] = useState({ x: 2.5, y: 2 });
    const [radialBg, setRadialBg] = useState(require('../../assets/images/greenTheme/radialBg.png'));
    const { selectedTheme } = useUser();

    useEffect(() => {
      console.log(radialBg);
      if (selectedTheme === 'greenTheme') {
        setRadialBg(require('../../assets/images/greenTheme/radialBg.png'));
      } else if (selectedTheme === 'blueTheme') {
        setRadialBg(require('../../assets/images/blueTheme/radialBg.png'));
      } else if (selectedTheme === 'redTheme') {
        setRadialBg(require('../../assets/images/redTheme/radialBg.png'));
      // } else if (selectedTheme === 'purpleTheme') {
      //   setBgColor("#761DA7");
      } else {
        setRadialBg(require('../../assets/images/orangeTheme/radialBg.png'));
      }
    }, [selectedTheme]);

    const handlePressIn = () => {
        Animated.timing(backgroundColor, {
            toValue: 1, // End value for pressed state
            duration: 200, // Transition duration in milliseconds
            useNativeDriver: false, // Color interpolation needs false
        }).start();
    };

    const handlePressOut = () => {
        Animated.timing(backgroundColor, {
            toValue: 0, // Back to initial state
            duration: 200, // Transition duration
            useNativeDriver: false,
        }).start();
    };

    // Interpolate the backgroundColor value
    const interpolatedBG = backgroundColor.interpolate({
        inputRange: [0, 1],
        outputRange: ["#000000", "#bbbbbb"], // Replace with your desired colors
    });

    return (
        <Pressable
            onPress={props.onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={({ pressed }) => [
                { backgroundColor: pressed ? "#ccc" : "transparent",
                borderRadius: 12,
                 },
            ]}
        >
            <ImageBackground source={radialBg} imageStyle={{ borderRadius: 12 }} resizeMode="cover">
                <Animated.View style={[styles.loginButton, props.style]}>
                    {/* <LinearGradient
                        colors={["#0d0d0d","#DAEDBD"]}
                        style={styles.loginButton}
                        start={gradientStart}
                        end={gradientEnd}
                    > */}
                        <Text style={styles.buttonText}>{props.title}</Text>
                    {/* </LinearGradient> */}
                </Animated.View>
            </ImageBackground>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    loginButton: {
        borderRadius: 14,
        fontSize: 16,
        borderColor: "#868686",
        borderWidth: 1,
        padding: 13,
        transitionDuration: "0.4s",
        transitionProperty: "backgroundColor",
        width: screenWidth / 1.38,
        textAlign: "center",
      },
    buttonText: {
        textAlign: "center",
        fontFamily: "Monrope",
        fontSize: 16,
        color: "#ffffff",
      },
});