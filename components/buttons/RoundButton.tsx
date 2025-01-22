import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { useRef, useState } from "react";
import { Animated, Dimensions, Pressable, View } from "react-native";
import { StyleSheet, Text } from "react-native";
import { useAnimatedStyle, useSharedValue } from "react-native-reanimated";


const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

export default function RoundButton(props:any) {
      const [gradientStart, setGradientStart] = useState({ x: 0.5, y: 0 });
      const [gradientEnd, setGradientEnd] = useState({ x: 4.6, y: 2 });
    const backgroundColor = useRef(new Animated.Value(0)).current; // Animated value for the color
    const scaleAnim = useSharedValue(1); // Shared value for scale

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scaleAnim.value }],
      }));
      


    return (
        <Pressable
            onPress={props.onPress}
            style={({ pressed }) => [
                { 
                borderRadius: 50,
                 },
            ]}
        >
        <Animated.View style={[animatedStyle, { width: 40 }]}>
            <LinearGradient
            colors={["#000000", "#DAEDBD", "#000000"]}
            style={styles.loginButton}
            start={gradientStart}
            end={gradientEnd}
            >
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <Ionicons name="add" size={45} color="white" style={{width:45,height: 45}} />
            </View>
            </LinearGradient>
        </Animated.View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    loginButton: {
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
    },
    backButton: {
        borderRadius: 90,
        width: 30,
        height: 30,
        textAlign: "center",
        borderWidth: 1,
        borderColor: "#ffffff50",
      },
});
