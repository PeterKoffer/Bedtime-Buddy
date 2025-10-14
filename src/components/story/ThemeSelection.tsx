import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StoryTheme } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';

interface ThemeSelectionProps {
  selectedTheme: StoryTheme | null;
  onThemeChange: (theme: StoryTheme) => void;
  onNext: () => void;
  onBack: () => void;
}

export function ThemeSelection({ selectedTheme, onThemeChange, onNext, onBack }: ThemeSelectionProps) {
  const { t } = useLanguage();

  // Available themes
  const themes: StoryTheme[] = [
    {
      id: 'fantasy',
      name: t('themes', 'fantasy_name'),
      description: t('themes', 'fantasy_description'),
      imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=fantasy-theme'
    },
    {
      id: 'space',
      name: t('themes', 'space_name'),
      description: t('themes', 'space_description'),
      imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=space-theme'
    },
    {
      id: 'ocean',
      name: t('themes', 'ocean_name'),
      description: t('themes', 'ocean_description'),
      imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=ocean-theme'
    },
    {
      id: 'jungle',
      name: t('themes', 'jungle_name'),
      description: t('themes', 'jungle_description'),
      imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=jungle-theme'
    },
    {
      id: 'castle',
      name: t('themes', 'castle_name'),
      description: t('themes', 'castle_description'),
      imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=castle-theme'
    },
    {
      id: 'pirates',
      name: t('themes', 'pirates_name'),
      description: t('themes', 'pirates_description'),
      imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=pirates-theme'
    },
    {
      id: 'dinosaurs',
      name: t('themes', 'dinosaurs_name'),
      description: t('themes', 'dinosaurs_description'),
      imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=dinosaurs-theme'
    },
    {
      id: 'superheroes',
      name: t('themes', 'superheroes_name'),
      description: t('themes', 'superheroes_description'),
      imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=superheroes-theme'
    }
  ];

  const handleNext = () => {
    if (selectedTheme) {
      onNext();
    }
  };

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-none text-white">
      <CardHeader>
        <CardTitle className="text-2xl text-center">
          {t('create_story', 'theme_title')}
        </CardTitle>
        <CardDescription className="text-center text-blue-100">
          {t('create_story', 'theme_description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {themes.map((theme) => (
            <div
              key={theme.id}
              className={`
                rounded-lg overflow-hidden cursor-pointer transition-all
                ${selectedTheme?.id === theme.id 
                  ? 'ring-4 ring-blue-400 shadow-lg shadow-blue-500/30 scale-105' 
                  : 'hover:scale-105 hover:shadow-md hover:shadow-blue-400/20'
                }
              `}
              onClick={() => onThemeChange(theme)}
            >
              <div className="aspect-[4/3] bg-indigo-900/70 flex items-center justify-center">
                <img 
                  src={theme.imageUrl} 
                  alt={theme.name}
                  className="h-16 w-16 object-contain" 
                />
              </div>
              <div className="p-3 bg-gradient-to-b from-indigo-800/80 to-purple-900/80">
                <h3 className="font-semibold text-md mb-1">{theme.name}</h3>
                <p className="text-xs text-blue-100">{theme.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="text-white border-blue-300/30 hover:bg-blue-600/30"
        >
          {t('common', 'back')}
        </Button>
        <Button 
          onClick={handleNext} 
          disabled={!selectedTheme}
          className={`btn-dreamy ${!selectedTheme ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {t('common', 'continue')}
        </Button>
      </CardFooter>
    </Card>
  );
}