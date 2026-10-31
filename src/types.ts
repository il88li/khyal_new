export type Example = { type: 'text' | 'image'; value: string };
export type User = {
  id: string; name: string; handle: string; bio: string; email: string;
  interests: string[]; baseFollowers: number; isAdmin?: boolean; isPrivate?: boolean;
};
export type Prompt = {
  id: string; authorId: string; title: string; description: string; body: string;
  variables: string[]; tags: string[]; category: string; model: string;
  examples: Example[]; remixOf?: string; createdAt: number; copies: number; baseLikes: number; likedBy: string[];
};
export type Comment = { id: string; promptId: string; authorId: string; text: string; parentId?: string; at: number };
export type Collection = { id: string; ownerId: string; name: string; promptIds: string[] };
export type NotifType = 'like' | 'comment' | 'follow';
export type Notif = { id: string; toUserId: string; fromUserId: string; type: NotifType; promptId?: string; read: boolean; at: number };
export type Report = { id: string; targetType: 'prompt' | 'user'; targetId: string; reason: string; note: string; byUserId: string; at: number };
export type ThemeMode = 'system' | 'light' | 'dark';
export type State = {
  session: string | null; theme: ThemeMode;
  users: User[]; creds: Record<string, { password: string; userId: string }>;
  prompts: Prompt[]; comments: Comment[];
  follows: string[]; blocks: string[]; // "a>b"
  collections: Collection[]; notifs: Notif[]; reports: Report[];
};
