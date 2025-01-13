import { useRef } from "react";
import { Animated, Dimensions, Pressable } from "react-native";
import { StyleSheet, Text } from "react-native";


const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

export default function GraytButton(props:any) {
    const backgroundColor = useRef(new Animated.Value(0)).current; // Animated value for the color

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
        outputRange: ["#3B3B3B", "#2b2b2b"], // Replace with your desired colors
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
            <Animated.View style={[styles.loginButton, { backgroundColor: interpolatedBG }]}>
                <Text style={{ textAlign: "center", fontFamily: "SFPROBOLD", color: "#fff" }}>
                    {props.title}
                </Text>
            </Animated.View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    loginButton: {
        backgroundColor:"#fbfbfc",
        borderRadius: 12,
        color: "#fff",
        padding: 15,
        fontSize: 20,
        transitionDuration: "0.4s",
        transitionProperty: "backgroundColor",
        width: screenWidth/1.3,
        textAlign: "center",
    },
});
