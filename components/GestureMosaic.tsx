import React, { act, useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDecay,
  useAnimatedReaction,
  runOnJS,
  interpolateColor,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import { StyleSheet, Dimensions, View,Image } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import LoadingScreen from './LoadingScreen';
import { HoldItem } from 'react-native-hold-menu';
import BackButton from './buttons/BackButton';
import RoundButton from './buttons/RoundButton';
import {router} from 'expo-router';


const { width, height } = Dimensions.get('screen');

const NUM_COLUMNS = 5; // Nombre de colonnes
const IMAGE_SIZE = 150; // Taille des images
const SPACING = 10; // Espacement entre les images
const GridWidth = width*4;

// const generateRandomPositions = (images: any) => {
//   const maxRows = Math.ceil(Math.sqrt(images.length));
//   const maxCols = Math.ceil(images.length / maxRows);

//   return images.map((image:any,index:any) => ({
//     x:  index * SPACING * 1.5 - (maxCols * SPACING) / 2 + Math.random() * (SPACING * 0.5),
//     y:  index * SPACING * 1.5 - (maxRows * SPACING) / 2 + Math.random() * (SPACING * 0.5)
//   }));
// }



export default function GestureMosaic() {

  const MenuItems = [
    { text: 'Delete', icon: 'trash', isDestructive: true, onPress: ()=>{} },
  ];

  const [loadingVisible, setLoadingVisible] = React.useState<boolean>(true);

  const [photos, setPhotos] = React.useState<{ uri: string; width: number; height: number }[]>([]);
  const [topPhotos, setTopPhotos] = React.useState<any[]>([]);
  const [leftPhotos, setLeftPhotos] = React.useState<any[]>([]);
  const [topLeftPhotos, setTopLeftPhotos] = React.useState<any[]>([]);

  const [oldPhotos, setOldPhotos] = React.useState<any[]>([]);
  const [oldTopPhotos, setOldTopPhotos] = React.useState<any[]>([]);
  const [oldLeftPhotos, setOldLeftPhotos] = React.useState<any[]>([]);
  const [oldTopLeftPhotos, setOldTopLeftPhotos] = React.useState<any[]>([]);

  const baseIndex = useSharedValue(0);
  const leftIndex = useSharedValue(0);
  const topIndex = useSharedValue(0);
  const topLeftIndex = useSharedValue(0);


  const [positions, setPositions] = React.useState<any[]>([]);
  const [topPositions, setTopPositions] = React.useState<any[]>([]);
  const [leftPositions, setLeftPositions] = React.useState<any[]>([]);
  const [topLeftPositions, setTopLeftPositions] = React.useState<any[]>([]);

  const [oldPositions, setOldPositions] = React.useState<any[][]>([]);
  const [oldTopPositions, setOldTopPositions] = React.useState<any[][]>([]);
  const [oldLeftPositions, setOldLeftPositions] = React.useState<any[][]>([]);
  const [oldTopLeftPositions, setOldTopLeftPositions] = React.useState<any[][]>([])

  const scale = useSharedValue(1);
  const prevScale = useSharedValue(1); 

  const [status, requestPermission] = MediaLibrary.usePermissions();
  const [total, setTotal] = React.useState(0);
  const [translate, setTranslate] = React.useState({ x: 0, y: 0 });
  const translationX = useSharedValue(0);
  const translationY = useSharedValue(0);
  const prevTranslationX = useSharedValue(0);
  const prevTranslationY = useSharedValue(0);
  const constantOffset =GridWidth
  const constantHeightOffset = useSharedValue(0);

  const baseOffset = useSharedValue(0);
  const heihtBaseOffset = useSharedValue(0);

  const leftOffset = useSharedValue(width*4);
  const topOffset = useSharedValue(0);

  const opacity = useSharedValue(1);
  const currentEvent:any = useSharedValue({});
  const progress = useSharedValue(0);


  const generateGridPositions = (images: any) => {
    let positions: any[] = [];
    let currentX = 0;
    let currentY = 0;
    let row: any[] = [];
    let maxRowHeight = 0;
    console.log(photos)
  
    images.forEach(async (image:any, index:any) => {
      if (currentX + image.width >GridWidth) {
        // Apply the max height of the row to all images in it
        row.forEach((img) => {
          positions[img.index].y = currentY;
        });
  
        currentX = 0;
        currentY += maxRowHeight + SPACING;
        maxRowHeight = 0;
        row = [];
      }
  
      positions.push({ x: currentX, y: currentY });
      row.push({ index, height: image.height });
  
      maxRowHeight = Math.max(maxRowHeight, image.height);
  
      currentX += image.width + SPACING;
    });
  
    row.forEach((img) => {
      positions[img.index].y = currentY;
    });

    const lastPosition = positions[positions.length-1]
    constantHeightOffset.value = 8*160
    topOffset.value = 8*160
    console.log(constantHeightOffset)
    console.log(positions)
  
    return positions;
  };

  async function getPhotos(func:any, oldFunc:any, posFunc:any, oldPosFunc:any, passedPhotos:any, passedPositions:any) {
    setLoadingVisible(true);
  
    if (status === null) {
      await requestPermission();
    }
  
    let actualTotal = total;
    if (total === 0) {
      const fetchedPhotos = await MediaLibrary.getAssetsAsync({ first: 1 });
      setTotal(fetchedPhotos.totalCount);
      actualTotal = fetchedPhotos.totalCount;
    }
  
    let randIndexes = Array.from({ length: 100 }, () => Math.floor(Math.random() * actualTotal));
  
    // Exécuter toutes les requêtes en parallèle
    const randImages = await Promise.all(
      randIndexes.map(async (tempRand) => {
        let rand = await MediaLibrary.getAssetsAsync({
          after: tempRand.toFixed(),
          first: 1,
        });
        return rand.assets[0];
      })
    );
  
    let newPhotos = randImages.map((asset) => {
      let scaledWidth = asset.width;
      let scaledHeight = asset.height;
      
      if (asset.height > 150) {
        const aspectRatio = asset.width / asset.height;
        scaledHeight = 150;
        scaledWidth = 150 * aspectRatio;
      }
  
      return {
        uri: asset.uri,
        width: scaledWidth,
        height: scaledHeight,
      };
    });
  
    oldFunc([...(passedPhotos || []), newPhotos]);
    func(newPhotos);
    
    const newPositions = generateGridPositions(newPhotos);
    posFunc(newPositions);
    oldPosFunc([...(passedPositions || []), newPositions]);
    
    setLoadingVisible(false);
  }
  

    useEffect(() => {
      // progress.value = withRepeat(
      //   withTiming(1, { duration: 1000, }),
      //   -1,
      //   true
      // );
        getPhotos(setPhotos, setOldPhotos, setPositions,setOldPositions,oldPhotos, positions);
        console.log("useEffect")

    }, []);

    useEffect(() => {
      console.log("Photos")
    }, [photos]);


    const verifPos = () => {
      // console.log(currentEvent.value)
      console.log(translationY.value)
      console.log(-baseOffset.value, -leftOffset.value)
      console.log(-baseOffset.value-700, -leftOffset.value-700)
      // console.log(-topOffset.value, -heihtBaseOffset.value)
      // console.log(-topOffset.value-700, -heihtBaseOffset.value-700)
    
      if(translationX.value < -leftOffset.value-700 && baseOffset.value < leftOffset.value ){
        baseOffset.value = leftOffset.value + constantOffset
        baseIndex.value++

        // if(oldPhotos[baseIndex.value] == undefined){
        //   console.log("BAYBAEHEHEHE")
        //   runOnJS(getPhotos)(setPhotos, setOldPhotos, setPositions,setOldPositions,oldPhotos || [], positions || []);
        // } else {
        //   runOnJS(setPhotos)(oldPhotos[baseIndex.value])
        //   runOnJS(setPositions)(oldPositions[baseIndex.value])
        // }
      } else if(translationX.value > -leftOffset.value-700 && baseOffset.value > leftOffset.value){
        baseOffset.value = leftOffset.value - constantOffset
        baseIndex.value--
        // runOnJS(setPhotos)(oldPhotos[baseIndex.value])
        // runOnJS(setPositions)(oldPositions[baseIndex.value])

      } else if(translationX.value < -baseOffset.value-700 && baseOffset.value > leftOffset.value){
        leftOffset.value = baseOffset.value + constantOffset
        leftIndex.value++

        // if(oldLeftPhotos[leftIndex.value] == undefined){
        //   console.log("BAYBAEHEHEHE LEFT")
        //   runOnJS(getPhotos)(setLeftPhotos, setOldLeftPhotos,setLeftPositions,setOldLeftPositions,oldLeftPhotos, leftPositions);
        // } else {
        //   runOnJS(setLeftPhotos)(oldLeftPhotos[leftIndex.value])
        //   runOnJS(setLeftPositions)(oldLeftPositions[leftIndex.value])
        // }

      } else if(translationX.value > -baseOffset.value-700 && baseOffset.value < leftOffset.value){
        leftOffset.value = baseOffset.value - constantOffset
        leftIndex.value--
        // runOnJS(setLeftPhotos)(oldLeftPhotos[leftIndex.value])
        // runOnJS(setLeftPositions)(oldLeftPositions[leftIndex.value])
      }

      if(translationY.value < -topOffset.value-700 && heihtBaseOffset.value < topOffset.value ){
        console.log("salolo")
        heihtBaseOffset.value = topOffset.value + constantHeightOffset.value
        topIndex.value++
        console.log(oldTopLeftPhotos[topLeftIndex.value])
      } else if(translationY.value > -topOffset.value-700 && heihtBaseOffset.value > topOffset.value){
        console.log("pineapple")
        heihtBaseOffset.value = topOffset.value - constantHeightOffset.value
        topIndex.value--
      } else if(translationY.value < -heihtBaseOffset.value-700 && heihtBaseOffset.value > topOffset.value){
        topOffset.value = heihtBaseOffset.value + constantHeightOffset.value
        topLeftIndex.value++
      } else if(translationY.value > -heihtBaseOffset.value-700 && heihtBaseOffset.value < topOffset.value){
        topOffset.value = heihtBaseOffset.value - constantHeightOffset.value
        topLeftIndex.value--
      }

      if(opacity.value == 0){
        opacity.value = withSpring(
          1,
          { damping: 10 }
        );
      }
    }

    const panGesture = Gesture.Pan()
    .onStart(() => {
      prevTranslationX.value = translationX.value;
      prevTranslationY.value = translationY.value;


    })
    .onUpdate((event) => {
      translationX.value = prevTranslationX.value + event.translationX;
      translationY.value = prevTranslationY.value + event.translationY;

      if(event.velocityX > 4000 || event.velocityX < -4000 || event.velocityY > 4000 || event.velocityY < -4000){
        opacity.value = withSpring(0);
        console.log(event.velocityX)
      }
    })
    .onEnd(async (event) => {
      // Apply withDecay for smooth deceleration
      translationX.value = withDecay({ velocity: event.velocityX },()=>{currentEvent.value = event;verifPos});
      translationY.value = withDecay({ velocity: event.velocityY },verifPos);
      console.log("END",translationX.value, -width*4)
      
      verifPos()
    });

    const pinchGesture = Gesture.Pinch()
      .onStart(() => {
        prevScale.value = scale.value;
      })
      .onUpdate((event) => {
        scale.value = Math.max(0.4, Math.min(prevScale.value * event.scale, 3));
      })
      .onEnd(() => {
        scale.value = withSpring(Math.max(0.5, Math.min(scale.value, 3)), { damping: 50 });
        prevScale.value = scale.value; 
      });
  
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ translateX: translationX.value+baseOffset.value }, 
        { translateY: translationY.value+heihtBaseOffset.value },      
      ],
      opacity: opacity.value,
    }));

    const animatedScale  = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    const leftAnimatedStyle = useAnimatedStyle(() => ({
      transform: [{ translateX: translationX.value+leftOffset.value},
        { translateY: translationY.value + heihtBaseOffset.value },
      ],
      opacity: opacity.value,
    }));

    const topAnimatedStyle = useAnimatedStyle(() => (
      {
      transform: [{ translateX: translationX.value + baseOffset.value }, 
        { translateY: translationY.value + topOffset.value },
      ],
      opacity: opacity.value,
    }));

    const topLeftAnimatedStyle = useAnimatedStyle(() => (
      {
      transform: [{ translateX: translationX.value + leftOffset.value }, 
        { translateY: translationY.value + topOffset.value },
      ],
      opacity: opacity.value,
    }));

    const animatedColor = useAnimatedStyle(() => {
      return {
        backgroundColor: interpolateColor(
          progress.value,
          [0, 1],
          ['#959595', '#606060']
        ),
      };
    });


    return (<>
    <LoadingScreen text="Loading local images..." isVisible={loadingVisible}></LoadingScreen>
    <View style={[styles.topBar, {zIndex: 950}]}>
        <RoundButton
            onPress={() => router.replace("/home")}
            title="Home" icon="home" size={25}
        />
    </View>
    <GestureHandlerRootView style={styles.container}>
      <GestureDetector gesture={Gesture.Simultaneous(panGesture, pinchGesture)}>
        <Animated.View style={[{display: "flex", flexDirection: "row"}, animatedScale]}>
        <Animated.View style={[styles.mosaicContainer, animatedStyle]}>
          {photos?.length>1? photos?.map((photo:any, index:any) => (
            // <HoldItem items={MenuItems} hapticFeedback="Heavy" key={index}>
              <Image
                key={index}
                source={{ uri: photo.uri }}
                style={[
                  styles.image,
                  { width: photo.width, height: photo.height, left: positions[index]?.x, top: positions[index]?.y },
                ]}
              />
            // </HoldItem>
          ))
          : //Loop to create 60 empty boxes
          <Animated.View style={{display: "flex", flexDirection: "column", gap: 15}}>
{            [...Array(7)].map((_, index) => (
              <Animated.View style={{display: "flex", flexDirection: "row", gap: 15}} key={index}>
                {[...Array(9)].map((_, index) => (
                  <Animated.View style={[styles.box2,animatedColor,{backgroundColor:"black"}]} key={index}></Animated.View>
                ))}
            </Animated.View>
          ))}
          </Animated.View>
        }
        </Animated.View>

        <Animated.View style={[styles.mosaicContainer, leftAnimatedStyle]}>
        {photos?.length>1? photos?.map((photo:any, index:any) => (
            <Image
              key={index}
              source={{ uri: photo.uri }}
              style={[
                styles.image,
                { width: photo.width, height: photo.height, left: positions[index]?.x, top: positions[index]?.y },
              ]}
            />
          ))
          : //Loop to create 60 empty boxes
          <View style={{display: "flex", flexDirection: "column", gap: 15}}>
{            [...Array(7)].map((_, index) => (
              <View style={{display: "flex", flexDirection: "row", gap: 15}} key={index}>
                {[...Array(9)].map((_, index) => (
                  <Animated.View style={[styles.box2,animatedColor]} key={index}></Animated.View>
                ))}
            </View>
          ))}
          </View>
        }
        </Animated.View>

        <Animated.View style={[styles.mosaicContainer, topAnimatedStyle]}>
        {photos?.length>1? photos?.map((photo:any, index:any) => (
          // <HoldItem items={MenuItems} hapticFeedback="Heavy" key={index}>
              <Image
                key={index}
                source={{ uri: photo.uri }}
                style={[
                  styles.image,
                  { width: photo.width, height: photo.height, left: positions[index]?.x, top: positions[index]?.y },
                ]}
              />
            // </HoldItem>
          ))
          : //Loop to create 60 empty boxes
          <View style={{display: "flex", flexDirection: "column", gap: 15}}>
{            [...Array(7)].map((_, index) => (
              <View style={{display: "flex", flexDirection: "row", gap: 15}} key={index}>
                {[...Array(9)].map((_, index) => (
                  <Animated.View style={[styles.box2,animatedColor]} key={index}></Animated.View>
                ))}
            </View>
          ))}
          </View>
        }
        </Animated.View>
        
        <Animated.View style={[styles.mosaicContainer, topLeftAnimatedStyle]}>
        {photos?.length>1? photos?.map((photo:any, index:any) => (
            <Image
              key={index}
              source={{ uri: photo.uri }}
              style={[
                styles.image,
                { width: photo.width, height: photo.height, left: positions[index]?.x, top: positions[index]?.y },
              ]}
            />
          ))
          : //Loop to create 60 empty boxes
          <View style={{display: "flex", flexDirection: "column", gap: 15}}>
{            [...Array(7)].map((_, index) => (
              <View style={{display: "flex", flexDirection: "row", gap: 15}} key={index}>
                {[...Array(9)].map((_, index) => (
                  <Animated.View style={[styles.box2,animatedColor]} key={index}></Animated.View>
                ))}
            </View>
          ))}
          </View>
        }
        </Animated.View>

        </Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
    </>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a1a',
    width: width,
    height: height,
  },
  mosaicContainer: {
    position: "absolute",
    backgroundColor:"#1a1a1a",
    width:GridWidth, 
    height: 8*160,
    overflow: "hidden",
  },
  image: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    position: "absolute",
    borderRadius: 10,
  },
  box2: {
    width: 145,
    height: 145,
    borderRadius: 20,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    paddingTop: 45,
    position: 'absolute',
    top: 0,
},

});