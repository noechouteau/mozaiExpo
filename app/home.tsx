import { StyleSheet, View, Text, Button, TextInput, Pressable, Image } from 'react-native';
import { Link, router } from 'expo-router';
import { getAuth } from "firebase/auth";
import { useFonts } from 'expo-font';
import Animated from 'react-native-reanimated';
import auth from '@react-native-firebase/auth';
import { useEffect, useState } from 'react';
import { getDbDoc, queryDbDocsByField } from '@/database/firebase/read';
import LightButton from '@/components/LightButton';
import GraytButton from '@/components/GrayButton';
import CreateModal from '@/components/CreateModal';
import JoinModal from '@/components/JoinModal';

export default function Home() {
    const [initializing, setInitializing] = useState(true);
    const [user, setUser]: any = useState();
    const [loaded, error] = useFonts({
        'SFPRO': require('../assets/fonts/SFPRODISPLAYMEDIUM.otf'),
        "SFPROBOLD": require('../assets/fonts/SFPRODISPLAYBOLD.otf'),
    });
    const [isCreateModalVisible, setCreateModalVisible] = useState<boolean>(false);
    const [isJoinModalVisible, setJoinModalVisible] = useState<boolean>(false);

    // Handle user state changes
    async function onAuthStateChanged(newUserAuth: any) {
        if (initializing) setInitializing(false);

        await queryDbDocsByField({ collectionId: "users", field: "uid", value: newUserAuth.uid }).then(async (res: any) => {
            console.log(res);
            setUser(res[0]);

            const mosaicPromises = res[0].mosaiques.map((mosaique: any) =>
                getDbDoc({ collectionId: "mosaiques", docId: mosaique.id })
            );

            const allMosaiques = await Promise.all(mosaicPromises);
            setUser((prevUser: any) => ({
                ...prevUser,
                mosaiques: allMosaiques,
            }));
        });
    }

    useEffect(() => {
        const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
        return subscriber; // unsubscribe on unmount
    }, []);

    function onLogout() {
        auth().signOut();
        router.replace("/");
    }

    return (
        <View style={styles.container}>
            <CreateModal isVisible={isCreateModalVisible} onClose={() => setCreateModalVisible(false)} user={user} />
            <JoinModal isVisible={isJoinModalVisible} onClose={() => setJoinModalVisible(false)} user={user} />
            <Text>Mosaic</Text>

            {user?.mosaiques && (
                <View style={styles.mosaiquesContainer}>
                    {user.mosaiques
                        .filter((mosaique: any) => mosaique !== null) // Filter out null values
                        .map((mosaique: any) => (
                            <View key={mosaique.id} style={styles.mosaicTag}>
                                <Image source={{ uri: mosaique.icon }} style={{ width: 50, height: 50 }} />
                                <Text style={styles.mosaicText}>{mosaique.name}</Text>
                            </View>
                        ))}
                </View>
            )}


            {user && <LightButton title="Create a mosaic" onPress={() => setCreateModalVisible(true)} />}
            <LightButton title="Join a mosaic" onPress={() => setJoinModalVisible(true)} />
            {user && <GraytButton title="Logout" onPress={onLogout} />}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#262626',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
    },
    mosaiquesContainer: {
        marginVertical: 20,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    mosaicTag: {
        backgroundColor: '#444',
        borderRadius: 8,
        paddingVertical: 5,
        paddingHorizontal: 10,
        margin: 5,
    },
    mosaicText: {
        color: '#FFFFFF',
        fontSize: 16,
    },
});
