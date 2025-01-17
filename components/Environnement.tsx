import React from 'react';
import {GLView} from 'expo-gl';
import {Text, View} from 'react-native';
import SceneManager from "@/components/gallery/SceneManager";
import useInteractionHandlers from "@/components/gallery/useInteractionHandlers"

export default function App({
                                images
                            }: {
    images: string[]
}) {
    const {backTouch, handleTouchStart, handleTouchEnd, panHandlers, handleTouchMove} = useInteractionHandlers();

    const {active, action} = backTouch();

    return (
        <View style={{flex: 1,zIndex:100}}>
            <View style={{
                position: 'absolute',
                bottom: "15%",
                left: "50%",
                transform: [{translateX: "-50%"}],
                backgroundColor: 'white',
                padding: 15,
                paddingHorizontal: 75,
                zIndex: 100,
                borderRadius: 50,
                opacity: active ? 1 : 0,
            }}
                  onTouchStart={action}
            >
                <Text>Back</Text>
            </View>

            <GLView
                {...panHandlers}
                style={{flex: 1}}
                onContextCreate={(gl) => SceneManager(gl, images)}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onTouchMove={handleTouchMove}
            />
        </View>
    );
}
