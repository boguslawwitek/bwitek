"use client"
import {useTranslations, useLocale} from 'next-intl';
import {Link, useRouter, usePathname} from '@/i18n/navigation';
import {useParams} from 'next/navigation';
import { useTheme } from "next-themes";
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Icon } from '@/components/icon';
import { useState, useEffect } from 'react';

export default function Footer() {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const locale = useLocale();
  const { theme, setTheme } = useTheme();
  const currentYear = new Date().getFullYear();
  
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return t('common.loading');
  }

  return (
    <footer className="w-full py-6 border-t border-gray-200 dark:border-gray-800 mt-auto">
      <div className="max-w-screen-lg mx-auto px-6 md:px-24">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-6 flex-wrap justify-center">

            <div className="flex flex-col items-center gap-1">
              <span className="text-sm text-gray-700 dark:text-gray-200">{t('theme.toggle')}</span>
              <Tabs 
                id="theme-tabs"
                defaultValue={theme}
                value={theme}
                onValueChange={setTheme}>
                <TabsList>
                  <TabsTrigger 
                    value="light" 
                    className="flex items-center gap-1"
                    id="theme-light-tab"
                    aria-controls="theme-light-content"
                    tabIndex={theme === 'light' ? 0 : -1}>
                    <Icon name="Sun" provider="lu" />
                    <span>{t('theme.light')}</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="dark" 
                    className="flex items-center gap-1"
                    id="theme-dark-tab"
                    aria-controls="theme-dark-content"
                    tabIndex={theme === 'dark' ? 0 : -1}>
                    <Icon name="Moon" provider="lu" />
                    <span>{t('theme.dark')}</span>
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="light" id="theme-light-content" className="hidden" />
                <TabsContent value="dark" id="theme-dark-content" className="hidden" />
              </Tabs>
            </div>
            
            <div className="flex flex-col items-center gap-1">
              <span className="text-sm text-gray-700 dark:text-gray-200">{t('language.switch')}</span>
              <Tabs 
                id="language-tabs"
                defaultValue={locale} 
                value={locale}
                onValueChange={(value) => router.replace(
                  // @ts-expect-error -- TypeScript will validate that only known `params`
                  // are used in combination with a given `pathname`. Since the two will
                  // always match for the current route, we can skip runtime checks.
                  {pathname, params}, {locale: value})}>
                <TabsList>
                  <TabsTrigger 
                    value="pl" 
                    className="flex items-center gap-1"
                    id="lang-pl-tab"
                    aria-controls="lang-pl-content"
                    tabIndex={locale === 'pl' ? 0 : -1}>
                    <span>Polski</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="en" 
                    className="flex items-center gap-1"
                    id="lang-en-tab"
                    aria-controls="lang-en-content"
                    tabIndex={locale === 'en' ? 0 : -1}>
                    <span>English</span>
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="pl" id="lang-pl-content" className="hidden" />
                <TabsContent value="en" id="lang-en-content" className="hidden" />
              </Tabs>
            </div>
          </div>

          <div className="text-sm text-gray-700 dark:text-gray-200 text-center md:text-right">
            <div className="space-y-1">
              <div className="flex flex-col gap-1">
                <Link 
                  href="/privacy-policy"
                  className="hover:text-gray-900 dark:hover:text-white transition-colors"
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