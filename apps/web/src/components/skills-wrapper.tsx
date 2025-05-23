"use client"
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import {useTranslations} from 'next-intl';
import MainLayout from "@/components/main-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import * as LucideIcons from 'lucide-react';
import * as SimpleIcons from '@icons-pack/react-simple-icons';

interface Props {
  locale: string;
}

export default function SkillsClientWrapper({ locale }: Props) {
  const t = useTranslations();
  const { data: skills, isLoading: skillsLoading } = useQuery(trpc.content.getSkills.queryOptions());
  const { data: categories, isLoading: categoriesLoading } = useQuery(trpc.content.getSkillCategories.queryOptions());
  
  const isLoading = skillsLoading || categoriesLoading;

  return (
    <MainLayout>
      <div className="max-w-screen-lg mx-auto px-6 md:px-24 py-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100">
          {t('skills.title')}
        </h1>
        
        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">{t('common.loading')}</p>
          </div>
        ) : categories && categories.length > 0 ? (
          <Tabs defaultValue={categories[0].id}>
            <TabsList className="mb-6 flex flex-wrap border border-red-300 dark:border-red-700">
              {categories.map((category) => (
                <TabsTrigger key={category.id} value={category.id}>
                  {category.name[locale as 'pl' | 'en']}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {categories.map((category) => {
              const categorySkills = skills?.filter(skill => skill.categoryId === category.id) || [];
              return (
                <TabsContent key={category.id} value={category.id}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {categorySkills.length > 0 ? (
                      categorySkills.map((skill) => (
                        <Card key={skill.id} className="overflow-hidden border border-gray-200 dark:border-gray-800 hover:border-red-300 dark:hover:border-red-700 transition-colors">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">

                                {(() => {
                                  const getIcon = (iconName: string | null | undefined, iconProvider: string | null | undefined, size = 20) => {
                                    if (!iconName) return null;
                                    
                                    if (iconProvider === 'lucide') {
                                      const LucideIcon = (LucideIcons as any)[iconName];
                                      if (LucideIcon) return <LucideIcon size={size} className="text-red-600 dark:text-red-400" />;
                                    } else if (iconProvider === 'simple-icons') {
                                      const SimpleIcon = (SimpleIcons as any)[iconName];
                                      if (SimpleIcon) return <SimpleIcon size={size} className="text-red-600 dark:text-red-400" />;
                                    }
                                    
                                    return null;
                                  };
                                  
                                  const icon = getIcon(skill.iconName, skill.iconProvider);
                                  return icon ? (
                                    <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-full">
                                      {icon}
                                    </div>
                                  ) : null;
                                })()}
                                <h3 className="text-base font-medium text-gray-900 dark:text-gray-100 font-mono">
                                  {skill.name?.[locale as 'pl' | 'en']}
                                </h3>
                            </div>

                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center py-4 text-gray-600 dark:text-gray-400">
                        {t('skills.noSkills')}
                      </div>
                    )}
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>
        ) : (
          <div className="text-center py-8 text-gray-600 dark:text-gray-400">
            {t('skills.noCategories')}
          </div>
        )}
      </div>
    </MainLayout>
  );
} 