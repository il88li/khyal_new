import React from 'react';
import { useStore } from '../../src/store';
import { ProfileBody } from '../../src/profile';
import { Screen } from '../../src/ui';

export default function ProfileScreen() {
  const { me } = useStore();
  if (!me) return null;
  return <Screen title="حسابي" tabs><ProfileBody userId={me.id} self /></Screen>;
}
