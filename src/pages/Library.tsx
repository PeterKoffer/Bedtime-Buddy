import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Story } from '@/types';
import { BookOpen, Plus } from 'lucide-react';

export default function Library() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user's stories from localStorage
    const loadStories = () => {
      try {
        const storedStories = localStorage.getItem(`bedtime_buddy_stories_${user?.id}`);
        if (storedStories) {
          const userStories = JSON.parse(storedStories);
          setStories(userStories);
        }
      } catch (error) {
        console.error('Error loading stories:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadStories();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-white border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            {t('story', 'your_stories')}
          </h1>
          <p className="text-blue-200 text-lg mb-6">
            Your collection of magical bedtime stories
          </p>
          
          <Button asChild className="btn-dreamy">
            <Link to="/create">
              <Plus className="h-4 w-4 mr-2" />
              {t('story', 'create_new')}
            </Link>
          </Button>
        </div>

        {stories.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="h-24 w-24 text-white/50 mx-auto mb-6" />
            <h2 className="text-2xl font-semibold text-white mb-4">
              {t('story', 'no_stories')}
            </h2>
            <p className="text-blue-200 mb-8">
              Start creating your first magical story!
            </p>
            <Button asChild className="btn-dreamy">
              <Link to="/create">
                <Plus className="h-4 w-4 mr-2" />
                {t('story', 'create_new')}
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {stories.map((story) => (
              <Card key={story.id} className="bg-white/10 backdrop-blur-sm border-none text-white hover:bg-white/20 transition-colors cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    {story.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-blue-200">
                      Character: {story.character.name}
                    </p>
                    <p className="text-sm text-blue-200">
                      Theme: {story.theme}
                    </p>
                    <p className="text-sm text-blue-200">
                      Created: {new Date(story.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-300 line-clamp-3">
                      {story.content.substring(0, 100)}...
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}