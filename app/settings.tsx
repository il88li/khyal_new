import React from 'react';
import { Alert, View } from 'react-native';
import { router } from 'expo-router';
import { useStore } from '../src/store';
import { space } from '../src/theme';
import { Button, Chip, Row, Screen, SectionTitle, T, Toggle, UserRow, useToast } from '../src/ui';

export default function SettingsScreen() {
  const { s, me, setTheme, updateProfile, logout, toggleBlock } = useStore();
  const toast = useToast();
  const blocked = s.blocks.filter((b) => b.startsWith(`${me?.id}>`)).map((b) => b.split('>')[1]);
  const out = () => Alert.alert('تسجيل الخروج', 'هل تريد تسجيل الخروج؟', [
    { text: 'إلغاء', style: 'cancel' },
    { text: 'خروج', style: 'destructive', onPress: () => { logout(); router.replace('/splash'); } },
  ]);
  return (
    <Screen back title="الإعدادات">
      <SectionTitle style={{ marginTop: space.lg }}>المظهر</SectionTitle>
      <View style={{ flexDirection: 'row', gap: space.sm, paddingHorizontal: space.lg }}>
        {([['system', 'تلقائي'], ['light', 'نهاري'], ['dark', 'ليلي']] as const).map(([k, l]) => <Chip key={k} label={l} active={s.theme === k} onPress={() => setTheme(k)} />)}
      </View>
      <SectionTitle>الخصوصية</SectionTitle>
      <Row icon="lock-closed-outline" label="حساب خاص" right={<Toggle value={!!me?.isPrivate} onValueChange={(v) => { updateProfile({ isPrivate: v }); toast(v ? 'حسابك خاص الآن' : 'حسابك عام الآن'); }} />} />
      <View style={{ paddingHorizontal: space.lg, paddingTop: space.sm }}><T v="captionSm" color="mute">الخيار يغيّر الواجهة فقط حاليًا ولا يطبّق قيودًا فعلية.</T></View>
      {blocked.length > 0 && (
        <>
          <SectionTitle>المحظورون</SectionTitle>
          {blocked.map((id) => <UserRow key={id} id={id} right={<Button title="إلغاء الحظر" variant="secondary" onPress={() => { toggleBlock(id); toast('تم إلغاء الحظر'); }} />} />)}
        </>
      )}
      <SectionTitle>المزيد</SectionTitle>
      <Row icon="help-circle-outline" label="مركز المساعدة والقوانين" onPress={() => router.push('/help')} />
      {me?.isAdmin && <Row icon="shield-checkmark-outline" label="طلبات الإبلاغ" onPress={() => router.push('/admin-reports')} />}
      <Row icon="log-out-outline" danger label="تسجيل الخروج" onPress={out} />
    </Screen>
  );
}
