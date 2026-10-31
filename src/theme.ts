// رموز التصميم مأخوذة حرفيًا من DESIGN-pinterest.md.
// الملف لا يعرّف ألوانًا للوضع الداكن إلا surface-dark (#262622)، فالباقي مشتق منه ومن on-dark.
import { TextStyle } from 'react-native';

const light = {
  primary: '#e60023', primaryPressed: '#cc001f', onPrimary: '#ffffff',
  ink: '#000000', inkSoft: '#211922', body: '#33332e', charcoal: '#262622',
  mute: '#62625b', ash: '#91918c', stone: '#c8c8c1',
  hairline: '#dadad3', hairlineSoft: '#e5e5e0',
  secondaryBg: '#e5e5e0', secondaryPressed: '#c8c8c1', onSecondary: '#000000',
  canvas: '#ffffff', surfaceSoft: '#fbfbf9', surfaceCard: '#f6f6f3',
  chipActiveBg: '#000000', chipActiveText: '#ffffff',
  focus: '#435ee5', error: '#9e0a0a', errorDeep: '#cc001f',
  successDeep: '#103c25', successPale: '#c7f0da',
  toastBg: '#262622', toastText: '#ffffff',
  scrim: 'rgba(0,0,0,0.5)', onDark: '#ffffff', onDarkMute: 'rgba(255,255,255,0.7)',
};
export type Palette = typeof light;

const dark: Palette = {
  ...light,
  ink: '#ffffff', inkSoft: '#f6f6f3', body: '#e5e5e0', charcoal: '#e5e5e0',
  mute: 'rgba(255,255,255,0.7)', ash: '#91918c', stone: '#62625b',
  hairline: '#3a3a35', hairlineSoft: '#2f2f2b',
  secondaryBg: '#3a3a35', secondaryPressed: '#4a4a44', onSecondary: '#ffffff',
  canvas: '#161614', surfaceSoft: '#1d1d1a', surfaceCard: '#262622',
  chipActiveBg: '#ffffff', chipActiveText: '#000000',
  error: '#ff7a85', toastBg: '#ffffff', toastText: '#000000',
};
export const palette = { light, dark };

export const radius = { none: 0, sm: 8, md: 16, lg: 32, full: 9999 };
export const space = { xxs: 4, xs: 6, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, section: 64 };

type W = '400' | '500' | '600' | '700';
const t = (size: number, weight: W, lh: number, ls = 0): TextStyle => ({
  fontSize: size, fontWeight: weight, lineHeight: Math.round(size * lh), letterSpacing: ls,
});
// الخط: Pin Sans غير متاح؛ نستخدم خط النظام (يدعم العربية) كأبسط حل. التتبّع السالب يُطبَّق على العناوين الكبيرة فقط.
export const type = {
  displayXl: t(70, '600', 1.1, -1.2),
  displayXlMobile: t(44, '600', 1.1, -1.2), // الحجم على الهاتف حسب جدول الاستجابة
  displayLg: t(44, '700', 1.15, -0.8),
  headingXl: t(28, '700', 1.2, -1.2),
  headingLg: t(22, '600', 1.25),
  headingMd: t(18, '600', 1.3),
  bodyMd: t(16, '400', 1.4),
  bodyStrong: t(16, '600', 1.4),
  bodySm: t(14, '400', 1.4),
  bodySmStrong: t(14, '700', 1.4),
  captionMd: t(12, '500', 1.5),
  captionSm: t(12, '400', 1.4),
  linkMd: t(16, '600', 1.4),
  buttonMd: t(14, '700', 1),
  buttonSm: t(12, '700', 1),
};

// الشبكة على الهاتف: عمود واحد وفاصل 6px (<480)، عمودان من 480 فأعلى وفاصل 8px.
export const gridFor = (width: number) => (width >= 480 ? { cols: 2, gap: space.sm } : { cols: 1, gap: space.xs });
