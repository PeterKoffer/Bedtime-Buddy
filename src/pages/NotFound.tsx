import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function NotFound() {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="space-y-6 max-w-md">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">404</h1>
          <h2 className="text-2xl font-semibold">{t('notfound.title')}</h2>
        </div>
        
        <p className="text-muted-foreground">
          {t('notfound.message')}
        </p>
        
        <Link to="/">
          <Button>
            {t('notfound.backHome')}
          </Button>
        </Link>
      </div>
    </div>
  );
}