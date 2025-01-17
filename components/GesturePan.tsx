import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Dimensions, ImageBackground, Pressable, StyleSheet,Text, View,Image } from 'react-native';
import { Gesture, GestureDetector, ScrollView } from 'react-native-gesture-handler';
import { HoldItem } from 'react-native-hold-menu';
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
} from 'react-native-reanimated';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const backgroundImage = require('../assets/images/bg_login_2.png');

const MenuItems = [
  { text: 'Actions', icon: 'home', isTitle: true, onPress: () => {} },
  { text: 'Rename', icon: 'edit', onPress: () => {} },
  { text: 'Quit', icon: 'trash', isDestructive: true, onPress: (mosaiqueId:any) => {} },
];

const END_POSITION = - screenWidth *0.9;

// Calculate initial offset to center the left box
const INITIAL_POSITION = screenWidth / 2 - screenWidth * 0.9 / 2;

export default function GesturePan({ mosaics }: any) {
  const displayedMosaics = mosaics;
  const onLeft = useSharedValue(true);
  const position = useSharedValue(INITIAL_POSITION); // Start centered on the left box

  const panGesture = Gesture.Pan()
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
          onLeft.value = false;
        } else {
          position.value = withTiming(INITIAL_POSITION, { duration: 200 });
          onLeft.value = true;
        }
      } else if (position.value > END_POSITION*0.66 || velocity > 1.9) {
          position.value = withTiming(INITIAL_POSITION, { duration: 200 });
          onLeft.value = true;
        } else {
          position.value = withTiming(END_POSITION, { duration: 200 });
          onLeft.value = false;
        }

    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: position.value }],
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.container, animatedStyle]}>

        <Animated.View style={[styles.box]} >
          <ScrollView contentContainerStyle={styles.mosaiquesContainer}>
              {displayedMosaics
                .filter((mosaique: any) => mosaique !== null && mosaique !== undefined) // Avoid null/undefined
                .map((mosaique: any) => (
                  <HoldItem items={MenuItems} hapticFeedback="Heavy" key={mosaique?.id} 
                  actionParams={{
                    Quit: [mosaique.id],
                  }}>
                    <Pressable style={styles.mosaicTag}  key={mosaique?.id} onPress={async() => {await AsyncStorage.setItem("activeMosaic", mosaique?.id);router.replace("/mosaic")}}>
                      
                    <ImageBackground source={backgroundImage} resizeMode="cover" style={styles.mosaicPreview}>
                      <View style={styles.mosaicPreview}>
                        {/* <LinearGradient
                          // Background Linear Gradient
                          colors={['rgba(0,0,0,0.8)', 'transparent']}
                          style={styles.background}
                        /> */}
                        <Image
                          source={{ uri: mosaique?.icon || 'https://placehold.co/100x100' }}
                          style={{ width: 50, height: 50 }}
                        />
                        <Image
                          source={{ uri: mosaique?.images[0]?.url || 'https://placehold.co/100x100' }}
                          style={{ width: 50, height: 50 }}
                        />
                      </View>
                    </ImageBackground>

                      <View style={styles.mosaicInfo}>
                        <Text style={styles.mosaicText}>{mosaique?.name || 'Unnamed Mosaic'}</Text>
                      </View>
                    </Pressable>
                  </HoldItem>
                ))}
          </ScrollView>
        </Animated.View>

        <Animated.View style={[styles.rightBox]}>

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
    width: screenWidth * 0.9,
    padding: 0,

    margin: 0,
    borderRadius: 20,
    marginBottom: 30,
  },
  rightBox: {
    height: 520,
    width: screenWidth * 0.9,
    backgroundColor: '#b58df1',
    borderRadius: 20,
    marginBottom: 30,
  },
  mosaiquesContainer: {
    margin:0,
    padding:0,
    display: 'flex',
    width: screenWidth,
  },
  mosaicTag: {
    backgroundColor: '#444',
    borderRadius: 8,
    marginTop: 10,
    width: screenWidth*0.88,
  },
  mosaicText: {
      color: '#FFFFFF',
      fontSize: 16,
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
});
