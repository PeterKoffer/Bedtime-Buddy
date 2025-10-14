import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { ChevronLeft, ChevronRight, Home, Share, BookMarked, Globe } from 'lucide-react';

interface StoryPage {
  page_number: number;
  text: string;
  image_url: string;
}

interface StoryData {
  id: string;
  title: string;
  user_id: string;
  pages: StoryPage[];
  published: boolean;
  created_at: string;
}

export default function StoryViewer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [story, setStory] = useState<StoryData | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchStory = async () => {
      try {
        const { data, error } = await supabase
          .from('stories')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) throw error;
        
        if (!data) {
          setError('Story not found');
          return;
        }
        
        // Check if user has access to this story
        if (!data.published && data.user_id !== user?.id) {
          setError('You do not have permission to view this story');
          return;
        }
        
        setStory(data);
      } catch (err: any) {
        console.error('Error fetching story:', err);
        setError(err.message);
        toast.error('Failed to load story');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchStory();
    }
  }, [id, user]);
  
  const handleNextPage = () => {
    if (story && currentPage < story.pages.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const togglePublish = async () => {
    if (!story || story.user_id !== user?.id) return;
    
    try {
      const { error } = await supabase
        .from('stories')
        .update({ published: !story.published })
        .eq('id', story.id);
        
      if (error) throw error;
      
      setStory({ ...story, published: !story.published });
      toast.success(`Story ${story.published ? 'unpublished' : 'published'} successfully`);
    } catch (err: any) {
      console.error('Error updating story:', err);
      toast.error(`Failed to ${story.published ? 'unpublish' : 'publish'} story`);
    }
  };
  
  const shareStory = () => {
    // In a real app, this would create a shareable link
    // For now, we'll just copy the URL to clipboard
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };
  
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error || !story) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <h2 className="text-2xl font-bold mb-4">Oops!</h2>
        <p className="text-gray-600 mb-6">{error || 'Something went wrong'}</p>
        <Button onClick={() => navigate('/')}>
          <Home className="mr-2 h-4 w-4" />
          Go Home
        </Button>
      </div>
    );
  }
  
  const currentPageData = story.pages[currentPage];
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">{story.title}</h1>
        
        <div className="flex gap-2">
          {story.user_id === user?.id && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={togglePublish}
            >
              {story.published ? (
                <>
                  <BookMarked className="mr-2 h-4 w-4" />
                  Unpublish
                </>
              ) : (
                <>
                  <Globe className="mr-2 h-4 w-4" />
                  Publish
                </>
              )}
            </Button>
          )}
          
          <Button 
            variant="outline"
            size="sm"
            onClick={shareStory}
          >
            <Share className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>
      </div>
      
      <Card className="mb-6 overflow-hidden bg-gradient-to-br from-amber-50 to-stone-100 border-amber-200">
        <div className="relative">
          <div className="aspect-[4/3] flex items-center justify-center bg-gray-200">
            <img 
              src={currentPageData.image_url}
              alt={`Page ${currentPageData.page_number}`}
              className="w-full h-full object-contain"
            />
          </div>
          
          <CardContent className="p-8">
            <p className="text-xl leading-relaxed font-serif">{currentPageData.text}</p>
          </CardContent>
          
          <div className="absolute bottom-4 right-4 text-gray-400 text-sm">
            Page {currentPageData.page_number} of {story.pages.length}
          </div>
        </div>
      </Card>
      
      <div className="flex justify-between mb-6">
        <Button
          variant={currentPage > 0 ? "default" : "outline"}
          onClick={handlePrevPage}
          disabled={currentPage === 0}
        >
          <ChevronLeft className="mr-2 h-5 w-5" />
          Previous Page
        </Button>
        
        <Button
          variant={currentPage < story.pages.length - 1 ? "default" : "outline"}
          onClick={handleNextPage}
          disabled={currentPage === story.pages.length - 1}
        >
          Next Page
          <ChevronRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}