"use client";

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from '@/components/icon';
import { Link } from '@/i18n/navigation';
import { trpc } from "@/utils/trpc";
import { useMutation, useQuery } from "@tanstack/react-query";
import ArticleContent from "@/components/admin/article-content";
import CommentsSection from "@/components/blog/comments-section";
import NewsletterSignup from '@/components/newsletter-signup';
import SocialShare from '@/components/blog/social-share';
import { type Locale, type BlogPost, mapIconProvider } from '@/lib/types';
import { getFullImageUrl } from '@/lib/url';
import { stripHtml, truncateText } from '@/lib/text';
import { formatDate } from '@/lib/format';

interface BlogPostClientProps {
  locale: Locale;
  postData: BlogPost;
  relatedPosts: BlogPost[];
}

export default function BlogPostClient({ 
  locale, 
  postData, 
  relatedPosts 
}: BlogPostClientProps) {
  const t = useTranslations();

  const { data: newsletterStatus } = useQuery(
    trpc.getNewsletterStatus.queryOptions()
  );

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
              <Icon name="ArrowLeft" provider="lu" className="w-4 h-4 mr-2" />
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
            <Icon name="ArrowLeft" provider="lu" className="w-4 h-4 mr-2" />
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
                {postData.category.iconName && mapIconProvider(postData.category.iconProvider) && (
                  <Icon name={postData.category.iconName} provider={mapIconProvider(postData.category.iconProvider)!} className="text-current" />
                )}
                {postData.category.name[locale]}
              </Badge>
            )}
          </div>

          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4 leading-tight">
            {postData.title[locale]}
          </h1>

          {postData.excerpt && (
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
              {stripHtml(postData.excerpt[locale])}
            </p>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Icon name="Calendar" provider="lu" className="h-4 w-4" />
                {formatDate(postData.publishedAt, { locale })}
              </div>
              <div className="flex items-center gap-1">
                <Icon name="Eye" provider="lu" className="h-4 w-4" />
                {postData.viewCount} {t('blog.views')}
              </div>
            </div>
            <SocialShare 
              url={`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'}/${locale}/blog/${postData.slug}`}
              title={postData.title[locale]}
              description={postData.excerpt ? stripHtml(postData.excerpt[locale]) : undefined}
            />
          </div>

          {postData.ogImage && (
            <div className="aspect-video overflow-hidden rounded-lg mb-8">
              <img
                src={getFullImageUrl(postData.ogImage)}
                alt={postData.title[locale]}
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </header>

        <ArticleContent 
          content={processHtmlContent(postData.content[locale])}
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
                      alt={post.title[locale]}
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
                        {post.category.iconName && mapIconProvider(post.category.iconProvider) && (
                          <Icon name={post.category.iconName} provider={mapIconProvider(post.category.iconProvider)!} className="text-current" />
                        )}
                        {post.category.name[locale]}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                    <Link href={`/blog/${post.slug}`}>
                      {post.title[locale]}
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {post.excerpt && (
                    <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 text-sm">
                      {truncateText(stripHtml(post.excerpt[locale]))}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Icon name="Calendar" provider="lu" className="h-3 w-3" />
                        {formatDate(post.publishedAt, { locale })}
                      </div>
                      <div className="flex items-center gap-1">
                        <Icon name="Eye" provider="lu" className="h-3 w-3" />
                        {post.viewCount}
                      </div>
                    </div>
                    <Link href={`/blog/${post.slug}`}>
                      <Button variant="ghost" size="sm" className="p-0 h-auto">
                        <Icon name="ArrowRight" provider="lu" className="h-3 w-3" />
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
      {newsletterStatus?.enabled && (
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
      )}

      {postData && postData.id && (
        <CommentsSection postId={postData.id} />
      )}
    </div>
  );
} 