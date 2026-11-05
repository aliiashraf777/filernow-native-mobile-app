// nativeApp\src\app\_layout.tsx

import "../../global.css";
// translations ready (and following the saved language) before the first screen renders
import "@/i18n";

import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { AppLockGate } from "@/features/app-lock/components/app-lock-gate";
import { Toaster } from "@/lib/toast";
import { useStoresHydrated } from "@/stores/use-stores-hydrated";
import { fontAssets } from "@/theme/fonts";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(fontAssets);
  const hydrated = useStoresHydrated();
  const ready = (fontsLoaded || fontError !== null) && hydrated;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }} />
      <AppLockGate />
      <Toaster />
    </GestureHandlerRootView>
  );
}