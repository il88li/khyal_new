import React, { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { CATEGORIES } from './data';
import { fmt, useStore } from './store';
import { space } from './theme';
import { Avatar, Button, Chip, Empty, IconBtn, Input, PinGrid, Row, SectionTitle, Sheet, T, useToast } from './ui';

const Stat = ({ n, label }: { n: number; label: string }) => (
  <View style={{ alignItems: 'center', flex: 1 }}><T v="headingLg">{fmt(n)}</T><T v="captionMd" color="mute">{label}</T></View>
);

export function ProfileBody({ userId, self }: { userId: string; self?: boolean }) {
  const { user, s, me, visiblePrompts, followers, following, isFollowing, isBlocked, toggleFollow, toggleBlock, updateProfile } = useStore();
  const toast = useToast();
  const u = user(userId);
  const [edit, setEdit] = useState(false);
  const [more, setMore] = useState(false);
  const [name, setName] = useState(u?.name ?? '');
  const [bio, setBio] = useState(u?.bio ?? '');
  const [interests, setInterests] = useState<string[]>(u?.interests ?? []);
  if (!u) return <Empty title="المستخدم غير موجود" />;
  const mine = s.prompts.filter((p) => p.authorId === u.id);
  const blocked = !self && isBlocked(u.id);
  const f = isFollowing(u.id);
  const save = () => {
    if (name.trim().length < 2) return toast('الاسم حرفان على الأقل', 'err');
    updateProfile({ name: name.trim(), bio: bio.trim(), interests });
    setEdit(false); toast('تم حفظ الملف الشخصي');
  };
  return (
    <>
      <View style={{ alignItems: 'center', padding: space.xl, gap: space.sm }}>
        <Avatar handle={u.handle} name={u.name} size={96} />
        <T v="headingXl" style={{ textAlign: 'center' }}>{u.name}</T>
        <T v="bodySm" color="mute">@{u.handle}</T>
        {!!u.bio && <T v="bodyMd" style={{ textAlign: 'center' }}>{u.bio}</T>}
        <View style={{ flexDirection: 'row', alignSelf: 'stretch', marginTop: space.md }}>
          <Stat n={followers(u.id)} label="متابِع" /><Stat n={following(u.id)} label="يتابع" /><Stat n={mine.length} label="برومبت" />
        </View>
        <View style={{ flexDirection: 'row', gap: space.sm, marginTop: space.md, alignItems: 'center' }}>
          {self ? (
            <>
              <Button title="تعديل الملف" variant="secondary" icon="create-outline" onPress={() => { setName(u.name); setBio(u.bio); setInterests(u.interests); setEdit(true); }} />
              <IconBtn icon="settings-outline" onPress={() => router.push('/settings')} />
            </>
          ) : (
            <>
              {!blocked && <Button title={f ? 'إلغاء المتابعة' : 'متابعة'} variant={f ? 'secondary' : 'primary'} onPress={() => { toggleFollow(u.id); if (!f) toast(`تتابع ${u.name} الآن`); }} />}
              <IconBtn icon="ellipsis-horizontal" onPress={() => setMore(true)} />
            </>
          )}
        </View>
      </View>
      {blocked ? <Empty icon="ban-outline" title="لقد حظرت هذا المستخدم" sub="لن تظهر لك برومبتاته." action={<Button title="إلغاء الحظر" variant="secondary" onPress={() => toggleBlock(u.id)} />} />
        : <><SectionTitle style={{ marginTop: 0 }}>{self ? 'برومبتاتي' : 'البرومبتات'}</SectionTitle><PinGrid items={self ? mine : mine.filter((p) => visiblePrompts.includes(p))} empty={<Empty title="لا توجد برومبتات بعد" />} /></>}

      <Sheet visible={edit} onClose={() => setEdit(false)} title="تعديل الملف الشخصي">
        <View style={{ gap: space.lg }}>
          <Input label="الاسم" value={name} onChangeText={setName} />
          <Input label="نبذة" value={bio} onChangeText={setBio} multiline placeholder="عرّف بنفسك في سطر أو سطرين" />
          <View style={{ gap: space.sm }}>
            <T v="bodyStrong">الاهتمامات</T>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
              {CATEGORIES.map((k) => <Chip key={k} label={k} active={interests.includes(k)} onPress={() => setInterests((x) => (x.includes(k) ? x.filter((y) => y !== k) : [...x, k]))} />)}
            </View>
          </View>
          <Button title="حفظ" onPress={save} />
        </View>
      </Sheet>
      <Sheet visible={more} onClose={() => setMore(false)} title={`@${u.handle}`}>
        <View style={{ marginHorizontal: -space.xl }}>
          <Row icon="flag-outline" label="إبلاغ عن المستخدم" onPress={() => { setMore(false); router.push({ pathname: '/report', params: { type: 'user', id: u.id } }); }} />
          <Row icon="ban-outline" danger label={isBlocked(u.id) ? 'إلغاء الحظر' : 'حظر المستخدم'} onPress={() => { toggleBlock(u.id); setMore(false); toast(isBlocked(u.id) ? 'تم إلغاء الحظر' : 'تم حظر المستخدم'); }} />
        </View>
      </Sheet>
    </>
  );
}
