import { StyleSheet, View,Text, Button, TextInput,Pressable } from 'react-native';
import { Link } from 'expo-router';
import { useFonts } from 'expo-font';
import Animated from 'react-native-reanimated';


export default function Index() {

  const [loaded, error] = useFonts({
    'SFPRO': require('../assets/fonts/SFPRODISPLAYMEDIUM.otf'),
    "SFPROBOLD": require('../assets/fonts/SFPRODISPLAYBOLD.otf'),
  });

  return (<View style={styles.container}>
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
  </View>
    // <WebView
    //   source={{ uri: 'https://mozai-gallery.vercel.app/' }}
    // /> 
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#262626',
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
  }
});