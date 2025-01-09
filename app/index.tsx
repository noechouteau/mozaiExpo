import { StyleSheet, View,Text, Button } from 'react-native';
import { Link } from 'expo-router';
import { getAuth } from "firebase/auth";


export default function Index() {
  const auth = getAuth();
  auth.languageCode = 'it';

  return (<View>
    <Text>Test</Text>
    <Link href="/tests">
      <Button title="Test Connexion"/>
      </Link>
  </View>
    // <WebView
    //   source={{ uri: 'https://mozai-gallery.vercel.app/' }}
    // /> 
  );
}