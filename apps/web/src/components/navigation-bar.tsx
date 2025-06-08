"use client"
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { trpc } from '@/utils/trpc';
import { Icon } from '@/components/icon';
import {useTranslations, useLocale} from 'next-intl';
import {Link, useRouter, usePathname} from '@/i18n/navigation';

export default function NavigationBar() {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  
  const { data: navigationItems, isLoading } = useQuery(trpc.content.getNavigation.queryOptions());
  
  const currentPath = pathname
  const activeItems = navigationItems?.filter(item => item.isActive) || [];
  const currentIndex = activeItems.findIndex(item => (item.url || '#') === currentPath);

  useEffect(() => {
    const handleKeyUp = (e: KeyboardEvent) => {
      if (!activeItems.length || (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight')) return;
      
      if (e.key === 'ArrowLeft') {
        const prevIndex = currentIndex <= 0 ? activeItems.length - 1 : currentIndex - 1;
        const prevItem = activeItems[prevIndex];
        if (prevItem && !prevItem.external) {
          const url = prevItem.url || '/';
          router.push(url as any);
        }
      } else if (e.key === 'ArrowRight') {
        const nextIndex = currentIndex >= activeItems.length - 1 ? 0 : currentIndex + 1;
        const nextItem = activeItems[nextIndex];
        if (nextItem && !nextItem.external) {
          const url = nextItem.url || '/';
          router.push(url as any);
        }
      }
    };

    window.addEventListener('keyup', handleKeyUp);
    return () => window.removeEventListener('keyup', handleKeyUp);
  }, [activeItems, currentIndex, router]);

  return (
    <nav className="bg-gray-50/80 dark:bg-gray-900/50 backdrop-blur-sm py-3 w-full select-none border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-screen-lg mx-auto px-2 md:px-24">
        {isLoading ? (
          <div className="text-sm text-gray-700 dark:text-gray-200">{t('common.loading')}</div>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <ul className="flex flex-wrap gap-4 md:gap-0 md:space-x-8 items-center justify-center px-2">
              {activeItems.map((item, index) => {
                const isCurrent = item.url === currentPath;
                const linkClasses = `py-2 px-3 font-medium transition-colors ${
                  isCurrent 
                    ? 'text-rose-700 dark:text-rose-300 border-b-2 border-rose-600 dark:border-rose-300' 
                    : 'text-gray-900 dark:text-gray-100 hover:text-rose-700 dark:hover:text-rose-300'
                } focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-opacity-50`;
                
                return (
                  <li key={item.id}>
                    {item.external ? (
                      <a
                        href={item.url || '#'}
                        className={`relative px-2 md:px-3 py-1 rounded-md text-sm font-medium transition-colors ${item.url === currentPath ? 'text-rose-700 dark:text-rose-300' : 'text-gray-900 dark:text-gray-100 hover:text-rose-700 dark:hover:text-rose-300'} focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-opacity-50`}
                        rel="noopener noreferrer"
                        target="_blank"
                        aria-label={`${item.label[locale]} ${t('common.opensInNewTab')}`}
                      >
                        {item.label[locale]}
                      </a>
                    ) : (
                      <Link
                        href={item.url || '#'}
                        className={linkClasses}
                        aria-current={isCurrent ? 'page' : undefined}
                      >
                        {item.label[locale]}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
            <div className="hidden md:flex text-sm text-gray-900 dark:text-gray-100 mt-4 text-center items-center justify-center">
              <Icon name="MoveLeft" provider="lu" className="inline mr-1" />{t('navigation.keyboardHint')}<Icon name="MoveRight" provider="lu" className="inline ml-1" />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}