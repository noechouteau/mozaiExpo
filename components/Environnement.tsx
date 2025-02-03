import React, {useState, useEffect} from 'react';
import {GLView} from 'expo-gl';
import {Text, View, ActivityIndicator} from 'react-native';
import SceneManager from "@/components/gallery/SceneManager";
import useInteractionHandlers from "@/components/gallery/useInteractionHandlers";
import DraggableEmoji from "@/components/gallery/DraggableEmojis";

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

    return (
        <View style={{flex: 1, zIndex: 100}}>

            {active ? <DraggableEmoji/> : children}

            {isLoading && (
                // TODO: NOE LOADING
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#ffffff" />
                    <Text style={styles.loadingText}>Loading images...</Text>
                </View>
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
