import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Character, Story, StoryImage } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { ChevronLeft, ChevronRight, Save, Download, Share2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

interface StoryRendererProps {
  story: Story;
  character: Character;
  images: StoryImage[];
  onSaveStory: () => Promise<boolean>;
}

export function StoryRenderer({ story, character, images, onSaveStory }: StoryRendererProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [currentPage, setCurrentPage] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  // Split story content into pages (paragraphs)
  const pages = story.content.split('\n\n').filter(p => p.trim());
  
  // Get image for current page or nearby page
  const getCurrentPageImage = () => {
    // Try to find an image for this exact page
    const exactMatch = images.find(img => img.pageNumber === currentPage + 1);
    if (exactMatch) return exactMatch.imageUrl;
    
    // Otherwise find the closest image
    const closestImage = images.reduce((closest, img) => {
      const currentDistance = Math.abs(img.pageNumber - (currentPage + 1));
      const closestDistance = Math.abs(closest.pageNumber - (currentPage + 1));
      return currentDistance < closestDistance ? img : closest;
    }, images[0]);
    
    return closestImage?.imageUrl;
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextPage = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const success = await onSaveStory();
      
      if (success) {
        toast({
          title: t('story', 'save_to_library'),
          description: "Your story has been saved to your library"
        });
      }
    } catch (error) {
      console.error('Error saving story:', error);
      toast({
        title: "Error",
        description: t('errors', 'save_failed'),
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownload = () => {
    // In a real implementation, this would generate a PDF
    toast({
      description: "PDF download feature will be available soon"
    });
  };

  const handleShare = () => {
    // In a real implementation, this would open sharing options
    toast({
      description: "Sharing feature will be available soon"
    });
  };

  const handleCreateNew = () => {
    navigate('/create');
  };

  return (
    <div className="flex flex-col items-center">
      {/* Story header */}
      <div className="w-full max-w-2xl mb-8">
        <Card className="bg-white/10 backdrop-blur-sm border-none text-white p-6">
          <h1 className="text-3xl font-bold text-center mb-3">{story.title}</h1>
          <p className="text-center text-blue-200">
            {t('story', 'by')} {character.name}{character.age ? `, ${character.age}` : ''}
          </p>
        </Card>
      </div>
      
      {/* Story content */}
      <div className="w-full max-w-2xl mb-8">
        <Card className="bg-white/10 backdrop-blur-sm border-none text-white overflow-hidden">
          {/* Image */}
          <div className="aspect-[4/3] bg-indigo-900/70 overflow-hidden">
            <img 
              src={getCurrentPageImage()}
              alt="Story illustration"
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Text */}
          <div className="p-6">
            <div className="prose prose-lg prose-invert max-w-none">
              <p>{pages[currentPage]}</p>
            </div>
          </div>
          
          {/* Navigation */}
          <div className="px-6 pb-6 flex items-center justify-between">
            <Button 
              variant="outline"
              onClick={handlePrevPage}
              disabled={currentPage === 0}
              className="flex items-center gap-1 border-blue-300/30 text-white hover:bg-blue-600/30 disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
              {t('common', 'back')}
            </Button>
            
            <div className="text-sm text-blue-200">
              {t('story', 'page')} {currentPage + 1} {t('story', 'of')} {pages.length}
            </div>
            
            <Button 
              variant="outline"
              onClick={handleNextPage}
              disabled={currentPage === pages.length - 1}
              className="flex items-center gap-1 border-blue-300/30 text-white hover:bg-blue-600/30 disabled:opacity-50"
            >
              {t('common', 'continue')}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      </div>
      
      {/* Actions */}
      <div className="w-full max-w-2xl flex flex-wrap gap-4 justify-center">
        <Button 
          onClick={handleSave}
          disabled={isSaving}
          className="btn-dreamy flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {t('story', 'save_to_library')}
        </Button>
        
        <Button 
          variant="outline"
          onClick={handleCreateNew}
          className="border-blue-300/30 text-white hover:bg-blue-600/30 flex items-center gap-2"
        >
          {t('story', 'create_new')}
        </Button>
        
        <Button 
          variant="outline"
          onClick={handleDownload}
          className="border-blue-300/30 text-white hover:bg-blue-600/30 flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          {t('story', 'download')}
        </Button>
        
        <Button 
          variant="outline"
          onClick={handleShare}
          className="border-blue-300/30 text-white hover:bg-blue-600/30 flex items-center gap-2"
        >
          <Share2 className="h-4 w-4" />
          {t('story', 'share')}
        </Button>
      </div>
    </div>
  );
}