import React, { useCallback } from 'react';
import { Pressable, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { timeAgo, useStore } from '../../src/store';
import { space } from '../../src/theme';
import { Avatar, Empty, Screen, T } from '../../src/ui';

const TEXT = { like: 'أعجب ببرومبتك', comment: 'علّق على برومبتك', follow: 'بدأ بمتابعتك' } as const;

export default function NotificationsScreen() {
  const { c, s, me, user, markNotifsRead } = useStore();
  const list = s.notifs.filter((n) => n.toUserId === me?.id).sort((a, b) => b.at - a.at);
  const shown = React.useRef(list.filter((n) => !n.read).map((n) => n.id));
  useFocusEffect(useCallback(() => { shown.current = list.filter((n) => !n.read).map((n) => n.id); const t = setTimeout(markNotifsRead, 1200); return () => clearTimeout(t); }, [s.notifs.length]));
  return (
    <Screen title="الإشعارات" tabs>
      {list.length === 0 && <Empty icon="notifications-outline" title="لا توجد إشعارات" sub="ستظهر هنا الإعجابات والتعليقات والمتابعات." />}
      {list.map((n) => {
        const from = user(n.fromUserId);
        if (!from) return null;
        return (
          <Pressable key={n.id} onPress={() => router.push(n.promptId ? `/prompt/${n.promptId}` : `/user/${from.id}`)}
            style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.lg, backgroundColor: shown.current.includes(n.id) ? c.surfaceCard : 'transparent' }}>
            <Avatar handle={from.handle} name={from.name} size={48} />
            <View style={{ flex: 1 }}>
              <T v="bodyMd"><T v="bodyStrong">{from.name}</T> {TEXT[n.type]}</T>
              <T v="captionSm" color="mute">{timeAgo(n.at)}</T>
            </View>
          </Pressable>
        );
      })}
    </Screen>
  );
}
