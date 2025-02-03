import React, { useRef, useState } from 'react';
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

const DraggableEmoji = ({
                            emoji,
                            initialPosition,
                            onDrop,
                        }: {
    emoji: string;
    initialPosition: { x: number; y: number };
    onDrop: (emoji: string, position: { x: number; y: number }) => void;
}) => {
    const pan = useRef(new Animated.ValueXY(initialPosition)).current;
    const [isDraggable, setIsDraggable] = useState(true);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => isDraggable,
            onPanResponderGrant: () => {
                if (isDraggable) {
                    pan.stopAnimation((value) => {
                        pan.setOffset(value);
                        pan.setValue({ x: 0, y: 0 });
                    });
                }
            },
            onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
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

const DraggableEmojis = () => {
    const [emojiPositions, setEmojiPositions] = useState<
        { emoji: string; position: { x: number; y: number } }[]
    >([]);
    const [emojis, setEmojis] = useState<
        { emoji: string; initialPosition: { x: number; y: number } }[]
    >([
        { emoji: '😀', initialPosition: { x: 0, y: 0 } },
        { emoji: '😎', initialPosition: { x: 0, y: 0 } },
        { emoji: '❤️', initialPosition: { x: 0, y: 0 } },
        { emoji: '🔥', initialPosition: { x: 0, y: 0 } },
        { emoji: '✨', initialPosition: { x: 0, y: 0 } },
    ]);
    const [modalVisible, setModalVisible] = useState(false);
    const [newEmoji, setNewEmoji] = useState('');

    const handleDrop = (emoji: string, position: { x: number; y: number }) => {
        setEmojiPositions((prevPositions) => {
            const updatedPositions = prevPositions.filter(
                (item) => item.emoji !== emoji
            );
            updatedPositions.push({ emoji, position });
            console.log('Updated Emoji Positions:', updatedPositions);
            return updatedPositions;
        });
    };

    const addEmoji = () => {
        if (newEmoji.trim() !== '') {
            setEmojis((prev) => [
                ...prev,
                { emoji: newEmoji, initialPosition: { x: 0, y: 0 } },
            ]);
            setNewEmoji('');
            setModalVisible(false);
        }
    };

    return (
        <View style={styles.container}>
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
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 50,
        left: '50%',
        transform: [{ translateX: "-50%" }],
        zIndex: 100,
        borderRadius: 50,
        width: 'auto',
        backgroundColor: 'white',
        justifyContent: 'flex-start',
        alignItems: 'center',
        padding: 20,
    },
    emojiRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    emojiContainer: {
        padding: 0,
    },
    emojiText: {
        fontSize: 56,
    },
    addButton: {
        marginLeft: 10,
        backgroundColor: '#e0e0e0',
        borderRadius: 25,
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addButtonText: {
        fontSize: 30,
        color: '#333',
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
