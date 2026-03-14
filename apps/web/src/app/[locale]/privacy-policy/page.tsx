import type { Metadata } from "next";
import { unstable_noStore as noStore } from 'next/cache';
import MainLayout from "@/components/main-layout";
import PrivacyPolicyClientWrapper from "@/components/privacy-policy-wrapper";
import type { Locale } from '@/lib/types';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  
  noStore();
  
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/trpc/content.getPrivacyPolicyPageMeta`, {
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
          title: data.metaTitle[locale] || "Privacy Policy - BWitek.dev",
          description: data.metaDescription[locale] || "Our privacy policy and data protection information.",
          keywords: data.metaKeywords?.[locale]?.split(',').map((k: string) => k.trim()),
          openGraph: {
            title: data.metaTitle[locale] || "Privacy Policy - BWitek.dev",
            description: data.metaDescription[locale] || "Our privacy policy and data protection information.",
            images: data.ogImage ? [{ url: data.ogImage }] : undefined,
          },
          twitter: {
            card: 'summary_large_image',
            title: data.metaTitle[locale] || "Privacy Policy - BWitek.dev",
            description: data.metaDescription[locale] || "Our privacy policy and data protection information.",
            images: data.ogImage ? [data.ogImage] : undefined,
          }
        };
      }
    }
  } catch (error) {
    console.error('Error fetching privacy policy meta:', error);
  }
  
  return {
    title: "Privacy Policy - BWitek.dev",
    description: "Our privacy policy and data protection information.",
  };
}

export default async function PrivacyPolicyPage({ params }: Props) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  
  return (
    <MainLayout>
      <PrivacyPolicyClientWrapper locale={locale} />
    </MainLayout>
  );
}