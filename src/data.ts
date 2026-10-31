import { State, Prompt, User } from './types';

export const CATEGORIES = ['تسويق', 'برمجة', 'صور', 'كتابة', 'دراسة', 'تصميم', 'ترجمة', 'أعمال'];
export const MODELS = ['ChatGPT', 'Claude', 'Gemini', 'Midjourney', 'أي نموذج'];
export const REPORT_REASONS = ['محتوى مسيء', 'بريد مزعج أو إعلانات', 'انتحال أو سرقة', 'معلومات مضللة', 'سبب آخر'];

const H = 3600_000;
const now = Date.now();
const img = (s: string, w = 600, h = 800) => ({ type: 'image' as const, value: `https://picsum.photos/seed/${s}/${w}/${h}` });
const txt = (value: string) => ({ type: 'text' as const, value });

const users: User[] = [
  { id: 'u1', name: 'سارة المطيري', handle: 'sara', bio: 'أكتب برومبتات للتسويق والمحتوى.', email: 'demo@khayal.app', interests: ['تسويق', 'كتابة'], baseFollowers: 128, isAdmin: true },
  { id: 'u2', name: 'عمر الحربي', handle: 'omar', bio: 'مطوّر برمجيات. أحب الأتمتة.', email: 'omar@khayal.app', interests: ['برمجة'], baseFollowers: 342 },
  { id: 'u3', name: 'لينا الشمري', handle: 'lina', bio: 'مصممة. برومبتات الصور والهوية البصرية.', email: 'lina@khayal.app', interests: ['صور', 'تصميم'], baseFollowers: 912 },
  { id: 'u4', name: 'خالد القحطاني', handle: 'khaled', bio: 'طالب دراسات عليا، أبسّط المذاكرة.', email: 'khaled@khayal.app', interests: ['دراسة'], baseFollowers: 57 },
  { id: 'u5', name: 'نورة العتيبي', handle: 'noura', bio: 'مسوّقة رقمية في وكالة صغيرة.', email: 'noura@khayal.app', interests: ['تسويق', 'أعمال'], baseFollowers: 205 },
  { id: 'u6', name: 'فهد الدوسري', handle: 'fahad', bio: 'مترجم وكاتب محتوى.', email: 'fahad@khayal.app', interests: ['ترجمة', 'كتابة'], baseFollowers: 76 },
];

const P = (p: Partial<Prompt> & Pick<Prompt, 'id' | 'authorId' | 'title' | 'body' | 'category'>, hoursAgo: number): Prompt => ({
  description: '', variables: [], tags: [], model: 'أي نموذج', examples: [], copies: 0, baseLikes: 0, likedBy: [],
  createdAt: now - hoursAgo * H, ...p,
});

const prompts: Prompt[] = [
  P({ id: 'p1', authorId: 'u5', category: 'تسويق', model: 'ChatGPT', title: 'خطة محتوى شهرية لمتجر إلكتروني',
    description: 'يبني تقويم محتوى كامل لمنصات التواصل مع أفكار منشورات وأوقات نشر.',
    body: 'أنت خبير تسويق رقمي. أنشئ خطة محتوى لمدة شهر لمتجر {{نوع_المتجر}} يستهدف {{الجمهور}}. قدّم جدولًا أسبوعيًا يضم: فكرة المنشور، المنصة، أفضل وقت للنشر، ونداء الإجراء.',
    variables: ['نوع_المتجر', 'الجمهور'], tags: ['تسويق', 'محتوى', 'سوشال_ميديا'], baseLikes: 214, copies: 530,
    examples: [txt('الأسبوع 1 — الثلاثاء: فيديو قصير لتغليف الطلبات، إنستغرام 8م، نداء: اطلب الآن.')] }, 5),
  P({ id: 'p2', authorId: 'u3', category: 'صور', model: 'Midjourney', title: 'بورتريه سينمائي بإضاءة ذهبية',
    description: 'صورة شخصية بطابع الأفلام وقت الغروب.',
    body: 'cinematic portrait of {{الشخصية}}, golden hour light, shallow depth of field, 85mm lens, film grain, warm tones --ar 3:4',
    variables: ['الشخصية'], tags: ['صور', 'بورتريه', 'سينمائي'], baseLikes: 880, copies: 1200, examples: [img('khayal-p2', 600, 800)] }, 9),
  P({ id: 'p3', authorId: 'u2', category: 'برمجة', model: 'Claude', title: 'مراجعة كود مع اقتراحات تحسين',
    description: 'مراجعة صارمة للقراءة والأداء والأمان.',
    body: 'راجع الكود التالي بلغة {{اللغة}} كمهندس أول. اذكر: الأخطاء المحتملة، مشاكل الأداء، الثغرات الأمنية، ثم أعد كتابة أهم جزء بشكل أفضل مع شرح قصير.\n\n{{الكود}}',
    variables: ['اللغة', 'الكود'], tags: ['برمجة', 'مراجعة_كود'], baseLikes: 421, copies: 760,
    examples: [txt('1) الدالة تعدّل المصفوفة الأصلية. 2) الحلقة المتداخلة O(n²) يمكن استبدالها بخريطة.')] }, 12),
  P({ id: 'p4', authorId: 'u4', category: 'دراسة', model: 'Gemini', title: 'ملخص فصل دراسي مع أسئلة مراجعة',
    description: 'يحوّل أي نص دراسي إلى ملخص ثم اختبار قصير.',
    body: 'لخّص النص التالي في 7 نقاط واضحة لطالب مستوى {{المستوى}}، ثم اكتب 5 أسئلة اختيار من متعدد مع الإجابات.\n\n{{النص}}',
    variables: ['المستوى', 'النص'], tags: ['دراسة', 'تلخيص', 'اختبارات'], baseLikes: 96, copies: 310, examples: [] }, 20),
  P({ id: 'p5', authorId: 'u6', category: 'ترجمة', model: 'ChatGPT', title: 'ترجمة أدبية تحافظ على النبرة',
    description: 'ترجمة من الإنجليزية للعربية بأسلوب سلس لا حرفي.',
    body: 'ترجم النص التالي إلى العربية الفصحى المعاصرة مع الحفاظ على النبرة {{النبرة}} وتجنب الترجمة الحرفية. أضف ملاحظة قصيرة لأي عبارة صعبة.\n\n{{النص}}',
    variables: ['النبرة', 'النص'], tags: ['ترجمة', 'كتابة'], baseLikes: 63, copies: 140, examples: [] }, 30),
  P({ id: 'p6', authorId: 'u3', category: 'تصميم', model: 'Midjourney', title: 'هوية بصرية لمقهى بسيط',
    description: 'شعار ولوحة ألوان وتغليف لمقهى.',
    body: 'minimal brand identity for a specialty coffee shop called {{الاسم}}, logo mark, color palette, packaging mockup, flat lay, soft studio light',
    variables: ['الاسم'], tags: ['تصميم', 'شعار', 'هوية'], baseLikes: 502, copies: 640, examples: [img('khayal-p6', 600, 600)] }, 40),
  P({ id: 'p7', authorId: 'u1', category: 'كتابة', model: 'Claude', title: 'مقدمة مقال تشدّ القارئ',
    description: 'ثلاث مقدمات بأساليب مختلفة لنفس الموضوع.',
    body: 'اكتب ثلاث مقدمات مختلفة (سؤال، قصة قصيرة، رقم صادم) لمقال عنوانه «{{العنوان}}». لا تتجاوز كل مقدمة 60 كلمة.',
    variables: ['العنوان'], tags: ['كتابة', 'مقالات'], baseLikes: 150, copies: 280, examples: [] }, 48),
  P({ id: 'p8', authorId: 'u2', category: 'برمجة', model: 'ChatGPT', title: 'شرح خطأ برمجي خطوة بخطوة',
    description: 'يفسّر رسالة الخطأ ويقترح الحل.',
    body: 'هذه رسالة الخطأ التي تظهر لي:\n{{الخطأ}}\nاشرح سببها بلغة بسيطة، ثم اقترح 3 حلول مرتبة من الأسهل للأصعب.',
    variables: ['الخطأ'], tags: ['برمجة', 'أخطاء'], baseLikes: 301, copies: 590, examples: [] }, 60),
  P({ id: 'p9', authorId: 'u5', category: 'أعمال', model: 'Claude', title: 'رسالة بيع باردة بنسبة رد أعلى',
    description: 'رسالة قصيرة لعميل محتمل لا تشبه القوالب.',
    body: 'اكتب رسالة بريد باردة لا تتجاوز 90 كلمة إلى {{المنصب}} في شركة {{المجال}} تعرض فيها {{العرض}}. ابدأ بملاحظة شخصية وانتهِ بسؤال واحد.',
    variables: ['المنصب', 'المجال', 'العرض'], tags: ['مبيعات', 'أعمال', 'بريد'], baseLikes: 188, copies: 220, examples: [] }, 72),
  P({ id: 'p10', authorId: 'u3', category: 'صور', model: 'Midjourney', title: 'مدينة مستقبلية بطابع عربي',
    description: 'مشهد عمراني يجمع الزخرفة الإسلامية والتقنية.',
    body: 'futuristic arabian city at dusk, mashrabiya facades, glowing lanterns, flying trams, intricate geometric patterns, ultra detailed --ar 2:3',
    variables: [], tags: ['صور', 'مستقبل', 'عمارة'], baseLikes: 1203, copies: 1500, examples: [img('khayal-p10', 600, 900)] }, 80),
  P({ id: 'p11', authorId: 'u4', category: 'دراسة', model: 'Claude', title: 'جدول مراجعة قبل الاختبار',
    description: 'جدول أيام وساعات بحسب المواد المتبقية.',
    body: 'لدي اختبار في {{المادة}} بعد {{الأيام}} أيام ومتاح لي {{الساعات}} ساعات يوميًا. ابنِ جدول مراجعة يوزع المواضيع مع فترات راحة ومراجعة سريعة قبل النوم.',
    variables: ['المادة', 'الأيام', 'الساعات'], tags: ['دراسة', 'جدولة'], baseLikes: 77, copies: 120, examples: [] }, 90),
  P({ id: 'p12', authorId: 'u2', category: 'برمجة', model: 'Claude', title: 'تحويل مكوّن React إلى TypeScript',
    description: 'تحويل مع تعريف الأنواع بدون any.',
    body: 'حوّل مكوّن React التالي إلى TypeScript مع تعريف واجهة Props دقيقة وتجنّب any:\n\n{{المكون}}',
    variables: ['المكون'], tags: ['برمجة', 'react', 'typescript'], baseLikes: 260, copies: 410, examples: [], remixOf: 'p3' }, 100),
];

export const seed = (): State => ({
  session: null, theme: 'system', users,
  creds: Object.fromEntries(users.map((u) => [u.email, { password: '123456', userId: u.id }])),
  prompts,
  comments: [
    { id: 'c1', promptId: 'p2', authorId: 'u2', text: 'نتيجة رائعة! جرّبتها مع شخصية بحّار وطلعت ممتازة.', at: now - 6 * H },
    { id: 'c2', promptId: 'p2', authorId: 'u3', text: 'سعيدة إنها عجبتك، جرّب تغيّر العدسة إلى 50mm.', parentId: 'c1', at: now - 5 * H },
    { id: 'c3', promptId: 'p1', authorId: 'u1', text: 'استخدمتها لعميل وفرت عليّ ساعات.', at: now - 3 * H },
    { id: 'c4', promptId: 'p3', authorId: 'u5', text: 'مفيد جدًا للمراجعة السريعة.', at: now - 8 * H },
  ],
  follows: ['u1>u2', 'u1>u3', 'u5>u1', 'u2>u1'],
  blocks: [],
  collections: [{ id: 'col1', ownerId: 'u1', name: 'مفضلتي', promptIds: ['p2', 'p3'] }],
  notifs: [
    { id: 'n1', toUserId: 'u1', fromUserId: 'u3', type: 'like', promptId: 'p7', read: false, at: now - 1 * H },
    { id: 'n2', toUserId: 'u1', fromUserId: 'u2', type: 'comment', promptId: 'p7', read: false, at: now - 2 * H },
    { id: 'n3', toUserId: 'u1', fromUserId: 'u5', type: 'follow', read: true, at: now - 20 * H },
  ],
  reports: [
    { id: 'r1', targetType: 'prompt', targetId: 'p9', reason: 'بريد مزعج أو إعلانات', note: 'يشبه رسائل ترويجية متكررة.', byUserId: 'u4', at: now - 10 * H },
    { id: 'r2', targetType: 'user', targetId: 'u6', reason: 'سبب آخر', note: 'تعليقات غير لائقة في أحد البرومبتات.', byUserId: 'u2', at: now - 26 * H },
  ],
});

export const CAT_ICONS: Record<string, string> = {
  تسويق: 'megaphone-outline', برمجة: 'code-slash-outline', صور: 'image-outline', كتابة: 'create-outline',
  دراسة: 'school-outline', تصميم: 'color-palette-outline', ترجمة: 'language-outline', أعمال: 'briefcase-outline',
};
