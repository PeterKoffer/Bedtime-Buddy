import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { Character } from '@/types';
import { ArrowLeft } from 'lucide-react';
import { getSupabase, isSupabaseEnabled } from '@/lib/supabase';
import CharacterCreation from '@/components/character/CharacterCreation';
import { useTranslation } from 'react-i18next';

interface LocalCharacterRow {
  id: string;
  name: string;
  age: number;
  personality: string[];
  appearance: string | null;
  description: string | null;
  selected_gender: string | null;
  avatar_url: string | null;
  avatar_generated: boolean;
  created_at: string;
}

export default function CreateStory() {
  const { language } = useLanguage();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [character, setCharacter] = useState<Character | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const handleCharacterCreate = async (characterData: Omit<Character, 'id' | 'createdAt'>) => {
    // Insert into Supabase characters table
    const payload = {
      name: characterData.name,
      age: characterData.age,
      personality: characterData.personality || [],
      appearance: characterData.appearance || null,
      description: characterData.description || null,
      selected_gender: characterData.selectedGender || null,
      avatar_url: characterData.cartoonImage || null,
      avatar_generated: Boolean(characterData.avatarGenerated),
    };

    const sb = getSupabase();
    let data: { id: string; created_at: string } | null = null;
    let error: { message?: string } | null = null;
    if (sb) {
      ({ data, error } = await sb.from('characters').insert(payload).select().single());
    } else {
      // Local-only fallback
      const id = 'local-' + Date.now();
      const created_at = new Date().toISOString();
      const localRow = { id, ...payload, created_at };
      const key = 'bedtime-characters';
      const list = JSON.parse(localStorage.getItem(key) || '[]');
      list.unshift(localRow);
      localStorage.setItem(key, JSON.stringify(list));
      data = { id, created_at };
      error = null;
    }
    if (error || !data) {
      console.error('Failed to save character to Supabase', error);
      // Still show locally so user can proceed; mark unsaved
      const localCharacter: Character = {
        ...characterData,
        id: Date.now().toString(),
        createdAt: new Date(),
      };
      setCharacter(localCharacter);
      setIsSaved(false);
      return;
    }

    const saved: Character = {
      ...characterData,
      id: data.id as string,
      createdAt: new Date(data.created_at as string),
    };
    setCharacter(saved);
    setIsSaved(true);
  };

  const handleNext = () => {
    // Navigate to Generate Story after character creation
    navigate('/generate');
  };

  const handleSaveCurrentCharacter = async () => {
    if (!character) return;
    // If character has an id from Supabase, update; else insert
    if (character.id) {
      const updatePayload = {
        name: character.name,
        age: character.age,
        personality: character.personality || [],
        appearance: character.appearance || null,
        description: character.description || null,
        selected_gender: character.selectedGender || null,
        avatar_url: character.cartoonImage || null,
        avatar_generated: Boolean(character.avatarGenerated),
      };
      const sb = getSupabase();
      let error: { message?: string } | null = null;
      if (sb) {
        ({ error } = await sb.from('characters').update(updatePayload).eq('id', character.id));
      } else {
        const key = 'bedtime-characters';
        const list: LocalCharacterRow[] = JSON.parse(localStorage.getItem(key) || '[]');
        const idx = list.findIndex((c) => c.id === character.id);
        if (idx !== -1) {
          list[idx] = { ...list[idx], ...updatePayload };
          localStorage.setItem(key, JSON.stringify(list));
        }
        error = null;
      }
      if (error) {
        console.error('Failed to update character', error);
        setIsSaved(false);
        return;
      }
      setIsSaved(true);
    } else {
      const insertPayload = {
        name: character.name,
        age: character.age,
        personality: character.personality || [],
        appearance: character.appearance || null,
        description: character.description || null,
        selected_gender: character.selectedGender || null,
        avatar_url: character.cartoonImage || null,
        avatar_generated: Boolean(character.avatarGenerated),
      };
      const sb = getSupabase();
      let data: { id: string; created_at: string } | null = null;
      let error: { message?: string } | null = null;
      if (sb) {
        ({ data, error } = await sb.from('characters').insert(insertPayload).select().single());
      } else {
        const id = 'local-' + Date.now();
        const created_at = new Date().toISOString();
        const localRow: LocalCharacterRow = { id, ...insertPayload, created_at };
        const key = 'bedtime-characters';
        const list: LocalCharacterRow[] = JSON.parse(localStorage.getItem(key) || '[]');
        list.unshift(localRow);
        localStorage.setItem(key, JSON.stringify(list));
        data = { id, created_at };
        error = null;
      }
      if (error || !data) {
        console.error('Failed to insert character', error);
        setIsSaved(false);
        return;
      }
      setCharacter({ ...character, id: data.id as string, createdAt: new Date(data.created_at as string) } as Character);
      setIsSaved(true);
    }
  };

  // If no character created yet, show character creation
  if (!character) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        {/* Night Sky Background Effects */}
        <div className="stars"></div>
        <div className="twinkling"></div>
        <div className="floating-orbs"></div>
        
        {/* Back Button */}
        <div className="relative z-10 container mx-auto px-4 py-4">
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            className="btn-premium-outline"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('create.back_to_home')}
          </Button>
        </div>

        <CharacterCreation 
          onCharacterCreate={handleCharacterCreate}
          onNext={handleNext}
        />
      </div>
    );
  }

  // Character created successfully - show success message
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Night Sky Background Effects */}
      <div className="stars"></div>
      <div className="twinkling"></div>
      <div className="floating-orbs"></div>
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 rounded-full blur-xl opacity-30 animate-pulse w-20 h-20 mx-auto"></div>
            <div className="relative z-10">
              {character.cartoonImage ? (
                <img
                  src={character.cartoonImage}
                  alt={`${character.name}'s avatar`}
                  className="w-20 h-20 rounded-full border-4 border-yellow-400 mx-auto"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-purple-600 border-4 border-yellow-400 mx-auto flex items-center justify-center text-2xl">
                  ✨
                </div>
              )}
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-300 via-pink-300 to-yellow-300 bg-clip-text text-transparent mb-4">
            {t('create.created_title')}
          </h1>
          
          <p className="text-xl text-purple-200 mb-8">
            {t('create.created_subtitle', { name: character.name })}
          </p>

          <div className="bg-purple-900/30 rounded-lg p-6 border border-purple-500/30 mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">{t('create.summary.title')}</h3>
            <div className="space-y-2 text-purple-200">
              <p><span className="text-white font-medium">{t('create.summary.name')}</span> {character.name}</p>
              <p><span className="text-white font-medium">{t('create.summary.age')}</span> {t('create.summary.age_value', { age: character.age })}</p>
              <p><span className="text-white font-medium">{t('create.summary.personality')}</span> {character.personality.join(', ')}</p>
              <p><span className="text-white font-medium">{t('create.summary.photos')}</span> {character.photos.length}</p>
              {character.avatarGenerated && (
                <p><span className="text-white font-medium">{t('create.summary.avatar')}</span> ✅ {t('create.summary.avatar_generated')}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleSaveCurrentCharacter}
              variant="outline"
              className={`btn-premium-outline text-lg px-8 py-3 ${isSaved ? 'opacity-60 cursor-default' : ''}`}
              disabled={isSaved}
            >
              {isSaved ? t('create.saved') : t('create.save_character')}
            </Button>
            <Button
              onClick={() => navigate('/stories')}
              className="btn-premium text-lg px-8 py-3 magic-glow"
            >
              {t('create.view_stories')}
            </Button>
            <Button
              onClick={() => {
                setCharacter(null);
                // Clear the current character to create a new one
              }}
              variant="outline"
              className="btn-premium-outline text-lg px-8 py-3"
            >
              {t('create.create_another')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}