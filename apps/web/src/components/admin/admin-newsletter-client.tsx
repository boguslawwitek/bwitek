"use client";
import { useTranslations } from "next-intl";
import NewsletterNotifications from "./newsletter-notifications";

export default function AdminNewsletterClient() {
  const t = useTranslations();
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('newsletter.admin.title')}</h1>
        <p className="text-muted-foreground">
          {t('newsletter.admin.description')}
        </p>
      </div>
      
      <NewsletterNotifications />
    </div>
  );
}