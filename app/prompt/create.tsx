import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { PromptForm } from '../../src/promptForm';
import { useStore } from '../../src/store';

export default function CreatePromptScreen() {
  const { remix } = useLocalSearchParams<{ remix?: string }>();
  const { s } = useStore();
  const source = remix ? s.prompts.find((p) => p.id === remix) : undefined;
  return <PromptForm mode={source ? 'remix' : 'create'} source={source} />;
}
