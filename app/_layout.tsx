import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { useEffect } from "react";
import { UserProvider } from "@/context/UsersContext";
import { MosaicProvider } from "@/context/MosaicContext";
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  const [loaded, error] = useFonts({
    "SF-Pro-Display-Medium": require("../assets/fonts/SFPRODISPLAYMEDIUM.otf"),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <UserProvider>
      <MosaicProvider>
      <StatusBar translucent/>

        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'none'
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="tests" />
          <Stack.Screen name="phone" />
          <Stack.Screen name="animation" />
          <Stack.Screen name="home" />
          <Stack.Screen name="mosaic" />
          <Stack.Screen name="profile" />
        </Stack>
      </MosaicProvider>
    </UserProvider>
  );
}
