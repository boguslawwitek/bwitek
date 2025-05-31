"use client";
import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/utils/trpc";
import { toast } from "sonner";
import { Mail, Loader2 } from "lucide-react";

interface NewsletterSignupProps {
  source?: 'blog' | 'article' | 'manual';
  compact?: boolean;
  minimal?: boolean;
  showLanguageSelector?: boolean;
}

export default function NewsletterSignup({ 
  source = 'blog', 
  compact = false,
  minimal = false,
  showLanguageSelector = false 
}: NewsletterSignupProps) {
  const t = useTranslations();
  const currentLocale = useLocale() as 'pl' | 'en';
  
  const [email, setEmail] = useState('');
  const [language, setLanguage] = useState<'pl' | 'en'>(currentLocale);
  const [gdprConsent, setGdprConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subscribeMutation = useMutation(
    trpc.newsletter.subscribe.mutationOptions({
      onSuccess: (data) => {
        toast.success(data.message);
        setEmail('');
        setGdprConsent(false);
      },
      onError: (error) => {
        toast.error(error.message);
      },
      onSettled: () => {
        setIsSubmitting(false);
      },
    })
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error(t('validation.required'));
      return;
    }
    
    if (!gdprConsent) {
      toast.error(t('newsletter.gdprConsentError'));
      return;
    }

    setIsSubmitting(true);
    subscribeMutation.mutate({
      email: email.trim(),
      language,
      gdprConsent,
      source,
    });
  };

  if (minimal) {
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              type="email"
              placeholder={t('newsletter.emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          {showLanguageSelector && (
            <div className="sm:w-32">
              <Select value={language} onValueChange={(value: 'pl' | 'en') => setLanguage(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pl">{t('newsletter.languages.polish')}</SelectItem>
                  <SelectItem value="en">{t('newsletter.languages.english')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <Button 
            type="submit" 
            disabled={isSubmitting || !email.trim() || !gdprConsent}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('newsletter.subscribing')}
              </>
            ) : (
              t('newsletter.subscribeShort')
            )}
          </Button>
        </div>
        <div className="flex items-start space-x-2">
          <Checkbox
            id="gdpr-minimal"
            checked={gdprConsent}
            onCheckedChange={(checked) => setGdprConsent(checked as boolean)}
            required
          />
          <Label htmlFor="gdpr-minimal" className="text-xs leading-relaxed inline-flex flex-wrap items-baseline">
            <span>
              {t('newsletter.gdprConsent')}{' '}
              <Link href="/privacy-policy" className="text-primary hover:underline inline">
                {t('newsletter.privacyPolicy')}
              </Link>
              .
            </span>
          </Label>
        </div>
      </form>
    );
  }

  if (compact) {
    return (
      <div className="bg-muted/50 p-4 rounded-lg border">
        <div className="flex items-center gap-2 mb-3">
          <Mail className="h-4 w-4 text-primary" />
          <span className="font-medium text-sm">
            {t('newsletter.title')}
          </span>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            type="email"
            placeholder={t('newsletter.emailPlaceholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="text-sm"
          />
          {showLanguageSelector && (
            <Select value={language} onValueChange={(value: 'pl' | 'en') => setLanguage(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pl">{t('newsletter.languages.polish')}</SelectItem>
                <SelectItem value="en">{t('newsletter.languages.english')}</SelectItem>
              </SelectContent>
            </Select>
          )}
          <div className="flex items-start space-x-2">
            <Checkbox
              id="gdpr-compact"
              checked={gdprConsent}
              onCheckedChange={(checked) => setGdprConsent(checked as boolean)}
              required
            />
            <Label htmlFor="gdpr-compact" className="text-xs leading-relaxed inline-flex flex-wrap items-baseline">
              <span>
                {t('newsletter.gdprConsent')}{' '}
                <Link href="/privacy-policy" className="text-primary hover:underline inline">
                  {t('newsletter.privacyPolicy')}
                </Link>
                .
              </span>
            </Label>
          </div>
          <Button 
            type="submit" 
            disabled={isSubmitting || !email.trim() || !gdprConsent}
            className="w-full"
            size="sm"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                {t('newsletter.subscribing')}
              </>
            ) : (
              t('newsletter.subscribeShort')
            )}
          </Button>
        </form>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">
            {t('newsletter.title')}
          </CardTitle>
        </div>
        <CardDescription>
          {t('newsletter.description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">
              {t('newsletter.email')}
            </Label>
            <Input
              id="email"
              type="email"
              placeholder={t('newsletter.emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {showLanguageSelector && (
            <div className="space-y-2">
              <Label htmlFor="language">
                {t('newsletter.language')}
              </Label>
              <Select value={language} onValueChange={(value: 'pl' | 'en') => setLanguage(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pl">{t('newsletter.languages.polish')}</SelectItem>
                  <SelectItem value="en">{t('newsletter.languages.english')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex items-start space-x-2">
            <Checkbox
              id="gdpr"
              checked={gdprConsent}
              onCheckedChange={(checked) => setGdprConsent(checked as boolean)}
              required
            />
            <Label htmlFor="gdpr" className="text-sm leading-relaxed inline-flex flex-wrap items-baseline">
              <span>
                {t('newsletter.gdprConsent')}{' '}
                <Link href="/privacy-policy" className="text-primary hover:underline inline">
                  {t('newsletter.privacyPolicy')}
                </Link>
              .
              </span>
            </Label>
          </div>

          <Button 
            type="submit" 
            disabled={isSubmitting || !email.trim() || !gdprConsent}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('newsletter.subscribing')}
              </>
            ) : (
              t('newsletter.subscribe')
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}