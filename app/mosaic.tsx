import {StyleSheet, View, Text, Pressable} from 'react-native';
import {router} from 'expo-router';

import {useFonts} from 'expo-font';

import {PropsWithChildren, useEffect, useRef, useState} from 'react';
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
import Ionicons from '@expo/vector-icons/Ionicons';
import MozaiInfosModal from '@/components/MozaiInfosModal';
import Animated from 'react-native-reanimated';

type Props = PropsWithChildren<{
    user: any;
    mosaicId?: string;
}>;

export default function Mosaic({user, mosaicId}: Props) {

    const [isConfirmVisible, setConfirmVisible] = useState<boolean>(false);
    const [isMozaiInfosVisible, setMozaiInfosVisible] = useState<boolean>(false);
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
    const [topZindex, setTopZindex] = useState<number>(130);

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
        await ImagePicker.requestMediaLibraryPermissionsAsync();
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

            <View style={[styles.topBar,{zIndex:topZindex}]}>
                <RoundButton
                        onPress={() => userData ? router.replace("/home") : router.replace("/animation")}
                        title="Home" icon="home" size={25} />
            </View>

            <View>
                <ConfirmModal isVisible={isConfirmVisible}
                text={`Do you want to add ${assetsNumber} images to the mosaic ?`}
                onClose={(confirmation) => (confirmUpload(confirmation))} user={user}/>
            </View>

            {activeMosaic?.id &&
            <View>
                 <MozaiInfosModal mosaicId={activeMosaic.id} isVisible={isMozaiInfosVisible} onClose={() => {setTopZindex(130); setMozaiInfosVisible(false)}} users={activeMosaic.users}>
                </MozaiInfosModal>
             </View>
            }

            <Animated.View style={[styles.smoothCover, isMozaiInfosVisible?{opacity:1}:{opacity:0}]}></Animated.View>

            {activeMosaic?.images
                
                ? <Environnement images={activeMosaic.images}/>
                : <Text>loading</Text>
            }

            <View style={{position: 'absolute', zIndex:125, top: 45, display: 'flex', flexDirection: 'row', justifyContent: 'center', width: '100%'}}>
                {activeMosaic && 
                    <RoundButton style={{zIndex:20,width:"unset", padding:20}} onPress={() => { setTopZindex(110);setMozaiInfosVisible(true)}} >
                        <View style={{display: 'flex', flexDirection: 'row', gap: 8, alignItems: 'center'}}>
                            <Ionicons name="chevron-down" size={25} color="white" style={{width: 25, height: 25}}/>
                            <Text style={styles.text}>{activeMosaic.name}</Text>
                        </View>
                    </RoundButton>
                }
            </View>


            <View style={styles.buttons}>
                {userData && <RoundButton onPress={pickImageAsync} style={{width:180,height:50}}>
                                <Text style={styles.text}>Add</Text>
                            </RoundButton>
                    }
            </View>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        flex: 1,
    },
    smoothCover:{
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
        // fontWeight: 'bold',
        fontFamily: 'SFPROBOLD',
        textAlign: 'center',
      },
});
