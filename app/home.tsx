import { StyleSheet, View, Text, Button, TextInput, Pressable, Image, ImageBackground, Dimensions, ScrollView } from 'react-native';
import { Link, router } from 'expo-router';
import { getAuth } from "firebase/auth";
import { useFonts } from 'expo-font';
import Animated from 'react-native-reanimated';
import auth from '@react-native-firebase/auth';
import React, { Suspense, useEffect, useState } from 'react';
import { getDbDoc, queryDbDocsByField } from '@/database/firebase/read';
import LightButton from '@/components/buttons/LightButton';
import GraytButton from '@/components/buttons/GrayButton';
import CreateModal from '@/components/CreateModal';
import JoinModal from '@/components/JoinModal';
import { HoldItem, HoldMenuProvider } from 'react-native-hold-menu';
import ConfirmModal from '@/components/ConfirmModal';
import { deleteDbDoc } from '@/database/firebase/delete';
import { updateDoc } from '@/database/firebase/set';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NewUserModal from '@/components/NewUserModal';
import { Asset } from 'expo-asset';
import Ionicons from '@expo/vector-icons/Ionicons';
import SelectButton from '@/components/buttons/SelectButton';
import RoundButton from '@/components/buttons/RoundButton';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import GesturePan from '@/components/GesturePan';
import { useUser } from '@/context/UsersContext';
import { useMosaic } from '@/context/MosaicContext';
import RenameModal from '@/components/RenameModal';

const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

export default function Home() {
    const [initializing, setInitializing] = useState(true);
    const { authInfos, userData, updateUserData } = useUser();
    const { mosaics, updateMosaic } = useMosaic();

  
    const [loaded, error] = useFonts({
        'SFPRO': require('../assets/fonts/SFPRODISPLAYMEDIUM.otf'),
        "SFPROBOLD": require('../assets/fonts/SFPRODISPLAYBOLD.otf'),
    });
    const [isCreateModalVisible, setCreateModalVisible] = useState<boolean>(false);
    const [isJoinModalVisible, setJoinModalVisible] = useState<boolean>(false);
    const [isConfirmDeleteModalVisible, setConfirmDeleteModalVisible] = useState<boolean>(false);
    const [isNewUserModalVisible, setNewUserModalVisible] = useState<boolean>(false);
    const [mosaiqueToDelete, setMosaiqueToDelete] = useState("");
    const [userPicture, setUserPicture] = useState<any>(require('../assets/images/newUserBgPic.png'));
    const [searchChain, setSearchChain] = useState("");

    const pan = Gesture.Pan()

    const AddItems = [
      { text: 'Add', icon: 'plus', isTitle: true, onPress: () => {} },
      { text: 'Create', icon: 'edit', onPress: () => {
        setCreateModalVisible(true)
      } },
      { text: 'Join', icon: 'edit', onPress: () => {setJoinModalVisible(true)} },
    ]

    // Handle user state changes
    async function onAuthStateChanged(newUserAuth: any) {
        
        const loggedIn = await AsyncStorage.getItem("loggedIn");
        if(loggedIn == "false"|| loggedIn == null) {
          await AsyncStorage.setItem("loggedIn", "true");
        }
        if (initializing) setInitializing(false);

    }

    useEffect(() => {
      onAuthStateChanged(authInfos);
    }, []);


    useEffect(() => {
      if (userData) {
        console.log('Snapshot updated:', userData);
        console.log(userData.picture);
        console.log("ARGHHHHH", mosaics)
        setUserPicture({uri: userData.picture});
        onAuthStateChanged(authInfos)
      }
    }, [userData]); // This runs whenever `userData` changes

    useEffect(() => {
      if (mosaics) {
        console.log('Snapshot updated:', mosaics);
      }
    }, [mosaics]); // This runs whenever `mosaics` changes
    


    async function confirmDelete(confirmation: boolean){
      setConfirmDeleteModalVisible(false)
      if(confirmation && mosaics && userData){
        const completeMosToDel = mosaics.find((mosaique: any) => mosaique.id === mosaiqueToDelete);
        if(completeMosToDel) {
          await updateMosaic(mosaiqueToDelete, {
            users: completeMosToDel.users.filter((user: any) => user !== userData.uid)
          }).then(() => {
            console.log("Mosaic quitted");
          });
        }
        // await deleteDbDoc({ collection: "mosaiques", docId: mosaiqueToDelete }).then(async () => {
        //   await updateUserData({
        //     mosaiques: user.mosaiques.filter((mosaique: any) => mosaique.id !== mosaiqueToDelete)
        //   }).then(() => {
        //     console.log("Mosaic deleted");
        //   });
        // });
        }
    }

    async function dynamicSearch(searchString: any) {
      if(mosaics) {
        setSearchChain(searchString);
      }
    }


    return (
    <HoldMenuProvider theme='dark' safeAreaInsets={{
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    }}>
      
        <View><NewUserModal isVisible={isNewUserModalVisible} onClose={async() => {
          console.log("aaa")
          const activeUser=await AsyncStorage.getItem("activeUser");
          await onAuthStateChanged({uid:activeUser});
          setNewUserModalVisible(false)
          }} user={userData} /></View>

        <View><CreateModal isVisible={isCreateModalVisible} onClose={() => setCreateModalVisible(false)} user={userData} /></View>
        <View><JoinModal isVisible={isJoinModalVisible} onClose={() => setJoinModalVisible(false)} user={userData} /></View>
        <View><ConfirmModal isVisible={isConfirmDeleteModalVisible} text={"Are you sure you want to quit this mosaic?"} onClose={(confirmation)=>(confirmDelete(confirmation))} user={userData} /></View>

        <Animated.View style={styles.container}>
            <View style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: screenWidth, gap: 10, position: mosaics && mosaics.length>0 ? "relative" : "absolute", top: 0}}>
              <View style={styles.topBar}>
                  <Pressable onPress={() => {router.replace("/profile")}}>
                    <Image source={userData ?{uri: userData.picture}:userPicture} style={{width: 40,height:40, borderRadius:50}}/>
                  </Pressable>
                  <View style={styles.searchBar}>
                    <Ionicons name="search" size={26} color="grey" style={{width:35,paddingLeft:3}} />
                    <TextInput
                        // style={styles.input}
                        placeholder="Browse mosaics..."
                        placeholderTextColor={"#ffffff50"}
                        // onChangeText={(searchString) => {this.setState({searchString})}}
                        underlineColorAndroid="transparent"
                        style={{padding:0,width:"100%",color:"#fff"}}
                        onChangeText={(text) => dynamicSearch(text)}
                    />
                  </View>
                </View>
            </View>

              {mosaics && mosaics.length > 0 ? (
                <GestureHandlerRootView>
                  <GestureDetector gesture={pan}>
                      <GesturePan searchChain={searchChain} deleteFunction={(tempId:any)=>{setMosaiqueToDelete(tempId);setConfirmDeleteModalVisible(true)}}></GesturePan>
                  </GestureDetector>
                </GestureHandlerRootView>
              ) : (
                <Text style={{ color: '#FFF', marginTop: 20 }}>No mosaics found. Create or join one!</Text>
              )}


              <TextInput style={styles.homeTextInput}></TextInput>

              {userData && (
              <HoldItem key={"Test"} items={AddItems} hapticFeedback="Heavy" activateOn="tap" menuAnchorPosition="bottom-right" containerStyles={{position: 'absolute', bottom: 15, right:15,zIndex: 10}}>
                  <RoundButton title="+"/>
              </HoldItem>
              )}
        </Animated.View>
    </HoldMenuProvider>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    backgroundColor: '#0d0d0d',
  },
    mosaiquesContainer: {
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      display: 'flex',
      width: screenWidth,
    },
    mosaicTag: {
        backgroundColor: '#444',
        borderRadius: 8,
        margin: 10,
        width: screenWidth*0.88,
    },
    mosaicText: {
        color: '#FFFFFF',
        fontSize: 16,
    },
    topBar: {
        flexDirection: 'row',
        width: "100%",
        height: 40,
        justifyContent: 'center',
        marginTop:55,
        display: 'flex',
        alignItems: 'center',
        gap:10
    },
    searchBar : {
        borderRadius: 50,
        width: "75%",
        padding: 5,
        fontSize: 15,
        backgroundColor: "#000000",
        borderWidth: 1.3,
        borderColor: "#FFFFFF50",
        color: "#ADADAD",
        flexDirection: 'row',
        alignItems: 'center',
    },
    mosaicPreview: {
      borderTopLeftRadius: 10,
      borderTopRightRadius: 10,
      height: 150,
      borderWidth: 1,
      borderColor: "#FFFFFF50",
      overflow: 'hidden',
    },
    mosaicInfo: {
      borderBottomLeftRadius: 10,
      borderBottomRightRadius: 10,
      borderWidth: 2,
      borderColor: "#FFFFFF50",
      padding: 10,
      backgroundColor: "#000000",
    },
    background: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      height: 300,
    },



    homeTextInput: {
      height:0, 
    },
});
