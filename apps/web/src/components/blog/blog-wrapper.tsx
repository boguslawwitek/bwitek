"use client";

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icon } from '@/components/icon';
import { Link } from '@/i18n/navigation';
import { useQuery } from '@tanstack/react-query';
import { trpc } from '@/utils/trpc';
import NewsletterSignup from '@/components/newsletter-signup';
import type { Locale, BlogCategory, BlogPost } from '@/lib/types';
import { mapIconProvider } from '@/lib/types';
import { getFullImageUrl } from '@/lib/url';
import { stripHtml, truncateText } from '@/lib/text';
import { formatDate } from '@/lib/format';

interface BlogPageClientProps {
  locale: Locale;
  blogData: any;
  categoriesData: BlogCategory[];
  postsData: BlogPost[];
}

export default function BlogPageClient({
  locale,
  blogData,
  categoriesData,
  postsData
}: BlogPageClientProps) {
  const t = useTranslations();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: newsletterStatus } = useQuery(
    trpc.getNewsletterStatus.queryOptions()
  );

  const filteredPosts = postsData.filter(post => {
    const matchesSearch = !searchTerm ||
      post.title[locale].toLowerCase().includes(searchTerm.toLowerCase()) ||
      (post.excerpt?.[locale] || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = !selectedCategory || post.category?.id === selectedCategory;

    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    const dateA = new Date(a.publishedAt || '').getTime();
    const dateB = new Date(b.publishedAt || '').getTime();
    return dateB - dateA;
  });

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 md:px-24 py-8 sm:py-12">
      <section className="mb-8 sm:mb-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {t('blog.title')}
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400">
              {t('blog.subtitle')}
            </p>
          </div>
          <div className="flex items-center">
            <Button asChild variant="secondary" size="sm">
              <a
                href={`${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'}/rss/${locale}.xml`}
                target="_blank"
                rel="noopener noreferrer"
                title={locale === 'pl' ? 'RSS Feed Bloga' : 'Blog RSS Feed'}
                className="flex items-center gap-2"
              >
                <Icon name="Rss" provider="lu" className="h-4 w-4" />
                {t('blog.rssFeed')}
              </a>
            </Button>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <div className="flex flex-col gap-4 mb-6">
          <div className="relative">
            <Icon name="Search" provider="lu" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder={t('blog.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {categoriesData.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
              className="w-full sm:w-auto"
            >
              {t('blog.allCategories')}
            </Button>
            {categoriesData
              .filter(category => category.isActive)
              .sort((a, b) => a.order - b.order)
              .map(category => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="flex items-center gap-2 w-full sm:w-auto"
                >
                  {category.iconName && mapIconProvider(category.iconProvider) && (
                    <Icon name={category.iconName} provider={mapIconProvider(category.iconProvider)!} className="text-current" />
                  )}
                  {category.name[locale]}
                </Button>
              ))
            }
          </div>
        )}
      </section>

      <section>
        {filteredPosts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                {t('blog.noArticlesFound')}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map(post => (
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
                      <Badge variant="secondary">
                        {t('blog.featured')}
                      </Badge>
                    )}
                    {post.category && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        {post.category.iconName && mapIconProvider(post.category.iconProvider) && (
                          <Icon name={post.category.iconName} provider={mapIconProvider(post.category.iconProvider)!} className="text-current" />
                        )}
                        {post.category.name[locale]}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                    <Link href={`/blog/${post.slug}`}>
                      {post.title[locale]}
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {post.excerpt && (
                    <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                      {truncateText(stripHtml(post.excerpt[locale]))}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Icon name="Calendar" provider="lu" className="h-4 w-4" />
                        {formatDate(post.publishedAt, { locale })}
                      </div>
                      <div className="flex items-center gap-1">
                        <Icon name="Eye" provider="lu" className="h-4 w-4" />
                        {post.viewCount}
                      </div>
                    </div>
                    <Link href={`/blog/${post.slug}`}>
                      <Button variant="ghost" size="sm" className="p-0 h-auto shrink-0">
                        <Icon name="ArrowRight" provider="lu" className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Newsletter Signup */}
      {newsletterStatus?.enabled && (
        <section className="mt-16 py-12 bg-muted/30 rounded-lg">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">
              {t('newsletter.blogSectionTitle')}
            </h2>
            <p className="text-muted-foreground">
              {t('newsletter.blogSectionDescription')}
            </p>
          </div>
          <div className="max-w-md mx-auto">
            <NewsletterSignup
              source="blog"
              minimal={true}
              showLanguageSelector={true}
            />
          </div>
        </section>
      )}
    </div>
  );
}
