import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { X } from 'lucide-react';

interface KeywordSelectionProps {
  keywords: string[];
  onKeywordsChange: (keywords: string[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export function KeywordSelection({ keywords, onKeywordsChange, onNext, onBack }: KeywordSelectionProps) {
  const { t } = useLanguage();
  const [keywordInput, setKeywordInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Keyword suggestions
  const suggestions = [
    { key: 'funny', label: t('keywords', 'funny') },
    { key: 'magical', label: t('keywords', 'magical') },
    { key: 'animals', label: t('keywords', 'animals') },
    { key: 'friendship', label: t('keywords', 'friendship') },
    { key: 'adventure', label: t('keywords', 'adventure') },
    { key: 'nature', label: t('keywords', 'nature') },
    { key: 'family', label: t('keywords', 'family') },
    { key: 'mystery', label: t('keywords', 'mystery') },
    { key: 'brave', label: t('keywords', 'brave') },
    { key: 'learning', label: t('keywords', 'learning') },
    { key: 'treasure', label: t('keywords', 'treasure') },
    { key: 'journey', label: t('keywords', 'journey') },
  ];

  const addKeyword = (keyword: string) => {
    const trimmedKeyword = keyword.trim().toLowerCase();
    
    if (!trimmedKeyword) {
      return;
    }

    // Validate keyword length
    if (trimmedKeyword.length > 15) {
      setError(t('errors', 'keyword_too_long'));
      return;
    }

    // Check if already exists
    if (keywords.includes(trimmedKeyword)) {
      setError(t('errors', 'keyword_exists'));
      return;
    }

    // Check max keywords
    if (keywords.length >= 8) {
      setError(t('errors', 'too_many_keywords'));
      return;
    }

    // Add keyword
    onKeywordsChange([...keywords, trimmedKeyword]);
    setKeywordInput('');
    setError(null);
  };

  const removeKeyword = (keywordToRemove: string) => {
    onKeywordsChange(keywords.filter(kw => kw !== keywordToRemove));
    setError(null);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && keywordInput) {
      e.preventDefault();
      addKeyword(keywordInput);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    // Only add if not already in the keywords list
    if (!keywords.includes(suggestion.toLowerCase())) {
      addKeyword(suggestion);
    } else {
      setError(t('errors', 'keyword_exists'));
    }
  };

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-none text-white">
      <CardHeader>
        <CardTitle className="text-2xl text-center">
          {t('create_story', 'keywords_title')}
        </CardTitle>
        <CardDescription className="text-center text-blue-100">
          {t('create_story', 'keywords_description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Keyword input */}
        <div className="space-y-2">
          <label className="text-sm font-medium">{t('keywords', 'add_keyword')}</label>
          <div className="flex gap-2">
            <Input
              value={keywordInput}
              onChange={(e) => {
                setKeywordInput(e.target.value);
                setError(null);
              }}
              onKeyDown={handleInputKeyDown}
              placeholder={t('keywords', 'keyword_placeholder')}
              className="bg-white/20 border-pink-300/30 text-white placeholder:text-pink-200/70"
            />
            <Button 
              onClick={() => addKeyword(keywordInput)} 
              disabled={!keywordInput.trim()}
              variant="outline"
              className="border-pink-300/50 text-white hover:bg-pink-600/30"
            >
              {t('keywords', 'add')}
            </Button>
          </div>
          {error && <p className="text-red-300 text-sm">{error}</p>}
        </div>
        
        {/* Selected keywords */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">{t('keywords', 'selected_keywords')}</h3>
          {keywords.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {keywords.map((keyword, index) => (
                <Badge 
                  key={index}
                  variant="secondary"
                  className="bg-pink-600/30 hover:bg-pink-600/50 text-white border-none"
                >
                  {keyword}
                  <button
                    onClick={() => removeKeyword(keyword)}
                    className="ml-1 hover:text-red-300"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-pink-200/70">{t('keywords', 'no_keywords')}</p>
          )}
        </div>
        
        {/* Suggestions */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">{t('keywords', 'suggestions')}</h3>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <Badge 
                key={suggestion.key}
                variant="outline"
                className={`
                  cursor-pointer border-pink-300/30 text-pink-100
                  ${keywords.includes(suggestion.key.toLowerCase()) 
                    ? 'bg-pink-600/40' 
                    : 'bg-transparent hover:bg-pink-600/30'
                  }
                `}
                onClick={() => handleSuggestionClick(suggestion.key)}
              >
                {suggestion.label}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="text-white border-pink-300/30 hover:bg-pink-600/30"
        >
          {t('common', 'back')}
        </Button>
        <Button 
          onClick={onNext}
          className="btn-dreamy"
        >
          {t('common', 'continue')}
        </Button>
      </CardFooter>
    </Card>
  );
}