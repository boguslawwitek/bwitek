import { useTranslations } from 'next-intl';
import { Button } from "@/components/ui/button";
import { Icon } from '@/components/icon';
import { Link } from '@/i18n/navigation';
import MainLayout from "@/components/main-layout";

export default function NotFound() {
  const t = useTranslations();

  return (
    <MainLayout>
      <div className="max-w-screen-lg mx-auto px-6 md:px-24 py-12">
        <div className="text-center">
          <div className="mb-8">
            <h1 className="text-6xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              404
            </h1>
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
              {t('pages.notFound.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              {t('pages.notFound.description')}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/blog">
              <Button variant="default" className="flex items-center gap-2">
                <Icon name="ArrowLeft" provider="lu" className="w-4 h-4" />
                {t('blog.backToBlog')}
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="flex items-center gap-2">
                <Icon name="Home" provider="lu" className="w-4 h-4" />
                {t('pages.notFound.homepage')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 