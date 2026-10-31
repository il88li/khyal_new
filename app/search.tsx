import React, { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { useStore } from '../src/store';
import { space } from '../src/theme';
import { Chip, ChipRow, Empty, PinGrid, Screen, SearchBar, UserRow } from '../src/ui';

export default function SearchScreen() {
  const { s, visiblePrompts, isBlocked } = useStore();
  const [q, setQ] = useState('');
  const [tab, setTab] = useState<'p' | 't' | 'u'>('p');
  const k = q.trim().toLowerCase().replace(/^[#@]/, '');
  const prompts = k ? visiblePrompts.filter((p) => [p.title, p.description, p.body, p.category, ...p.tags].some((x) => x.toLowerCase().includes(k))) : [];
  const tagSet = Array.from(new Set(s.prompts.flatMap((p) => p.tags))).filter((t) => k && t.toLowerCase().includes(k));
  const users = s.users.filter((u) => k && !isBlocked(u.id) && (u.name.toLowerCase().includes(k) || u.handle.toLowerCase().includes(k)));
  return (
    <Screen title="بحث" back>
      <View style={{ padding: space.lg, paddingBottom: 0 }}><SearchBar value={q} onChangeText={setQ} autoFocus /></View>
      <ChipRow>
        <Chip label="برومبتات" active={tab === 'p'} onPress={() => setTab('p')} />
        <Chip label="وسوم" active={tab === 't'} onPress={() => setTab('t')} />
        <Chip label="مستخدمون" active={tab === 'u'} onPress={() => setTab('u')} />
      </ChipRow>
      {!k ? <Empty icon="search-outline" title="ابحث بالكلمات أو الوسوم أو الأسماء" /> :
        tab === 'p' ? <PinGrid items={prompts} empty={<Empty title="لا توجد نتائج" sub="جرّب كلمة أخرى." />} /> :
        tab === 't' ? (tagSet.length ? <ChipRow>{tagSet.map((t) => <Chip key={t} label={`#${t}`} onPress={() => router.push(`/tag/${encodeURIComponent(t)}`)} />)}</ChipRow> : <Empty title="لا توجد وسوم مطابقة" />) :
        (users.length ? users.map((u) => <UserRow key={u.id} id={u.id} />) : <Empty title="لا يوجد مستخدمون مطابقون" />)}
    </Screen>
  );
}
