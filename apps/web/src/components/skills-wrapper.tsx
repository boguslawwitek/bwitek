"use client"
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { useTranslations } from 'next-intl';
import type { Locale } from '@/lib/types';
import { mapIconProvider } from '@/lib/types';
import MainLayout from "@/components/main-layout";
import { Icon } from '@/components/icon';

interface Props {
  locale: Locale;
}

export default function SkillsClientWrapper({ locale }: Props) {
  const t = useTranslations();
  const { data: skills, isLoading: skillsLoading } = useQuery(trpc.content.getSkills.queryOptions());
  const { data: categories, isLoading: categoriesLoading } = useQuery(trpc.content.getSkillCategories.queryOptions());

  const isLoading = skillsLoading || categoriesLoading;

  return (
    <MainLayout>
      <div className="max-w-screen-lg mx-auto px-6 md:px-24 py-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-gray-100">
          {t('pages.skills.title')}
        </h1>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">{t('common.loading')}</p>
          </div>
        ) : categories && categories.length > 0 ? (
          <div className="space-y-8">
            {categories.map((category) => {
              const categorySkills = skills?.filter(skill => skill.categoryId === category.id) || [];
              if (categorySkills.length === 0) return null;

              return (
                <section key={category.id}>
                  <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3 border-b border-gray-200 dark:border-gray-800 pb-2">
                    {category.name[locale]}
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {categorySkills.map((skill) => {
                      const provider = mapIconProvider(skill.iconProvider);
                      return (
                        <div
                          key={skill.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm font-mono text-gray-800 dark:text-gray-200 hover:border-red-300 dark:hover:border-red-700 transition-colors"
                        >
                          {skill.iconName && provider && (
                            <Icon name={skill.iconName} provider={provider} size={14} className="text-red-600 dark:text-red-400" />
                          )}
                          {skill.name?.[locale]}
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-600 dark:text-gray-400">
            {t('pages.skills.noCategories')}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
