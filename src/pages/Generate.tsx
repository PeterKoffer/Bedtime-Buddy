import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState, useMemo } from 'react';

type CreaturePrefab = {
  id: string;
  name: string;
  species: string;
  suggested_themes?: string[];
  tags?: string[];
  story_seed?: string;
};

export default function Generate() {
  const { t } = useTranslation();
  const location = useLocation() as { state?: { prefab?: CreaturePrefab } };
  const initialPrefab = location.state?.prefab;
  const [prefab, setPrefab] = useState<CreaturePrefab | undefined>(initialPrefab);

  const themes = useMemo(() => prefab?.suggested_themes || [], [prefab]);
  const tags = useMemo(() => prefab?.tags || [], [prefab]);
  const seed = useMemo(() => prefab?.story_seed || '', [prefab]);

  const clearPrefab = () => setPrefab(undefined);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-900">{t('generate.title', { defaultValue: 'Generate a Story' })}</h1>
          {prefab && (
            <Badge className="bg-yellow-700/60 text-yellow-100 border border-yellow-400/40">
              {t('generate.prefab_using', { defaultValue: 'Using prefab: {{name}}' }, { name: prefab.name })}
            </Badge>
          )}
        </div>

        {prefab && (
          <Card className="bg-white/70 backdrop-blur border border-yellow-200">
            <CardHeader>
              <CardTitle className="text-blue-900">{t('generate.prefab_details', { defaultValue: 'Prefab details' })}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {themes.length > 0 && (
                <p className="text-sm text-blue-900">
                  <span className="font-semibold">{t('generate.prefab_themes', { defaultValue: 'Themes' })}:</span> {themes.join(', ')}
                </p>
              )}
              {tags.length > 0 && (
                <p className="text-sm text-blue-900">
                  <span className="font-semibold">{t('generate.prefab_tags', { defaultValue: 'Tags' })}:</span> {tags.join(', ')}
                </p>
              )}
              {seed && (
                <p className="text-sm text-blue-900">
                  <span className="font-semibold">{t('generate.prefab_seed', { defaultValue: 'Story seed' })}:</span> {seed}
                </p>
              )}
              <div className="flex justify-end">
                <Button variant="outline" className="btn-premium-outline" onClick={clearPrefab}>
                  {t('generate.prefab_clear', { defaultValue: 'Clear' })}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="bg-white/70 backdrop-blur border border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">{t('generate.form_title', { defaultValue: 'Story Settings' })}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-blue-800">
              {t('generate.form_hint', { defaultValue: 'Adjust your settings below and proceed to generate.' })}
            </p>
            {/* Minimal form placeholder: you can expand with character, language, length, etc. */}
            <div className="flex justify-end">
              <Button className="btn-premium">{t('generate.cta', { defaultValue: 'Generate' })}</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}