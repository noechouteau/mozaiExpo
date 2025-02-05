// DraggableEmojis.tsx
import React, {useEffect, useRef, useState} from 'react';
import {
    Text,
    Animated,
    PanResponder,
    StyleSheet,
    View,
    Modal,
    TextInput,
    TouchableOpacity,
} from 'react-native';

const DraggableEmoji = ({emoji, initialPosition, onDrop}) => {
    const pan = useRef(new Animated.ValueXY(initialPosition)).current;
    const [isDraggable, setIsDraggable] = useState(true);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => isDraggable,
            onPanResponderGrant: () => {
                if (isDraggable) {
                    pan.stopAnimation((value) => {
                        pan.setOffset(value);
                        pan.setValue({x: 0, y: 0});
                    });
                }
            },
            onPanResponderMove: Animated.event([null, {dx: pan.x, dy: pan.y}], {
                useNativeDriver: false,
            }),
            onPanResponderRelease: () => {
                if (isDraggable) {
                    pan.flattenOffset();
                    setIsDraggable(false);
                    pan.extractOffset();
                    pan.stopAnimation((finalPosition) => {
                        onDrop(emoji, finalPosition);
                    });
                }
            },
        })
    ).current;

    return (
        <Animated.View
            {...(isDraggable ? panResponder.panHandlers : {})}
            style={[pan.getLayout(), styles.emojiContainer]}
        >
            <Text style={styles.emojiText}>{emoji}</Text>
        </Animated.View>
    );
};

const DraggableEmojis = ({ show }) => {
    const fadeAnim = useRef(new Animated.Value(show ? 1 : 0)).current;
    const [emojiPositions, setEmojiPositions] = useState([]);
    const [emojis, setEmojis] = useState([
        {emoji: '😀', initialPosition: {x: 0, y: 0}},
        {emoji: '😎', initialPosition: {x: 0, y: 0}},
        {emoji: '❤️', initialPosition: {x: 0, y: 0}},
        {emoji: '🔥', initialPosition: {x: 0, y: 0}},
        {emoji: '✨', initialPosition: {x: 0, y: 0}},
    ]);
    const [modalVisible, setModalVisible] = useState(false);
    const [newEmoji, setNewEmoji] = useState('');

    const handleDrop = (emoji, position) => {
        setEmojiPositions((prevPositions) => {
            const updated = prevPositions.filter((item) => item.emoji !== emoji);
            updated.push({emoji, position});
            return updated;
        });
    };

    const addEmoji = () => {
        if (newEmoji.trim() !== '') {
            setEmojis((prev) => [...prev, {emoji: newEmoji, initialPosition: {x: 0, y: 0}}]);
            setNewEmoji('');
            setModalVisible(false);
        }
    };

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: show ? 0 : 1,
            duration: 300,
            delay: show ? 0 : 1000,
            useNativeDriver: true,
        }).start(() => {
            if (!show) {
                setEmojiPositions([]);
            }
        });
    }, [show]);

    return (
        <Animated.View style={[styles.container, {opacity: fadeAnim}]}>
            <View style={styles.emojiRow}>
                {emojis.map((item, index) => (
                    <DraggableEmoji
                        key={index}
                        emoji={item.emoji}
                        initialPosition={item.initialPosition}
                        onDrop={handleDrop}
                    />
                ))}
            </View>
            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <TextInput
                            value={newEmoji}
                            onChangeText={setNewEmoji}
                            style={styles.input}
                            placeholder="Entrez un emoji"
                            autoFocus
                        />
                        <TouchableOpacity onPress={addEmoji} style={styles.modalButton}>
                            <Text style={styles.modalButtonText}>Ajouter</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setModalVisible(false)}
                            style={styles.modalButton}
                        >
                            <Text style={styles.modalButtonText}>Annuler</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 150,
        left: '50%',
        transform: [{translateX: '-50%'}],
        zIndex: 100,
        borderRadius: 50,
        width: 'auto',
        backgroundColor: 'white',
        alignItems: 'center',
        padding: 20,
    },
    emojiRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    emojiContainer: {
        padding: 0,
    },
    emojiText: {
        fontSize: 56,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '80%',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        width: '100%',
        height: 40,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 15,
        fontSize: 18,
    },
    modalButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        marginVertical: 5,
        width: '100%',
        alignItems: 'center',
    },
    modalButtonText: {
        color: 'white',
        fontSize: 18,
    },
});

export default DraggableEmojis;
