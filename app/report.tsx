import React, { useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { REPORT_REASONS } from '../src/data';
import { useStore } from '../src/store';
import { space } from '../src/theme';
import { Button, Input, Row, Screen, T, goBack, useToast } from '../src/ui';

export default function ReportScreen() {
  const { type, id } = useLocalSearchParams<{ type: 'prompt' | 'user'; id: string }>();
  const { s, user, addReport } = useStore();
  const toast = useToast();
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const target = type === 'prompt' ? s.prompts.find((p) => p.id === id)?.title : user(id)?.name;
  const send = () => { addReport(type, id, reason, note); toast('تم إرسال البلاغ'); goBack(); };
  return (
    <Screen back title={type === 'prompt' ? 'إبلاغ عن برومبت' : 'إبلاغ عن مستخدم'}
      footer={<View style={{ padding: space.lg }}><Button title="إرسال البلاغ" disabled={!reason} onPress={send} /></View>}>
      <View style={{ padding: space.lg, gap: space.sm }}>
        <T v="bodySm" color="mute">الهدف</T><T v="headingMd">{target ?? '—'}</T>
      </View>
      <T v="bodyStrong" style={{ paddingHorizontal: space.lg, marginTop: space.md }}>سبب البلاغ</T>
      {REPORT_REASONS.map((r) => <Row key={r} label={r} icon={reason === r ? 'radio-button-on' : 'radio-button-off'} right={<View />} onPress={() => setReason(r)} />)}
      <View style={{ padding: space.lg }}><Input label="ملاحظة (اختياري)" value={note} onChangeText={setNote} multiline placeholder="أضف تفاصيل تساعد المشرف" /></View>
    </Screen>
  );
}
