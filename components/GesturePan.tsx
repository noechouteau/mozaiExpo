import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Dimensions, ImageBackground, Pressable, StyleSheet,Text, View,Image } from 'react-native';
import { Gesture, GestureDetector, ScrollView } from 'react-native-gesture-handler';
import { HoldItem } from 'react-native-hold-menu';
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  runOnJS,
} from 'react-native-reanimated';
import SelectButton from './buttons/SelectButton';
import { useEffect, useMemo, useRef, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useMosaic } from '@/context/MosaicContext';
import { useUser } from '@/context/UsersContext';
import RenameModal from './RenameModal';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');


const END_POSITION = - screenWidth *0.9;

// Calculate initial offset to center the left box
const INITIAL_POSITION = screenWidth / 2 - screenWidth * 0.9 / 2;

export default function GesturePan({ searchChain, deleteFunction }: any) {
  const [bgColor, setBgColor] = useState("");
  const [radialBg, setRadialBg] = useState();
  const [backgroundImage, setBackgroundImage] = useState();
  const [isRenameModalVisible, setRenameModalVisible] = useState<boolean>(false);
  const { selectedTheme } = useUser();

  const MenuItems = [
    { text: 'Actions', icon: 'home', isTitle: true, onPress: () => {} },
    { text: 'Rename', icon: 'edit', onPress: async(mosaiqueId:any) => {await AsyncStorage.setItem("activeMosaic",mosaiqueId);setRenameModalVisible(true)} },
    { text: 'Quit', icon: 'trash', isDestructive: true, onPress: (mosaiqueId:any) => {deleteFunction(mosaiqueId)} },
  ];

  const { mosaics } = useMosaic();
  const displayedMosaics = mosaics ? mosaics.filter((mosaique: any) => mosaique.name.toLowerCase().includes(searchChain.toLowerCase())) : [];
  const onLeft = useSharedValue(true);
  const position = useSharedValue(INITIAL_POSITION); // Start centered on the left box
  const [knobPosition, setKnobPosition] = useState("Shared");

  useEffect(() => {
    console.log(radialBg);
    if (selectedTheme === 'greenTheme') {
      setBgColor("#DAEDBD");
      setRadialBg(require('../assets/images/greenTheme/radialBg.png'));
      setBackgroundImage(require('../assets/images/greenTheme/mosaicMinia.png'));
    } else if (selectedTheme === 'blueTheme') {
      setBgColor("#1100ff");
      setRadialBg(require('../assets/images/blueTheme/radialBg.png'));
      setBackgroundImage(require('../assets/images/blueTheme/mosaicMinia.png'));
    } else if (selectedTheme === 'redTheme') {
      setBgColor("#F0265D");
      setRadialBg(require('../assets/images/redTheme/radialBg.png'));
      setBackgroundImage(require('../assets/images/redTheme/mosaicMinia.png'));
    // } else if (selectedTheme === 'purpleTheme') {
    //   setBgColor("#761DA7");
    } else {
      setBgColor("#F94D20");
      setRadialBg(require('../assets/images/orangeTheme/radialBg.png'));
      setBackgroundImage(require('../assets/images/orangeTheme/mosaicMinia.png'));
    }
  }, [selectedTheme]);

  const panGesture = Gesture.Pan().runOnJS(true)
    .onUpdate((e) => {
      if (onLeft.value) {
        position.value = INITIAL_POSITION + e.translationX;
      } else {
        position.value = END_POSITION + e.translationX;
      }
    })
    .onEnd((e) => {
      const velocity = e.velocityX/1000;

      if(onLeft.value){
        if (position.value < END_POSITION*0.33 || velocity < -1.9) {
          position.value = withTiming(END_POSITION, { duration: 200 });
          setTimeout(() => {
            setKnobPosition("Solo");
          }, 200);
          onLeft.value = false;
        } else {
          position.value = withTiming(INITIAL_POSITION, { duration: 200 });
          onLeft.value = true;
        }
      } else if (position.value > END_POSITION*0.66 || velocity > 1.9) {
          position.value = withTiming(INITIAL_POSITION, { duration: 200 })
          setTimeout(() => {
            setKnobPosition("Shared");
          }, 200);
          onLeft.value = true;
        } else {
          position.value = withTiming(END_POSITION, { duration: 200 });
          onLeft.value = false;
        }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: position.value }],
  }));

  useEffect(() => {
    if(knobPosition === "Shared"){
      position.value = withTiming(INITIAL_POSITION, { duration: 200 });
      onLeft.value = true;
    } else {
      position.value = withTiming(END_POSITION, { duration: 200 });
      onLeft.value = false;
    }
  }, [knobPosition]);

  const imagePositionsCache = useRef<Record<string, { top: number; left: number }[]>>({});

  // Function to precompute positions for a mosaic
  const getImagePositions = (mosaicId: string, images: any[]) => {
    console.log(imagePositionsCache.current[mosaicId])
    if (!imagePositionsCache.current[mosaicId]) {
      // If positions are not cached, calculate and store them
      imagePositionsCache.current[mosaicId] = images.map(() => ({
        top: Math.random() * 50,
        left: Math.random() * 200,
      }));
    }
    return imagePositionsCache.current[mosaicId];
  };

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={{marginTop:10}}>
      <SelectButton knobPosition={knobPosition} setKnobPosition={setKnobPosition} />
      <Animated.View style={[styles.container, animatedStyle]}>
        <Animated.View style={[styles.box]} >
          <View><RenameModal isVisible={isRenameModalVisible} onClose={() => setRenameModalVisible(false)} ></RenameModal></View>
          <ScrollView contentContainerStyle={styles.mosaiquesContainer}>
              {displayedMosaics
                .filter((mosaique: any) => mosaique !== null && mosaique !== undefined) // Avoid null/undefined
                .map((mosaique: any) => (
                  mosaique.users &&
                  mosaique.users.length > 1 &&
                  <HoldItem items={MenuItems} hapticFeedback="Heavy" key={mosaique?.id} menuAnchorPosition={mosaique == displayedMosaics[displayedMosaics.length-1] && displayedMosaics.length-1 > 1 ? "bottom-left" : "top-left"}
                  actionParams={{
                    Rename: [mosaique.id],
                    Quit: [mosaique.id],
                  }}>
                    <Pressable style={styles.mosaicTag}  key={mosaique?.id} onPress={async() => {await AsyncStorage.setItem("activeMosaic", mosaique?.id);router.replace("/mosaic")}}>
                      
                    <ImageBackground
                        source={backgroundImage}
                        resizeMode="cover"
                        style={{ backgroundColor: "#0D0D0D" }}
                        imageStyle={{ borderTopLeftRadius: 15, borderTopRightRadius: 15 }}
                      >
                        <View style={styles.mosaicPreview}>
                          <LinearGradient
                            colors={[bgColor, "#0d0d0d", bgColor]}
                            start={{ x: 0.4, y: -4.7 }}
                            end={{ x: -1.1, y: 4.8 }}
                            style={styles.background}
                          />
                            {mosaique?.images?.reverse().map((image:any, index:any) => {
                            const positions = getImagePositions(mosaique.id, mosaique.images);
                            return (
                              <Image
                              key={index}
                              source={{ uri: image.url || 'https://placehold.co/100x100' }}
                              style={{
                              width: 100, 
                              height: 100,
                              top: positions[mosaique.images.length - 1 - index].top,
                              left: positions[mosaique.images.length - 1 - index].left,
                              position: "absolute",
                              }}
                            />
                            ); })}                                 
                        </View>
                      </ImageBackground>

                    <ImageBackground source={radialBg} resizeMode="cover" imageStyle={{  borderBottomLeftRadius: 15, borderBottomRightRadius: 15}} style={{backgroundColor:"#0D0D0D"}}>
                      <View style={styles.mosaicInfo}>
                        <Text style={styles.mosaicText}>{mosaique?.name || 'Unnamed Mosaic'}</Text>
                      </View>
                    </ImageBackground>

                    </Pressable>
                  </HoldItem>
                ))}
          </ScrollView>
        </Animated.View>

        <Animated.View style={[styles.rightBox]}>
          <ScrollView contentContainerStyle={styles.mosaiquesContainer}>
                {displayedMosaics
                  .filter((mosaique: any) => mosaique !== null && mosaique !== undefined) // Avoid null/undefined
                  .map((mosaique: any) => (
                    mosaique.users &&
                    mosaique.users.length == 1 &&
                    <HoldItem items={MenuItems} hapticFeedback="Heavy" key={mosaique?.id} menuAnchorPosition={mosaique == displayedMosaics[displayedMosaics.length-1] && displayedMosaics.length-1 > 1 ? "bottom-left" : "top-left"}
                    actionParams={{
                      Quit: [mosaique.id],
                    }}>
                      <Pressable style={styles.mosaicTag}  key={mosaique?.id} onPress={async() => {await AsyncStorage.setItem("activeMosaic", mosaique?.id);router.replace("/mosaic")}}>
                        
                      <ImageBackground source={backgroundImage} resizeMode="stretch" style={{backgroundColor:"#0D0D0D"}} imageStyle={{  borderTopLeftRadius: 15, borderTopRightRadius: 15}}>
                        <View style={styles.mosaicPreview}>
                        {mosaique?.images?.reverse().map((image:any, index:any) => {
                            const positions = getImagePositions(mosaique.id, mosaique.images);
                            return (
                              <Image
                              key={index}
                              source={{ uri: image.url || 'https://placehold.co/100x100' }}
                              style={{
                              width: 100, 
                              height: 100,
                              top: positions[mosaique.images.length - 1 - index].top,
                              left: positions[mosaique.images.length - 1 - index].left,
                              position: "absolute",
                              }}
                            />
                            ); })} 
                        </View>
                      </ImageBackground >

                      <ImageBackground source={radialBg} resizeMode="cover" imageStyle={{  borderBottomLeftRadius: 15, borderBottomRightRadius: 15}} style={{backgroundColor:"#0D0D0D"}}>
                        <View style={styles.mosaicInfo}>
                          <Text style={styles.mosaicText}>{mosaique?.name || 'Unnamed Mosaic'}</Text>
                        </View>
                      </ImageBackground>

                      </Pressable>
                    </HoldItem>
                  ))}
            </ScrollView>
        </Animated.View>


      </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    width: screenWidth * 2,
    gap: 20,
    justifyContent: 'flex-start',
    left: screenWidth / 2,
  },
  box: {
    height: screenHeight-120 ,
    width: screenWidth * 0.9,
    marginBottom: 30,
  },
  rightBox: {
    height: screenHeight-120 ,
    width: screenWidth * 0.9,
    marginBottom: 30,
  },
  mosaiquesContainer: {
    margin:0,
    padding:0,
    display: 'flex',
    width: screenWidth,
  },
  mosaicTag: {
    marginTop: 15,
    width: screenWidth*0.88,
  },
  mosaicText: {
      color: '#FFFFFF',
      fontSize: 16,
  },
  mosaicPreview: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    height: 160,
    borderWidth: 2,
    borderColor: "#8D8E8C",
    overflow: 'hidden',
  },
  mosaicInfo: {
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    borderWidth: 2,
    borderTopWidth: 0,
    borderColor: "#8D8E8C",
    padding: 10,
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 300,
  },
});
