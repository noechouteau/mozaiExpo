import { useRef } from "react";
import { Animated, Dimensions, Pressable } from "react-native";
import { StyleSheet, Text } from "react-native";


const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

export default function ScreenButton(props:any) {
    const backgroundColor = useRef(new Animated.Value(0)).current; // Animated value for the color

    const interpolatedBG = backgroundColor.interpolate({
        inputRange: [0, 1],
        outputRange: ["#000000", "#bbbbbb"],
    });

    return (
        <Pressable
            onPress={props.onPress}
            style={({ pressed }) => [
                { backgroundColor: pressed ? "#ccc" : "transparent",
                    borderRadius: 12,
                },
            ]}
        >
            <Animated.View style={[styles.loginButton, { backgroundColor: interpolatedBG }]}>
                <Text style={styles.buttonText}>{props.title}</Text>
            </Animated.View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    loginButton: {
        backgroundColor: "#fbfbfc",
        borderRadius: 100,
        fontSize: 20,
        borderColor: "#fff",
        borderWidth: 1,
        padding: 15,
        width: 150,
        textAlign: "center",
        marginBottom: 20,
    },
    buttonText: {
        textAlign: "center",
        fontFamily: "SFPRO",
        fontSize: 18,
        color: "#ffffff",
    },
});
