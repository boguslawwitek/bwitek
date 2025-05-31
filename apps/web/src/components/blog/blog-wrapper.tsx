"use client";

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Eye, Search, Tag, ArrowRight, Rss } from "lucide-react";
import { Link } from '@/i18n/navigation';
import * as LucideIcons from 'lucide-react';
import * as SimpleIcons from '@icons-pack/react-simple-icons';
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

interface BlogPageClientProps {
  locale: string;
  blogData: any;
  categoriesData: BlogCategory[];
  postsData: BlogPost[];
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

export default function BlogPageClient({ 
  locale, 
  blogData, 
  categoriesData, 
  postsData 
}: BlogPageClientProps) {
  const t = useTranslations();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredPosts = postsData.filter(post => {
    const matchesSearch = !searchTerm || 
      post.title[locale as 'pl' | 'en'].toLowerCase().includes(searchTerm.toLowerCase()) ||
      (post.excerpt?.[locale as 'pl' | 'en'] || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !selectedCategory || post.category?.id === selectedCategory;
    
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    const dateA = new Date(a.publishedAt || '').getTime();
    const dateB = new Date(b.publishedAt || '').getTime();
    return dateB - dateA;
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString(locale === 'pl' ? 'pl-PL' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const truncateText = (text: string, maxLength: number = 150) => {
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

  return (
    <div className="max-w-screen-xl mx-auto px-6 md:px-24 py-12">
      <section className="mb-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {t('blog.title')}
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
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
                <Rss className="h-4 w-4" />
                {t('blog.rssFeed')}
              </a>
            </Button>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
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
                  className="flex items-center gap-2"
                >
                  {getIcon(category.iconName, category.iconProvider, 14)}
                  {category.name[locale as 'pl' | 'en']}
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
                      alt={post.title[locale as 'pl' | 'en']}
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
                        {getIcon(post.category.iconName, post.category.iconProvider, 12)}
                        {post.category.name[locale as 'pl' | 'en']}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                    <Link href={`/blog/${post.slug}`}>
                      {post.title[locale as 'pl' | 'en']}
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {post.excerpt && (
                    <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                      {truncateText(stripHtml(post.excerpt[locale as 'pl' | 'en']))}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(post.publishedAt)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {post.viewCount}
                      </div>
                    </div>
                    <Link href={`/blog/${post.slug}`}>
                      <Button variant="ghost" size="sm" className="p-0 h-auto">
                        <ArrowRight className="h-4 w-4" />
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
    </div>
  );
} 