import React, { useRef } from 'react';
import { Text, Animated, PanResponder, StyleSheet, View, Pressable } from 'react-native';

const DraggableEmoji = ({ emoji, initialPosition }: { emoji: string; initialPosition: { x: number; y: number } }) => {
    const pan = useRef(new Animated.ValueXY(initialPosition)).current;

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderGrant: () => {
                pan.stopAnimation((value) => {
                    pan.setOffset(value);
                    pan.setValue({ x: 0, y: 0 });
                });
            },
            onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
            onPanResponderRelease: () => {
                pan.flattenOffset();
            },
        })
    ).current;

    return (
        <Animated.View {...panResponder.panHandlers} style={[pan.getLayout(), styles.emojiContainer]}>
            <Text style={styles.emojiText}>{emoji}</Text>
        </Animated.View>
    );
};

const DraggableEmojis = () => {
    const emojis = [
        { emoji: '😀', initialPosition: { x: 0, y: 0 } },
        { emoji: '😎', initialPosition: { x: 0, y: 0 } },
        { emoji: '❤️', initialPosition: { x: 0, y: 0 } },
        { emoji: '🔥', initialPosition: { x: 0, y: 0 } },
        { emoji: '✨', initialPosition: { x: 0, y: 0 } },
    ];

    const onAddEmoji = () => {};

    return (
        <View style={styles.container}>
            <View style={styles.emojiRow}>
                {emojis.map((item, index) => (
                    <DraggableEmoji key={index} emoji={item.emoji} initialPosition={item.initialPosition} />
                ))}
            </View>
            {/*<Pressable onPress={onAddEmoji} style={styles.plusButton}>*/}
            {/*    <Text style={styles.emojiText}>+</Text>*/}
            {/*</Pressable>*/}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 100,
        left: '50%',
        transform: [{ translateX: '-50%' }],
        width: 'auto',
        height: "auto",
        zIndex: 100,
        borderRadius: 50,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
    },
    emojiRow: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
    },
    emojiContainer: {
        padding: 10,
    },
    emojiText: {
        fontSize: 32,
    },
    plusButton: {
        position: 'absolute',
        top: 10,
        right: 20,
        padding: 10,
    },
});

export default DraggableEmojis;
