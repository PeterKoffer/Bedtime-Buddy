import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Character, StoryImage } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { generateImage } from '@/lib/openai';
import { Loader2, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface StoryImageGeneratorProps {
  storyContent: string;
  character: Character;
  onImagesGenerated: (images: StoryImage[]) => void;
  onGenerationComplete: () => void;
}

export function StoryImageGenerator({ 
  storyContent, 
  character, 
  onImagesGenerated,
  onGenerationComplete 
}: StoryImageGeneratorProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  
  // Split story into sections for image generation (usually 4-5 images)
  const [storyPrompts, setStoryPrompts] = useState<string[]>([]);
  const [generatedImages, setGeneratedImages] = useState<StoryImage[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    // Divide the story into sections for image generation
    const paragraphs = storyContent.split('\n\n').filter(p => p.trim());
    
    // Create prompts for about 4 images
    const promptCount = Math.min(4, Math.max(3, Math.ceil(paragraphs.length / 2)));
    const newPrompts: string[] = [];
    
    // Beginning prompt - introduce character
    const intro = paragraphs.slice(0, 1).join(' ');
    newPrompts.push(`A scene showing ${character.name} from a children's story. ${intro}`);
    
    // Middle prompts - key scenes
    const middleStart = 1;
    const middleEnd = paragraphs.length - 1;
    const middleStep = Math.floor((middleEnd - middleStart) / (promptCount - 2));
    
    for (let i = 0; i < promptCount - 2; i++) {
      const sectionStart = middleStart + i * middleStep;
      const sectionEnd = Math.min(middleEnd, sectionStart + middleStep);
      const section = paragraphs.slice(sectionStart, sectionEnd).join(' ');
      newPrompts.push(`A scene from a children's story showing: ${section.substring(0, 200)}`);
    }
    
    // Ending prompt - conclusion
    const ending = paragraphs.slice(-1).join(' ');
    newPrompts.push(`The final scene of a children's story showing: ${ending.substring(0, 200)}`);
    
    setStoryPrompts(newPrompts);
  }, [storyContent, character]);

  // Start generating images when prompts are ready
  useEffect(() => {
    if (storyPrompts.length > 0 && generatedImages.length === 0) {
      generateNextImage();
    }
  }, [storyPrompts]);

  const generateNextImage = async () => {
    if (currentImageIndex >= storyPrompts.length) {
      setIsComplete(true);
      onImagesGenerated(generatedImages);
      return;
    }
    
    setIsGenerating(true);
    
    try {
      const prompt = storyPrompts[currentImageIndex];
      const imageUrl = await generateImage(prompt);
      
      const newImage: StoryImage = {
        id: `img-${Date.now()}-${currentImageIndex}`,
        prompt,
        imageUrl,
        pageNumber: currentImageIndex + 1
      };
      
      const updatedImages = [...generatedImages, newImage];
      setGeneratedImages(updatedImages);
      onImagesGenerated(updatedImages);
      
      // Move to next image
      setCurrentImageIndex(currentImageIndex + 1);
      
      // Check if we're done
      if (currentImageIndex + 1 >= storyPrompts.length) {
        setIsComplete(true);
      }
    } catch (error) {
      console.error('Error generating image:', error);
      toast({
        title: "Error",
        description: t('errors', 'image_generation_failed'),
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const regenerateImage = async (index: number) => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    
    try {
      const prompt = storyPrompts[index];
      const imageUrl = await generateImage(prompt);
      
      const updatedImages = generatedImages.map((img, i) => {
        if (i === index) {
          return { ...img, imageUrl };
        }
        return img;
      });
      
      setGeneratedImages(updatedImages);
      onImagesGenerated(updatedImages);
      
      toast({
        title: "Image regenerated",
        description: "The image has been successfully regenerated"
      });
    } catch (error) {
      console.error('Error regenerating image:', error);
      toast({
        title: "Error",
        description: t('errors', 'image_regeneration_failed'),
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleContinue = () => {
    onGenerationComplete();
  };

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-none text-white">
      <CardHeader>
        <CardTitle className="text-2xl text-center">
          {t('create_story', 'images_title')}
        </CardTitle>
        <CardDescription className="text-center text-blue-100">
          {t('create_story', 'images_description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {storyPrompts.map((prompt, index) => {
            const image = generatedImages[index];
            const isCurrentlyGenerating = isGenerating && index === currentImageIndex;
            const isWaiting = index > currentImageIndex;
            
            return (
              <div 
                key={index} 
                className="rounded-lg overflow-hidden bg-indigo-900/50 flex flex-col"
              >
                <div className="aspect-square relative flex items-center justify-center">
                  {image ? (
                    <>
                      <img 
                        src={image.imageUrl} 
                        alt={`Story illustration ${index + 1}`} 
                        className="w-full h-full object-cover"
                      />
                      <button 
                        className="absolute bottom-2 right-2 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full"
                        onClick={() => regenerateImage(index)}
                        disabled={isGenerating}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </button>
                    </>
                  ) : isCurrentlyGenerating ? (
                    <div className="flex flex-col items-center justify-center h-full">
                      <Loader2 className="h-12 w-12 animate-spin text-blue-400 mb-4" />
                      <p className="text-blue-200">{t('images', 'generating_image')}</p>
                    </div>
                  ) : isWaiting ? (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-blue-200/70">{t('images', 'waiting')}</p>
                    </div>
                  ) : null}
                </div>
                <div className="p-3 bg-indigo-950/50">
                  <p className="text-xs text-blue-200/80 line-clamp-2">
                    {prompt.length > 100 ? `${prompt.substring(0, 100)}...` : prompt}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
      <CardFooter className="flex justify-center">
        {isComplete ? (
          <Button onClick={handleContinue} className="btn-dreamy">
            {t('images', 'continue_to_story')}
          </Button>
        ) : (
          <Button 
            onClick={generateNextImage} 
            disabled={isGenerating} 
            className="flex items-center gap-2 btn-dreamy"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t('common', 'loading')}
              </>
            ) : (
              <>
                Continue Generating
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}