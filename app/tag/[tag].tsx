import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { useStore } from '../../src/store';
import { space } from '../../src/theme';
import { Empty, PinGrid, Screen, T } from '../../src/ui';
import { View } from 'react-native';

export default function TagScreen() {
  const { tag } = useLocalSearchParams<{ tag: string }>();
  const t = decodeURIComponent(tag ?? '');
  const { visiblePrompts } = useStore();
  const items = visiblePrompts.filter((p) => p.tags.includes(t));
  return (
    <Screen back title={`#${t}`}>
      <View style={{ padding: space.lg }}><T v="bodySm" color="mute">{items.length} برومبت بهذا الوسم</T></View>
      <PinGrid items={items} empty={<Empty icon="pricetag-outline" title="لا توجد برومبتات بهذا الوسم" />} />
    </Screen>
  );
}
