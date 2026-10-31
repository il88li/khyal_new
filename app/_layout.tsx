import React, { useEffect } from 'react';
import { DevSettings, I18nManager, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StoreProvider, useStore } from '../src/store';
import { ToastProvider } from '../src/ui';

// فرض RTL: يحتاج إعادة تحميل مرة واحدة بعد أول تشغيل.
if (Platform.OS === 'web') {
  if (typeof document !== 'undefined') { document.documentElement.dir = 'rtl'; document.documentElement.lang = 'ar'; }
} else if (!I18nManager.isRTL) {
  I18nManager.allowRTL(true);
  I18nManager.forceRTL(true);
  if (__DEV__) setTimeout(() => DevSettings.reload(), 50);
}

function Inner() {
  const { c, dark, ready } = useStore();
  if (!ready) return null;
  return (
    <>
      <StatusBar style={dark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.canvas }, animation: 'slide_from_right' }}>
        <Stack.Screen name="splash" options={{ animation: "fade" }} />
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
        <Stack.Screen name="report" options={{ presentation: 'modal' }} />
      </Stack>
    </>
  );
}

export default function Root() {
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <ToastProvider>
          <Inner />
        </ToastProvider>
      </StoreProvider>
    </SafeAreaProvider>
  );
}
