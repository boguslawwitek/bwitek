"use client"
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import {useTranslations, useLocale} from 'next-intl';
import MainLayout from "@/components/main-layout";

export default function HomePage() {
  const t = useTranslations();
  const locale = useLocale();
  const { data, isLoading } = useQuery(trpc.content.getHomepage.queryOptions());

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="text-gray-400">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-screen-lg mx-auto px-6 md:px-24 py-12">
        <section className="mb-16">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {data?.welcomeText?.[locale]}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            {data?.specializationText?.[locale]}
          </p>
        </section>

        <section className="mb-16">
          <div className="prose dark:prose-invert max-w-none">
            {data?.aboutMeText?.[locale]}
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
