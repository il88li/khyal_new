import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, Animated, I18nManager, Image, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleProp,
  Switch as RNSwitch, Text, TextInput, TextInputProps, TextStyle, View, ViewStyle, useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { fmt, useStore } from './store';
import { Palette, gridFor, radius, space, type } from './theme';
import { Prompt } from './types';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

/* ---------- Text ---------- */
export function T({ v = 'bodyMd', color, style, children, numberOfLines, onPress }: {
  v?: keyof typeof type; color?: keyof Palette; style?: StyleProp<TextStyle>; children?: React.ReactNode; numberOfLines?: number; onPress?: () => void;
}) {
  const { c } = useStore();
  const def: keyof Palette = v.startsWith('body') || v.startsWith('caption') ? 'body' : 'ink';
  return <Text onPress={onPress} numberOfLines={numberOfLines} style={[type[v], { color: c[color ?? def], writingDirection: 'rtl' }, style]}>{children}</Text>;
}

/* ---------- Toast ---------- */
const ToastCtx = createContext<(m: string, kind?: 'ok' | 'err') => void>(() => {});
export const useToast = () => useContext(ToastCtx);
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const { c } = useStore();
  const [m, setM] = useState<{ t: string; k: 'ok' | 'err' } | null>(null);
  const o = useRef(new Animated.Value(0)).current;
  const show = (t: string, k: 'ok' | 'err' = 'ok') => {
    setM({ t, k }); o.setValue(0);
    Animated.sequence([Animated.timing(o, { toValue: 1, duration: 180, useNativeDriver: true }), Animated.delay(1700), Animated.timing(o, { toValue: 0, duration: 220, useNativeDriver: true })]).start(() => setM(null));
  };
  return (
    <ToastCtx.Provider value={show}>
      {children}
      {m && (
        <Animated.View pointerEvents="none" style={{ position: 'absolute', left: 16, right: 16, bottom: 100, alignItems: 'center', opacity: o, transform: [{ translateY: o.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }] }}>
          <View style={{ backgroundColor: m.k === 'err' ? c.errorDeep : c.toastBg, borderRadius: radius.full, paddingVertical: 12, paddingHorizontal: 20 }}>
            <T v="bodySmStrong" style={{ color: m.k === 'err' ? '#fff' : c.toastText }}>{m.t}</T>
          </View>
        </Animated.View>
      )}
    </ToastCtx.Provider>
  );
}

/* ---------- Buttons ---------- */
export function Button({ title, onPress, variant = 'primary', loading, disabled, icon, style }: {
  title: string; onPress?: () => void; variant?: 'primary' | 'secondary' | 'tertiary'; loading?: boolean; disabled?: boolean; icon?: IconName; style?: StyleProp<ViewStyle>;
}) {
  const { c } = useStore();
  return (
    <Pressable disabled={disabled || loading} onPress={onPress} hitSlop={4}
      style={({ pressed }) => {
        const bg = disabled ? c.surfaceCard : variant === 'primary' ? (pressed ? c.primaryPressed : c.primary) : variant === 'secondary' ? (pressed ? c.secondaryPressed : c.secondaryBg) : 'transparent';
        return [{ height: 40, minWidth: 80, paddingHorizontal: 14, borderRadius: radius.md, backgroundColor: bg, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, opacity: variant === 'tertiary' && pressed ? 0.6 : 1 }, style];
      }}>
      {loading ? <ActivityIndicator size="small" color={variant === 'primary' ? c.onPrimary : c.ink} /> : (
        <>
          {icon && <Ionicons name={icon} size={16} color={disabled ? c.ash : variant === 'primary' ? c.onPrimary : c.ink} />}
          <T v="buttonMd" style={{ color: disabled ? c.ash : variant === 'primary' ? c.onPrimary : variant === 'secondary' ? c.onSecondary : c.ink }}>{title}</T>
        </>
      )}
    </Pressable>
  );
}

export function IconBtn({ icon, onPress, color, size = 20, style }: { icon: IconName; onPress?: () => void; color?: string; size?: number; style?: StyleProp<ViewStyle> }) {
  const { c } = useStore();
  return (
    <Pressable onPress={onPress} hitSlop={4} style={({ pressed }) => [{ width: 40, height: 40, borderRadius: radius.full, backgroundColor: pressed ? c.secondaryBg : c.surfaceCard, alignItems: 'center', justifyContent: 'center' }, style]}>
      <Ionicons name={icon} size={size} color={color ?? c.ink} />
    </Pressable>
  );
}

export function Chip({ label, active, onPress }: { label: string; active?: boolean; onPress?: () => void }) {
  const { c } = useStore();
  return (
    <Pressable onPress={onPress} style={{ height: 40, paddingHorizontal: 16, borderRadius: radius.full, backgroundColor: active ? c.chipActiveBg : c.surfaceCard, alignItems: 'center', justifyContent: 'center' }}>
      <T v="buttonMd" style={{ color: active ? c.chipActiveText : c.ink }}>{label}</T>
    </Pressable>
  );
}

export function Pill({ children, icon }: { children: React.ReactNode; icon?: IconName }) {
  // pin-overlay-pill: خلفية بيضاء ونص أسود دائمًا لأنها فوق الصور.
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#ffffff', borderRadius: radius.full, paddingVertical: 6, paddingHorizontal: 12, maxWidth: '100%' }}>
      {icon && <Ionicons name={icon} size={12} color="#000" />}
      <Text numberOfLines={1} style={[type.buttonSm, { color: '#000', flexShrink: 1, writingDirection: 'rtl' }]}>{children}</Text>
    </View>
  );
}

/* ---------- Inputs ---------- */
export function Input({ label, error, hint, style, ...rest }: TextInputProps & { label?: string; error?: string; hint?: string }) {
  const { c } = useStore();
  const [f, setF] = useState(false);
  return (
    <View style={{ gap: 6 }}>
      {label && <T v="bodyStrong">{label}</T>}
      {/* حلقة التركيز المزدوجة: 2px ink داخلية + 4px focus-outer خارجية */}
      <View style={{ margin: -4, borderWidth: 4, borderRadius: radius.md + 4, borderColor: f ? c.focus : 'transparent' }}>
        <TextInput
          {...rest} onFocus={(e) => { setF(true); rest.onFocus?.(e); }} onBlur={(e) => { setF(false); rest.onBlur?.(e); }}
          placeholderTextColor={c.ash}
          style={[type.bodyMd, { backgroundColor: c.canvas, color: c.ink, borderRadius: radius.md, borderWidth: f ? 2 : 1, borderColor: f ? c.ink : error ? c.error : c.ash, minHeight: 44, paddingHorizontal: 15, paddingVertical: rest.multiline ? 12 : 0, textAlignVertical: rest.multiline ? 'top' : 'center', writingDirection: 'rtl' }, rest.multiline && { minHeight: 110 }, style]}
        />
      </View>
      {!!error && <T v="bodySm" style={{ color: c.error, marginTop: 4 }}>{error}</T>}
      {!error && !!hint && <T v="captionSm" color="mute" style={{ marginTop: 4 }}>{hint}</T>}
    </View>
  );
}

export function SearchBar({ value, onChangeText, placeholder = 'ابحث عن برومبت أو وسم أو مستخدم', autoFocus, onPress }: { value?: string; onChangeText?: (t: string) => void; placeholder?: string; autoFocus?: boolean; onPress?: () => void }) {
  const { c } = useStore();
  const [f, setF] = useState(false);
  const box: ViewStyle = { height: 48, borderRadius: radius.full, backgroundColor: f ? c.canvas : c.surfaceCard, borderWidth: 1, borderColor: f ? c.ash : 'transparent', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, gap: 8 };
  if (onPress) return (
    <Pressable onPress={onPress} style={box}><Ionicons name="search" size={18} color={c.mute} /><T v="bodyMd" color="ash" style={{ flex: 1 }}>{placeholder}</T></Pressable>
  );
  return (
    <View style={box}>
      <Ionicons name="search" size={18} color={c.mute} />
      <TextInput value={value} onChangeText={onChangeText} autoFocus={autoFocus} placeholder={placeholder} placeholderTextColor={c.ash} onFocus={() => setF(true)} onBlur={() => setF(false)} returnKeyType="search"
        style={[type.bodyMd, { flex: 1, color: c.ink, padding: 0, writingDirection: 'rtl' }]} />
      {!!value && <Pressable onPress={() => onChangeText?.('')} hitSlop={8}><Ionicons name="close-circle" size={18} color={c.ash} /></Pressable>}
    </View>
  );
}

export function Toggle({ value, onValueChange }: { value: boolean; onValueChange: (v: boolean) => void }) {
  const { c } = useStore();
  return <RNSwitch value={value} onValueChange={onValueChange} trackColor={{ false: c.secondaryPressed, true: c.ink }} thumbColor={c.canvas} ios_backgroundColor={c.secondaryPressed} />;
}

/* ---------- Avatar ---------- */
export function Avatar({ handle, name, size = 40 }: { handle: string; name: string; size?: number }) {
  const { c } = useStore();
  const [bad, setBad] = useState(false);
  const base: ViewStyle = { width: size, height: size, borderRadius: radius.full, backgroundColor: c.secondaryBg, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' };
  return (
    <View style={base}>
      {bad ? <Text style={[type.bodySmStrong, { color: c.ink, fontSize: size * 0.4 }]}>{name.trim().charAt(0)}</Text>
        : <Image source={{ uri: `https://picsum.photos/seed/${handle}/160/160` }} style={{ width: size, height: size }} onError={() => setBad(true)} />}
    </View>
  );
}

/* ---------- Layout ---------- */
export const goBack = () => (router.canGoBack() ? router.back() : router.replace('/(tabs)'));

export function Screen({ title, back, right, children, scroll = true, tabs, footer, header = true }: {
  title?: string; back?: boolean; right?: React.ReactNode; children: React.ReactNode; scroll?: boolean; tabs?: boolean; footer?: React.ReactNode; header?: boolean;
}) {
  const { c } = useStore();
  return (
    <SafeAreaView edges={tabs ? ['top'] : ['top', 'bottom']} style={{ flex: 1, backgroundColor: c.canvas }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {header && (
          <View style={{ height: 64, flexDirection: 'row', alignItems: 'center', paddingHorizontal: space.lg, gap: space.md, borderBottomWidth: 1, borderBottomColor: c.hairline }}>
            {back && <IconBtn icon={I18nManager.isRTL ? 'arrow-forward' : 'arrow-back'} onPress={goBack} />}
            <T v="headingMd" style={{ flex: 1 }} numberOfLines={1}>{title}</T>
            {right}
          </View>
        )}
        {scroll ? <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: space.xxl }}>{children}</ScrollView> : <View style={{ flex: 1 }}>{children}</View>}
        {footer}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function Sheet({ visible, onClose, title, children }: { visible: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  const { c } = useStore();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={{ flex: 1, backgroundColor: c.scrim }} onPress={onClose} />
        <View style={{ backgroundColor: c.canvas, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, padding: space.xl, paddingBottom: space.xxl, maxHeight: '85%' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: space.lg }}>
            <T v="headingLg" style={{ flex: 1 }}>{title}</T>
            <IconBtn icon="close" onPress={onClose} />
          </View>
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>{children}</ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export function Empty({ icon = 'sparkles-outline', title, sub, action }: { icon?: IconName; title: string; sub?: string; action?: React.ReactNode }) {
  const { c } = useStore();
  return (
    <View style={{ alignItems: 'center', padding: space.xxl, gap: space.md }}>
      <Ionicons name={icon} size={36} color={c.ash} />
      <T v="headingMd" style={{ textAlign: 'center' }}>{title}</T>
      {!!sub && <T v="bodySm" color="mute" style={{ textAlign: 'center' }}>{sub}</T>}
      {action}
    </View>
  );
}

export function Row({ icon, label, value, onPress, right, danger }: { icon?: IconName; label: string; value?: string; onPress?: () => void; right?: React.ReactNode; danger?: boolean }) {
  const { c } = useStore();
  return (
    <Pressable onPress={onPress} disabled={!onPress} style={({ pressed }) => ({ minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: space.md, paddingHorizontal: space.lg, backgroundColor: pressed ? c.surfaceCard : 'transparent', borderBottomWidth: 1, borderBottomColor: c.hairlineSoft })}>
      {icon && <Ionicons name={icon} size={22} color={danger ? c.error : c.ink} />}
      <T v="bodyStrong" style={{ flex: 1, color: danger ? c.error : c.ink }}>{label}</T>
      {!!value && <T v="bodySm" color="mute">{value}</T>}
      {right ?? (onPress && <Ionicons name={I18nManager.isRTL ? 'chevron-back' : 'chevron-forward'} size={18} color={c.ash} />)}
    </Pressable>
  );
}

export const SectionTitle = ({ children, style }: { children: React.ReactNode; style?: StyleProp<TextStyle> }) => <T v="headingLg" style={[{ paddingHorizontal: space.lg, marginTop: space.xl, marginBottom: space.md }, style]}>{children}</T>;

export function FAB({ onPress }: { onPress: () => void }) {
  const { c } = useStore();
  return (
    <Pressable onPress={onPress} accessibilityLabel="برومبت جديد" style={({ pressed }) => ({ position: 'absolute', end: space.lg, bottom: space.lg, width: 56, height: 56, borderRadius: radius.full, backgroundColor: pressed ? c.primaryPressed : c.primary, alignItems: 'center', justifyContent: 'center' })}>
      <Ionicons name="add" size={30} color={c.onPrimary} />
    </Pressable>
  );
}

/* ---------- Pins ---------- */
const RATIOS = [1, 3 / 4, 2 / 3, 4 / 5];
const hash = (s: string) => [...s].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) >>> 0, 7);

export function PinCard({ p }: { p: Prompt }) {
  const { c, user, likeCount } = useStore();
  const a = user(p.authorId);
  const image = p.examples.find((e) => e.type === 'image');
  const open = () => router.push(`/prompt/${p.id}`);
  const author = a && (
    <Pill>{a.name}</Pill>
  );
  const likes = <Pill icon="heart">{fmt(likeCount(p))}</Pill>;
  if (image) {
    // pin-card: الصورة هي البطاقة، بلا حشو داخلي، والبيانات فوق الصورة.
    return (
      <Pressable onPress={open} style={{ borderRadius: radius.md, overflow: 'hidden', backgroundColor: c.surfaceCard }}>
        <Image source={{ uri: image.value }} style={{ width: '100%', aspectRatio: RATIOS[hash(p.id) % RATIOS.length] }} resizeMode="cover" />
        <View style={{ position: 'absolute', top: 8, start: 8, end: 8, flexDirection: 'row' }}><Pill>{p.title}</Pill></View>
        <View style={{ position: 'absolute', bottom: 8, start: 8, end: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <View style={{ flexShrink: 1 }}>{author}</View>{likes}
        </View>
      </Pressable>
    );
  }
  // بطاقة نصية: لا توجد صورة لتحمل البيانات، فنستثني الحشو الداخلي (16px) على سطح surface-card.
  return (
    <Pressable onPress={open} style={{ borderRadius: radius.md, backgroundColor: c.surfaceCard, padding: space.lg, gap: space.md }}>
      <View style={{ flexDirection: 'row' }}><View style={{ backgroundColor: c.canvas, borderRadius: radius.full, paddingVertical: 6, paddingHorizontal: 12 }}><T v="buttonSm">{p.category} · {p.model}</T></View></View>
      <T v="headingMd">{p.title}</T>
      <T v="bodySm" color="mute" numberOfLines={4}>{p.body.replace(/\{\{\s*([^}]+?)\s*\}\}/g, '[$1]')}</T>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {a && <Avatar handle={a.handle} name={a.name} size={32} />}
        <T v="bodySmStrong" style={{ flex: 1 }} numberOfLines={1}>{a?.name}</T>
        <Ionicons name="heart" size={14} color={c.mute} /><T v="captionMd" color="mute">{fmt(likeCount(p))}</T>
      </View>
    </Pressable>
  );
}

export function PinGrid({ items, empty }: { items: Prompt[]; empty?: React.ReactNode }) {
  const { width } = useWindowDimensions();
  const { cols, gap } = gridFor(width);
  if (!items.length) return <>{empty ?? <Empty title="لا توجد برومبتات هنا بعد" />}</>;
  const columns: Prompt[][] = Array.from({ length: cols }, () => []);
  items.forEach((p, i) => columns[i % cols].push(p));
  return (
    <View style={{ flexDirection: 'row', gap, paddingHorizontal: space.lg }}>
      {columns.map((col, i) => <View key={i} style={{ flex: 1, gap }}>{col.map((p) => <PinCard key={p.id} p={p} />)}</View>)}
    </View>
  );
}

export function ChipRow({ children }: { children: React.ReactNode }) {
  return <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: space.lg, gap: space.sm, paddingVertical: space.md }}>{children}</ScrollView>;
}

export function UserRow({ id, right }: { id: string; right?: React.ReactNode }) {
  const { user } = useStore();
  const u = user(id);
  if (!u) return null;
  return (
    <Pressable onPress={() => router.push(`/user/${u.id}`)} style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, paddingHorizontal: space.lg, paddingVertical: space.sm }}>
      <Avatar handle={u.handle} name={u.name} size={48} />
      <View style={{ flex: 1 }}><T v="bodyStrong" numberOfLines={1}>{u.name}</T><T v="bodySm" color="mute">@{u.handle}</T></View>
      {right}
    </Pressable>
  );
}
