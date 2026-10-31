import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { ProfileBody } from '../../src/profile';
import { useStore } from '../../src/store';
import { Screen } from '../../src/ui';

export default function OtherUserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { me, user } = useStore();
  return <Screen title={user(id)?.name ?? 'الملف الشخصي'} back><ProfileBody userId={id} self={me?.id === id} /></Screen>;
}
