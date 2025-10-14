import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { getJSON, setJSON, STORAGE_KEYS } from '@/lib/storage';

type Creature = {
  id: string;
  name: string;
  species: string;
  short_pitch: string;
  description?: string;
  personality_traits?: string[];
  powers?: string[];
  home_realm?: string;
  color_palette?: string[];
  suggested_themes?: string[];
  age_suitability?: string;
  languages?: string[];
  tags?: string[];
  illustration_prompt?: string;
  story_seed?: string;
  content_rating?: string;
};

type SortBy = 'name' | 'likes';
type AgeGroup = '4-6' | '6-8' | 'all';
type Lang = 'da' | 'en' | 'all';

export default function PublicLibrary() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [creatures, setCreatures] = useState<Creature[]>([]);
  const [search, setSearch] = useState('');
  const [age, setAge] = useState<AgeGroup>('all');
  const [lang, setLang] = useState<Lang>('all');
  const [sortBy, setSortBy] = useState<SortBy>('name');

  // load creatures from local storage
  useEffect(() => {
    const arr = getJSON<Creature[]>(STORAGE_KEYS.creatures, []);
    if (Array.isArray(arr)) setCreatures(arr);
  }, []);

  // aggregate likes by creature from posts + likes map
  const likesByCreature = useMemo(() => {
    const posts = getJSON<{ id: string; title: string; excerpt: string; creature_id?: string; created_at: string }[]>(
      STORAGE_KEYS.posts,
      [],
    );
    const likesMap = getJSON<Record<string, string[]>>(STORAGE_KEYS.likes, {});
    const counts: Record<string, number> = {};
    for (const p of posts) {
      if (!p.creature_id) continue;
      const lc = Array.isArray(likesMap[p.id]) ? likesMap[p.id].length : 0;
      counts[p.creature_id] = (counts[p.creature_id] || 0) + lc;
    }
    return counts;
  }, [creatures]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const bySearch = (c: Creature) => {
      if (!term) return true;
      const hay = [
        c.name,
        c.species,
        ...(c.tags || []),
        ...(c.suggested_themes || []),
        c.short_pitch || '',
      ]
        .join(' ')
        .toLowerCase();
      return hay.includes(term);
    };
    const byAge = (c: Creature) => {
      if (age === 'all') return true;
      const a = (c.age_suitability || '').toLowerCase();
      if (age === '4-6') return a.includes('4-6') || a.includes('4 to 6') || a.includes('4–6');
      if (age === '6-8') return a.includes('6-8') || a.includes('6 to 8') || a.includes('6–8');
      return true;
    };
    const byLang = (c: Creature) => {
      if (lang === 'all') return true;
      const arr = (c.languages || []).map((x) => x.toLowerCase());
      return arr.includes(lang);
    };
    let out = creatures.filter((c) => bySearch(c) && byAge(c) && byLang(c));
    if (sortBy === 'name') {
      out = out.slice().sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'likes') {
      out = out
        .slice()
        .sort((a, b) => (likesByCreature[b.id] || 0) - (likesByCreature[a.id] || 0));
    }
    return out;
  }, [creatures, search, age, lang, sortBy, likesByCreature]);

  const resetFilters = () => {
    setSearch('');
    setAge('all');
    setLang('all');
    setSortBy('name');
  };

  const importFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text) as unknown;
      if (!Array.isArray(data)) {
        toast({
          title: t('library.import_error', { defaultValue: 'Import failed' }),
          description: t('library.import_error_not_array', { defaultValue: 'JSON should be an array of creatures.' }),
          variant: 'destructive',
        });
        return;
      }
      const ok = data.filter((x) => {
        if (typeof x !== 'object' || x === null) return false;
        const obj = x as Record<string, unknown>;
        return typeof obj.id === 'string' && typeof obj.name === 'string' && typeof obj.species === 'string' && typeof obj.short_pitch === 'string';
      });
      if (ok.length !== data.length) {
        toast({
          title: t('library.import_error', { defaultValue: 'Import failed' }),
          description: t('library.import_error_shape', { defaultValue: 'Each item must have id, name, species, short_pitch.' }),
          variant: 'destructive',
        });
        return;
      }
      setJSON(STORAGE_KEYS.creatures, ok as Creature[]);
      setCreatures(ok as Creature[]);
      toast({
        title: t('library.import_success', { defaultValue: 'Import successful' }),
        description: t('library.import_success_desc', { defaultValue: 'Prefab creatures updated.' }),
      });
    } catch (err) {
      toast({
        title: t('library.import_error', { defaultValue: 'Import failed' }),
        description: err instanceof Error ? err.message : t('library.import_error_parse', { defaultValue: 'Failed to parse JSON.' }),
        variant: 'destructive',
      });
    }
  };

  // Navigate to Generate with router state (session-only prefill)
  const applyInStory = (c: Creature) => {
    navigate('/generate', { state: { prefab: c } });
    toast({
      title: t('library.use_success', { defaultValue: 'Prefab selected' }),
      description: t('library.use_success_desc', { defaultValue: `Using ${c.name} in Generate.` }),
    });
  };

  const count = useMemo(() => creatures.length, [creatures]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-900">{t('library.title', { defaultValue: 'Public Library' })}</h1>
          <div className="text-sm text-blue-700">
            {t('library.count', { defaultValue: `Total: ${count}`, count })}
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur rounded-lg border border-blue-200 p-4 space-y-3">
          <label htmlFor="jsonFile" className="text-sm font-medium text-blue-900">{t('library.import_label', { defaultValue: 'Import JSON' })}</label>
          <p className="text-xs text-blue-700">{t('library.import_help', { defaultValue: 'Upload a creatures JSON file to replace the prefab set.' })}</p>
          <div className="flex items-center gap-3">
            <Input id="jsonFile" type="file" accept="application/json" onChange={importFile} />
            <Button variant="outline" className="btn-premium-outline" onClick={() => {
              try {
                const data = creatures && Array.isArray(creatures) ? creatures : [];
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'creatures_export.json';
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
                toast({
                  title: t('library.export_success', { defaultValue: 'Exported' }),
                  description: t('library.export_success_desc', { defaultValue: 'Downloaded creatures_export.json' }),
                });
              } catch (err) {
                toast({
                  title: t('library.export_error', { defaultValue: 'Export failed' }),
                  description: err instanceof Error ? err.message : t('library.export_error_desc', { defaultValue: 'Could not export current creatures.' }),
                  variant: 'destructive',
                });
              }
            }}>
              {t('library.export_label', { defaultValue: 'Export JSON' })}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-3">
            <Input
              placeholder={t('library.search_ph', { defaultValue: 'Search name/species/tags/themes...' })}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="border rounded px-2 py-2 text-sm bg-white"
              value={age}
              onChange={(e) => setAge(e.target.value as AgeGroup)}
              aria-label={t('library.age_label', { defaultValue: 'Age' })}
            >
              <option value="all">{t('library.age_all', { defaultValue: 'All ages' })}</option>
              <option value="4-6">{t('library.age_4_6', { defaultValue: '4-6' })}</option>
              <option value="6-8">{t('library.age_6_8', { defaultValue: '6-8' })}</option>
            </select>
            <select
              className="border rounded px-2 py-2 text-sm bg-white"
              value={lang}
              onChange={(e) => setLang(e.target.value as Lang)}
              aria-label={t('library.lang_label', { defaultValue: 'Language' })}
            >
              <option value="all">{t('library.lang_all', { defaultValue: 'All languages' })}</option>
              <option value="da">DA</option>
              <option value="en">EN</option>
            </select>
            <select
              className="border rounded px-2 py-2 text-sm bg-white"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              aria-label={t('library.sort_label', { defaultValue: 'Sort' })}
            >
              <option value="name">{t('library.sort_name', { defaultValue: 'Name (A→Z)' })}</option>
              <option value="likes">{t('library.sort_likes', { defaultValue: 'Likes (desc)' })}</option>
            </select>
          </div>
          <div className="flex justify-end">
            <Button variant="outline" className="btn-premium-outline" onClick={resetFilters}>
              {t('library.reset_filters', { defaultValue: 'Reset Filters' })}
            </Button>
          </div>
        </div>

        {creatures.length === 0 ? (
          <div className="text-blue-800 text-sm">
            {t('library.empty_hint', { defaultValue: 'No creatures loaded. Try Import JSON above.' })}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((c) => (
              <Card key={c.id} className="bg-blue-900/10 border border-blue-300/40">
                <CardHeader>
                  <CardTitle className="text-blue-900">{c.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-blue-800"><span className="font-semibold">{t('library.species', { defaultValue: 'Species' })}:</span> {c.species}</p>
                  <p className="text-sm text-blue-900">{c.short_pitch}</p>
                  {Array.isArray(c.tags) && c.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {c.tags.slice(0, 6).map((tag) => (
                        <Badge key={tag} className="bg-blue-800 text-blue-100 border border-blue-400/40">{tag}</Badge>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <Badge className="bg-blue-800 text-blue-100 border border-blue-400/40">
                      {t('library.likes_badge', { defaultValue: 'Likes' })}: {likesByCreature[c.id] || 0}
                    </Badge>
                    <Button className="btn-premium" onClick={() => applyInStory(c)}>
                      {t('library.use_cta', { defaultValue: 'Use in story' })}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}