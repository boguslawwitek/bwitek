import { Suspense } from 'react';
import type { Metadata } from "next";
import NewsletterConfirmClient from '@/components/newsletter-confirm-client';

export const metadata: Metadata = {
  title: "Potwierdzenie subskrypcji - BWitek.dev",
  description: "Potwierdź subskrypcję newslettera BWitek.dev",
};

export default function NewsletterConfirmPage() {
  return (
    <div className="container mx-auto py-12">
      <Suspense fallback={
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      }>
        <NewsletterConfirmClient />
      </Suspense>
    </div>
  );
} 