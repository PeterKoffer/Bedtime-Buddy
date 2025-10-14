import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Home from '@/pages/Home';
import NotFound from './pages/NotFound';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n';
import LanguageSwitcher from '@/components/i18n/LanguageSwitcher';
import SettingsPanel from '@/components/settings/SettingsPanel';
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/components/ui/use-toast';
import { ToastAction } from '@/components/ui/toast';
import PublicLibrary from '@/pages/PublicLibrary';
import PublicBoard from '@/pages/PublicBoard';
import Generate from '@/pages/Generate';
import { AuthProvider } from '@/contexts/AuthContext';
import { getJSON, setJSON, STORAGE_KEYS } from '@/lib/storage';

const queryClient = new QueryClient();

const App = () => {
  const [showSettings, setShowSettings] = useState(false);
  const { t } = useTranslation();
  const { toast } = useToast();
  const [needsRetry, setNeedsRetry] = useState(false);

  const ensureCreatures = useCallback(async () => {
    const KEY = STORAGE_KEYS.creatures;
    const existing = getJSON<unknown>(KEY, null as unknown as null);
    if (existing && Array.isArray(existing)) {
      setNeedsRetry(false);
      return;
    }
    try {
      const res = await fetch('/creatures_2025.json', { cache: 'no-store' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = (await res.json()) as unknown;
      if (!Array.isArray(data)) throw new Error('Invalid JSON shape');
      // minimal validation: array of 10; elements with id/name/species strings
      const typed = data.filter((x) => {
        if (typeof x !== 'object' || x === null) return false;
        const obj = x as Record<string, unknown>;
        return typeof obj.id === 'string' && typeof obj.name === 'string' && typeof obj.species === 'string';
      });
      if (typed.length !== 10) throw new Error('Expected 10 items with id/name/species');
      setJSON(KEY, typed);
      setNeedsRetry(false);
    } catch (err) {
      console.error('Auto-load creatures failed:', err);
      setNeedsRetry(true);
      toast({
        title: t('library.autoload_fail_title', { defaultValue: 'Failed to load prefab creatures' }),
        description: t('library.autoload_fail_desc', { defaultValue: 'Please click Retry to try again. If the problem persists, use Library → Import JSON.' }),
        variant: 'destructive',
        action: (
          <ToastAction altText={t('app.retry_alt', { defaultValue: 'Retry' })} onClick={ensureCreatures}>
            {t('app.retry_prefab_load', { defaultValue: 'Retry Prefab Load' })}
          </ToastAction>
        ),
      });
    }
  }, [toast, t]);

  useEffect(() => {
    // First-run auto-load of creatures
    ensureCreatures();
  }, [ensureCreatures]);

  return (
    <I18nextProvider i18n={i18n}>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <BrowserRouter>
              <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
                <header className="w-full flex justify-between items-center px-4 py-3 bg-blue-900/70 text-white">
                  <h1 className="text-lg font-semibold">MGX</h1>
                  <nav className="flex items-center gap-4">
                    <Link to="/" className="text-white/90 hover:text-white">{t('nav.home')}</Link>
                    <Link to="/library" className="text-white/90 hover:text-white">{t('nav.library')}</Link>
                    <Link to="/board" className="text-white/90 hover:text-white">{t('nav.board')}</Link>
                    <Link to="/generate" className="text-white/90 hover:text-white">{t('nav.generate')}</Link>
                    <LanguageSwitcher />
                    {needsRetry && (
                      <Button variant="outline" className="btn-premium-outline" onClick={ensureCreatures}>
                        {t('app.retry_prefab_load', { defaultValue: 'Retry Prefab Load' })}
                      </Button>
                    )}
                    <Button variant="outline" className="btn-premium-outline" onClick={() => setShowSettings((v) => !v)}>
                      {t('settings.button')}
                    </Button>
                  </nav>
                </header>
                {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/library" element={<PublicLibrary />} />
                  <Route path="/board" element={<PublicBoard />} />
                  <Route path="/generate" element={<Generate />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </AuthProvider>
    </I18nextProvider>
  );
};

export default App;