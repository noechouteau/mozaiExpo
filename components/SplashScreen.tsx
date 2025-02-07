import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface SplashScreenProps {
    onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
    const [isVideoFinished, setIsVideoFinished] = useState(false);
    console.log("SplashScreen: Chargement de la vidéo...");

    // Chargement et lecture de la vidéo
    const player = useVideoPlayer(require('../assets/videos/splashscreen/start.mp4'), (player) => {
        console.log("SplashScreen: Lecture de la vidéo...");
        player.play();
    });

    useEffect(() => {
        const handlePlaybackEnd = () => {
            console.log("SplashScreen: Vidéo terminée.");
            setIsVideoFinished(true); // Change l'état quand la vidéo se termine
        };

        // Abonnement à l'événement de fin de lecture de la vidéo
        const subscription = player.addListener('ended', handlePlaybackEnd);

        console.log("SplashScreen: Abonnement à l'événement 'ended'.");

        return () => {
            subscription.remove(); // Nettoyage de l'abonnement
            console.log("SplashScreen: Désabonnement de l'événement 'ended'.");
        };
    }, [player]);

    useEffect(() => {
        if (isVideoFinished) {
            onFinish(); // Appel de onFinish après que la vidéo soit terminée
        }
    }, [isVideoFinished, onFinish]);

    return (
        <View style={styles.container}>
            <VideoView
                style={styles.video}
                player={player}
            />
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
        justifyContent: 'center',
        alignItems: 'center',
    },
    video: {
        width: screenWidth,
        height: screenHeight,
    },
});
