"use client";

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { trpc } from '@/utils/trpc';
import { toast } from 'sonner';

const unsubscribeReasons = [
  'too_frequent',
  'not_relevant',
  'never_subscribed', 
  'poor_content',
  'technical_issues',
  'other'
] as const;

type UnsubscribeReason = typeof unsubscribeReasons[number];

export default function NewsletterUnsubscribeClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const t = useTranslations('newsletter.unsubscribe');
  const locale = useLocale() as 'pl' | 'en';
  
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [reason, setReason] = useState<UnsubscribeReason | ''>('');
  const [feedback, setFeedback] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const unsubscribeMutation = useMutation(
    trpc.newsletter.unsubscribeWithFeedback.mutationOptions({
      onSuccess: (data: any) => {
        setIsSubmitted(true);
        toast.success(data.message);
      },
      onError: (error: any) => {
        toast.error(error.message);
      },
    })
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error(t('emailRequired'));
      return;
    }

    // If reason is provided, it must be valid. If not provided, use 'other' as default
    const finalReason = reason || 'other';

    unsubscribeMutation.mutate({
      email: email.trim(),
      reason: finalReason as UnsubscribeReason,
      feedback: feedback.trim() || undefined,
      language: locale,
    });
  };

  const handleGoHome = () => {
    router.push(`/${locale}`);
  };

  const handleGoToBlog = () => {
    router.push(`/${locale}/blog`);
  };

  if (isSubmitted) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <img src="/apple-icon.png" alt="BWitek.dev" className="w-12 h-12 mx-auto" />
          </div>
          <CardTitle className="flex items-center justify-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            {t('successTitle')}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            {t('successMessage')}
          </p>

          <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <p className="text-xs text-green-700 dark:text-green-300">
              {t('feedbackNote')}
            </p>
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              variant="outline" 
              onClick={handleGoHome}
              className="flex-1"
            >
              {t('home')}
            </Button>
            <Button 
              onClick={handleGoToBlog}
              className="flex-1"
            >
              {t('blog')}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4">
          <img src="/apple-icon.png" alt="BWitek.dev" className="w-12 h-12 mx-auto" />
        </div>
        <CardTitle>
          {t('title')}
        </CardTitle>
        <p className="text-muted-foreground text-sm">
          {t('subtitle')}
        </p>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">
              {t('emailAddress')}
            </Label>
            <Input
              id="email"
              type="email"
              placeholder={t('emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>
              {t('reason')}
            </Label>
            <RadioGroup value={reason} onValueChange={(value: UnsubscribeReason) => setReason(value)}>
              {unsubscribeReasons.map((reasonKey) => (
                <div key={reasonKey} className="flex items-center space-x-2">
                  <RadioGroupItem value={reasonKey} id={reasonKey} />
                  <Label 
                    htmlFor={reasonKey} 
                    className="text-sm font-normal cursor-pointer"
                  >
                    {t(`reasons.${reasonKey}`)}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {reason === 'other' && (
            <div className="space-y-2">
              <Label htmlFor="feedback">
                {t('feedback')}
              </Label>
              <Textarea
                id="feedback"
                placeholder={t('feedbackPlaceholder')}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={3}
              />
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button 
              variant="outline" 
              type="button"
              onClick={handleGoHome}
              className="flex-1"
            >
              {t('cancel')}
            </Button>
            <Button 
              type="submit" 
              disabled={unsubscribeMutation.isPending || !email.trim()}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              {unsubscribeMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('unsubscribing')}
                </>
              ) : (
                t('unsubscribeAction')
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 