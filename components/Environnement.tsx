import React from 'react';
import {GLView} from 'expo-gl';
import {Pressable, Text, View} from 'react-native';
import SceneManager from "@/components/gallery/SceneManager";
import useInteractionHandlers from "@/components/gallery/useInteractionHandlers";
import {GestureHandlerRootView, PinchGestureHandler} from "react-native-gesture-handler";
import DraggableEmojis from "@/components/gallery/DraggableEmojis";
import RoundButton from "@/components/buttons/RoundButton";
import GraytButton from './buttons/GrayButton';

export default function App({images, children, delImageFunc}: {
    images: string[],
    children?: React.ReactNode,
    delImageFunc: (imgUrl: string) => void
}) {
    const {
        isMeshActive,
        meshClick,
        panHandlers,
        onPinchGestureEvent,
        onPinchHandlerStateChange
    } = useInteractionHandlers();

    return (
        <View style={{flex: 1, zIndex: 100}}>

            {isMeshActive ? (
                    <>
                        <DraggableEmojis/>
                        <View style={{
                            position: 'absolute',
                            bottom: 80,
                            gap: 8,
                            left: "50%",
                            transform: [{translateX: "-50%"}],
                            width: '90%',
                            height: 'auto',
                            flexDirection: 'row',
                            zIndex: 100,
                        }}>
                            <View style={{
                                width: "49%",
                            }}>
                                <RoundButton style={{width: "100%"}} onPress={() => {
                                    meshClick.leave()
                                }}>
                                    <Text style={{color: 'white', fontSize: 20, textAlign: 'center'}}>Back</Text>
                                </RoundButton>
                            </View>

                            {/* TODO : NOAI DELETE BUTTON*/}

                            <Pressable onPress={() => () => {delImageFunc("test")}}>
                            <View style={{
                                width: "49%",
                                height: 60,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: 'white',
                                borderRadius: 50,
                            }}>
                                <Text style={{
                                    color: 'black',
                                    fontSize: 20,
                                    textAlign: 'center',
                                }}>Delete</Text>
                            </View>
                            </Pressable>
                        </View>
                    </>
                ) : children
            }


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

