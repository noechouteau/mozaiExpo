import { StyleSheet, View,Text, Button, TextInput,Pressable, ImageBackground, Dimensions } from 'react-native';
import { Link } from 'expo-router';
import { useFonts } from 'expo-font';
import Animated from 'react-native-reanimated';
import { HoldMenuProvider } from 'react-native-hold-menu';
import { HoldItem } from 'react-native-hold-menu';
import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';

const {width: screenWidth, height: screenHeight} = Dimensions.get('window');
const backgroundImage = require('../assets/images/bg_login_2.png');

export default function Index() {

  const [loaded, error] = useFonts({
    'SFPRO': require('../assets/fonts/SFPRODISPLAYMEDIUM.otf'),
    "SFPROBOLD": require('../assets/fonts/SFPRODISPLAYBOLD.otf'),
  });

  const MenuItems = [
    { text: 'Actions', icon: 'home', isTitle: true, onPress: () => {} },
    { text: 'Action 1', icon: 'edit', onPress: () => {} },
    { text: 'Action 2', icon: 'map-pin', withSeparator: true, onPress: () => {} },
    { text: 'Action 3', icon: 'trash', isDestructive: true, onPress: () => {} },
  ];

  const [data, setData] = useState([
    { id: '1', name: 'Item 1' },
    { id: '2', name: 'Item 2' },
    { id: '3', name: 'Item 3' },
  ]);

  return (<HoldMenuProvider theme='dark' safeAreaInsets={{
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  }}>
  <StatusBar translucent/>
  <ImageBackground source={backgroundImage} resizeMode="cover" style={{ flex: 1, justifyContent: 'center', alignItems: 'center', width: screenWidth, height: screenHeight+45 }}>
  
  <View style={styles.container}>
    <Text style={styles.text}>Join or create a room</Text>
    <TextInput style={styles.homeTextInput} placeholder='Room code'></TextInput>

    <Link href="/animation" asChild>
    <Pressable style={styles.homeButton}>
      <Text style={styles.text}>Create a mosaic</Text>
    </Pressable>
    </Link>

    <Link href="/tests" asChild>
      <Button title="Test Connexion"/>
    </Link>
    <Link href="/phone" asChild>
      <Button title="Phone"/>
    </Link>

    {data.map((item) => (
          <HoldItem key={item.id} items={MenuItems} menuAnchorPosition="bottom-left">
            <View style={styles.item}>
              <Text style={styles.text}>{item.name}</Text>
            </View>
          </HoldItem>
    ))}
  </View>
  </ImageBackground>
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
  text: {
    color: '#fff',
    // fontWeight: 'bold',
    fontFamily: 'SFPROBOLD',
    textAlign: 'center',
  },
  homeTextInput: {
    borderRadius: 5,
    width: "50%",
    padding: 10,
    backgroundColor: "#3A3A3A",
    color: "#ADADAD",
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