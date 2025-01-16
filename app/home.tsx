import { StyleSheet, View, Text, Button, TextInput, Pressable, Image, ImageBackground, Dimensions, ScrollView } from 'react-native';
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
import { HoldItem, HoldMenuProvider } from 'react-native-hold-menu';
import ConfirmModal from '@/components/ConfirmModal';
import { deleteDbDoc } from '@/database/firebase/delete';
import { updateDoc } from '@/database/firebase/set';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NewUserModal from '@/components/NewUserModal';
import { Asset } from 'expo-asset';
import Ionicons from '@expo/vector-icons/Ionicons';
import SelectButton from '@/components/SelectButton';
import RoundButton from '@/components/RoundButton';
import { StatusBar } from 'expo-status-bar';


const {width: screenWidth, height: screenHeight} = Dimensions.get('window');
const backgroundImage = require('../assets/images/bg_login_2.png');

export default function Home() {
    const [initializing, setInitializing] = useState(true);
    const [user, setUser]: any = useState();
    const [userMosaics, setUserMosaics] = useState([
      { id: '1', name: 'Item 1',icon:"" },
      { id: '2', name: 'Item 2',icon:"" },
      { id: '3', name: 'Item 3',icon:"" },
    ]);
  
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

    const MenuItems = [
      { text: 'Actions', icon: 'home', isTitle: true, onPress: () => {} },
      { text: 'Rename', icon: 'edit', onPress: () => {} },
      { text: 'Quit', icon: 'trash', isDestructive: true, onPress: (mosaiqueId:any) => {setMosaiqueToDelete(mosaiqueId);setConfirmDeleteModalVisible(true)} },
    ];

    const AddItems = [
      { text: 'Add', icon: 'plus', isTitle: true, onPress: () => {} },
      { text: 'Create', icon: 'edit', onPress: () => {setCreateModalVisible(true)} },
      { text: 'Join', icon: 'edit', onPress: () => {setJoinModalVisible(true)} },
    ]

    // Handle user state changes
    async function onAuthStateChanged(newUserAuth: any) {
        console.log(newUserAuth);
        if (initializing) setInitializing(false);

        await queryDbDocsByField({ collectionId: "users", field: "uid", value: newUserAuth.uid }).then(async (res: any) => {
            console.log(res.length < 1);

            if(res.length < 1 && newUserAuth) {

              await AsyncStorage.setItem("activeUser", newUserAuth.uid);
              await AsyncStorage.setItem("activePhone", newUserAuth.phoneNumber);
              console.log("test")
              setNewUserModalVisible(true);
            } 
            
            else {
              await AsyncStorage.setItem("activeUser", res[0].uid);

              const mosaicPromises = res[0].mosaiques.map((mosaique: any) =>
                  getDbDoc({ collectionId: "mosaiques", docId: mosaique.id })
              );

              const allMosaiques = await Promise.all(mosaicPromises);
              setUserMosaics(allMosaiques);
              setUser(res[0]);
              console.log(res[0].picture);
              setUserPicture({uri: res[0].picture});
            }
        }
        );

    }

    useEffect(() => {
        const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
        return subscriber; // unsubscribe on unmount
    }, []);

    async function onLogout() {
        auth().signOut();
        await AsyncStorage.setItem("activeUser", "");
        router.replace("/");
    }

    async function confirmDelete(confirmation: boolean){
      setConfirmDeleteModalVisible(false)
      if(confirmation){
        console.log(mosaiqueToDelete)
        await deleteDbDoc({ collection: "mosaiques", docId: mosaiqueToDelete }).then(async () => {
          user.mosaiques = user.mosaiques.filter((mosaique: any) => mosaique.id !== mosaiqueToDelete);
          setUser(user);
          setUserMosaics(userMosaics.filter((mosaique: any) => mosaique.id !== mosaiqueToDelete));
          if(user.uid == "1qcL9cle0mXLbPfWHQtCAVCdww63") {
            user.uid = "0"
          }
          await updateDoc({ collectionId: "users", docId: user.uid, newDatas: {
            mosaiques: user.mosaiques
          }}).then(() => {
            console.log("User updated");
            user.uid = "1qcL9cle0mXLbPfWHQtCAVCdww63"
          });
        });
        }
    }


    return (
    
    // <HoldMenuProvider theme='dark' safeAreaInsets={{
    //   top: 0,
    //   right: 0,
    //   bottom: 0,
    //   left: 0
    // }}>
    // <StatusBar translucent/>
    // <ImageBackground source={backgroundImage} resizeMode="cover" style={{ flex: 1, justifyContent: 'center', alignItems: 'center', width: screenWidth, height: screenHeight+45 }}>
    
    // <View style={styles.container}>
    //   <TextInput style={styles.homeTextInput} placeholder='Room code'></TextInput>

  
    //   <HoldItem key={"heyp"} items={MenuItems} menuAnchorPosition="bottom-right" hapticFeedback="Heavy" activateOn="tap" containerStyles={{position: 'absolute', bottom: 15, right: 15,zIndex: 10}}>
    //     <View style={styles.item}>
    //       <Text style={styles.text}>aaaaaa</Text>
    //     </View>
    //   </HoldItem>
    // </View>
    // </ImageBackground>
    // </HoldMenuProvider>




    <HoldMenuProvider theme='dark' safeAreaInsets={{
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    }}>
        <View style={styles.container}>
          
          <ImageBackground source={backgroundImage} resizeMode="cover" style={{ flex: 1, justifyContent: 'center', alignItems: 'center', width: screenWidth, height: screenHeight+45 }}>
          
            <View>
              <NewUserModal isVisible={isNewUserModalVisible} onClose={async() => {
                console.log("aaa")
                const activeUser=await AsyncStorage.getItem("activeUser");
                await onAuthStateChanged({uid:activeUser});
                setNewUserModalVisible(false)
                }} user={user} />

              <CreateModal isVisible={isCreateModalVisible} onClose={() => setCreateModalVisible(false)} user={user} />
              <JoinModal isVisible={isJoinModalVisible} onClose={() => setJoinModalVisible(false)} user={user} />
              <ConfirmModal isVisible={isConfirmDeleteModalVisible} text={"Are you sure you want to delete this mosaic?"} onClose={(confirmation)=>(confirmDelete(confirmation))} user={user} />
            </View>
            <Text>Mosaic</Text>

              <View style={styles.topBar}>
                <Pressable onPress={() => {router.replace("/home")}}>
                  <Image source={userPicture} style={{width: 50,height:50, borderRadius:50}}/>
                </Pressable>
                <View style={styles.searchBar}>
                  <Ionicons name="search" size={25} color="grey" style={{width:35}} />
                  <TextInput
                      // style={styles.input}
                      placeholder="Browse mosaics..."
                      placeholderTextColor={"#ffffff50"}
                      // onChangeText={(searchString) => {this.setState({searchString})}}
                      underlineColorAndroid="transparent"
                      style={{padding:0}}
                  />
                </View>
              </View>

              <SelectButton>

                
              </SelectButton>

            {user?.mosaiques && user.mosaiques.length > 0 ? (
              <ScrollView contentContainerStyle={styles.mosaiquesContainer}>
                  {userMosaics
                    .filter((mosaique: any) => mosaique !== null && mosaique !== undefined) // Avoid null/undefined
                    .map((mosaique: any) => (
                      <HoldItem items={MenuItems} hapticFeedback="Heavy" key={mosaique?.id} 
                      actionParams={{
                        Quit: [mosaique.id],
                      }}>
                        <Pressable style={styles.mosaicTag}  key={mosaique?.id} onPress={async() => {await AsyncStorage.setItem("activeMosaic", mosaique?.id);router.replace("/mosaic")}}>
                          <Image
                            source={{ uri: mosaique?.icon || 'https://placehold.co/100x100' }}
                            style={{ width: 50, height: 50 }}
                          />
                          <Text style={styles.mosaicText}>{mosaique?.name || 'Unnamed Mosaic'}</Text>
                        </Pressable>
                      </HoldItem>
                    ))}
              </ScrollView>
            ) : (
              <Text style={{ color: '#FFF', marginTop: 20 }}>No mosaics found. Create or join one!</Text>
            )} 


              <TextInput style={styles.homeTextInput}></TextInput>

                
              <HoldItem key={"Test"} items={AddItems} hapticFeedback="Heavy" activateOn="tap" menuAnchorPosition="bottom-right" containerStyles={{position: 'absolute', bottom: 15, right: 15,zIndex: 10}}>
                  {user && <RoundButton title="+" fontSize={20} />}
              </HoldItem>
          </ImageBackground>
        </View>
    </HoldMenuProvider>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
    mosaiquesContainer: {
        marginVertical: 20,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        display: 'flex',
        width: screenWidth,
    },
    mosaicTag: {
        backgroundColor: '#444',
        borderRadius: 8,
        height: 260,
        margin: 5,
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




    text: {
      color: '#fff',
      // fontWeight: 'bold',
      fontFamily: 'SFPROBOLD',
      textAlign: 'center',
    },
    homeTextInput: {
      height:0, 
    },
    homeButton: {
      backgroundColor: "#9B74DE",
      color: "#fff",
      padding: 10,
      width: "50%",
      textAlign: "center",
      borderRadius: 5,
    },
    item: {
      width: 50,
      height: 50,
      backgroundColor: 'blue',
      margin: 10,
    },
});
