"use client"
import {useTranslations, useLocale} from 'next-intl';
import {Link, useRouter, usePathname} from '@/i18n/navigation';
import {useParams} from 'next/navigation';
import { useTheme } from "next-themes";
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Moon, Sun } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Footer() {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const locale = useLocale();
  const { theme, setTheme } = useTheme();
  const currentYear = new Date().getFullYear();
  
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('light');
  
  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (theme === 'system') {
      setCurrentTheme(prefersDark ? 'dark' : 'light');
    } else if (theme === 'light' || theme === 'dark') {
      setCurrentTheme(theme);
    }
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (theme === 'system') {
        setCurrentTheme(e.matches ? 'dark' : 'light');
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  return (
    <footer className="w-full py-6 border-t border-gray-200 dark:border-gray-800 mt-auto">
      <div className="max-w-screen-lg mx-auto px-6 md:px-24">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-6 flex-wrap justify-center">

            <div className="flex flex-col items-center gap-1">
              <span className="text-xs text-gray-500 dark:text-gray-400">{t('theme.toggle')}</span>
              <Tabs 
                value={currentTheme} 
                onValueChange={(value) => setTheme(value as 'light' | 'dark')}>
                <TabsList className="bg-gray-100 dark:bg-gray-800">
                  <TabsTrigger value="light" className="flex items-center gap-1">
                    <Sun className="h-4 w-4" />
                    <span>{t('theme.light')}</span>
                  </TabsTrigger>
                  <TabsTrigger value="dark" className="flex items-center gap-1">
                    <Moon className="h-4 w-4" />
                    <span>{t('theme.dark')}</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs text-gray-500 dark:text-gray-400">{t('language.switch')}</span>
              <Tabs defaultValue={locale} onValueChange={(value) => router.replace(
                // @ts-expect-error -- TypeScript will validate that only known `params`
                // are used in combination with a given `pathname`. Since the two will
                // always match for the current route, we can skip runtime checks.
                {pathname, params}, {locale: value})}>
                <TabsList className="bg-gray-100 dark:bg-gray-800">
                  <TabsTrigger value="pl" className="flex items-center gap-1">
                    <span>Polski</span>
                  </TabsTrigger>
                  <TabsTrigger value="en" className="flex items-center gap-1">
                    <span>English</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          <div className="text-sm text-gray-500 dark:text-gray-400 text-center md:text-right">
            <div className="space-y-1">
              <div>
                <Link 
                  href="/privacy-policy"
                  className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  {locale === 'pl' ? 'Polityka Prywatności' : 'Privacy Policy'}
                </Link>
              </div>
              <div>
                &copy; {currentYear} {t('footer.copyright')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}