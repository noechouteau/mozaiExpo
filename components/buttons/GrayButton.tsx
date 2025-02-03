import { useRef } from "react";
import { Animated, Dimensions, Pressable } from "react-native";
import { StyleSheet, Text } from "react-native";


const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

export default function GraytButton(props:any) {
    const backgroundColor = useRef(new Animated.Value(0)).current; // Animated value for the color

    const handlePressIn = () => {
        Animated.timing(backgroundColor, {
            toValue: 1, // End value for pressed state
            duration: 100, // Transition duration in milliseconds
            useNativeDriver: false, // Color interpolation needs false
        }).start();
    };

    const handlePressOut = () => {
        Animated.timing(backgroundColor, {
            toValue: 0, // Back to initial state
            duration: 100, // Transition duration
            useNativeDriver: false,
        }).start();
    };

    // Interpolate the backgroundColor value
    const interpolatedBG = backgroundColor.interpolate({
        inputRange: [0, 1],
        outputRange: ["#ffffff", "#818181"], // Replace with your desired colors
    });

    return (
        <Pressable
            onPress={props.onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={({ pressed }) => [
                { backgroundColor: pressed ? "#ffffff" : "transparent",
                borderRadius: 14,
                 },
            ]}
        >
            <Animated.View style={[styles.loginButton, { backgroundColor: interpolatedBG }, props.style]}>
        {props.children?
            props.children
            :
            <Text style={[styles.buttonText,props.textStyle]}>{props.title}</Text>
        }
      </Animated.View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    loginButton: {
        backgroundColor: "#ffffff",
        borderRadius: 14,
        padding: 13,
        width: screenWidth / 1.38,
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        textAlign: "center",
      },
      buttonText: {
        textAlign: "center",
        fontFamily: "Monrope",
        fontSize: 16,
        flex:1,
        color: "#000000",
      },
});