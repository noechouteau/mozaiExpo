import { StyleSheet, View,Text, Button, TextInput,Pressable, ImageBackground, Dimensions } from 'react-native';
import { Link, router } from 'expo-router';
import { useFonts } from 'expo-font';
import Animated from 'react-native-reanimated';
import { HoldMenuProvider } from 'react-native-hold-menu';
import { HoldItem } from 'react-native-hold-menu';
import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Onboarding from '../components/OnBoarding';

const {width: screenWidth, height: screenHeight} = Dimensions.get('window');
const backgroundImage = require('../assets/images/blueTheme/bg_login_2.png');

export default function Index() {
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);
  // Tester l'onBoarding
  const [showOnboarding, setShowOnboarding] = useState(false);

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

  useEffect(() => {
    async function fast(){
      const activeUser = await AsyncStorage.getItem("loggedIn");
      console.log(activeUser);
      if(activeUser && activeUser!="false" && activeUser!=""){
        router.replace("/home");
      }
    }

    fast();
  }, []);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      const hasCompletedOnboarding = await AsyncStorage.getItem('@onboardingCompleted');
      setIsFirstLaunch(hasCompletedOnboarding === null);  // Si la clé n'existe pas, c'est la première fois
    };

    checkOnboardingStatus();
  }, []);

  const handleOnboardingComplete = async () => {
    await AsyncStorage.setItem('@onboardingCompleted', 'true');
    setIsFirstLaunch(false);
    setShowOnboarding(false); // Ferme l'onboarding après le test
    router.replace('/animation');
  };

  if (isFirstLaunch === null) {
    return null;  // Éviter le rendu avant de vérifier AsyncStorage
  }

  if (isFirstLaunch || showOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (<HoldMenuProvider theme='dark' safeAreaInsets={{
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  }}>
  <ImageBackground source={backgroundImage} resizeMode="cover" style={{ flex: 1, justifyContent: 'center', alignItems: 'center', width: screenWidth, height: screenHeight+45 }}>
  
  <View style={styles.container}>
    <Text style={styles.text}>Join or create a room</Text>
    <TextInput style={styles.homeTextInput} placeholder='Room code'></TextInput>

    <Link href="/animation" asChild>
    <Pressable style={styles.homeButton}>
      <Text style={styles.text}>Create a mosaic</Text>
    </Pressable>
    </Link>

    <Pressable style={styles.homeButton} onPress={() => setShowOnboarding(true)}>
  <Text style={styles.text}>Tester l'Onboarding</Text>
</Pressable>

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