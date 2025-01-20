import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing, ReduceMotion } from 'react-native-reanimated';

const { width: screenWidth } = Dimensions.get('window');
const BACKGROUND_WIDTH = screenWidth * 0.9; // 90% of screen width

const SelectButton = (props:any) => {
  const [selected, setSelected] = useState('Shared'); // Selected value
  const [leftOffset, setLeftOffset] = useState(4); // Left offset of the highlight
  const animationValue = useSharedValue(0);

  const handleSelect = (option:any) => {
    setSelected(option);
    setLeftOffset(0)
    animationValue.value = withTiming(option === 'Shared' ? 0.0295 : 0.995, {
    duration: 500,
    easing: Easing.inOut(Easing.quad),
    reduceMotion: ReduceMotion.System,
    });
    props.setKnobPosition(option);
  };

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = animationValue.value * (BACKGROUND_WIDTH / 2); // Adjusted to fit the dimensions of buttons
    return {
      transform: [{ translateX }],
      left: leftOffset,
    };
  });

  useEffect(() => {
    handleSelect(props.knobPosition);
    setSelected(props.knobPosition);
  }, [props.knobPosition]);

  return (
    <View>
      <View style={styles.background}>
        <Animated.View
          style={[
            styles.highlight,
            animatedStyle, // Apply the animated style
            
          ]}
        />
        <TouchableOpacity
          style={styles.option}
          onPress={() => handleSelect('Shared')}
        >
          <Text
            style={[
              styles.text,
              selected === 'Shared' ? styles.selectedText : styles.unselectedText,
            ]}
          >
            Shared
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.option}
          onPress={() => handleSelect('Solo')}
        >
          <Text
            style={[
              styles.text,
              selected === 'Solo' ? styles.selectedText : styles.unselectedText,
            ]}
          >
            Solo
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  background: {
    flexDirection: 'row',
    width: screenWidth*0.9,
    left: screenWidth*0.55,
    height: 40,
    padding: 5,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#646464',
    overflow: 'hidden',
    backgroundColor: '#000', // Background color
    alignItems: 'center',
    display: 'flex',
  },
  highlight: {
    position: 'absolute',
    width: '50%',
    height: '100%',
    transform: [{ translateX: 15 }],
    borderWidth: 1,
    borderColor: '#ffffff50',
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.1)', // Animation color
  },
  option: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  selectedText: {
    color: '#FFFFFF',
  },
  unselectedText: {
    color: '#888888',
  },
});

export default SelectButton;
