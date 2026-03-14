import type { Metadata } from "next";
import { unstable_noStore as noStore } from 'next/cache';
import ProjectsClientWrapper from "@/components/projects-wrapper";
import type { Locale } from '@/lib/types';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  
  noStore();
  
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/trpc/content.getProjectsPageMeta`, {
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
          title: data.metaTitle[locale] || "Projects - BWitek.dev",
          description: data.metaDescription[locale] || "My projects and portfolio.",
          keywords: data.metaKeywords?.[locale]?.split(',').map((k: string) => k.trim()),
          openGraph: {
            title: data.metaTitle[locale] || "Projects - BWitek.dev",
            description: data.metaDescription[locale] || "My projects and portfolio.",
            images: data.ogImage ? [{ url: data.ogImage }] : undefined,
          },
          twitter: {
            card: 'summary_large_image',
            title: data.metaTitle[locale] || "Projects - BWitek.dev",
            description: data.metaDescription[locale] || "My projects and portfolio.",
            images: data.ogImage ? [data.ogImage] : undefined,
          }
        };
      }
    }
  } catch (error) {
    console.error('Error fetching projects meta:', error);
  }
  
  return {
    title: "Projects - BWitek.dev",
    description: "My projects and portfolio.",
  };
}

export default async function ProjectsPage({ params }: Props) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  
  return <ProjectsClientWrapper locale={locale} />;
}
