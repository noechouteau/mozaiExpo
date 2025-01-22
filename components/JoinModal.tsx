import { Modal, View, Text, Pressable, StyleSheet, TextInput,Image } from 'react-native';
import React, { PropsWithChildren, useState } from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import LightButton from './buttons/LightButton';
import { queryDbDocsByField } from '@/database/firebase/read';
import { updateDoc } from '@/database/firebase/set';
import { db } from '@/db-configs/firebase';
import { doc } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Props = PropsWithChildren<{
  isVisible: boolean;
  onClose: () => void;
  user: any;
}>;

export default function JoinModal({ isVisible, onClose, user }: Props) {
    const [mosaicId, setMosaicId] = useState<string>("");
    const router = useRouter();

    const joinMosaic = async () => {
        if(mosaicId.length < 1) {
            alert("Please enter a mosaic id");
            return;
        }
       await queryDbDocsByField({ collectionId: "mosaiques", field:"id", value: mosaicId }).then(async (res:any) => {
            if(user) {
                for(const mosaique of user.mosaiques) {
                    if(mosaique.id == res[0].id) {
                        alert("You are already in this mosaic");
                        return;
                    }
                }
                await updateDoc({collectionId:"users", docId: user.uid, newDatas: {
                    mosaiques: [...user.mosaiques, doc(db, "mosaiques", res[0].id)],
                }}).then(() => {
                    console.log("Successfully joined the mosaic - user side");
                })
                await updateDoc({collectionId:"mosaiques", docId: res[0].id, newDatas: {
                    users: [...res[0].users, doc(db, "users", user.uid)],
                }}).then(async () => {
                    console.log("Successfully joined the mosaic - mosaic side");
                    router.replace("/mosaic");
                    await AsyncStorage.setItem("activeMosaic", res[0].id);
                    onClose();
                })
            }
            else {
                router.replace("/mosaic");
                await AsyncStorage.setItem("activeMosaic", res[0].id);
                onClose();
            }
        })
    } 

  return (
    <Modal animationType="slide" transparent={true} visible={isVisible}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
            <View style={styles.titleContainer}>
            <Text style={styles.title}>Join a mosaic</Text>
            <Pressable onPress={onClose}>
                <MaterialIcons name="close" color="#fff" size={22} />
            </Pressable>
            </View>
            <Text>Enter mosaic id to join</Text>
            <TextInput placeholder="Enter the mosaic id" onChangeText={(text) => setMosaicId(text)} />
            <LightButton title="Join" onPress={joinMosaic} />

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
