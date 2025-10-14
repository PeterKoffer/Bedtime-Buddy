import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { BookOpen, User, LogOut, Moon, Stars, Sparkles } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  return (
    <nav className="nav-night sticky top-0 z-50 border-b border-purple-500/20">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-md opacity-30 group-hover:opacity-50 transition-opacity"></div>
              <Moon className="h-8 w-8 text-yellow-300 relative z-10 group-hover:rotate-12 transition-transform" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
              Bedtime Buddy
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              to="/create" 
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                location.pathname === '/create' 
                  ? 'bg-purple-800/50 text-purple-200' 
                  : 'text-purple-300 hover:text-white hover:bg-purple-800/30'
              }`}
            >
              <Sparkles className="h-4 w-4" />
              <span>Create Story</span>
            </Link>
            <Link 
              to="/stories" 
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                location.pathname === '/stories' 
                  ? 'bg-purple-800/50 text-purple-200' 
                  : 'text-purple-300 hover:text-white hover:bg-purple-800/30'
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span>My Stories</span>
            </Link>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden mt-4 pt-4 border-t border-purple-500/20">
          <div className="flex items-center justify-around">
            <Link 
              to="/create" 
              className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-colors ${
                location.pathname === '/create' 
                  ? 'bg-purple-800/50 text-purple-200' 
                  : 'text-purple-300 hover:text-white hover:bg-purple-800/30'
              }`}
            >
              <Sparkles className="h-5 w-5" />
              <span className="text-xs">Create</span>
            </Link>
            <Link 
              to="/stories" 
              className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-colors ${
                location.pathname === '/stories' 
                  ? 'bg-purple-800/50 text-purple-200' 
                  : 'text-purple-300 hover:text-white hover:bg-purple-800/30'
              }`}
            >
              <BookOpen className="h-5 w-5" />
              <span className="text-xs">Stories</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}