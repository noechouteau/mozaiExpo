import { LinearGradient } from "expo-linear-gradient";
import { useRef, useState } from "react";
import { Animated, Dimensions, Pressable } from "react-native";
import { StyleSheet, Text } from "react-native";


const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

export default function LightButton(props:any) {
    const backgroundColor = useRef(new Animated.Value(0)).current; // Animated value for the color
    const [gradientStart, setGradientStart] = useState({ x: 0, y: 0 });
    const [gradientEnd, setGradientEnd] = useState({ x: 2.5, y: 2 });
  
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
            <Animated.View >
                <LinearGradient
                    colors={["#0d0d0d","#DAEDBD"]}
                    style={styles.loginButton}
                    start={gradientStart}
                    end={gradientEnd}
                >
                    <Text style={styles.buttonText}>{props.title}</Text>
                </LinearGradient>
            </Animated.View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    loginButton: {
        borderRadius: 12,
        fontSize: 16,
        borderColor: "#b3b3b3ff",
        borderWidth: 1,
        padding: 10,
        transitionDuration: "0.4s",
        transitionProperty: "backgroundColor",
        width: screenWidth / 1.35,
        textAlign: "center",
      },
    buttonText: {
        textAlign: "center",
        fontFamily: "SFPRO",
        fontSize: 16,
        color: "#ffffff",
      },
});