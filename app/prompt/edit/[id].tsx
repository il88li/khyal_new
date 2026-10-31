import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { PromptForm } from '../../../src/promptForm';
import { useStore } from '../../../src/store';
import { Empty, Screen } from '../../../src/ui';

export default function EditPromptScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { s, me } = useStore();
  const p = s.prompts.find((x) => x.id === id);
  if (!p || p.authorId !== me?.id) return <Screen back title="تعديل البرومبت"><Empty icon="lock-closed-outline" title="لا يمكنك تعديل هذا البرومبت" sub="التعديل متاح لصاحبه فقط." /></Screen>;
  return <PromptForm mode="edit" initial={p} />;
}
