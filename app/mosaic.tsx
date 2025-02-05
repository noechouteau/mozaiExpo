import {StyleSheet, View, Text, Pressable} from 'react-native';
import {router} from 'expo-router';

import {useFonts} from 'expo-font';

import {PropsWithChildren, useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import {Asset} from 'expo-asset';
import ConfirmModal from '@/components/ConfirmModal';
import {uploadPicture} from '@/database/aws/set';
import {Timestamp} from 'firebase/firestore';
import Environnement from '@/components/Environnement';
import {useMosaic} from '@/context/MosaicContext';
import firestore from '@react-native-firebase/firestore';
import {useUser} from '@/context/UsersContext';
import RoundButton from '@/components/buttons/RoundButton';
import Ionicons from '@expo/vector-icons/Ionicons';
import MozaiInfosModal from '@/components/MozaiInfosModal';
import Animated from 'react-native-reanimated';

type Props = PropsWithChildren<{
    user: any;
    mosaicId?: string;
}>;

export default function Mosaic({user, mosaicId}: Props) {

    const [isConfirmVisible, setConfirmVisible] = useState<boolean>(false);
    const [mosaiqueToDelete, setMosaiqueToDelete] = useState<string>("");
    const [isConfirmDeleteModalVisible, setConfirmDeleteModalVisible] = useState<boolean>(false);
    const [isMozaiInfosVisible, setMozaiInfosVisible] = useState<boolean>(false);
    const [activeMosaic, setActiveMosaic] = useState<any>(null);
    const [activeUser, setActiveUser] = useState<any>(user);
    const [assetsNumber, setAssetsNumber] = useState<number>(0);
    const [imagesToUpload, setImagesToUpload] = useState<any>();
    const [loaded, error] = useFonts({
        'SFPRO': require('../assets/fonts/SFPRODISPLAYMEDIUM.otf'),
        "SFPROBOLD": require('../assets/fonts/SFPRODISPLAYBOLD.otf'),
    });
    const {mosaics, updateMosaic,deleteMosaic} = useMosaic();
    const {userData} = useUser();
    
    const [topZindex, setTopZindex] = useState<number>(130);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const tempActiveMosaic = await AsyncStorage.getItem("activeMosaic");
            const user = await AsyncStorage.getItem("activeUser") ?? "";
            setActiveUser(user);

            if (tempActiveMosaic && mosaics) {
                const mosaic = mosaics.find((mosaic: any) => mosaic.id === tempActiveMosaic);
                if (mosaic) {
                    setActiveMosaic(mosaic);
                }
            } else if (!user && tempActiveMosaic) {
                const mosaic = await firestore().collection("mosaiques").doc(tempActiveMosaic).get().then((doc) => doc.data());
                if (mosaic) {
                    setActiveMosaic(mosaic);
                }
            }
        } catch (error) {
            console.error("Error fetching data: ", error);
        }
    };

    async function confirmDelete(confirmation: boolean){
        setConfirmDeleteModalVisible(false)
        if(confirmation && mosaics && userData){
          const completeMosToDel = mosaics.find((mosaique: any) => mosaique.id === mosaiqueToDelete);
          if(completeMosToDel) {
              await updateMosaic(mosaiqueToDelete, {
              users: completeMosToDel.users.filter((user: any) => user.id !== userData.uid)
              }).then(async() => {
              console.log("Mosaic quitted");
              console.log(completeMosToDel.users.length);
              if(completeMosToDel.users.length == 1 || completeMosToDel.users.length == 0) {
                  await deleteMosaic(mosaiqueToDelete).then(() => {
                  console.log("Mosaic deleted");
                  router.replace("/home");
                  });
              }
              });
          }
          }
      }

    async function deleteImage(imageUrl: string) {
        const updatedImages = activeMosaic.images.filter((image: any) => image.url !== imageUrl);
        const updatedMosaic = {
            ...activeMosaic,
            images: updatedImages,
        };

        setActiveMosaic(updatedMosaic);

        await updateMosaic(activeMosaic.id, {
            images: updatedImages,
        });
    }


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

        const assetPromises = imagesToUpload.map((asset: any) =>
            uploadPicture(asset.localUri, `${activeMosaic.id}/${activeUser}/${asset.uri.split("/").pop()}`)
        );

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

            const updatedMosaic = {
                ...activeMosaic,
                images: [...activeMosaic.images, ...newImages],
            };

            setActiveMosaic(updatedMosaic);

            await updateMosaic(activeMosaic.id, {
                images: updatedMosaic.images,
            });
        });
    };


    return (
        <View style={styles.container}>
            <View style={[styles.topBar, {zIndex: topZindex}]}>
                <RoundButton
                    onPress={() => userData ? router.replace("/home") : router.replace("/animation")}
                    title="Home" icon="home" size={25}
                />
            </View>

            <View>
            <ConfirmModal isVisible={isConfirmVisible}
                          text={`Do you want to add ${assetsNumber} images to the mosaic ?`}
                          onClose={(confirmation) => confirmUpload(confirmation)}
                          user={user}
            />
            </View>

            <View>
            <ConfirmModal isVisible={isConfirmDeleteModalVisible} text={"Are you sure you want to quit/delete this mosaic?"} onClose={(confirmation)=>(confirmDelete(confirmation))} user={userData} />
            </View>
            

            {activeMosaic?.id && (
                <MozaiInfosModal
                    mosaicId={activeMosaic.id}
                    isVisible={isMozaiInfosVisible}
                    onClose={() => {
                        setTopZindex(130);
                        setMozaiInfosVisible(false);
                    }}
                    users={activeMosaic.users}
                    deleteFunction={(tempId:any)=>{setMosaiqueToDelete(tempId);setConfirmDeleteModalVisible(true)}}
                />
            )}

            <Animated.View style={[styles.smoothCover, isMozaiInfosVisible ? {opacity: 1} : {opacity: 0}]}/>


            {activeMosaic?.images ? (
                <Environnement images={activeMosaic.images} delImageFunc={deleteImage}>
                    {userData ? (
                        <View style={styles.buttons}>
                            <RoundButton onPress={pickImageAsync} style={{width: 180, height: 50}}>
                                <Text style={styles.text}>Add</Text>
                            </RoundButton>
                        </View>
                    ) : <View></View>}
                </Environnement>
            ) : (
                <Text>loading</Text>
            )}


            <View style={styles.infoButtonContainer}>
                {activeMosaic && (
                    <RoundButton
                        style={{zIndex: 20, width: "unset", padding: 20}}
                        onPress={() => {
                            setTopZindex(110);
                            setMozaiInfosVisible(true);
                        }}
                    >
                        <View style={styles.infoButtonContent}>
                            <Ionicons name="chevron-down" size={25} color="white"/>
                            <Text style={styles.text}>{activeMosaic.name}</Text>
                        </View>
                    </RoundButton>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        flex: 1,
    },
    smoothCover: {
        position: 'absolute',
        zIndex: 120,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        backgroundColor: 'rgba(0,0,0,0.6)',
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
        paddingTop: 45,
        position: 'absolute',
        top: 0,
    },
    text: {
        color: '#fff',
        fontFamily: 'SFPROBOLD',
        textAlign: 'center',
    },
    infoButtonContainer: {
        position: 'absolute',
        zIndex: 125,
        top: 45,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        width: '100%',
    },
    infoButtonContent: {
        display: 'flex',
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
    },
});
