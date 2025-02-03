import React, {useState, useEffect, useRef} from 'react';
import {GLView} from 'expo-gl';
import {Text, View, ActivityIndicator, Animated, Easing} from 'react-native';
import SceneManager from "@/components/gallery/SceneManager";
import useInteractionHandlers from "@/components/gallery/useInteractionHandlers";
import DraggableEmoji from "@/components/gallery/DraggableEmojis";
import LoadingScreen from './LoadingScreen';

export default function App({
                                images,
                                children
                            }: {
    images: string[],
    children: React.ReactNode
}) {
    const [isMeshActive, setIsMeshActive] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true); // État de chargement

    const {backTouch, handleTouchStart, handleTouchEnd, panHandlers, handleTouchMove} = useInteractionHandlers(
        [isMeshActive, setIsMeshActive]
    );

    const {active, action} = backTouch();

    const emojiOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(emojiOpacity, {
            toValue: active ? 1 : 0,
            duration: 500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
        }).start();
    }, [active]);

    useEffect(() => {
        setIsLoading(true);
    }, [images]);

    const handleContextCreate = async (gl: WebGLRenderingContext) => {
        try {
            await SceneManager(gl, images);
        } catch (error) {
            console.error("Erreur lors du chargement de la scène :", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        Animated.timing(emojiOpacity, {
            toValue: active ? 1 : 0,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
        }).start();
    }, [active]);


    return (
        <View style={{flex: 1, zIndex: 100}}>

            <Animated.View
                style={{
                    opacity: emojiOpacity,
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 200,
                }}
            >
                {active && <DraggableEmoji />}
            </Animated.View>


            {isLoading && (
                <LoadingScreen isVisible={isLoading} text={"Loading Images..."} />
            )}

            <GLView
                {...panHandlers}
                key={images.length}
                style={{flex: 1}}
                onContextCreate={handleContextCreate}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onTouchMove={handleTouchMove}
            />
        </View>
    );
}

const styles = {
    loadingContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 200,
    },
    loadingText: {
        marginTop: 10,
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
};
