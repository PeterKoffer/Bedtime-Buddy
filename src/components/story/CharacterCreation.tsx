import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useLanguage } from '@/contexts/LanguageContext';
import { Character } from '@/types';
import { Camera, ImagePlus, Loader2, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

interface CharacterCreationProps {
  character: Character | null;
  onCharacterChange: (character: Character) => void;
  onNext: () => void;
}

export function CharacterCreation({ character, onCharacterChange, onNext }: CharacterCreationProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onCharacterChange({
      ...character || { id: `char-${Date.now()}`, name: '', avatarUrl: '' },
      name: e.target.value
    });
  };

  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onCharacterChange({
      ...character || { id: `char-${Date.now()}`, name: '', avatarUrl: '' },
      age: e.target.value
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

    const file = e.target.files[0];
    
    try {
      setIsUploading(true);
      
      // Upload to Supabase Storage (in our case, just create object URL)
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `avatars/${fileName}`;
      
      const { data, error } = await supabase.storage
        .from('characters')
        .upload(filePath, file);
        
      if (error) throw error;
      
      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('characters')
        .getPublicUrl(filePath);
        
      onCharacterChange({
        ...character || { id: `char-${Date.now()}`, name: '', avatarUrl: '' },
        avatarUrl: publicUrl
      });
      
      toast({
        description: t('character', 'image_uploaded')
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Error",
        description: t('errors', 'upload_failed'),
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const generateRandomAvatar = async () => {
    try {
      setIsGenerating(true);
      
      // In a real implementation, this would call an API like DALL-E
      // For this mock, we'll just use a placeholder image
      const seed = Math.random().toString(36).substring(2, 7);
      const style = Math.floor(Math.random() * 10);
      const avatarUrl = `https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}&style=${style}`;
      
      onCharacterChange({
        ...character || { id: `char-${Date.now()}`, name: '', avatarUrl: '' },
        avatarUrl
      });
      
      toast({
        description: t('character', 'avatar_generated')
      });
    } catch (error) {
      console.error('Error generating avatar:', error);
      toast({
        title: "Error",
        description: t('errors', 'generation_failed'),
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const handleNext = () => {
    if (character?.name) {
      onNext();
    }
  };

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-none text-white">
      <CardHeader>
        <CardTitle className="text-2xl text-center">
          {t('create_story', 'character_title')}
        </CardTitle>
        <CardDescription className="text-center text-blue-100">
          {t('create_story', 'character_description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="h-32 w-32">
              {character?.avatarUrl ? (
                <AvatarImage src={character.avatarUrl} alt={character.name} />
              ) : (
                <AvatarFallback className="text-3xl bg-gradient-to-br from-blue-600 to-purple-600">
                  {getInitials(character?.name || '')}
                </AvatarFallback>
              )}
            </Avatar>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="border-blue-300/30 text-white hover:bg-blue-600/30 flex items-center gap-2"
              >
                {isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ImagePlus className="h-4 w-4" />
                )}
                {t('character', 'upload')}
              </Button>
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              
              <Button
                variant="outline"
                onClick={generateRandomAvatar}
                disabled={isGenerating}
                className="border-blue-300/30 text-white hover:bg-blue-600/30 flex items-center gap-2"
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                {t('character', 'generate')}
              </Button>
            </div>
          </div>
          
          {/* Character Info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t('character', 'name')} *</Label>
              <Input
                id="name"
                value={character?.name || ''}
                onChange={handleNameChange}
                placeholder={t('character', 'name_placeholder')}
                className="bg-white/20 border-blue-300/30 text-white placeholder:text-blue-200/70"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="age">{t('character', 'age')} <span className="text-blue-300/70">({t('character', 'optional')})</span></Label>
              <Input
                id="age"
                value={character?.age || ''}
                onChange={handleAgeChange}
                placeholder={t('character', 'age_placeholder')}
                className="bg-white/20 border-blue-300/30 text-white placeholder:text-blue-200/70"
              />
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleNext} 
          disabled={!character?.name}
          className={`w-full btn-dreamy ${!character?.name ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {t('common', 'continue')}
        </Button>
      </CardFooter>
    </Card>
  );
}