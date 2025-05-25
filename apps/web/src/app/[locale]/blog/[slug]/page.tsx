import type { Metadata } from "next";
import { notFound } from 'next/navigation';
import MainLayout from "@/components/main-layout";
import { unstable_noStore as noStore } from 'next/cache';
import BlogPostClient from '@/components/blog/blog-slug-wrapper';

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

interface Translation {
  pl: string;
  en: string;
}

interface BlogCategory {
  id: string;
  name: Translation;
  slug: string;
  description?: Translation;
  iconName?: string;
  iconProvider?: string;
  order: number;
  isActive: boolean;
}

interface BlogPost {
  id: string;
  title: Translation;
  slug: string;
  content: Translation;
  excerpt?: Translation;
  metaTitle?: Translation;
  metaDescription?: Translation;
  metaKeywords?: Translation;
  ogImage?: string;
  isPublished: boolean;
  publishedAt?: string;
  isFeatured: boolean;
  viewCount: number;
  categoryId?: string;
  category?: BlogCategory;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  
  noStore();
  
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/trpc/blog.getBlogPostBySlug?input=${encodeURIComponent(JSON.stringify(slug))}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });
    
    if (response.ok) {
      const result = await response.json();
      const post: BlogPost = result.result?.data;
      
      if (post && post.isPublished) {
        const title = post.metaTitle?.[locale as 'pl' | 'en'] || post.title[locale as 'pl' | 'en'];
        const description = post.metaDescription?.[locale as 'pl' | 'en'] || post.excerpt?.[locale as 'pl' | 'en'] || '';
        
        return {
          title: `${title} - BWitek.dev`,
          description,
          keywords: post.metaKeywords?.[locale as 'pl' | 'en']?.split(',').map((k: string) => k.trim()),
          openGraph: {
            title,
            description,
            images: post.ogImage ? [{ url: post.ogImage }] : undefined,
            type: 'article',
            publishedTime: post.publishedAt,
          },
          twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: post.ogImage ? [post.ogImage] : undefined,
          }
        };
      }
    }
  } catch (error) {
    console.error('Error fetching blog post meta:', error);
  }
  
  return {
    title: "Article not found - BWitek.dev",
    description: "The article you searched for was not found.",
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { locale, slug } = await params;
  
  noStore();
  
  let postData: BlogPost | null = null;
  let relatedPosts: BlogPost[] = [];
  
  try {
    const postResponse = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/trpc/blog.getBlogPostBySlug?input=${encodeURIComponent(JSON.stringify(slug))}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });
    
    if (postResponse.ok) {
      const result = await postResponse.json();
      postData = result.result?.data;
      
      if (!postData || !postData.isPublished) {
        notFound();
      }
      
      if (postData.categoryId) {
        const relatedResponse = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/trpc/blog.getBlogPosts?input=${encodeURIComponent(JSON.stringify({ 
          published: true, 
          categoryId: postData.categoryId, 
          limit: 4 
        }))}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'no-store',
        });
        
        if (relatedResponse.ok) {
          const result = await relatedResponse.json();
          relatedPosts = result.result?.data?.filter((p: BlogPost) => p.id !== postData!.id) || [];
        }
      }
    } else {
      notFound();
    }
  } catch (error) {
    console.error('Error fetching blog post:', error);
    notFound();
  }

  return (
    <MainLayout>
      <BlogPostClient 
        locale={locale}
        postData={postData}
        relatedPosts={relatedPosts}
      />
    </MainLayout>
  );
} 