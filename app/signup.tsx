import React, { useState } from 'react';
import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useStore } from '../src/store';
import { space } from '../src/theme';
import { Button, Input, Screen, T } from '../src/ui';

export default function SignupScreen() {
  const { signup } = useStore();
  const { interests } = useLocalSearchParams<{ interests?: string }>();
  const [f, setF] = useState({ name: '', email: '', pw: '', pw2: '' });
  const [err, setErr] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (v: string) => setF((p) => ({ ...p, [k]: v }));
  const submit = () => {
    const e: Record<string, string> = {};
    if (f.name.trim().length < 2) e.name = 'الاسم حرفان على الأقل';
    if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) e.email = 'أدخل بريدًا إلكترونيًا صحيحًا';
    if (f.pw.length < 6) e.pw = 'كلمة المرور 6 أحرف على الأقل';
    if (f.pw2 !== f.pw) e.pw2 = 'كلمتا المرور غير متطابقتين';
    setErr(e);
    if (Object.keys(e).length) return;
    setBusy(true);
    setTimeout(() => {
      const r = signup({ name: f.name, email: f.email, password: f.pw, interests: interests ? interests.split(',') : [] });
      setBusy(false);
      if (r) setErr({ email: r }); else router.replace('/(tabs)');
    }, 500);
  };
  return (
    <Screen title="إنشاء حساب" back>
      <View style={{ padding: space.xl, gap: space.lg }}>
        <T v="headingLg">مرحبًا بك في خيال</T>
        <Input label="الاسم" value={f.name} onChangeText={set('name')} placeholder="اسمك الظاهر" error={err.name} />
        <Input label="البريد الإلكتروني" value={f.email} onChangeText={set('email')} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} placeholder="name@email.com" error={err.email} />
        <Input label="كلمة المرور" value={f.pw} onChangeText={set('pw')} secureTextEntry error={err.pw} />
        <Input label="تأكيد كلمة المرور" value={f.pw2} onChangeText={set('pw2')} secureTextEntry error={err.pw2} />
        <Button title="إنشاء الحساب" loading={busy} onPress={submit} />
        <Button title="لدي حساب بالفعل" variant="tertiary" onPress={() => router.replace('/login')} />
      </View>
    </Screen>
  );
}
