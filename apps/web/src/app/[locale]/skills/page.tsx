import type { Metadata } from "next";
import { unstable_noStore as noStore } from 'next/cache';
import SkillsClientWrapper from "@/components/skills-wrapper";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  
  noStore();
  
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/trpc/content.getSkillsPageMeta`, {
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
          title: data.metaTitle[locale as 'pl' | 'en'] || "Skills - BWitek.dev",
          description: data.metaDescription[locale as 'pl' | 'en'] || "My technical skills and expertise.",
          keywords: data.metaKeywords?.[locale as 'pl' | 'en']?.split(',').map((k: string) => k.trim()),
          openGraph: {
            title: data.metaTitle[locale as 'pl' | 'en'] || "Skills - BWitek.dev",
            description: data.metaDescription[locale as 'pl' | 'en'] || "My technical skills and expertise.",
            images: data.ogImage ? [{ url: data.ogImage }] : undefined,
          },
          twitter: {
            card: 'summary_large_image',
            title: data.metaTitle[locale as 'pl' | 'en'] || "Skills - BWitek.dev",
            description: data.metaDescription[locale as 'pl' | 'en'] || "My technical skills and expertise.",
            images: data.ogImage ? [data.ogImage] : undefined,
          }
        };
      }
    }
  } catch (error) {
    console.error('Error fetching skills meta:', error);
  }
  
  return {
    title: "Skills - BWitek.dev",
    description: "My technical skills and expertise.",
  };
}

export default async function SkillsPage({ params }: Props) {
  const { locale } = await params;
  
  return <SkillsClientWrapper locale={locale} />;
}
