import React, { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDecay,
  useAnimatedReaction,
  runOnJS,
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import { StyleSheet, Dimensions, View,Image } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import { PanGestureHandler, State } from 'react-native-gesture-handler';


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
  const [photos, setPhotos] = React.useState<{ uri: string; width: number; height: number }[]>([]);
  const [topPhotos, setTopPhotos] = React.useState<any[]>([]);
  const [leftPhotos, setLeftPhotos] = React.useState<any[]>([]);
  const [topLeftPhotos, setTopLeftPhotos] = React.useState<any[]>([]);

  const [oldPhotos, setOldPhotos] = React.useState<any[]>([]);
  const [oldTopPhotos, setOldTopPhotos] = React.useState<any[]>([]);
  const [oldLeftPhotos, setOldLeftPhotos] = React.useState<any[]>([]);
  const [oldTopLeftPhotos, setOldTopLeftPhotos] = React.useState<any[]>([]);

  const testOldPhotos = useSharedValue<any[]>([]);

  const baseIndex = useSharedValue(0);
  const leftIndex = useSharedValue(0);
  const topIndex = useSharedValue(0);
  const topLeftIndex = useSharedValue(0);


  const [positions, setPositions] = React.useState<any[][]>([]);
  const [topPositions, setTopPositions] = React.useState<any[]>([]);
  const [leftPositions, setLeftPositions] = React.useState<any[]>([]);
  const [topLeftPositions, setTopLeftPositions] = React.useState<any[]>([]);

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
    constantHeightOffset.value = lastPosition.y + 150 + SPACING
    topOffset.value = lastPosition.y + 150 + SPACING
    console.log(constantHeightOffset)
    console.log(positions)
  
    return positions;
  };

  async function getPhotos(func:any, oldFunc:any, posFunc:any, passedPhotos:any,passedPositions:any) {
    setPhotos([]);
    if (status === null) {
      await requestPermission();
    }
  
    const fetchedPhotos = await MediaLibrary.getAssetsAsync({
      first : 1,
    });

    setTotal(fetchedPhotos.totalCount)

    let randImages = []
    let randIndexes = [0]
    console.log("FETCHED",fetchedPhotos.totalCount)
    for(let i = 0; i< 60; i++){
      let tempRand = Math.floor(Math.random() * fetchedPhotos.totalCount)

      let rand = await MediaLibrary.getAssetsAsync({
        // after: fetchedPhotos.assets[tempRand].id,
        after: tempRand.toFixed(),
        first: 1,
      })
      randImages.push(rand.assets[0])
      randIndexes.push(tempRand)
    }
  
    let newPhotos = [];
  
    for (const element of randImages) {
      let asset = element;
  
      let scaledWidth = asset.width;
      let scaledHeight = asset.height;
  
      // Scale down if too large, but keep aspect ratio
      if (asset.height > 150) {
        const aspectRatio = asset.width / asset.height;
        // if (aspectRatio > 1) {
        //   scaledWidth = 150;
        //   scaledHeight = 150 / aspectRatio;
        // } else {
          scaledHeight = 150;
          scaledWidth = 150 * aspectRatio;
        // }
      }
  
      newPhotos.push({
        uri: asset.uri,
        width: scaledWidth,
        height: scaledHeight,
      });
    }
    func(newPhotos);
    oldFunc([...passedPhotos, newPhotos]);
    console.log("JUSTGOTNEW")
    console.log(oldPhotos)
    console.log(newPhotos)
    console.log([...oldPhotos, newPhotos])

    posFunc([...passedPositions, generateGridPositions(newPhotos)]);
  }

    useEffect(() => {
        getPhotos(setPhotos, setOldPhotos, setPositions,oldPhotos, positions);
        console.log("useEffect")
    }, []);

    useEffect(() => {
      console.log("Photos")
    }, [photos]);


    const verifPos = () => {
      // console.log(currentEvent.value)
      console.log(translationY.value)
      // console.log(-baseOffset.value, -leftOffset.value)
      // console.log(-baseOffset.value-700, -leftOffset.value-700)
      // console.log(-topOffset.value, -heihtBaseOffset.value)
      // console.log(-topOffset.value-700, -heihtBaseOffset.value-700)
    
      if(translationX.value < -leftOffset.value-700 && baseOffset.value < leftOffset.value ){
        console.log("houas")
        baseOffset.value = leftOffset.value + constantOffset
        baseIndex.value++

        if(oldPhotos[baseIndex.value] == undefined){
          console.log("BAYBAEHEHEHE")
          runOnJS(getPhotos)(setPhotos, setOldLeftPhotos, setPositions,oldPhotos,positions);
        }
      } else if(translationX.value > -leftOffset.value-700 && baseOffset.value > leftOffset.value){
        console.log("jveux domrir")
        baseOffset.value = leftOffset.value - constantOffset
        baseIndex.value--
        console.log(baseIndex.value)
      } else if(translationX.value < -baseOffset.value-700 && baseOffset.value > leftOffset.value){
        leftOffset.value = baseOffset.value + constantOffset
        leftIndex.value++

        if(oldLeftPhotos[leftIndex.value] == undefined){
          console.log("BAYBAEHEHEHE")
          runOnJS(getPhotos)(setLeftPhotos, setOldLeftPhotos, setLeftPositions,oldLeftPhotos, leftPositions);
        }
      } else if(translationX.value > -baseOffset.value-700 && baseOffset.value < leftOffset.value){
        leftOffset.value = baseOffset.value - constantOffset
        leftIndex.value--
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
      console.log(baseIndex.value)
      console.log(oldPhotos[baseIndex.value])
      console.log(oldPhotos[baseIndex.value]?.length>1)
      console.log(testOldPhotos.value)
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
    
    return (
      <GestureHandlerRootView style={styles.container}>
      <GestureDetector gesture={Gesture.Simultaneous(panGesture, pinchGesture)}>
        <Animated.View style={[{display: "flex", flexDirection: "row"}, animatedScale]}>

        <Animated.View style={[styles.mosaicContainer, animatedStyle]}>
          {oldPhotos[baseIndex.value]?.length>1? oldPhotos[baseIndex.value]?.map((photo:any, index:any) => (
            <Image
              key={index}
              source={{ uri: photo.uri }}
              style={[
                styles.image,
                { width: photo.width, height: photo.height, left: positions[baseIndex.value][index]?.x, top: positions[baseIndex.value][index]?.y },
              ]}
            />
          ))
          : //Loop to create 60 empty boxes
          <View style={{display: "flex", flexDirection: "column", gap: 15}}>
{            [...Array(7)].map((_, index) => (
              <View style={{display: "flex", flexDirection: "row", gap: 15}} key={index}>
                {[...Array(9)].map((_, index) => (
                  <View style={styles.box2} key={index}></View>
                ))}
            </View>
          ))}
          </View>
        }
        </Animated.View>

        <Animated.View style={[styles.mosaicContainer, leftAnimatedStyle]}>
          {oldLeftPhotos[leftIndex.value]?.length>1? oldLeftPhotos[leftIndex.value]?.map((photo:any, index:any) => (
            <Image
              key={index}
              source={{ uri: photo.uri }}
              style={[
                styles.image,
                { width: photo.width, height: photo.height, left: leftPositions[leftIndex.value][index]?.x, top: leftPositions[leftIndex.value][index]?.y },
              ]}
            />
          ))
          : //Loop to create 60 empty boxes
          <View style={{display: "flex", flexDirection: "column", gap: 15}}>
{            [...Array(7)].map((_, index) => (
              <View style={{display: "flex", flexDirection: "row", gap: 15}} key={index}>
                {[...Array(9)].map((_, index) => (
                  <View style={styles.box2} key={index}></View>
                ))}
            </View>
          ))}
          </View>
        }
        </Animated.View>

        <Animated.View style={[styles.mosaicContainer, topAnimatedStyle]}>
          {oldTopPhotos[topIndex.value]?.length>1? oldTopPhotos[topIndex.value]?.map((photo:any, index:any) => (
            <Image
              key={index}
              source={{ uri: photo.uri }}
              style={[
                styles.image,
                { width: photo.width, height: photo.height, left: topPositions[topIndex.value][index]?.x, top: topPositions[topIndex.value][index]?.y },
              ]}
            />
          ))
          : //Loop to create 60 empty boxes
          <View style={{display: "flex", flexDirection: "column", gap: 15}}>
{            [...Array(7)].map((_, index) => (
              <View style={{display: "flex", flexDirection: "row", gap: 15}} key={index}>
                {[...Array(9)].map((_, index) => (
                  <View style={styles.box2} key={index}></View>
                ))}
            </View>
          ))}
          </View>
        }
        </Animated.View>
        
        <Animated.View style={[styles.mosaicContainer, topLeftAnimatedStyle]}>
          {oldTopLeftPhotos[topLeftIndex.value]?.length>1? oldTopLeftPhotos[topLeftIndex.value]?.map((photo:any, index:any) => (
            <Image
              key={index}
              source={{ uri: photo.uri }}
              style={[
                styles.image,
                { width: photo.width, height: photo.height, left: topLeftPositions[topLeftIndex.value][index]?.x, top: topLeftPositions[topLeftIndex.value][index]?.y },
              ]}
            />
          ))
          : //Loop to create 60 empty boxes
          <View style={{display: "flex", flexDirection: "column", gap: 15}}>
{            [...Array(7)].map((_, index) => (
              <View style={{display: "flex", flexDirection: "row", gap: 15}} key={index}>
                {[...Array(9)].map((_, index) => (
                  <View style={styles.box2} key={index}></View>
                ))}
            </View>
          ))}
          </View>
        }
        </Animated.View>

        </Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'red',
    width: width,
    height: height,
  },
  mosaicContainer: {
    position: "absolute",
    backgroundColor:"#1a1a1a",
    width:GridWidth, 
    height: height,
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
    backgroundColor: '#b58df1',
    borderRadius: 20,

  },

});