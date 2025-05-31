"use client";

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';
import { trpc } from '@/utils/trpc';
import { toast } from 'sonner';

export default function NewsletterConfirmClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const t = useTranslations();
  const locale = useLocale();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  const confirmMutation = useMutation(
    trpc.newsletter.confirmSubscription.mutationOptions({
      onSuccess: (data: any) => {
        setStatus('success');
        setMessage(data.message);
        toast.success(data.message);
      },
      onError: (error: any) => {
        setStatus('error');
        setMessage(error.message);
        toast.error(error.message);
      },
    })
  );

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      setMessage(
        locale === 'pl' 
          ? 'Brak tokenu potwierdzającego w linku.' 
          : 'Missing confirmation token in the link.'
      );
      return;
    }

    // Confirm subscription automatically
    confirmMutation.mutate({ token });
  }, [searchParams, locale]);

  const handleGoHome = () => {
    router.push(`/${locale}`);
  };

  const handleGoToBlog = () => {
    router.push(`/${locale}/blog`);
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4">
          <img src="/apple-icon.png" alt="BWitek.dev" className="w-12 h-12 mx-auto" />
        </div>
        <CardTitle className="flex items-center justify-center gap-2">
          {status === 'loading' && <Loader2 className="h-5 w-5 animate-spin" />}
          {status === 'success' && <CheckCircle className="h-5 w-5 text-green-500" />}
          {status === 'error' && <XCircle className="h-5 w-5 text-red-500" />}
          
          {status === 'loading' && (
            locale === 'pl' ? 'Potwierdzanie subskrypcji...' : 'Confirming subscription...'
          )}
          {status === 'success' && (
            locale === 'pl' ? 'Subskrypcja potwierdzona!' : 'Subscription confirmed!'
          )}
          {status === 'error' && (
            locale === 'pl' ? 'Błąd potwierdzenia' : 'Confirmation error'
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="text-center space-y-4">
        <p className="text-muted-foreground">
          {message}
        </p>

        {status === 'success' && (
          <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Mail className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800 dark:text-green-200">
                {locale === 'pl' ? 'Wszystko gotowe!' : 'All set!'}
              </span>
            </div>
            <p className="text-xs text-green-700 dark:text-green-300">
              {locale === 'pl' 
                ? 'Będziesz otrzymywać powiadomienia o nowych artykułach na BWitek.dev'
                : 'You will receive notifications about new articles on BWitek.dev'
              }
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-xs text-red-700 dark:text-red-300">
              {locale === 'pl' 
                ? 'Spróbuj zapisać się ponownie na stronie newslettera.'
                : 'Try subscribing again on the newsletter page.'
              }
            </p>
          </div>
        )}

        <div className="flex gap-2 pt-4">
          <Button 
            variant="outline" 
            onClick={handleGoHome}
            className="flex-1"
          >
            {locale === 'pl' ? 'Strona główna' : 'Home'}
          </Button>
          <Button 
            onClick={handleGoToBlog}
            className="flex-1"
          >
            {locale === 'pl' ? 'Blog' : 'Blog'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 