import { Modal, View, Text, Pressable, StyleSheet, TextInput,Image } from 'react-native';
import React, { PropsWithChildren, useState } from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import LightButton from './buttons/LightButton';

import { useRouter } from 'expo-router';

type Props = PropsWithChildren<{
  isVisible: boolean;
  text: string;
  onClose: (confirm: boolean) => void;
  user: any;
}>;

export default function ConfirmModal({ isVisible,text, onClose, user }: Props) {
    const [mosaicId, setMosaicId] = useState<string>("");
    const router = useRouter();

  return (
    <Modal animationType="slide" transparent={true} visible={isVisible}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
            <View style={styles.titleContainer}>
            <Text style={styles.title}>Join a mosaic</Text>
            <Pressable onPress={()=>onClose(false)}>
                <MaterialIcons name="close" color="#fff" size={22} />
            </Pressable>
            </View>
            <Text>{text}</Text>
            <LightButton title="Yes" onPress={()=>(onClose(true))} />
            <LightButton title="No" onPress={()=>(onClose(false))} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
    modalContainer: {
        height: '100%',
        width: '100%',
        borderTopRightRadius: 18,
        display: 'flex',
        justifyContent: "center",
        alignItems: 'center',
        borderTopLeftRadius: 18,
        position: 'absolute',
        zIndex: 10,
    },
    modalContent: {
        height: "45%",
        width: "90%",
        backgroundColor: '#464C55',
    },
    titleContainer: {
        height: '16%',
        backgroundColor: '#464C55',
        borderTopRightRadius: 10,
        borderTopLeftRadius: 10,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    title: {
        color: '#fff',
        fontSize: 16,
    },
});
