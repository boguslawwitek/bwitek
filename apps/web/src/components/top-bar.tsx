"use client"
import { Icon } from '@/components/icon';
import { useQuery } from '@tanstack/react-query';
import { trpc } from '@/utils/trpc';
import { useTranslations, useLocale } from 'next-intl';

export default function TopBar() {
  const t = useTranslations();
  const locale = useLocale() as 'pl' | 'en';
  const { data: topBarItems, isLoading } = useQuery(trpc.content.getTopBar.queryOptions());

  const getIcon = (iconName: string | null | undefined, iconProvider: string | null | undefined) => {
    const size = typeof window !== 'undefined' && window.innerWidth < 768 ? 24 : 32;
    if (!iconName) return null;
    
    if (iconProvider === 'lucide') {
      return <Icon name={iconName} provider="lu" size={size} className="text-gray-300 hover:text-rose-400 transition-colors" />;
    } else if (iconProvider === 'simple-icons') {
      return <Icon name={iconName} provider="si" size={size} className="text-gray-300 hover:text-rose-400 transition-colors" />;
    }
    
    return null;
  };

  return (
    <div className="bg-black py-4 relative top-0 left-0 w-full select-none shadow-lg border-b border-gray-800 font-hack">
        <div className='max-w-screen-lg m-auto px-2 md:px-24'>
            <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                    <div>
                        <Icon name="terminal" provider="lu" size={32} className="text-rose-400" />
                    </div>
                    <div className="text-lg md:text-xl text-gray-100">BWitek.dev</div>
                </div>

                <div className='flex items-center gap-2 md:gap-4'>
                    {isLoading ? (
                      <div className="text-gray-300">{t('common.loading')}</div>
                    ) : (
                      topBarItems?.map((item, index) => {
                        const icon = getIcon(item.iconName, item.iconProvider);
                        if (!icon) return null;
                        
                        return (
                          <a 
                            key={item.id} 
                            href={item.url || '#'} 
                            className='focus:outline focus:outline-1 focus:outline-offset-1 focus:outline-rose-400 rounded hover:text-rose-400 group relative' 
                            target={item.newTab ? '_blank' : undefined}
                            rel={item.external ? 'noopener noreferrer' : undefined}
                            aria-label={item.name?.[locale]}
                            title={item.name?.[locale]}
                          >
                            <span className="sr-only">{item.name?.[locale]}</span>
                            {icon}
                            <span className="hidden md:block absolute z-10 -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-gray-100 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                              {item.name?.[locale]}
                            </span>
                          </a>
                        );
                      })
                    )}
                </div>
            </div>
        </div>
    </div>
  );
}