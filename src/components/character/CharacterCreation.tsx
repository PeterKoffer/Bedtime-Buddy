/*
Root cause: Completing a character could appear to freeze if remote save (Supabase) was slow/misconfigured, with no timeout or guaranteed navigation.
Fix: Add a robust async save flow with a 15s safety timeout and toast-based local fallback. Always proceed to the Generate Story screen on success or fallback.
*/
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import PhotoUpload from './PhotoUpload';
import AvatarGenerator from './AvatarGenerator';
import { Character } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import type { GenderOption } from '@/types';
import type { PostgrestError } from '@supabase/supabase-js';
import { User, Sparkles, Wand2, ArrowRight, Camera } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface CharacterCreationProps {
  onCharacterCreate: (character: Omit<Character, 'id' | 'createdAt'>) => void;
  onNext: () => void;
}

// Expanded default traits
const defaultTraits = [
  'Adventurous','Brave','Curious','Funny','Kind','Creative','Smart','Playful','Caring','Energetic','Gentle','Imaginative',
  'Confident','Helpful','Honest','Patient','Polite','Friendly','Cheerful','Thoughtful','Artistic','Athletic','Musical',
  'Loving','Determined','Calm','Optimistic','Inventive','Leader','Explorer'
];

export default function CharacterCreation({ onCharacterCreate, onNext }: CharacterCreationProps) {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState<'photos' | 'avatar' | 'details'>('photos');
  const [name, setName] = useState('');
  const [age, setAge] = useState([5]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [selectedTraits, setSelectedTraits] = useState<string[]>([]);
  const [traitsList, setTraitsList] = useState<string[]>(defaultTraits);
  const [customTrait, setCustomTrait] = useState('');
  const [appearance, setAppearance] = useState('');
  const [generatedAvatar, setGeneratedAvatar] = useState<string | null>(null);
  const [selectedGender, setSelectedGender] = useState<GenderOption>('unspecified');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const toTitleCase = (s: string) =>
    s
      .toLowerCase()
      .split(' ')
      .filter(Boolean)
      .map((w) => w[0].toUpperCase() + w.slice(1))
      .join(' ');

  const toggleTrait = (trait: string) => {
    setSelectedTraits((prev) =>
      prev.includes(trait) ? prev.filter((t) => t !== trait) : [...prev, trait]
    );
  };

  const addCustomTrait = () => {
    const raw = customTrait.trim();
    if (!raw) return;
    if (raw.length > 24) return;
    const tt = toTitleCase(raw);
    if (!traitsList.includes(tt)) {
      setTraitsList((prev) => [...prev, tt]);
    }
    setSelectedTraits((prev) => (prev.includes(tt) ? prev : [...prev, tt]));
    setCustomTrait('');
  };

  const handleSubmit = async () => {
    if (!name.trim() || photos.length === 0) {
      return;
    }

    const character: Omit<Character, 'id' | 'createdAt'> = {
      name: name.trim(),
      age: age[0],
      photos,
      personality: selectedTraits,
      appearance: appearance.trim() || t('create.appearance_fallback', { age: age[0] }),
      description: t('create.description_fallback', { name, age: age[0], traits: selectedTraits.join(', ') }),
      cartoonImage: generatedAvatar || undefined,
      avatarGenerated: !!generatedAvatar,
      selectedGender,
    };

    setIsSaving(true);
    let completed = false;

    const saveLocal = () => {
      const id = 'local-' + Date.now();
      const created_at = new Date().toISOString();
      const row = {
        id,
        name: character.name,
        age: character.age,
        personality: character.personality || [],
        appearance: character.appearance || null,
        description: character.description || null,
        selected_gender: character.selectedGender || null,
        avatar_url: character.cartoonImage || null,
        avatar_generated: Boolean(character.avatarGenerated),
        created_at,
      };
      const key = 'bedtime-characters';
      const list: typeof row[] = JSON.parse(localStorage.getItem(key) || '[]');
      list.unshift(row);
      localStorage.setItem(key, JSON.stringify(list));
    };

    const safety = setTimeout(() => {
      if (!completed) {
        saveLocal();
        toast({ title: t('create.toast.saved_locally'), description: t('create.toast.slow_network') });
        setIsSaving(false);
        completed = true;
        onNext();
      }
    }, 15000);

    try {
      if (!isSupabaseConfigured()) {
        saveLocal();
        toast({ title: t('create.toast.saved_locally'), description: t('create.toast.cloud_not_configured') });
        completed = true;
        clearTimeout(safety);
        onNext();
        return;
      }
      const sb = getSupabase();
      if (!sb) {
        saveLocal();
        toast({ title: t('create.toast.saved_locally'), description: t('create.toast.cloud_unavailable') });
        completed = true;
        clearTimeout(safety);
        onNext();
        return;
      }
      const payload = {
        name: character.name,
        age: character.age,
        personality: character.personality || [],
        appearance: character.appearance || null,
        description: character.description || null,
        selected_gender: character.selectedGender || null,
        avatar_url: character.cartoonImage || null,
        avatar_generated: Boolean(character.avatarGenerated),
      };
      const { data, error } = await sb.from('characters').insert(payload).select().single();
      if (error || !data) {
        const e = (error as PostgrestError | null);
        if (e) {
          console.error('[CharacterCreation] Supabase insert failed', {
            code: e.code,
            message: e.message,
            details: e.details,
            hint: e.hint,
          });
        } else {
          console.error('[CharacterCreation] Supabase insert failed: unknown error');
        }
        saveLocal();
        toast({ title: t('create.toast.saved_locally'), description: t('create.toast.cloud_save_failed') });
      } else {
        toast({ title: t('create.toast.character_saved'), description: t('create.toast.saved_to_cloud') });
      }
      completed = true;
      clearTimeout(safety);
      onNext();
    } catch (_e) {
      saveLocal();
      toast({ title: t('create.toast.saved_locally'), description: t('create.toast.network_error') });
      completed = true;
      clearTimeout(safety);
      onNext();
    } finally {
      setIsSaving(false);
    }
  };

  const handleNextStep = () => {
    if (currentStep === 'photos' && photos.length > 0 && name.trim()) {
      setCurrentStep('avatar');
    } else if (currentStep === 'avatar') {
      setCurrentStep('details');
    }
  };

  const handleBackStep = () => {
    if (currentStep === 'details') {
      setCurrentStep('avatar');
    } else if (currentStep === 'avatar') {
      setCurrentStep('photos');
    }
  };

  const handleAvatarGenerated = (avatarUrl: string) => {
    setGeneratedAvatar(avatarUrl);
  };

  const isValid = name.trim().length > 0 && photos.length >= 1;

  const getStepIcon = () => {
    switch (currentStep) {
      case 'photos': return <Camera className="h-16 w-16 text-blue-300 mx-auto relative z-10" />;
      case 'avatar': return <Wand2 className="h-16 w-16 text-yellow-300 mx-auto relative z-10" />;
      case 'details': return <User className="h-16 w-16 text-blue-300 mx-auto relative z-10" />;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'photos': return t('create.step.photos');
      case 'avatar': return t('create.step.avatar');
      case 'details': return t('create.step.details');
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 'photos': return t('create.stepdesc.photos');
      case 'avatar': return t('create.stepdesc.avatar');
      case 'details': return t('create.stepdesc.details');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900 relative overflow-hidden">
      {/* Night Sky Background Effects */}
      <div className="stars"></div>
      <div className="twinkling"></div>
      <div className="floating-orbs"></div>
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-sky-400 to-yellow-400 rounded-full blur-xl opacity-30 animate-pulse w-20 h-20 mx-auto"></div>
              {getStepIcon()}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-300 via-sky-300 to-yellow-300 bg-clip-text text-transparent mb-4">
              {getStepTitle()}
            </h1>
            <p className="text-xl text-blue-200 max-w-2xl mx-auto">
              {getStepDescription()}
            </p>
            
            {/* Step Progress */}
            <div className="flex justify-center mt-6 space-x-2">
              {['photos', 'avatar', 'details'].map((step, index) => (
                <div
                  key={step}
                  className={`w-3 h-3 rounded-full transition-all ${
                    currentStep === step 
                      ? 'bg-yellow-400 scale-125' 
                      : index < ['photos', 'avatar', 'details'].indexOf(currentStep)
                        ? 'bg-blue-400'
                        : 'bg-blue-800'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Step Content */}
          {currentStep === 'photos' && (
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Photo Upload */}
              <div>
                <PhotoUpload
                  photos={photos}
                  onPhotosChange={setPhotos}
                  maxPhotos={4}
                />
              </div>

              {/* Basic Character Info */}
              <div className="space-y-6">
                <Card className="premium-card">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Sparkles className="h-5 w-5 mr-2 text-blue-300" />
                      {t('create.basic_info')}
                    </CardTitle>
                    <CardDescription className="text-blue-200">
                      {t('create.basic_info_desc')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-blue-200 font-medium">
                        {t('create.name_label')}
                      </Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={t('create.name_placeholder')}
                        className="form-input"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label className="text-blue-200 font-medium">
                        {t('create.age_label', { age: age[0] })}
                      </Label>
                      <Slider
                        value={age}
                        onValueChange={setAge}
                        max={12}
                        min={2}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-blue-300">
                        <span>{t('create.age_min')}</span>
                        <span>{t('create.age_max')}</span>
                      </div>
                    </div>

                    {/* Gender (optional) */}
                    <div className="space-y-2">
                      <Label className="text-blue-200 font-medium">{t('character.gender.label')}</Label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          { key: 'girl', label: t('character.gender.girl') },
                          { key: 'boy', label: t('character.gender.boy') },
                          { key: 'non-binary', label: t('character.gender.nonBinary') },
                          { key: 'unspecified', label: t('character.gender.unspecified') },
                        ].map((opt) => {
                          const selected = selectedGender === (opt.key as GenderOption);
                          return (
                            <Button
                              key={opt.key}
                              type="button"
                              variant={selected ? 'default' : 'outline'}
                              className={
                                selected
                                  ? 'btn-premium text-white'
                                  : (opt.key === 'unspecified'
                                      ? 'btn-contrast text-white border-blue-300/70 hover:border-blue-400 focus:ring-2 focus:ring-blue-400'
                                      : 'btn-premium-outline text-blue-100 border-blue-300 hover:bg-blue-800/40')
                              }
                              onClick={() => setSelectedGender(opt.key as GenderOption)}
                            >
                              {opt.label}
                            </Button>
                          );
                        })}
                      </div>
                      <p className="text-xs text-blue-300">{t('character.gender.helper')}</p>
                    </div>
                  </CardContent>
                </Card>

                <Button
                  onClick={handleNextStep}
                  disabled={!name.trim() || photos.length === 0}
                  className="w-full btn-premium text-lg py-4 h-auto magic-glow"
                >
                  <Wand2 className="mr-3 h-5 w-5" />
                  {t('create.next_generate_avatar')}
                  <ArrowRight className="ml-3 h-5 w-5" />
                </Button>

                {(!name.trim() || photos.length === 0) && (
                  <p className="text-center text-blue-300 text-sm">
                    {!name.trim() && t('create.validation.name_required')}{' '}
                    {photos.length === 0 && t('create.validation.photo_required')}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Avatar Generation Step */}
          {currentStep === 'avatar' && (
            <div className="max-w-2xl mx-auto">
              <AvatarGenerator
                photos={photos}
                characterName={name}
                characterAge={age[0]}
                selectedGender={selectedGender}
                onAvatarGenerated={handleAvatarGenerated}
              />
              
              <div className="flex gap-4 mt-8">
                <Button
                  onClick={handleBackStep}
                  variant="outline"
                  className="btn-premium-outline flex-1"
                >
                  {t('create.back_to_photos')}
                </Button>
                <Button
                  onClick={handleNextStep}
                  className="btn-premium flex-1"
                >
                  {t('create.continue_to_details')}
                </Button>
              </div>
            </div>
          )}

          {/* Character Details Step */}
          {currentStep === 'details' && (
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Show Generated Avatar */}
              {generatedAvatar && (
                <Card className="premium-card">
                  <CardContent className="p-6 text-center">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      {t('create.avatar_heading', { name })}
                    </h3>
                    <img
                      src={generatedAvatar}
                      alt={`${name}'s avatar`}
                      className="w-24 h-24 rounded-full border-4 border-yellow-400 mx-auto mb-4"
                    />
                  </CardContent>
                </Card>
              )}

              {/* Appearance Description */}
              <Card className="premium-card">
                <CardHeader>
                  <CardTitle className="text-white">
                    {t('create.appearance_title')}
                  </CardTitle>
                  <CardDescription className="text-blue-200">
                    {t('create.appearance_desc')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Input
                    value={appearance}
                    onChange={(e) => setAppearance(e.target.value)}
                    placeholder={t('create.appearance_placeholder')}
                    className="form-input"
                  />
                </CardContent>
              </Card>

              {/* Personality Traits */}
              <Card className="premium-card">
                <CardHeader>
                  <CardTitle className="text-white">
                    {t('create.traits_title')}
                  </CardTitle>
                  <CardDescription className="text-blue-200">
                    {t('create.traits_desc')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {traitsList.map((trait) => (
                      <Badge
                        key={trait}
                        variant={selectedTraits.includes(trait) ? 'default' : 'outline'}
                        className={`cursor-pointer transition-all ${
                          selectedTraits.includes(trait)
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'border-blue-500/50 text-blue-200 hover:bg-blue-800/30'
                        }`}
                        onClick={() => toggleTrait(trait)}
                      >
                        {trait}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={customTrait}
                      onChange={(e) => setCustomTrait(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addCustomTrait();
                        }
                      }}
                      placeholder={t('create.traits_add_placeholder')}
                      className="form-input flex-1"
                    />
                    <Button type="button" variant="outline" className="btn-premium-outline" onClick={addCustomTrait}>
                      {t('common.add')}
                    </Button>
                  </div>
                  {selectedTraits.length > 0 && (
                    <p className="text-sm text-blue-300 mt-3">
                      {t('create.traits_selected', { list: selectedTraits.join(', ') })}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button
                  onClick={handleBackStep}
                  variant="outline"
                  className="btn-premium-outline flex-1"
                >
                  {t('create.back_to_avatar')}
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="btn-premium flex-1 magic-glow"
                  disabled={!isValid || isSaving}
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  {isSaving ? t('common.saving') : t('create.complete_character')}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}