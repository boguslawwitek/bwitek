import type { Metadata } from "next";
import { useTranslations, useLocale } from 'next-intl';
import MainLayout from "@/components/main-layout";
import { unstable_noStore as noStore } from 'next/cache';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  
  noStore();
  
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/trpc/content.getHomepage`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });
    
    if (response.ok) {
      const result = await response.json();
      const data = result.result?.data;
      
      if (data && data.metaTitle && data.metaDescription) {
        return {
          title: data.metaTitle[locale as 'pl' | 'en'] || "BWitek.dev",
          description: data.metaDescription[locale as 'pl' | 'en'] || "Full-stack developer portfolio.",
          keywords: data.metaKeywords?.[locale as 'pl' | 'en']?.split(',').map((k: string) => k.trim()),
          openGraph: {
            title: data.metaTitle[locale as 'pl' | 'en'] || "BWitek.dev",
            description: data.metaDescription[locale as 'pl' | 'en'] || "Full-stack developer portfolio.",
            images: data.ogImage ? [{ url: data.ogImage }] : undefined,
          },
          twitter: {
            card: 'summary_large_image',
            title: data.metaTitle[locale as 'pl' | 'en'] || "BWitek.dev",
            description: data.metaDescription[locale as 'pl' | 'en'] || "Full-stack developer portfolio.",
            images: data.ogImage ? [data.ogImage] : undefined,
          }
        };
      }
    }
  } catch (error) {
    console.error('Error fetching homepage meta:', error);
  }
  
  return {
    title: "BWitek.dev",
    description: "Full-stack developer portfolio.",
  };
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  
  noStore();
  
  let data;
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/trpc/content.getHomepage`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });
    
    if (response.ok) {
      const result = await response.json();
      data = result.result?.data;
    }
  } catch (error) {
    console.error('Error fetching homepage data:', error);
  }

  return (
    <MainLayout>
      <div className="max-w-screen-lg mx-auto px-6 md:px-24 py-12">
        <section className="mb-16">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {data?.welcomeText?.[locale as 'pl' | 'en']}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            {data?.specializationText?.[locale as 'pl' | 'en']}
          </p>
        </section>

        <section className="mb-16">
          <div className="prose dark:prose-invert max-w-none">
            {data?.aboutMeText?.[locale as 'pl' | 'en']}
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
