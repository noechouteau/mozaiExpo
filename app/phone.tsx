import React, { useState, useEffect } from 'react';
import { Button, TextInput, View,Text } from 'react-native';
import auth from '@react-native-firebase/auth';
import { usePathname, useRouter } from 'expo-router';

export default function Phone() {
// If null, no SMS has been sent
const [confirm, setConfirm]:any = useState(null);

// verification code (OTP - One-Time-Passcode)
const [code, setCode] = useState('');

const [initializing, setInitializing] = useState(true);
const [user, setUser]:any = useState();
const pathname = usePathname();
const router = useRouter();

useEffect(() => {
    if(pathname=="/firebaseauth/link") router.back();
}, [pathname]);

// Handle user state changes
function onAuthStateChanged(user:any) {
  
  console.log(user);
  if (initializing) setInitializing(false);
}

useEffect(() => {
  const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
  return subscriber; // unsubscribe on unmount
}, []);

// Handle the button press
async function signInWithPhoneNumber(phoneNumber:any) {
  try {
    const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
    setConfirm(confirmation);
  } catch (error) {
    console.error("Error signing in:", error);
    alert("Failed to send OTP. Please check the phone number.");
  }
}

async function confirmCode() {
  try {
    await confirm.confirm(code);
  } catch (error) {
    console.log('Invalid code.');
  }
}

if (initializing) return null;

if (!user) {
    if (!confirm) {
        return (
          <Button
            title="Phone Number Sign In"
            onPress={() => signInWithPhoneNumber('+1 805-434-7229').then((error) => console.log(error))}
          />
        );
      }
      
      return (
        <>
          <TextInput value={code} onChangeText={text => setCode(text)} />
          <Button title="Confirm Code" onPress={() => confirmCode()} />
        </>
      );
}

return (
  <View>
    <Text>Welcome {user.email}</Text>
    <Button title="Sign out" onPress={() => auth().signOut()} />
  </View>
);


}