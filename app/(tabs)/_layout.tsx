import React from 'react';
import { Redirect, Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../src/store';
import { type } from '../../src/theme';

const tab = (name: string, title: string, icon: string, iconOff: string) => (
  <Tabs.Screen key={name} name={name} options={{
    title,
    tabBarIcon: ({ color, focused, size }) => <Ionicons name={(focused ? icon : iconOff) as any} size={size} color={color} />,
  }} />
);

export default function TabsLayout() {
  const { c, me, s } = useStore();
  if (!me) return <Redirect href="/splash" />;
  const unread = s.notifs.filter((n) => n.toUserId === me.id && !n.read).length;
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: c.primary, // مؤشر التبويب النشط: أحد الاستخدامات المسموحة للأحمر
      tabBarInactiveTintColor: c.mute,
      tabBarLabelStyle: { ...type.captionMd, fontSize: 11 },
      tabBarStyle: { backgroundColor: c.canvas, borderTopColor: c.hairline, borderTopWidth: 1, elevation: 0, shadowOpacity: 0 },
    }}>
      {tab('index', 'الرئيسية', 'home', 'home-outline')}
      {tab('explore', 'استكشاف', 'compass', 'compass-outline')}
      {tab('collections', 'مجموعاتي', 'albums', 'albums-outline')}
      <Tabs.Screen name="notifications" options={{ title: 'الإشعارات', tabBarBadge: unread || undefined, tabBarBadgeStyle: { backgroundColor: c.ink, color: c.canvas }, tabBarIcon: ({ color, focused, size }) => <Ionicons name={focused ? 'notifications' : 'notifications-outline'} size={size} color={color} /> }} />
      {tab('profile', 'حسابي', 'person', 'person-outline')}
    </Tabs>
  );
}
