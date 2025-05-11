import * as LucideIcons from 'lucide-react';
import * as SimpleIcons from '@icons-pack/react-simple-icons';
import { Terminal } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { trpc } from '@/utils/trpc';
import { useTranslation } from 'react-i18next';

export default function TopBar() {
  const { t, i18n } = useTranslation();
  const { data: topBarItems, isLoading } = useQuery(trpc.content.getTopBar.queryOptions());
  const locale = i18n.language || 'en';

  const getIcon = (iconName: string | null | undefined, iconProvider: string | null | undefined, size = 32) => {
    if (!iconName) return null;
    
    if (iconProvider === 'lucide') {
      const LucideIcon = (LucideIcons as any)[iconName];
      if (LucideIcon) return <LucideIcon size={size} className="text-gray-400 hover:text-red-400 transition-colors" />;
    } else if (iconProvider === 'simple-icons') {
      const SimpleIcon = (SimpleIcons as any)[iconName];
      if (SimpleIcon) return <SimpleIcon size={size} className="text-gray-400 hover:text-red-400 transition-colors" />;
    }
    
    return null;
  };

  return (
    <div className="bg-black py-4 relative top-0 left-0 w-full select-none shadow-lg border-b border-gray-800 font-hack">
        <div className='max-w-screen-lg m-auto px-6 md:px-24'>
            <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                    <div>
                        <Terminal size={32} className="text-red-400" />
                    </div>
                    <div className="text-xl text-gray-300">BWitek.dev</div>
                </div>

                <div className='flex items-center gap-4'>
                    {isLoading ? (
                      <div className="text-gray-400">{t('common.loading')}</div>
                    ) : (
                      topBarItems?.map((item, index) => {
                        const icon = getIcon(item.iconName, item.iconProvider);
                        if (!icon) return null;
                        
                        return (
                          <a 
                            key={item.id} 
                            href={item.url || '#'} 
                            className='focus:outline focus:outline-1 focus:outline-offset-1 focus:outline-red-400 rounded hover:text-red-400' 
                            target={item.newTab ? '_blank' : undefined}
                            rel={item.external ? 'noopener noreferrer' : undefined}
                            tabIndex={5 + index}
                          >
                            {icon}
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