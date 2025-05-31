import { Suspense } from 'react';
import type { Metadata } from "next";
import NewsletterUnsubscribeClient from '@/components/newsletter-unsubscribe-client';

export const metadata: Metadata = {
  title: "Wypisz się z newslettera - BWitek.dev",
  description: "Wypisz się z newslettera BWitek.dev",
};

export default function NewsletterUnsubscribePage() {
  return (
    <div className="container mx-auto py-12">
      <Suspense fallback={
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      }>
        <NewsletterUnsubscribeClient />
      </Suspense>
    </div>
  );
} 