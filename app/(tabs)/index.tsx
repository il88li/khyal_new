import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../../src/store';
import { space } from '../../src/theme';
import { Button, Chip, ChipRow, Empty, FAB, IconBtn, PinGrid, T } from '../../src/ui';

export default function HomeFeedScreen() {
  const { c, me, s, visiblePrompts, isFollowing } = useStore();
  const [filter, setFilter] = useState('الكل');
  if (!me) return null;
  // Feed: برومبتات المتابَعين + اهتمامات المستخدم + برومبتاتي
  const base = visiblePrompts.filter((p) => p.authorId === me.id || isFollowing(p.authorId) || me.interests.includes(p.category));
  const list = (filter === 'الكل' ? base : filter === 'المتابَعون' ? base.filter((p) => isFollowing(p.authorId) || p.authorId === me.id) : base.filter((p) => p.category === filter)).sort((a, b) => b.createdAt - a.createdAt);
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: c.canvas }}>
      <View style={{ height: 64, flexDirection: 'row', alignItems: 'center', paddingHorizontal: space.lg }}>
        <T v="headingXl" color="primary" style={{ flex: 1 }}>خيال</T>
        <IconBtn icon="search" onPress={() => router.push('/search')} />
      </View>
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
          <ChipRow>
            {['الكل', 'المتابَعون', ...me.interests].map((k) => <Chip key={k} label={k} active={filter === k} onPress={() => setFilter(k)} />)}
          </ChipRow>
          <PinGrid items={list} empty={<Empty icon="albums-outline" title="لا يوجد شيء هنا بعد" sub="تابع مستخدمين أو انشر أول برومبت لك." action={<Button title="برومبت جديد" onPress={() => router.push('/prompt/create')} />} />} />
        </ScrollView>
        <FAB onPress={() => router.push('/prompt/create')} />
      </View>
    </SafeAreaView>
  );
}
