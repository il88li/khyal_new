# خيال (Khayal) — واجهة أمامية MVP

React Native + Expo Router + TypeScript. بيانات وهمية محلية ومصادقة وهمية عبر AsyncStorage.

## التشغيل
```
npm install
npx expo install --fix   # يضبط إصدارات الحزم على إصدار Expo عندك
npx expo start
```
أول تشغيل يفرض RTL ويعيد تحميل التطبيق تلقائيًا (في التطوير). إن لم يتحوّل الاتجاه أغلق التطبيق وافتحه مرة ثانية.

**حساب تجريبي (مشرف):** `demo@khayal.app` / `123456`

## البنية
- `app/` الشاشات (Expo Router) — 20 شاشة. نقطة البداية `(tabs)/index` (الرئيسية) وتحوّل إلى `splash` إن لم توجد جلسة.
- `src/theme.ts` رموز التصميم من DESIGN-pinterest.md (فاتح/داكن).
- `src/store.tsx` الحالة والحفظ في AsyncStorage، `src/data.ts` البيانات الوهمية.
- `src/ui.tsx` المكوّنات المشتركة.
