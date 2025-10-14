import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { getJSON, setJSON, STORAGE_KEYS } from '@/lib/storage';

type CreatureRef = { id: string; name: string; species: string };

type Post = {
  id: string;
  title: string;
  excerpt: string;
  creature_id?: string;
  created_at: string;
  author_nick: string;
};

const BAD_WORDS = ['badword', 'curse', 'swear']; // minimal example; extend as needed

const POSTS_KEY = STORAGE_KEYS.posts;
const LIKES_KEY = STORAGE_KEYS.likes;
const CREATURES_KEY = STORAGE_KEYS.creatures;
const NICK_KEY = STORAGE_KEYS.nickname;

export default function PublicBoard() {
  const { t } = useTranslation();
  const { toast } = useToast();

  const [posts, setPosts] = useState<Post[]>([]);
  const [likes, setLikes] = useState<Record<string, string[]>>({});
  const [creatures, setCreatures] = useState<CreatureRef[]>([]);
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [creatureId, setCreatureId] = useState<string | undefined>(undefined);
  const [nickname, setNickname] = useState<string>('');

  useEffect(() => {
    // Load posts, likes, creatures, and nickname
    setPosts(getJSON<Post[]>(POSTS_KEY, []));
    setLikes(getJSON<Record<string, string[]>>(LIKES_KEY, {}));
    const rawCreatures = getJSON<unknown[]>(CREATURES_KEY, []);
    const list: CreatureRef[] = Array.isArray(rawCreatures)
      ? rawCreatures
          .map((c) => {
            if (typeof c !== 'object' || c === null) return null;
            const obj = c as Record<string, unknown>;
            if (typeof obj.id === 'string' && typeof obj.name === 'string' && typeof obj.species === 'string') {
              return { id: obj.id, name: obj.name, species: obj.species };
            }
            return null;
          })
          .filter(Boolean) as CreatureRef[]
      : [];
    setCreatures(list);
    let nick = getJSON<string | null>(NICK_KEY, null);
    if (!nick) {
      const promptText = t('board.nickname_prompt', { defaultValue: 'Choose a nickname to post & like:' });
      const nextNick = window.prompt(promptText) || '';
      nick = nextNick.trim() || `Guest-${Math.random().toString(16).slice(2, 6)}`;
      setJSON(NICK_KEY, nick);
      toast({ title: t('board.nickname_set', { defaultValue: 'Nickname saved' }), description: nick });
    }
    setNickname(nick);
  }, [toast, t]);

  const containsBadWord = (text: string) => {
    const lower = text.toLowerCase();
    return BAD_WORDS.some((w) => lower.includes(w));
  };

  const submit = () => {
    if (!title.trim() || !excerpt.trim()) {
      toast({
        title: t('board.form_error', { defaultValue: 'Missing fields' }),
        description: t('board.form_error_desc', { defaultValue: 'Please fill title and excerpt.' }),
        variant: 'destructive',
      });
      return;
    }
    if (containsBadWord(title) || containsBadWord(excerpt)) {
      toast({
        title: t('board.badword_title', { defaultValue: 'Inappropriate content' }),
        description: t('board.badword_desc', { defaultValue: 'Please remove disallowed words from title/excerpt.' }),
        variant: 'destructive',
      });
      return;
    }
    const id =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? (crypto as unknown as { randomUUID: () => string }).randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const post: Post = {
      id,
      title: title.trim(),
      excerpt: excerpt.trim(),
      creature_id: creatureId,
      created_at: new Date().toISOString(),
      author_nick: nickname,
    };
    const next = [post, ...posts];
    setPosts(next);
    setJSON(POSTS_KEY, next);
    setTitle('');
    setExcerpt('');
    setCreatureId(undefined);
    toast({ title: t('board.post_ok', { defaultValue: 'Posted' }), description: t('board.post_ok_desc', { defaultValue: 'Your story has been shared.' }) });
  };

  const toggleLike = (postId: string) => {
    const current = getJSON<Record<string, string[]>>(LIKES_KEY, {});
    const list = Array.isArray(current[postId]) ? current[postId] : [];
    const has = list.includes(nickname);
    const nextList = has ? list.filter((n) => n !== nickname) : [...list, nickname];
    const nextLikes = { ...current, [postId]: nextList };
    setLikes(nextLikes);
    setJSON(LIKES_KEY, nextLikes);
  };

  const likesCount = (postId: string) => {
    const list = likes[postId];
    return Array.isArray(list) ? list.length : 0;
  };

  const creatureName = (id?: string) => creatures.find((c) => c.id === id)?.name;

  const count = useMemo(() => posts.length, [posts]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-900">{t('board.title', { defaultValue: 'Sharing Board' })}</h1>
          <div className="text-sm text-blue-700">{t('board.count', { defaultValue: `Posts: ${count}`, count })}</div>
        </div>

        <Card className="bg-white/70 backdrop-blur border border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">{t('board.form_title', { defaultValue: 'Share a story' })}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-blue-900" htmlFor="title">{t('board.form_title_label', { defaultValue: 'Title' })}</label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t('board.form_title_ph', { defaultValue: 'Enter a catchy title...' })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-blue-900" htmlFor="excerpt">{t('board.form_excerpt_label', { defaultValue: 'Excerpt' })}</label>
              <Textarea id="excerpt" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder={t('board.form_excerpt_ph', { defaultValue: 'Write a short teaser...' })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-blue-900">{t('board.form_creature_label', { defaultValue: 'Linked creature (optional)' })}</label>
              <Select value={creatureId} onValueChange={(v) => setCreatureId(v)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('board.form_creature_ph', { defaultValue: 'Select a creature...' })} />
                </SelectTrigger>
                <SelectContent>
                  {creatures.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name} ({c.species})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Badge className="bg-blue-800 text-blue-100 border border-blue-400/40">
                {t('board.nickname_label', { defaultValue: 'Nickname' })}: {nickname}
              </Badge>
              <Button className="btn-premium" onClick={submit}>{t('board.form_submit', { defaultValue: 'Post' })}</Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-blue-900">{t('board.posts_heading', { defaultValue: 'Latest posts' })}</h2>
          {posts.length === 0 ? (
            <p className="text-sm text-blue-800">{t('board.posts_empty', { defaultValue: 'No posts yet.' })}</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {posts.map((p) => {
                const countLikes = likesCount(p.id);
                const liked = (likes[p.id] || []).includes(nickname);
                return (
                  <Card key={p.id} className="bg-blue-900/10 border border-blue-300/40">
                    <CardHeader>
                      <CardTitle className="text-blue-900">{p.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-blue-900 text-sm">{p.excerpt}</p>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-blue-800 text-blue-100 border border-blue-400/40">
                          {t('board.likes', { defaultValue: 'Likes' })}: {countLikes}
                        </Badge>
                        {p.creature_id && (
                          <Badge className="bg-yellow-700/60 text-yellow-100 border border-yellow-400/40">
                            {t('board.creature_badge', { defaultValue: 'Creature: {{name}}' }, { name: creatureName(p.creature_id) || '—' })}
                          </Badge>
                        )}
                      </div>
                      <div className="flex justify-end">
                        <Button variant="outline" className="btn-premium-outline" onClick={() => toggleLike(p.id)}>
                          {liked ? t('board.unlike', { defaultValue: 'Unlike' }) : t('board.like', { defaultValue: 'Like' })}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}