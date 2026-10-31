import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { CATEGORIES, MODELS } from './data';
import { useStore } from './store';
import { radius, space } from './theme';
import { Prompt, Example } from './types';
import { Button, Chip, IconBtn, Input, Screen, T, goBack, useToast } from './ui';

const list = (s: string) => Array.from(new Set(s.split(/[,،\n]/).map((x) => x.trim().replace(/^#/, '').replace(/\s+/g, '_')).filter(Boolean)));
export const extractVars = (body: string) => Array.from(new Set([...body.matchAll(/\{\{\s*([^}]+?)\s*\}\}/g)].map((m) => m[1])));

// mode: create | edit | remix. في الـ remix نعبّئ الحقول من المصدر ونثبّت حقل "المصدر".
export function PromptForm({ mode, initial, source }: { mode: 'create' | 'edit' | 'remix'; initial?: Prompt; source?: Prompt }) {
  const { c, me, s, user, createPrompt, updatePrompt } = useStore();
  const toast = useToast();
  const base = initial ?? source;
  const [title, setTitle] = useState(base ? (mode === 'remix' ? `${base.title} (Remix)` : base.title) : '');
  const [description, setDescription] = useState(base?.description ?? '');
  const [body, setBody] = useState(base?.body ?? '');
  const [vars, setVars] = useState(base?.variables.join('، ') ?? '');
  const [tags, setTags] = useState(base?.tags.join('، ') ?? '');
  const [category, setCategory] = useState(base?.category ?? CATEGORIES[0]);
  const [model, setModel] = useState(base?.model ?? MODELS[MODELS.length - 1]);
  const [examples, setExamples] = useState<Example[]>(mode === 'remix' ? [] : base?.examples ?? []);
  const [err, setErr] = useState<Record<string, string>>({});
  const src = mode === 'remix' ? source : initial?.remixOf ? s.prompts.find((p) => p.id === initial.remixOf) : undefined;
  const srcUser = src ? user(src.authorId) : undefined;

  const submit = () => {
    const e: Record<string, string> = {};
    if (title.trim().length < 3) e.title = 'العنوان 3 أحرف على الأقل';
    if (body.trim().length < 10) e.body = 'نص البرومبت 10 أحرف على الأقل';
    setErr(e);
    if (Object.keys(e).length || !me) return;
    const data = {
      title: title.trim(), description: description.trim(), body: body.trim(), category, model,
      variables: Array.from(new Set([...list(vars), ...extractVars(body)])), tags: list(tags),
      examples: examples.filter((x) => x.value.trim()).map((x) => ({ ...x, value: x.value.trim() })),
    };
    if (mode === 'edit' && initial) { updatePrompt(initial.id, data); toast('تم حفظ التعديلات'); goBack(); return; }
    const id = createPrompt({ ...data, remixOf: mode === 'remix' ? source?.id : undefined });
    toast(mode === 'remix' ? 'تم نشر الـ Remix' : 'تم نشر البرومبت');
    router.replace(`/prompt/${id}`);
  };

  return (
    <Screen back title={mode === 'edit' ? 'تعديل البرومبت' : mode === 'remix' ? 'Remix' : 'برومبت جديد'}
      footer={<View style={{ padding: space.lg, borderTopWidth: 1, borderTopColor: c.hairline }}><Button title={mode === 'edit' ? 'حفظ التعديلات' : 'نشر'} onPress={submit} /></View>}>
      <View style={{ padding: space.lg, gap: space.xl }}>
        {src && (
          <View style={{ gap: 6 }}>
            <T v="bodyStrong">المصدر</T>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, minHeight: 44, paddingHorizontal: 15, borderRadius: radius.md, backgroundColor: c.surfaceCard }}>
              <Ionicons name="git-branch-outline" size={18} color={c.mute} />
              <T v="bodyMd" color="mute" style={{ flex: 1 }} numberOfLines={1}>Remix of @{srcUser?.handle} — {src.title}</T>
              <Ionicons name="lock-closed" size={14} color={c.ash} />
            </View>
          </View>
        )}
        <Input label="العنوان" value={title} onChangeText={setTitle} placeholder="مثال: خطة محتوى شهرية" error={err.title} />
        <Input label="الوصف" value={description} onChangeText={setDescription} multiline placeholder="ماذا يفعل هذا البرومبت؟" />
        <Input label="نص البرومبت" value={body} onChangeText={setBody} multiline style={{ minHeight: 160 }} placeholder="اكتب البرومبت. استخدم {{اسم_المتغير}} لمواضع التعبئة." error={err.body} />
        <View style={{ gap: space.sm }}>
          <Input label="المتغيرات" value={vars} onChangeText={setVars} placeholder="الجمهور، اللغة" hint="افصل بينها بفاصلة. نضيف تلقائيًا ما يرد في النص بصيغة {{...}}." />
          <View style={{ flexDirection: 'row' }}><Button variant="secondary" title="استخرج من النص" icon="sparkles-outline" onPress={() => setVars(extractVars(body).join('، '))} /></View>
        </View>
        <Input label="الوسوم" value={tags} onChangeText={setTags} placeholder="تسويق، محتوى" hint="افصل بينها بفاصلة." />
        <View style={{ gap: space.sm }}>
          <T v="bodyStrong">التصنيف</T>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>{CATEGORIES.map((k) => <Chip key={k} label={k} active={category === k} onPress={() => setCategory(k)} />)}</View>
        </View>
        <View style={{ gap: space.sm }}>
          <T v="bodyStrong">النموذج المناسب</T>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>{MODELS.map((k) => <Chip key={k} label={k} active={model === k} onPress={() => setModel(k)} />)}</View>
        </View>
        <View style={{ gap: space.md }}>
          <T v="bodyStrong">أمثلة على النتائج</T>
          {examples.map((x, i) => (
            <View key={i} style={{ flexDirection: 'row', gap: space.sm, alignItems: 'flex-start' }}>
              <View style={{ flex: 1 }}>
                <Input value={x.value} multiline={x.type === 'text'} autoCapitalize="none" keyboardType={x.type === 'image' ? 'url' : 'default'}
                  placeholder={x.type === 'text' ? 'نتيجة نصية' : 'https://...صورة'} onChangeText={(v) => setExamples((e) => e.map((y, j) => (j === i ? { ...y, value: v } : y)))} />
              </View>
              <IconBtn icon="trash-outline" onPress={() => setExamples((e) => e.filter((_, j) => j !== i))} />
            </View>
          ))}
          <View style={{ flexDirection: 'row', gap: space.sm, flexWrap: 'wrap' }}>
            <Button variant="secondary" icon="text-outline" title="مثال نصي" onPress={() => setExamples((e) => [...e, { type: 'text', value: '' }])} />
            <Button variant="secondary" icon="image-outline" title="رابط صورة" onPress={() => setExamples((e) => [...e, { type: 'image', value: '' }])} />
          </View>
        </View>
      </View>
    </Screen>
  );
}
