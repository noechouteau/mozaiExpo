import React from 'react';
import {GLView} from 'expo-gl';
import {Text, View} from 'react-native';
import SceneManager from "@/components/gallery/SceneManager";
import useInteractionHandlers from "@/components/gallery/useInteractionHandlers";
import {GestureHandlerRootView, PinchGestureHandler} from "react-native-gesture-handler";
import DraggableEmojis from "@/components/gallery/DraggableEmojis";

export default function App({images}: { images: string[] }) {
    const { isMeshActive, panHandlers, onPinchGestureEvent, onPinchHandlerStateChange } = useInteractionHandlers();

    return (
        <View style={{flex: 1, zIndex: 100}}>

            {isMeshActive ? <DraggableEmojis /> : null}


            <GestureHandlerRootView style={{flex: 1}}>
                <PinchGestureHandler
                    onGestureEvent={onPinchGestureEvent}
                    onHandlerStateChange={onPinchHandlerStateChange}
                >
                    <GLView
                        {...panHandlers}
                        style={{flex: 1}}
                        onContextCreate={(gl) => SceneManager(gl, images)}
                    />
                </PinchGestureHandler>
            </GestureHandlerRootView>
        </View>
    );
}
