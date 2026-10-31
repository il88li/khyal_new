import React, { useState } from 'react';
import { Image, Pressable, Text, TextInput, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { extractVars } from '../../src/promptForm';
import { fillVars, fmt, timeAgo, useStore } from '../../src/store';
import { radius, space, type } from '../../src/theme';
import { Avatar, Button, Chip, Empty, IconBtn, Input, Row, Screen, SectionTitle, Sheet, T, confirmAction, goBack, useToast } from '../../src/ui';

// 8) PromptDetailScreen
export default function PromptDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const st = useStore();
  const { c, s, me, user, likeCount, isLiked, isFollowing, toggleLike, toggleFollow, toggleBlock, deletePrompt, addComment, deleteComment, countCopy, createCollection, togglePromptInCollection } = st;
  const toast = useToast();
  const p = s.prompts.find((x) => x.id === id);
  const [menu, setMenu] = useState(false);
  const [fill, setFill] = useState(false);
  const [vals, setVals] = useState<Record<string, string>>({});
  const [save, setSave] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);
  const [newNames, setNewNames] = useState<string[]>([]);
  const [newName, setNewName] = useState('');
  const [text, setText] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);

  if (!p || !me) return <Screen back title="برومبت"><Empty icon="alert-circle-outline" title="هذا البرومبت غير متوفر" sub="ربما حُذف." /></Screen>;
  const a = user(p.authorId);
  const own = p.authorId === me.id;
  const vars = Array.from(new Set([...p.variables, ...extractVars(p.body)]));
  const hero = p.examples.find((e) => e.type === 'image');
  const others = p.examples.filter((e) => e !== hero);
  const source = p.remixOf ? s.prompts.find((x) => x.id === p.remixOf) : undefined;
  const sourceUser = source ? user(source.authorId) : undefined;
  const remixes = s.prompts.filter((x) => x.remixOf === p.id);
  const comments = s.comments.filter((x) => x.promptId === p.id);
  const roots = comments.filter((x) => !x.parentId).sort((x, y) => x.at - y.at);
  const myCols = s.collections.filter((x) => x.ownerId === me.id);

  // نسخ ذكي: إن وُجدت متغيرات تُملأ أولًا ثم يُنسخ النص النهائي
  const doCopy = async (v: Record<string, string>) => {
    await Clipboard.setStringAsync(fillVars(p.body, v));
    countCopy(p.id); setFill(false); toast('تم النسخ');
  };
  const onCopy = () => (vars.length ? (setVals({}), setFill(true)) : doCopy({}));
  const openSave = () => { setPicked(myCols.filter((x) => x.promptIds.includes(p.id)).map((x) => x.id)); setNewNames([]); setNewName(''); setSave(true); };
  const confirmSave = () => {
    myCols.forEach((col) => { if (col.promptIds.includes(p.id) !== picked.includes(col.id)) togglePromptInCollection(col.id, p.id); });
    newNames.forEach((n) => createCollection(n, [p.id]));
    setSave(false); toast(picked.length + newNames.length ? 'تم الحفظ في المجموعة' : 'تم تحديث المجموعات');
  };
  const confirmDelete = () => {
    setMenu(false);
    confirmAction('حذف البرومبت', 'سيُحذف نهائيًا مع تعليقاته. هل تريد المتابعة؟', 'حذف', () => { deletePrompt(p.id); goBack(); toast('تم حذف البرومبت'); });
  };
  const send = () => {
    if (!text.trim()) return;
    addComment(p.id, text, replyTo ?? undefined); setText(''); setReplyTo(null);
  };

  const parts = p.body.split(/(\{\{\s*[^}]+?\s*\}\})/g);
  const renderComment = (cm: typeof comments[number], reply = false) => {
    const u = user(cm.authorId);
    if (!u || st.isBlocked(u.id)) return null;
    return (
      <View key={cm.id} style={{ flexDirection: 'row', gap: space.md, paddingStart: reply ? space.xxl : 0, marginTop: space.md }}>
        <Avatar handle={u.handle} name={u.name} size={32} />
        <View style={{ flex: 1, gap: 2 }}>
          <View style={{ flexDirection: 'row', gap: space.sm, alignItems: 'center' }}><T v="bodySmStrong">{u.name}</T><T v="captionSm" color="mute">{timeAgo(cm.at)}</T></View>
          <T v="bodyMd">{cm.text}</T>
          <View style={{ flexDirection: 'row', gap: space.lg }}>
            {!reply && <T v="captionMd" color="mute" onPress={() => setReplyTo(cm.id)}>رد</T>}
            {(cm.authorId === me.id || own) && <T v="captionMd" color="mute" onPress={() => deleteComment(cm.id)}>حذف</T>}
          </View>
        </View>
      </View>
    );
  };
  const replyTarget = replyTo ? comments.find((x) => x.id === replyTo) : undefined;

  return (
    <Screen back title="" right={<IconBtn icon="ellipsis-horizontal" onPress={() => setMenu(true)} />}
      footer={
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, padding: space.md, borderTopWidth: 1, borderTopColor: c.hairline, backgroundColor: c.canvas }}>
          <IconBtn icon={isLiked(p) ? 'heart' : 'heart-outline'} onPress={() => toggleLike(p.id)} />
          <IconBtn icon="bookmark-outline" onPress={openSave} />
          {!own && <Button variant="secondary" title="Remix" icon="git-branch-outline" onPress={() => router.push({ pathname: '/prompt/create', params: { remix: p.id } })} />}
          <Button title="نسخ" icon="copy-outline" style={{ flex: 1 }} onPress={onCopy} />
        </View>
      }>
      {hero && <Image source={{ uri: hero.value }} style={{ marginHorizontal: space.lg, marginTop: space.lg, borderRadius: radius.lg, aspectRatio: 4 / 5, backgroundColor: c.surfaceCard }} resizeMode="cover" />}
      <View style={{ padding: space.lg, gap: space.lg }}>
        {source && (
          <Pressable onPress={() => router.push(`/prompt/${source.id}`)} style={{ flexDirection: 'row', alignSelf: 'flex-start', alignItems: 'center', gap: 6, backgroundColor: c.surfaceCard, borderRadius: radius.full, paddingVertical: 6, paddingHorizontal: 12 }}>
            <Ionicons name="git-branch-outline" size={14} color={c.ink} /><T v="buttonSm">Remix of @{sourceUser?.handle}</T>
          </Pressable>
        )}
        <T v="headingXl">{p.title}</T>
        {a && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
            <Pressable onPress={() => router.push(`/user/${a.id}`)} style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, flex: 1 }}>
              <Avatar handle={a.handle} name={a.name} size={40} />
              <View style={{ flex: 1 }}><T v="bodyStrong" numberOfLines={1}>{a.name}</T><T v="captionSm" color="mute">@{a.handle} · {timeAgo(p.createdAt)}</T></View>
            </Pressable>
            {!own && <Button title={isFollowing(a.id) ? 'إلغاء المتابعة' : 'متابعة'} variant="secondary" onPress={() => toggleFollow(a.id)} />}
          </View>
        )}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
          <Chip label={p.category} /><Chip label={p.model} />
          {p.tags.map((t) => <Chip key={t} label={`#${t}`} onPress={() => router.push(`/tag/${encodeURIComponent(t)}`)} />)}
        </View>
        {!!p.description && <T v="bodyMd">{p.description}</T>}

        <View style={{ backgroundColor: c.surfaceCard, borderRadius: radius.md, padding: space.lg }}>
          <Text style={[type.bodyMd, { color: c.ink, writingDirection: 'rtl' }]}>
            {parts.map((t, i) => /^\{\{/.test(t) ? <Text key={i} style={{ fontWeight: '700', backgroundColor: c.secondaryBg }}>{t.replace(/\{\{\s*|\s*\}\}/g, '')}</Text> : t)}
          </Text>
        </View>
        {vars.length > 0 && (
          <View style={{ gap: space.sm }}>
            <T v="bodyStrong">المتغيرات</T>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>{vars.map((v) => <Chip key={v} label={v.replace(/_/g, ' ')} />)}</View>
          </View>
        )}
        <T v="bodySm" color="mute">{fmt(likeCount(p))} إعجاب · نُسخ {fmt(p.copies)} مرة · {comments.length} تعليق</T>

        {others.length > 0 && (
          <View style={{ gap: space.sm }}>
            <T v="headingLg">أمثلة النتائج</T>
            {others.map((e, i) => e.type === 'image'
              ? <Image key={i} source={{ uri: e.value }} style={{ borderRadius: radius.md, aspectRatio: 1, backgroundColor: c.surfaceCard }} />
              : <View key={i} style={{ backgroundColor: c.surfaceCard, borderRadius: radius.md, padding: space.lg }}><T v="bodyMd">{e.value}</T></View>)}
          </View>
        )}

        {remixes.length > 0 && (
          <View style={{ gap: space.sm }}>
            <T v="headingLg">النسخ المشتقة ({remixes.length})</T>
            {remixes.map((r) => (
              <Pressable key={r.id} onPress={() => router.push(`/prompt/${r.id}`)} style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, backgroundColor: c.surfaceCard, borderRadius: radius.md, padding: space.md }}>
                <Ionicons name="git-branch-outline" size={18} color={c.ink} />
                <View style={{ flex: 1 }}><T v="bodyStrong" numberOfLines={1}>{r.title}</T><T v="captionSm" color="mute">@{user(r.authorId)?.handle}</T></View>
              </Pressable>
            ))}
          </View>
        )}

        <View>
          <T v="headingLg">التعليقات ({comments.length})</T>
          {roots.length === 0 && <T v="bodySm" color="mute" style={{ marginTop: space.sm }}>كن أول من يعلّق.</T>}
          {roots.map((cm) => <View key={cm.id}>{renderComment(cm)}{comments.filter((r) => r.parentId === cm.id).sort((x, y) => x.at - y.at).map((r) => renderComment(r, true))}</View>)}
          <View style={{ marginTop: space.lg, gap: space.sm }}>
            {replyTarget && <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}><T v="captionMd" color="mute" style={{ flex: 1 }}>رد على {user(replyTarget.authorId)?.name}</T><T v="captionMd" onPress={() => setReplyTo(null)}>إلغاء</T></View>}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
              <View style={{ flex: 1 }}><Input value={text} onChangeText={setText} placeholder="اكتب تعليقًا" /></View>
              <Button title="إرسال" variant="secondary" disabled={!text.trim()} onPress={send} />
            </View>
          </View>
        </View>
      </View>

      {/* ملء المتغيرات قبل النسخ */}
      <Sheet visible={fill} onClose={() => setFill(false)} title="املأ المتغيرات">
        <View style={{ gap: space.lg }}>
          {vars.map((v) => <Input key={v} label={v.replace(/_/g, ' ')} value={vals[v] ?? ''} onChangeText={(t) => setVals((o) => ({ ...o, [v]: t }))} />)}
          <Button title="نسخ" icon="copy-outline" disabled={vars.some((v) => !(vals[v] ?? '').trim())} onPress={() => doCopy(vals)} />
          <Button title="نسخ كما هو" variant="tertiary" onPress={() => doCopy({})} />
        </View>
      </Sheet>

      {/* حفظ في مجموعة */}
      <Sheet visible={save} onClose={() => setSave(false)} title="حفظ في مجموعة">
        <View style={{ gap: space.md }}>
          <View style={{ marginHorizontal: -space.xl }}>
            {myCols.map((col) => {
              const on = picked.includes(col.id);
              return <Row key={col.id} label={col.name} icon={on ? 'checkmark-circle' : 'ellipse-outline'} onPress={() => setPicked((x) => (on ? x.filter((y) => y !== col.id) : [...x, col.id]))} right={<View />} />;
            })}
            {newNames.map((n) => <Row key={n} label={n} icon="checkmark-circle" onPress={() => setNewNames((x) => x.filter((y) => y !== n))} right={<T v="captionSm" color="mute">جديدة</T>} />)}
          </View>
          <View style={{ flexDirection: 'row', gap: space.sm, alignItems: 'center' }}>
            <View style={{ flex: 1 }}><Input value={newName} onChangeText={setNewName} placeholder="اسم مجموعة جديدة" /></View>
            <Button title="إضافة" variant="secondary" disabled={!newName.trim()} onPress={() => { setNewNames((x) => [...x, newName.trim()]); setNewName(''); }} />
          </View>
          <Button title="تأكيد" onPress={confirmSave} />
        </View>
      </Sheet>

      <Sheet visible={menu} onClose={() => setMenu(false)} title="خيارات">
        <View style={{ marginHorizontal: -space.xl }}>
          {own ? (
            <>
              <Row icon="create-outline" label="تعديل البرومبت" onPress={() => { setMenu(false); router.push(`/prompt/edit/${p.id}`); }} />
              <Row icon="trash-outline" danger label="حذف البرومبت" onPress={confirmDelete} />
            </>
          ) : (
            <>
              <Row icon="flag-outline" label="إبلاغ عن البرومبت" onPress={() => { setMenu(false); router.push({ pathname: '/report', params: { type: 'prompt', id: p.id } }); }} />
              {a && <Row icon="person-outline" label={`ملف ${a.name}`} onPress={() => { setMenu(false); router.push(`/user/${a.id}`); }} />}
              {a && <Row icon="flag-outline" label="إبلاغ عن المستخدم" onPress={() => { setMenu(false); router.push({ pathname: '/report', params: { type: 'user', id: a.id } }); }} />}
              {a && <Row icon="ban-outline" danger label="حظر المستخدم" onPress={() => { toggleBlock(a.id); setMenu(false); goBack(); toast('تم حظر المستخدم'); }} />}
            </>
          )}
        </View>
      </Sheet>
    </Screen>
  );
}
