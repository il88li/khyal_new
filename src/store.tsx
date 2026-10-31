import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { seed } from './data';
import { palette } from './theme';
import { Comment, NotifType, Prompt, State, ThemeMode, User } from './types';

const KEY = 'khayal:v1';
export const rid = (p: string) => p + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
export type PromptInput = Pick<Prompt, 'title' | 'description' | 'body' | 'variables' | 'tags' | 'category' | 'model' | 'examples'> & { remixOf?: string };

function useBuild() {
  const [s, setS] = useState<State>(seed);
  const [ready, setReady] = useState(false);
  const scheme = useColorScheme();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => { if (raw) setS((prev) => ({ ...prev, ...JSON.parse(raw) })); })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);
  useEffect(() => {
    if (!ready) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => AsyncStorage.setItem(KEY, JSON.stringify(s)).catch(() => {}), 250);
  }, [s, ready]);

  const dark = s.theme === 'dark' || (s.theme === 'system' && scheme === 'dark');
  const c = dark ? palette.dark : palette.light;
  const me = s.users.find((u) => u.id === s.session) ?? null;
  const user = (id: string) => s.users.find((u) => u.id === id);
  const isBlocked = (id: string) => !!me && s.blocks.includes(`${me.id}>${id}`);
  const isFollowing = (id: string) => !!me && s.follows.includes(`${me.id}>${id}`);
  const likeCount = (p: Prompt) => p.baseLikes + p.likedBy.length;
  const isLiked = (p: Prompt) => !!me && p.likedBy.includes(me.id);
  const followers = (id: string) => (user(id)?.baseFollowers ?? 0) + s.follows.filter((f) => f.endsWith(`>${id}`)).length;
  const following = (id: string) => s.follows.filter((f) => f.startsWith(`${id}>`)).length;
  const visiblePrompts = s.prompts.filter((p) => !isBlocked(p.authorId));

  const notify = (d: State, from: string, to: string, type: NotifType, promptId?: string): State =>
    from === to ? d : { ...d, notifs: [{ id: rid('n'), toUserId: to, fromUserId: from, type, promptId, read: false, at: Date.now() }, ...d.notifs] };

  const act = {
    login(email: string, password: string): string | null {
      const rec = s.creds[email.trim().toLowerCase()];
      if (!rec || rec.password !== password) return 'البريد أو كلمة المرور غير صحيحة';
      setS((p) => ({ ...p, session: rec.userId }));
      return null;
    },
    signup(v: { name: string; email: string; password: string; interests: string[] }): string | null {
      const email = v.email.trim().toLowerCase();
      if (s.creds[email]) return 'هذا البريد مسجّل مسبقًا';
      const id = rid('u');
      const u: User = { id, name: v.name.trim(), handle: email.split('@')[0].replace(/[^a-z0-9_]/gi, '').toLowerCase() || id, bio: '', email, interests: v.interests, baseFollowers: 0 };
      setS((p) => ({ ...p, users: [...p.users, u], creds: { ...p.creds, [email]: { password: v.password, userId: id } }, session: id }));
      return null;
    },
    logout: () => setS((p) => ({ ...p, session: null })),
    setTheme: (theme: ThemeMode) => setS((p) => ({ ...p, theme })),
    updateProfile: (patch: Partial<Pick<User, 'name' | 'bio' | 'interests' | 'isPrivate'>>) =>
      setS((p) => ({ ...p, users: p.users.map((u) => (u.id === p.session ? { ...u, ...patch } : u)) })),

    createPrompt(v: PromptInput): string {
      const id = rid('p');
      setS((p) => ({ ...p, prompts: [{ ...v, id, authorId: p.session!, createdAt: Date.now(), copies: 0, baseLikes: 0, likedBy: [] }, ...p.prompts] }));
      return id;
    },
    updatePrompt: (id: string, v: Partial<PromptInput>) => setS((p) => ({ ...p, prompts: p.prompts.map((x) => (x.id === id ? { ...x, ...v } : x)) })),
    deletePrompt: (id: string) =>
      setS((p) => ({
        ...p, prompts: p.prompts.filter((x) => x.id !== id).map((x) => (x.remixOf === id ? { ...x, remixOf: undefined } : x)),
        comments: p.comments.filter((x) => x.promptId !== id),
        collections: p.collections.map((c) => ({ ...c, promptIds: c.promptIds.filter((x) => x !== id) })),
      })),
    countCopy: (id: string) => setS((p) => ({ ...p, prompts: p.prompts.map((x) => (x.id === id ? { ...x, copies: x.copies + 1 } : x)) })),
    toggleLike(id: string) {
      setS((p) => {
        const me0 = p.session!; const pr = p.prompts.find((x) => x.id === id)!;
        const liked = pr.likedBy.includes(me0);
        const next = { ...p, prompts: p.prompts.map((x) => (x.id === id ? { ...x, likedBy: liked ? x.likedBy.filter((u) => u !== me0) : [...x.likedBy, me0] } : x)) };
        return liked ? next : notify(next, me0, pr.authorId, 'like', id);
      });
    },
    addComment(promptId: string, text: string, parentId?: string) {
      setS((p) => {
        const cm: Comment = { id: rid('c'), promptId, authorId: p.session!, text: text.trim(), parentId, at: Date.now() };
        const pr = p.prompts.find((x) => x.id === promptId)!;
        return notify({ ...p, comments: [...p.comments, cm] }, p.session!, pr.authorId, 'comment', promptId);
      });
    },
    deleteComment: (id: string) => setS((p) => ({ ...p, comments: p.comments.filter((x) => x.id !== id && x.parentId !== id) })),

    toggleFollow(id: string) {
      setS((p) => {
        const k = `${p.session}>${id}`;
        return p.follows.includes(k) ? { ...p, follows: p.follows.filter((f) => f !== k) } : notify({ ...p, follows: [...p.follows, k] }, p.session!, id, 'follow');
      });
    },
    toggleBlock(id: string) {
      setS((p) => {
        const k = `${p.session}>${id}`;
        return p.blocks.includes(k)
          ? { ...p, blocks: p.blocks.filter((b) => b !== k) }
          : { ...p, blocks: [...p.blocks, k], follows: p.follows.filter((f) => f !== `${p.session}>${id}` && f !== `${id}>${p.session}`) };
      });
    },

    createCollection(name: string, promptIds: string[] = []): string {
      const id = rid('col');
      setS((p) => ({ ...p, collections: [...p.collections, { id, ownerId: p.session!, name: name.trim(), promptIds }] }));
      return id;
    },
    renameCollection: (id: string, name: string) => setS((p) => ({ ...p, collections: p.collections.map((c) => (c.id === id ? { ...c, name: name.trim() } : c)) })),
    deleteCollection: (id: string) => setS((p) => ({ ...p, collections: p.collections.filter((c) => c.id !== id) })),
    togglePromptInCollection: (colId: string, pid: string) =>
      setS((p) => ({ ...p, collections: p.collections.map((c) => (c.id !== colId ? c : { ...c, promptIds: c.promptIds.includes(pid) ? c.promptIds.filter((x) => x !== pid) : [...c.promptIds, pid] })) })),

    addReport: (targetType: 'prompt' | 'user', targetId: string, reason: string, note: string) =>
      setS((p) => ({ ...p, reports: [{ id: rid('r'), targetType, targetId, reason, note: note.trim(), byUserId: p.session!, at: Date.now() }, ...p.reports] })),
    markNotifsRead: () => setS((p) => (p.notifs.some((n) => n.toUserId === p.session && !n.read) ? { ...p, notifs: p.notifs.map((n) => (n.toUserId === p.session ? { ...n, read: true } : n)) } : p)),
  };

  return { s, ready, me, dark, c, user, isBlocked, isFollowing, likeCount, isLiked, followers, following, visiblePrompts, ...act };
}

export type Store = ReturnType<typeof useBuild>;
const Ctx = createContext<Store>(null as unknown as Store);
export const StoreProvider = ({ children }: { children: React.ReactNode }) => {
  const v = useBuild();
  return <Ctx.Provider value={v}>{children}</Ctx.Provider>;
};
export const useStore = () => useContext(Ctx);

export const timeAgo = (t: number) => {
  const m = Math.floor((Date.now() - t) / 60000);
  if (m < 1) return 'الآن';
  if (m < 60) return `منذ ${m} د`;
  const h = Math.floor(m / 60);
  if (h < 24) return `منذ ${h} س`;
  return `منذ ${Math.floor(h / 24)} يوم`;
};
export const fmt = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1).replace('.0', '')}k` : String(n));
export const fillVars = (body: string, vals: Record<string, string>) => body.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (m, k) => (vals[k] ? vals[k] : m));
