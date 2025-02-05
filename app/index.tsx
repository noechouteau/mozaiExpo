import React, {useEffect, useState} from 'react';
import {View, StyleSheet, Dimensions, ImageBackground} from 'react-native';
import {router} from 'expo-router';
import OnBoarding from "@/components/OnBoarding";
import AsyncStorage from "@react-native-async-storage/async-storage";

const {width: screenWidth, height: screenHeight} = Dimensions.get('window');
const backgroundImage = require('../assets/images/blueTheme/bg_login_2.png');

export default function Index() {
    const [isSplashScreenVisible, setIsSplashScreenVisible] = useState(true);
    const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);
    const handleSplashFinish = () => {
        setIsSplashScreenVisible(false);
    };

    useEffect(() => {
        async function fast() {
            const activeUser = await AsyncStorage.getItem("loggedIn");
            console.log(activeUser);
            if (activeUser && activeUser != "false" && activeUser != "") {
                router.replace("/home");
            }
        }

        fast();
    }, []);


    if (isFirstLaunch === null) {
        return null;
    }

    return (
        <>
            {/* {isSplashScreenVisible ? (
        <SplashScreen onFinish={handleSplashFinish} />
      ) : ( */}
            <ImageBackground
                source={backgroundImage}
                resizeMode="cover"
                style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: screenWidth,
                    height: screenHeight + 45,
                }}
            >
                <View style={styles.container}>
                    {/* Affichage du Onboarding après la vidéo du SplashScreen */}
                    <OnBoarding onComplete={() => router.replace('/animation')}/>
                </View>
            </ImageBackground>
            {/* )} */}
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
    },
});
