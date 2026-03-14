export type Locale = 'pl' | 'en';

export type Translation = Record<Locale, string>;

export const localeToBCP47: Record<Locale, string> = {
  pl: 'pl-PL',
  en: 'en-US',
};

export interface BlogCategory {
  id: string;
  name: Translation;
  slug: string;
  description?: Translation;
  iconName?: string;
  iconProvider?: string;
  order: number;
  isActive: boolean;
}

export interface BlogPost {
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

export function mapIconProvider(provider: string | null | undefined): 'lu' | 'si' | null {
  if (provider === 'lucide') return 'lu';
  if (provider === 'simple-icons') return 'si';
  return null;
}
