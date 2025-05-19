"use client"
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { trpc } from '@/utils/trpc';
import { MoveLeft, MoveRight } from 'lucide-react';
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
    <nav className="bg-gray-100 dark:bg-gray-900 py-3 w-full select-none border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-screen-lg mx-auto px-2 md:px-24">
        {isLoading ? (
          <div className="text-sm text-gray-600 dark:text-gray-400">{t('common.loading')}</div>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <ul className="flex flex-wrap gap-4 md:gap-0 md:space-x-8 items-center justify-center px-2">
              {activeItems.map((item, index) => {
                const isCurrent = item.url === currentPath;
                const linkClasses = `py-2 px-3 font-medium transition-colors ${
                  isCurrent 
                    ? 'text-red-600 dark:text-red-400 border-b-2 border-red-500 dark:border-red-400' 
                    : 'text-gray-800 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400'
                } focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50`;
                
                return (
                  <li key={item.id}>
                    {item.external ? (
                      <a
                        href={item.url || '#'}
                        className={`relative px-2 md:px-3 py-1 rounded-md text-sm font-medium transition-colors ${item.url === currentPath ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400'} focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50`}
                        tabIndex={index}
                        rel="noopener noreferrer"
                      >
                        {item.label[locale]}
                      </a>
                    ) : (
                      <Link
                        href={item.url || '#'}
                        className={linkClasses}
                        tabIndex={index}
                      >
                        {item.label[locale]}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
            <div className="hidden md:flex text-xs text-gray-500 dark:text-gray-400 mt-4 text-center items-center justify-center">
              <MoveLeft className="inline mr-1" />{t('navigation.keyboardHint')}<MoveRight className="inline ml-1" />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}