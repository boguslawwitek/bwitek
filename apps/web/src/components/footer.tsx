import { useTranslation } from 'react-i18next';
import { useTheme } from './theme-provider';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Moon, Sun, Languages } from 'lucide-react';

export default function Footer() {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full py-6 border-t border-gray-200 dark:border-gray-800 mt-auto">
      <div className="max-w-screen-lg mx-auto px-6 md:px-24">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-6 flex-wrap justify-center">

            <div className="flex flex-col items-center gap-1">
              <span className="text-xs text-gray-500 dark:text-gray-400">{t('theme.toggle')}</span>
              <Tabs defaultValue={theme} onValueChange={(value) => setTheme(value as 'light' | 'dark' | 'system')}>
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
              <Tabs defaultValue={i18n.language} onValueChange={(value) => i18n.changeLanguage(value)}>
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
            &copy; {currentYear} {t('footer.copyright')}
          </div>
        </div>
      </div>
    </footer>
  );
}
