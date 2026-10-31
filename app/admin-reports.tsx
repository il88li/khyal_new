import React from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { timeAgo, useStore } from '../src/store';
import { radius, space } from '../src/theme';
import { Empty, Screen, T } from '../src/ui';

export default function AdminReportsScreen() {
  const { c, s, me, user } = useStore();
  if (!me?.isAdmin) return <Screen back title="طلبات الإبلاغ"><Empty icon="lock-closed-outline" title="هذه الشاشة للمشرفين فقط" /></Screen>;
  const list = [...s.reports].sort((a, b) => b.at - a.at);
  return (
    <Screen back title="طلبات الإبلاغ">
      <View style={{ padding: space.lg, gap: space.sm }}>
        {list.length === 0 && <Empty icon="shield-checkmark-outline" title="لا توجد بلاغات" />}
        {list.map((r) => {
          const label = r.targetType === 'prompt' ? s.prompts.find((p) => p.id === r.targetId)?.title ?? 'برومبت محذوف' : user(r.targetId)?.name ?? 'مستخدم';
          const go = () => (r.targetType === 'prompt' ? s.prompts.some((p) => p.id === r.targetId) : true) && router.push(r.targetType === 'prompt' ? `/prompt/${r.targetId}` : `/user/${r.targetId}`);
          return (
            <Pressable key={r.id} onPress={go} style={{ backgroundColor: c.surfaceCard, borderRadius: radius.md, padding: space.lg, gap: space.sm }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
                <View style={{ backgroundColor: c.canvas, borderRadius: radius.full, paddingVertical: 4, paddingHorizontal: 10 }}><T v="buttonSm">{r.targetType === 'prompt' ? 'برومبت' : 'مستخدم'}</T></View>
                <T v="bodyStrong" style={{ flex: 1 }} numberOfLines={1}>{label}</T>
              </View>
              <T v="bodySmStrong">{r.reason}</T>
              {!!r.note && <T v="bodySm" color="mute">{r.note}</T>}
              <T v="captionSm" color="mute">بواسطة @{user(r.byUserId)?.handle} · {timeAgo(r.at)}</T>
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}
