import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { BookOpen, Sparkles, Users, Globe, Moon, Stars, Wand2, Heart, Crown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Index() {
  const { user } = useAuth();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Night Sky Background Effects */}
      <div className="stars"></div>
      <div className="twinkling"></div>
      <div className="shooting-star"></div>
      <div className="floating-orbs"></div>
      <div className="moon"></div>
      
      <div className="relative z-10">
        {/* Magical Night Hero Section */}
        <section className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-5xl mx-auto">
            <div className="mb-12">
              <div className="relative mb-8">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-40 h-40 bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 rounded-full blur-3xl opacity-20 animate-pulse"></div>
                </div>
                <Moon className="h-24 w-24 text-yellow-300 mx-auto mb-4 relative z-10 drop-shadow-2xl animate-bounce" />
              </div>
              <h1 className="text-6xl md:text-8xl font-extrabold bg-gradient-to-r from-purple-300 via-pink-300 to-yellow-300 bg-clip-text text-transparent mb-8 leading-tight text-glow">
                Bedtime Buddy
              </h1>
              <div className="w-32 h-1 bg-gradient-to-r from-purple-400 to-pink-400 mx-auto mb-8 rounded-full shadow-lg shadow-purple-500/50"></div>
              <p className="text-2xl md:text-3xl text-gray-100 mb-4 font-light">
                {t('index.hero.tagline')}
              </p>
              <p className="text-lg md:text-xl text-purple-200 mb-12 max-w-3xl mx-auto leading-relaxed">
                {t('index.hero.lead')}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <Button asChild size="lg" className="btn-premium text-xl px-12 py-4 h-auto magic-glow">
                <Link to="/create">
                  <Wand2 className="mr-3 h-6 w-6" />
                  {t('index.cta.create')}
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="btn-premium-outline text-xl px-12 py-4 h-auto">
                <Link to="/stories">
                  <BookOpen className="mr-3 h-6 w-6" />
                  {t('index.cta.myStories')}
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Starlit Features Section */}
        <section className="container mx-auto px-4 py-24">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent mb-6 text-glow">
              {t('index.features.heading')}
            </h2>
            <p className="text-xl text-purple-200 max-w-3xl mx-auto leading-relaxed">
              {t('index.features.subheading')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            <Card className="premium-card group">
              <CardHeader className="text-center pb-6">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                  <Wand2 className="h-16 w-16 text-purple-300 mx-auto relative z-10 group-hover:scale-110 transition-transform drop-shadow-lg" />
                </div>
                <CardTitle className="text-2xl font-bold text-white mb-2">{t('index.cards.enchanted.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-purple-200 text-lg leading-relaxed">
                  {t('index.cards.enchanted.desc')}
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="premium-card group">
              <CardHeader className="text-center pb-6">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-green-400 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                  <Globe className="h-16 w-16 text-blue-300 mx-auto relative z-10 group-hover:scale-110 transition-transform drop-shadow-lg" />
                </div>
                <CardTitle className="text-2xl font-bold text-white mb-2">{t('index.cards.world.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-purple-200 text-lg leading-relaxed">
                  {t('index.cards.world.desc')}
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="premium-card group">
              <CardHeader className="text-center pb-6">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-yellow-400 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                  <Heart className="h-16 w-16 text-pink-300 mx-auto relative z-10 group-hover:scale-110 transition-transform drop-shadow-lg" />
                </div>
                <CardTitle className="text-2xl font-bold text-white mb-2">{t('index.cards.moments.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-purple-200 text-lg leading-relaxed">
                  {t('index.cards.moments.desc')}
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Call to Action with Night Sky Theme */}
        <section className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-purple-600/20 rounded-3xl blur-xl"></div>
              <div className="relative bg-slate-900/60 backdrop-blur-xl border border-purple-500/30 rounded-3xl p-12">
                <Stars className="h-16 w-16 text-yellow-300 mx-auto mb-6 animate-pulse" />
                <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  {t('index.callout.title')}
                </h3>
                <p className="text-xl text-purple-200 mb-8 leading-relaxed">
                  {t('index.callout.subtitle')}
                </p>
                <Button asChild size="lg" className="btn-premium text-xl px-12 py-4 h-auto magic-glow">
                  <Link to="/create">
                    <Moon className="mr-3 h-6 w-6" />
                    {t('index.callout.button')}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}