import React, { useEffect } from 'react';
import { View } from 'react-native';
import { Redirect, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../src/store';
import { Button, T } from '../src/ui';
import { space } from '../src/theme';

export default function SplashScreen() {
  const { c, me } = useStore();
  if (me) return <Redirect href="/(tabs)" />;
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.canvas }}>
      <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: space.xl, gap: space.lg }}>
        {/* الشعار: الأحمر محجوز للشعار وزر الإجراء الرئيسي فقط */}
        <T v="headingXl" color="primary">خيال</T>
        <T v="displayXlMobile">حيث تُشارَك البرومبتات الجيدة.</T>
        <T v="bodyMd" color="mute">اكتشف برومبتات الذكاء الاصطناعي، انسخها، عدّلها، وشاركها مع مجتمعك.</T>
      </View>
      <View style={{ padding: space.xl, gap: space.md }}>
        <Button title="ابدأ الآن" onPress={() => router.push('/onboarding')} />
        <Button title="لدي حساب" variant="secondary" onPress={() => router.push('/login')} />
      </View>
    </SafeAreaView>
  );
}
