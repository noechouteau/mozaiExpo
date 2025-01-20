import React from 'react';
import { View, StyleSheet,Dimensions,Text,TextInput } from 'react-native';


const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

export default function CustomTextInput(props:any) {
    return(
    <View style={props.style}>
        <Text style={styles.text}>{props.label}</Text>
        <TextInput value={props.value} style={styles.input} placeholder={props.placeholder} onChangeText={props.onChangeText} placeholderTextColor={"#CBCBCB"}></TextInput>
    </View>
    )
}

const styles = StyleSheet.create({
      input: {
        borderRadius: 12,
        marginTop: 10,
        borderColor: "#fff",
        borderWidth: 1,
        fontSize: 14,
        color: "#fff",
        padding: 12,
        width: screenWidth/1.35,
      },
      text: {
        color: '#fff',
        // fontWeight: 'bold',
        fontFamily: 'SFPROBOLD',
        textAlign: 'left',
        fontSize: 16,
      },
 });