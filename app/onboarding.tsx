import React, { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { CATEGORIES } from '../src/data';
import { space } from '../src/theme';
import { Button, Chip, Screen, T } from '../src/ui';

export default function OnboardingInterestsScreen() {
  const [sel, setSel] = useState<string[]>([]);
  const toggle = (k: string) => setSel((s) => (s.includes(k) ? s.filter((x) => x !== k) : [...s, k]));
  return (
    <Screen title="اهتماماتك" back footer={
      <View style={{ padding: space.lg }}>
        <Button title="متابعة" disabled={sel.length === 0} onPress={() => router.push({ pathname: '/signup', params: { interests: sel.join(',') } })} />
      </View>
    }>
      <View style={{ padding: space.xl, gap: space.sm }}>
        <T v="headingXl">ماذا تريد أن ترى؟</T>
        <T v="bodyMd" color="mute">اختر مجالًا واحدًا على الأقل لنخصّص الصفحة الرئيسية.</T>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, paddingHorizontal: space.xl }}>
        {CATEGORIES.map((k) => <Chip key={k} label={k} active={sel.includes(k)} onPress={() => toggle(k)} />)}
      </View>
    </Screen>
  );
}
