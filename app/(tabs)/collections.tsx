import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../src/store';
import { radius, space } from '../../src/theme';
import { Button, Empty, IconBtn, Input, Screen, Sheet, T, useToast } from '../../src/ui';

export default function CollectionsScreen() {
  const { c, s, me, createCollection } = useStore();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const mine = s.collections.filter((x) => x.ownerId === me?.id);
  const create = () => {
    if (!name.trim()) return;
    createCollection(name); setName(''); setOpen(false); toast('تم إنشاء المجموعة');
  };
  return (
    <Screen title="مجموعاتي" tabs right={<IconBtn icon="add" onPress={() => setOpen(true)} />}>
      <View style={{ padding: space.lg, gap: space.sm }}>
        {mine.length === 0 && <Empty icon="albums-outline" title="لا توجد مجموعات بعد" sub="أنشئ مجموعة لحفظ البرومبتات التي تحبها." action={<Button title="مجموعة جديدة" onPress={() => setOpen(true)} />} />}
        {mine.map((col) => (
          <Pressable key={col.id} onPress={() => router.push(`/collection/${col.id}`)} style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.lg, borderRadius: radius.md, backgroundColor: c.surfaceCard }}>
            <Ionicons name="albums-outline" size={24} color={c.ink} />
            <View style={{ flex: 1 }}><T v="bodyStrong">{col.name}</T><T v="bodySm" color="mute">{col.promptIds.length} برومبت</T></View>
          </Pressable>
        ))}
      </View>
      <Sheet visible={open} onClose={() => setOpen(false)} title="مجموعة جديدة">
        <View style={{ gap: space.lg }}>
          <Input label="اسم المجموعة" value={name} onChangeText={setName} placeholder="مثال: أفكار للحملات" />
          <Button title="إنشاء" disabled={!name.trim()} onPress={create} />
        </View>
      </Sheet>
    </Screen>
  );
}
