import React, { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { useStore } from '../src/store';
import { space } from '../src/theme';
import { Button, Input, Screen, T } from '../src/ui';

export default function LoginScreen() {
  const { login } = useStore();
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState<{ email?: string; pw?: string; form?: string }>({});
  const [busy, setBusy] = useState(false);
  const submit = () => {
    const e: typeof err = {};
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) e.email = 'أدخل بريدًا إلكترونيًا صحيحًا';
    if (pw.length < 6) e.pw = 'كلمة المرور 6 أحرف على الأقل';
    setErr(e);
    if (Object.keys(e).length) return;
    setBusy(true);
    setTimeout(() => { // محاكاة الشبكة
      const r = login(email, pw);
      setBusy(false);
      if (r) setErr({ form: r }); else router.replace('/(tabs)');
    }, 500);
  };
  return (
    <Screen title="تسجيل الدخول" back>
      <View style={{ padding: space.xl, gap: space.lg }}>
        <T v="headingLg">أهلًا بعودتك</T>
        <Input label="البريد الإلكتروني" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} placeholder="name@email.com" error={err.email} />
        <Input label="كلمة المرور" value={pw} onChangeText={setPw} secureTextEntry placeholder="••••••" error={err.pw} />
        {!!err.form && <T v="bodySm" color="error">{err.form}</T>}
        <Button title="دخول" loading={busy} onPress={submit} />
        <T v="bodySm" color="mute">حساب تجريبي: demo@khayal.app / 123456</T>
        <Button title="ليس لدي حساب؟ أنشئ حسابًا" variant="tertiary" onPress={() => router.replace('/onboarding')} />
      </View>
    </Screen>
  );
}
