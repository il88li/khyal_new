import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CATEGORIES, CAT_ICONS } from '../../src/data';
import { useStore } from '../../src/store';
import { radius, space } from '../../src/theme';
import { Chip, ChipRow, PinGrid, SearchBar, SectionTitle, T } from '../../src/ui';

export default function ExploreScreen() {
  const { c, visiblePrompts, likeCount } = useStore();
  const [cat, setCat] = useState<string | null>(null);
  const tags = useMemo(() => {
    const m: Record<string, number> = {};
    visiblePrompts.forEach((p) => p.tags.forEach((t) => (m[t] = (m[t] || 0) + 1)));
    return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([t]) => t);
  }, [visiblePrompts]);
  const trending = useMemo(
    () => visiblePrompts.filter((p) => !cat || p.category === cat).sort((a, b) => likeCount(b) + b.copies - (likeCount(a) + a.copies)),
    [visiblePrompts, cat],
  );
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: c.canvas }}>
      <ScrollView contentContainerStyle={{ paddingBottom: space.xxl }}>
        <View style={{ padding: space.lg }}><SearchBar onPress={() => router.push('/search')} /></View>
        <SectionTitle style={{ marginTop: space.sm }}>التصنيفات</SectionTitle>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, paddingHorizontal: space.lg }}>
          {CATEGORIES.map((k) => {
            const on = cat === k;
            return (
              <Pressable key={k} onPress={() => setCat(on ? null : k)} style={{ width: '48.5%', flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.lg, borderRadius: radius.md, backgroundColor: on ? c.chipActiveBg : c.surfaceCard }}>
                <Ionicons name={CAT_ICONS[k] as any} size={22} color={on ? c.chipActiveText : c.ink} />
                <T v="bodyStrong" style={{ color: on ? c.chipActiveText : c.ink }}>{k}</T>
              </Pressable>
            );
          })}
        </View>
        <SectionTitle>الوسوم الشائعة</SectionTitle>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: space.lg, gap: space.sm }}>
          {tags.map((t) => <Chip key={t} label={`#${t}`} onPress={() => router.push(`/tag/${encodeURIComponent(t)}`)} />)}
        </ScrollView>
        <SectionTitle>{cat ? `الأكثر رواجًا في ${cat}` : 'الأكثر رواجًا'}</SectionTitle>
        <PinGrid items={trending} />
      </ScrollView>
    </SafeAreaView>
  );
}
