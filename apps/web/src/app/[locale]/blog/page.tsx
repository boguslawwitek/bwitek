import type { Metadata } from "next";
import { useLocale } from 'next-intl';
import MainLayout from "@/components/main-layout";
import { unstable_noStore as noStore } from 'next/cache';
import BlogPageClient from '@/components/blog/blog-wrapper';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  
  noStore();
  
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/trpc/blog.getBlogPageMeta`, {
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
          title: data.metaTitle[locale as 'pl' | 'en'] || "Blog - BWitek.dev",
          description: data.metaDescription[locale as 'pl' | 'en'],
          keywords: data.metaKeywords?.[locale as 'pl' | 'en']?.split(',').map((k: string) => k.trim()),
          openGraph: {
            title: data.metaTitle[locale as 'pl' | 'en'] || "Blog - BWitek.dev",
            description: data.metaDescription[locale as 'pl' | 'en'],
            images: data.ogImage ? [{ url: data.ogImage }] : undefined,
          },
          twitter: {
            card: 'summary_large_image',
            title: data.metaTitle[locale as 'pl' | 'en'] || "Blog - BWitek.dev",
            description: data.metaDescription[locale as 'pl' | 'en'],
            images: data.ogImage ? [data.ogImage] : undefined,
          }
        };
      }
    }
  } catch (error) {
    console.error('Error fetching blog meta:', error);
  }
  
  return {
    title: "Blog - BWitek.dev",
    description: "Articles about programming and technology.",
  };
}

export default async function BlogPage({ params }: Props) {
  const { locale } = await params;
  
  noStore();
  
  let blogData = null;
  let categoriesData = null;
  let postsData = null;
  
  try {
    const blogResponse = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/trpc/blog.getBlogPageMeta`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });
    
    if (blogResponse.ok) {
      const result = await blogResponse.json();
      blogData = result.result?.data;
    }

    const categoriesResponse = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/trpc/blog.getBlogCategories`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });
    
    if (categoriesResponse.ok) {
      const result = await categoriesResponse.json();
      categoriesData = result.result?.data;
    }

    const postsResponse = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/trpc/blog.getBlogPosts?input=${encodeURIComponent(JSON.stringify({ published: true, limit: 20 }))}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });
    
    if (postsResponse.ok) {
      const result = await postsResponse.json();
      postsData = result.result?.data;
    }
  } catch (error) {
    console.error('Error fetching blog data:', error);
  }

  return (
    <MainLayout>
      <BlogPageClient 
        locale={locale}
        blogData={blogData}
        categoriesData={categoriesData || []}
        postsData={postsData || []}
      />
    </MainLayout>
  );
} 