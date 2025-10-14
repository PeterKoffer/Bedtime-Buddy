import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StoryStyle } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';

interface StyleSelectionProps {
  selectedStyle: StoryStyle | null;
  onStyleChange: (style: StoryStyle) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StyleSelection({ selectedStyle, onStyleChange, onNext, onBack }: StyleSelectionProps) {
  const { t } = useLanguage();

  // Available styles
  const styles: StoryStyle[] = [
    {
      id: 'adventure',
      name: t('styles', 'adventure_name'),
      description: t('styles', 'adventure_description'),
      imageUrl: 'https://api.dicebear.com/7.x/icons/svg?seed=adventure'
    },
    {
      id: 'funny',
      name: t('styles', 'funny_name'),
      description: t('styles', 'funny_description'),
      imageUrl: 'https://api.dicebear.com/7.x/icons/svg?seed=funny'
    },
    {
      id: 'educational',
      name: t('styles', 'educational_name'),
      description: t('styles', 'educational_description'),
      imageUrl: 'https://api.dicebear.com/7.x/icons/svg?seed=educational'
    },
    {
      id: 'scary',
      name: t('styles', 'scary_name'),
      description: t('styles', 'scary_description'),
      imageUrl: 'https://api.dicebear.com/7.x/icons/svg?seed=scary'
    },
    {
      id: 'magical',
      name: t('styles', 'magical_name'),
      description: t('styles', 'magical_description'),
      imageUrl: 'https://api.dicebear.com/7.x/icons/svg?seed=magical'
    },
    {
      id: 'mystery',
      name: t('styles', 'mystery_name'),
      description: t('styles', 'mystery_description'),
      imageUrl: 'https://api.dicebear.com/7.x/icons/svg?seed=mystery'
    }
  ];

  const handleNext = () => {
    if (selectedStyle) {
      onNext();
    }
  };

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-none text-white">
      <CardHeader>
        <CardTitle className="text-2xl text-center">
          {t('create_story', 'style_title')}
        </CardTitle>
        <CardDescription className="text-center text-blue-100">
          {t('create_story', 'style_description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {styles.map((style) => (
            <div
              key={style.id}
              className={`
                rounded-lg overflow-hidden cursor-pointer transition-all
                ${selectedStyle?.id === style.id 
                  ? 'ring-4 ring-purple-400 shadow-lg shadow-purple-500/30 scale-105' 
                  : 'hover:scale-105 hover:shadow-md hover:shadow-purple-400/20'
                }
              `}
              onClick={() => onStyleChange(style)}
            >
              <div className="aspect-[4/3] bg-purple-900/70 flex items-center justify-center">
                <img 
                  src={style.imageUrl} 
                  alt={style.name}
                  className="h-16 w-16 object-contain"
                />
              </div>
              <div className="p-3 bg-gradient-to-b from-purple-800/80 to-pink-900/80">
                <h3 className="font-semibold text-md mb-1">{style.name}</h3>
                <p className="text-xs text-blue-100">{style.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="text-white border-purple-300/30 hover:bg-purple-600/30"
        >
          {t('common', 'back')}
        </Button>
        <Button 
          onClick={handleNext} 
          disabled={!selectedStyle}
          className={`btn-dreamy ${!selectedStyle ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {t('common', 'continue')}
        </Button>
      </CardFooter>
    </Card>
  );
}