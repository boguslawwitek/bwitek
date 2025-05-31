import { db } from "../db";
import { blogPosts, blogCategories } from "../db/schema/blog";
import { eq, desc, and, inArray } from "drizzle-orm";

interface RSSOptions {
  language: 'pl' | 'en';
  limit?: number;
}

interface BlogPost {
  id: string;
  title: { pl: string; en: string };
  content: { pl: string; en: string };
  excerpt?: { pl: string; en: string };
  slug: string;
  ogImage?: string | null;
  publishedAt?: Date | null;
  category?: {
    name: { pl: string; en: string };
  };
}

export class RSSService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001';
  }

  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').trim();
  }

  private truncateText(text: string, maxLength: number = 400): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  }

  private formatRFC822Date(date: Date): string {
    return date.toUTCString();
  }

  async getLastModified(language: 'pl' | 'en'): Promise<Date> {
    const latestPosts = await db.select({
      updatedAt: blogPosts.updatedAt,
      publishedAt: blogPosts.publishedAt
    }).from(blogPosts)
      .where(eq(blogPosts.isPublished, true))
      .orderBy(desc(blogPosts.updatedAt))
      .limit(1);

    return latestPosts[0]?.updatedAt || new Date();
  }

  generateETag(lastModified: Date, language: string): string {
    return `"${language}-${lastModified.getTime()}"`;
  }

  async generateRSSFeed(options: RSSOptions): Promise<string> {
    const { language, limit = 20 } = options;

    const posts = await db.select().from(blogPosts)
      .where(eq(blogPosts.isPublished, true))
      .orderBy(desc(blogPosts.publishedAt), desc(blogPosts.createdAt))
      .limit(limit);

    const categoryIds = posts.map(p => p.categoryId).filter(Boolean) as string[];
    const categories = categoryIds.length > 0 
      ? await db.select().from(blogCategories).where(inArray(blogCategories.id, categoryIds))
      : [];

    const transformedPosts: BlogPost[] = posts.map(post => {
      const category = categories.find(c => c.id === post.categoryId);
      return {
        ...post,
        title: typeof post.title === 'string' ? JSON.parse(post.title) : post.title,
        content: typeof post.content === 'string' ? JSON.parse(post.content) : post.content,
        excerpt: typeof post.excerpt === 'string' ? JSON.parse(post.excerpt) : post.excerpt,
        category: category ? {
          ...category,
          name: typeof category.name === 'string' ? JSON.parse(category.name) : category.name,
        } : undefined,
      };
    });

    const channelTitle = language === 'pl' 
      ? 'BWitek.dev - Blog o programowaniu' 
      : 'BWitek.dev - Programming Blog';
    
    const channelDescription = language === 'pl'
      ? 'Artykuły o programowaniu, technologii i rozwoju oprogramowania'
      : 'Articles about programming, technology and software development';

    const channelLink = `${this.baseUrl}/${language}/blog`;
    const latestPostDate = transformedPosts[0]?.publishedAt || new Date();

    let rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title><![CDATA[${channelTitle}]]></title>
    <description><![CDATA[${channelDescription}]]></description>
    <link>${channelLink}</link>
    <atom:link href="${this.baseUrl}/rss/${language}.xml" rel="self" type="application/rss+xml"/>
    <language>${language === 'pl' ? 'pl-PL' : 'en-US'}</language>
    <lastBuildDate>${this.formatRFC822Date(latestPostDate)}</lastBuildDate>
    <generator>BWitek.dev RSS Generator</generator>
    <managingEditor>contact@bwitek.dev (Bogusław Witek)</managingEditor>
    <webMaster>contact@bwitek.dev (Bogusław Witek)</webMaster>
    <image>
      <url>${this.baseUrl}/apple-icon.png</url>
      <title><![CDATA[${channelTitle}]]></title>
      <link>${channelLink}</link>
      <width>144</width>
      <height>144</height>
      <description><![CDATA[BWitek.dev Terminal Icon]]></description>
    </image>
    <ttl>60</ttl>
`;

    for (const post of transformedPosts) {
      const title = post.title[language] || post.title.pl || post.title.en;
      const content = post.content[language] || post.content.pl || post.content.en;
      const excerpt = post.excerpt?.[language] || post.excerpt?.pl || post.excerpt?.en;
      
      if (!title || !content) continue;

      const postUrl = `${this.baseUrl}/${language}/blog/${post.slug}`;
      const publishDate = post.publishedAt ? this.formatRFC822Date(post.publishedAt) : this.formatRFC822Date(new Date());
      
      const description = excerpt 
        ? this.truncateText(this.stripHtml(excerpt))
        : this.truncateText(this.stripHtml(content));

      const categoryName = post.category?.name[language] || post.category?.name.pl || '';

      rssXml += `
    <item>
      <title><![CDATA[${this.escapeXml(title)}]]></title>
      <description><![CDATA[${this.escapeXml(description)}]]></description>
      <content:encoded><![CDATA[${content}]]></content:encoded>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <pubDate>${publishDate}</pubDate>`;

      if (categoryName) {
        rssXml += `
      <category><![CDATA[${this.escapeXml(categoryName)}]]></category>`;
      }

      if (post.ogImage) {
        const imageUrl = post.ogImage.startsWith('http') 
          ? post.ogImage 
          : `${this.baseUrl}${post.ogImage.startsWith('/') ? '' : '/'}${post.ogImage}`;
        
        rssXml += `
      <enclosure url="${imageUrl}" type="image/jpeg"/>`;
      }

      rssXml += `
    </item>`;
    }

    rssXml += `
  </channel>
</rss>`;

    return rssXml;
  }
}

export const rssService = new RSSService(); 