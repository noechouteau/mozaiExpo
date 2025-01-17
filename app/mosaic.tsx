import {StyleSheet, View, Text} from 'react-native';
import {router} from 'expo-router';

import {useFonts} from 'expo-font';

import {PropsWithChildren, useEffect, useState} from 'react';
import {getDbDoc, queryDbDocsByField} from '@/database/firebase/read';
import LightButton from '@/components/LightButton';

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import {Asset} from 'expo-asset';
import ConfirmModal from '@/components/ConfirmModal';
import {uploadPicture} from '@/database/aws/set';
import {updateDoc} from '@/database/firebase/set';
import {Timestamp} from 'firebase/firestore';
import Environnement from '@/components/Environnement';

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

    const getData = async () => {

    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const tempActiveMosaic = await AsyncStorage.getItem("activeMosaic");
                setActiveMosaic(tempActiveMosaic);

                const user = await AsyncStorage.getItem("activeUser") ?? "";
                setActiveUser(user);

                if (tempActiveMosaic) {
                    const mosaic = await queryDbDocsByField({
                        collectionId: "mosaiques",
                        field: "id",
                        value: tempActiveMosaic,
                    });

                    if (mosaic.length > 0) {
                        setActiveMosaic(mosaic[0]);
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
            await updateDoc({
                collectionId: "mosaiques", docId: activeMosaic.id, newDatas: {
                    images: [...activeMosaic.images, ...newImages],
                }
            }).then(async () => {
                await getDbDoc({collectionId: "mosaiques", docId: activeMosaic.id}).then((mosaic: any) => {
                    setActiveMosaic(mosaic);
                })
            })
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

            <View style={styles.buttons}>
                <LightButton
                    onPress={() => activeUser != "guest" ? router.replace("/home") : router.replace("/animation")}
                    title="Home"/>
                {activeUser != "guest" && <LightButton onPress={pickImageAsync} title="+"/>}
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
        left: "50%",
        transform: [{translateX: "-50%"}],
        display: 'flex',

    }
});
