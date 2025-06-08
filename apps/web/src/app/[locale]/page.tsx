import type { Metadata } from "next";
import { useTranslations } from 'next-intl';
import MainLayout from "@/components/main-layout";
import HomeContent from "@/components/home-content";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/trpc/content.getHomepage`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      next: {
        revalidate: 300
      }
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
  
  let data;
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/trpc/content.getHomepage`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      next: {
        revalidate: 300
      }
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
      <HomeContent 
        welcomeText={data?.welcomeText?.[locale as 'pl' | 'en'] || ''}
        specializationText={data?.specializationText?.[locale as 'pl' | 'en'] || ''}
        aboutMeText={data?.aboutMeText?.[locale as 'pl' | 'en'] || ''}
      />
    </MainLayout>
  );
}
