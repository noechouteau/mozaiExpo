import {StyleSheet, View, Text} from 'react-native';
import {router} from 'expo-router';

import {useFonts} from 'expo-font';

import {PropsWithChildren, useEffect, useState} from 'react';
import {getDbDoc, queryDbDocsByField} from '@/database/firebase/read';
import LightButton from '@/components/buttons/LightButton';

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import {Asset} from 'expo-asset';
import ConfirmModal from '@/components/ConfirmModal';
import {uploadPicture} from '@/database/aws/set';
import {updateDoc} from '@/database/firebase/set';
import {Timestamp} from 'firebase/firestore';
import Environnement from '@/components/Environnement';
import { useMosaic } from '@/context/MosaicContext';
import firestore from '@react-native-firebase/firestore';
import { useUser } from '@/context/UsersContext';
import RoundButton from '@/components/buttons/RoundButton';

type Props = PropsWithChildren<{
    user: any;
    mosaicId?: string;
}>;

export default function Mosaic({user, mosaicId}: Props) {

    const [isConfirmVisible, setConfirmVisible] = useState<boolean>(false);
    const [initializing, setInitializing] = useState(true);
    const [activeMosaic, setActiveMosaic] = useState<any>(null);
    const [activeUser, setActiveUser] = useState<any>(user);
    const [assetsNumber, setAssetsNumber] = useState<number>(0);
    const [imagesToUpload, setImagesToUpload] = useState<any>();
    const [loaded, error] = useFonts({
        'SFPRO': require('../assets/fonts/SFPRODISPLAYMEDIUM.otf'),
        "SFPROBOLD": require('../assets/fonts/SFPRODISPLAYBOLD.otf'),
    });
    const { mosaics, updateMosaic } = useMosaic();
    const { authInfos, userData, updateUserData } = useUser();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const tempActiveMosaic = await AsyncStorage.getItem("activeMosaic");

                const user = await AsyncStorage.getItem("activeUser") ?? "";
                setActiveUser(user);

                if (tempActiveMosaic && mosaics) {
                    const mosaic = mosaics.filter((mosaic: any) => mosaic.id === tempActiveMosaic);

                    if (mosaic.length > 0) {
                        setActiveMosaic(mosaic[0]);
                    }
                }
                else if(!user && tempActiveMosaic) {
                    console.log("ah")
                    const mosaic = await firestore().collection("mosaiques").doc(tempActiveMosaic).get().then((doc) => doc.data())

                    if (mosaic) {
                        setActiveMosaic(mosaic);
                    }
                }
            } catch (error) {
                console.error("Error fetching data: ", error);
            }
        };

        fetchData();
    }, []);


    const pickImageAsync = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsMultipleSelection: true,
            allowsEditing: false,
            quality: 1,
        });

        if (!result.canceled) {
            setAssetsNumber(result.assets.length);

            const assetPromises = result.assets.map(async asset => {
                const loadedAsset: any = await Asset.loadAsync(asset.uri);

                const {width, height} = asset;
                return {
                    uri: loadedAsset[0].uri,
                    localUri: loadedAsset[0].localUri,
                    width: width || 0,
                    height: height || 0,
                };
            });
            const images = await Promise.all(assetPromises);
            images.forEach(image => console.log(image));
            setImagesToUpload(images);

            setConfirmVisible(true);
        } else {
            alert('You did not select any image.');
        }
    };

    const confirmUpload = async (confirmation: boolean) => {
        setConfirmVisible(false);
        if (!confirmation) return;
        const assetPromises = imagesToUpload.map((asset: any) => uploadPicture(asset.localUri, activeMosaic.id + "/" + activeUser + "/" + asset.uri.split("/").pop()));
        await Promise.all(assetPromises).then(async (res) => {
            const newImages = res.map((image: any, index: number) => ({
                date: new Timestamp(new Date().getTime() / 1000, 0),
                informations: "",
                reactions: [],
                url: image.Location,
                user: activeUser,
                width: imagesToUpload[index].width,
                height: imagesToUpload[index].height,
            }));

            await updateMosaic(activeMosaic.id, {
                images: [...activeMosaic.images, ...newImages],
            }).then(() => {
                console.log("Successfully uploaded images");
            });

            // await updateDoc({
            //     collectionId: "mosaiques", docId: activeMosaic.id, newDatas: {
            //         images: [...activeMosaic.images, ...newImages],
            //     }
            // }).then(async () => {
            //     await getDbDoc({collectionId: "mosaiques", docId: activeMosaic.id}).then((mosaic: any) => {
            //         setActiveMosaic(mosaic);
            //     })
            // })
        })

    }

    return (<View style={styles.container}>
            <ConfirmModal isVisible={isConfirmVisible}
                          text={`Do you want to add ${assetsNumber} images to the mosaic ?`}
                          onClose={(confirmation) => (confirmUpload(confirmation))} user={user}/>

            {activeMosaic?.images
                
                ? <Environnement images={activeMosaic.images}/>
                : <Text>loading</Text>
            }

            <View style={styles.topBar}>
                <RoundButton
                        onPress={() => userData ? router.replace("/home") : router.replace("/animation")}
                        title="Home" icon="home" size={35} />
            </View>
            <View style={styles.buttons}>
                {userData && <LightButton onPress={pickImageAsync} title="add"/>}
            </View>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        flex: 1,
    },
    buttons: {
        position: 'absolute',
        bottom: 50,
        zIndex: 100,
        left: "50%",
        transform: [{translateX: "-50%"}],
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
    },
    topBar: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        paddingTop: 50,
        position: 'absolute',
        top: 0,
        width: '100%',
        zIndex: 100,
    }
});
