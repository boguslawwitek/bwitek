"use client";

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Eye, ArrowLeft, ArrowRight, Tag } from "lucide-react";
import { Link } from '@/i18n/navigation';
import { trpc } from "@/utils/trpc";
import { useMutation } from "@tanstack/react-query";
import * as LucideIcons from 'lucide-react';
import * as SimpleIcons from '@icons-pack/react-simple-icons';
import ArticleContent from "@/components/admin/article-content";
import CommentsSection from "@/components/blog/comments-section";
import NewsletterSignup from '@/components/newsletter-signup';

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
  ogImage?: string;
  isPublished: boolean;
  publishedAt?: string;
  isFeatured: boolean;
  viewCount: number;
  category?: BlogCategory;
}

interface BlogPostClientProps {
  locale: string;
  postData: BlogPost;
  relatedPosts: BlogPost[];
}

const getFullImageUrl = (url: string): string => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  if (url.startsWith('/api/uploads/')) {
    return `${process.env.NEXT_PUBLIC_SERVER_URL}${url}`;
  }
  if (url.startsWith('/uploads/')) {
    return `${process.env.NEXT_PUBLIC_SERVER_URL}/api${url}`;
  }
  return url;
};

const getIcon = (iconName: string | null | undefined, iconProvider: string | null | undefined, size = 16) => {
  if (!iconName) return null;
  
  if (iconProvider === 'lucide') {
    const LucideIcon = (LucideIcons as any)[iconName];
    if (LucideIcon) return <LucideIcon size={size} className="text-current" />;
  } else if (iconProvider === 'simple-icons') {
    const SimpleIcon = (SimpleIcons as any)[iconName];
    if (SimpleIcon) return <SimpleIcon size={size} className="text-current" />;
  }
  
  return null;
};

export default function BlogPostClient({ 
  locale, 
  postData, 
  relatedPosts 
}: BlogPostClientProps) {
  const t = useTranslations();

  const { mutate: incrementViewCount } = useMutation(
    trpc.blog.incrementViewCount.mutationOptions({
      onError: (error) => {
        console.warn("Failed to increment view count:", error);
      }
    })
  );

  useEffect(() => {
    if (postData?.id) {
      incrementViewCount(postData.id);
    }
  }, [postData?.id, incrementViewCount]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString(locale === 'pl' ? 'pl-PL' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  const stripHtml = (html: string) => {
    if (typeof window === 'undefined') {
      return html.replace(/<[^>]*>/g, '');
    }
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const processHtmlContent = (html: string) => {
    return html.replace(/src="([^"]*\/(?:api\/)?uploads\/[^"]*)"/g, (match, url) => {
      return `src="${getFullImageUrl(url)}"`;
    });
  };

  if (!postData) {
    return (
      <div className="max-w-screen-lg mx-auto px-6 md:px-24 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {t('blog.articleNotFound')}
          </h1>
          <Link href="/blog">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('blog.backToBlog')}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-screen-lg mx-auto px-6 md:px-24 py-12">
      <div className="mb-8">
        <Link href="/blog">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('blog.backToBlog')}
          </Button>
        </Link>
      </div>

      <article className="mb-12">
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            {postData.isFeatured && (
              <Badge variant="secondary">
                {t('blog.featured')}
              </Badge>
            )}
            {postData.category && (
              <Badge variant="outline" className="flex items-center gap-1">
                {getIcon(postData.category.iconName, postData.category.iconProvider, 14)}
                {postData.category.name[locale as 'pl' | 'en']}
              </Badge>
            )}
          </div>

          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4 leading-tight">
            {postData.title[locale as 'pl' | 'en']}
          </h1>

          {postData.excerpt && (
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
              {stripHtml(postData.excerpt[locale as 'pl' | 'en'])}
            </p>
          )}

          <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400 mb-8">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {formatDate(postData.publishedAt)}
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {postData.viewCount} {t('blog.views')}
            </div>
          </div>

          {postData.ogImage && (
            <div className="aspect-video overflow-hidden rounded-lg mb-8">
              <img
                src={getFullImageUrl(postData.ogImage)}
                alt={postData.title[locale as 'pl' | 'en']}
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </header>

        <ArticleContent 
          content={processHtmlContent(postData.content[locale as 'pl' | 'en'])}
          className="border-0 p-0 bg-transparent"
        />
      </article>

      {relatedPosts.length > 0 && (
        <section className="border-t pt-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            {t('blog.relatedArticles')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedPosts.slice(0, 3).map(post => (
              <Card key={post.id} className="group hover:shadow-lg transition-shadow duration-200">
                {post.ogImage && (
                  <div className="aspect-video overflow-hidden rounded-t-lg">
                    <img
                      src={getFullImageUrl(post.ogImage)}
                      alt={post.title[locale as 'pl' | 'en']}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    {post.isFeatured && (
                      <Badge variant="secondary" className="text-xs">
                        {t('blog.featured')}
                      </Badge>
                    )}
                    {post.category && (
                      <Badge variant="outline" className="text-xs flex items-center gap-1">
                        {getIcon(post.category.iconName, post.category.iconProvider, 12)}
                        {post.category.name[locale as 'pl' | 'en']}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                    <Link href={`/blog/${post.slug}`}>
                      {post.title[locale as 'pl' | 'en']}
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {post.excerpt && (
                    <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 text-sm">
                      {truncateText(stripHtml(post.excerpt[locale as 'pl' | 'en']))}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(post.publishedAt)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {post.viewCount}
                      </div>
                    </div>
                    <Link href={`/blog/${post.slug}`}>
                      <Button variant="ghost" size="sm" className="p-0 h-auto">
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Newsletter Signup */}
      <section className="border-t pt-12">
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold mb-2">
            {t('newsletter.articleSectionTitle')}
          </h3>
          <p className="text-muted-foreground text-sm">
            {t('newsletter.articleSectionDescription')}
          </p>
        </div>
        <div className="max-w-sm mx-auto">
          <NewsletterSignup 
            source="article" 
            compact={true}
            showLanguageSelector={true}
          />
        </div>
      </section>

      {postData && postData.id && (
        <CommentsSection postId={postData.id} />
      )}
    </div>
  );
} 