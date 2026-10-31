import React, { useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useStore } from '../../src/store';
import { space } from '../../src/theme';
import { Button, Empty, IconBtn, Input, PinGrid, Row, Screen, Sheet, T, confirmAction, goBack, useToast } from '../../src/ui';

// 14) CollectionDetailScreen
export default function CollectionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { s, me, visiblePrompts, renameCollection, deleteCollection, togglePromptInCollection } = useStore();
  const toast = useToast();
  const col = s.collections.find((x) => x.id === id && x.ownerId === me?.id);
  const [menu, setMenu] = useState(false);
  const [rename, setRename] = useState(false);
  const [add, setAdd] = useState(false);
  const [name, setName] = useState(col?.name ?? '');
  if (!col) return <Screen back title="مجموعة"><Empty icon="albums-outline" title="المجموعة غير متوفرة" /></Screen>;
  const items = col.promptIds.map((pid) => visiblePrompts.find((p) => p.id === pid)).filter(Boolean) as typeof s.prompts;
  const del = () => {
    setMenu(false);
    confirmAction('حذف المجموعة', 'لن تُحذف البرومبتات نفسها. متابعة؟', 'حذف', () => { deleteCollection(col.id); goBack(); toast('تم حذف المجموعة'); });
  };
  return (
    <Screen back title={col.name} right={<IconBtn icon="ellipsis-horizontal" onPress={() => setMenu(true)} />}>
      <View style={{ paddingHorizontal: space.lg, paddingVertical: space.md, flexDirection: 'row', alignItems: 'center', gap: space.md }}>
        <T v="bodySm" color="mute" style={{ flex: 1 }}>{items.length} برومبت</T>
        <Button title="إضافة برومبتات" variant="secondary" icon="add" onPress={() => setAdd(true)} />
      </View>
      <PinGrid items={items} empty={<Empty icon="albums-outline" title="المجموعة فارغة" sub="أضف برومبتات من هنا أو من صفحة أي برومبت." />} />

      <Sheet visible={menu} onClose={() => setMenu(false)} title="خيارات المجموعة">
        <View style={{ marginHorizontal: -space.xl }}>
          <Row icon="create-outline" label="تغيير الاسم" onPress={() => { setName(col.name); setMenu(false); setRename(true); }} />
          <Row icon="trash-outline" danger label="حذف المجموعة" onPress={del} />
        </View>
      </Sheet>
      <Sheet visible={rename} onClose={() => setRename(false)} title="تغيير الاسم">
        <View style={{ gap: space.lg }}>
          <Input value={name} onChangeText={setName} />
          <Button title="حفظ" disabled={!name.trim()} onPress={() => { renameCollection(col.id, name); setRename(false); toast('تم تغيير الاسم'); }} />
        </View>
      </Sheet>
      <Sheet visible={add} onClose={() => setAdd(false)} title="إضافة برومبتات">
        <View style={{ marginHorizontal: -space.xl }}>
          {visiblePrompts.map((p) => {
            const on = col.promptIds.includes(p.id);
            return <Row key={p.id} label={p.title} icon={on ? 'checkmark-circle' : 'ellipse-outline'} right={<View />} onPress={() => togglePromptInCollection(col.id, p.id)} />;
          })}
        </View>
        <View style={{ marginTop: space.lg }}><Button title="تم" onPress={() => setAdd(false)} /></View>
      </Sheet>
    </Screen>
  );
}
