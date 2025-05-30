"use client";
import { trpc } from "@/utils/trpc";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PrivacyPolicyClientWrapperProps {
  locale: string;
}

export default function PrivacyPolicyClientWrapper({ locale }: PrivacyPolicyClientWrapperProps) {
  const t = useTranslations();
  
  const privacyPolicy = useQuery(trpc.content.getPrivacyPolicy.queryOptions());

  if (privacyPolicy.isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded w-5/6"></div>
              <div className="h-4 bg-muted rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (privacyPolicy.isError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">
                {t("common.errorLoadingContent")}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const content = privacyPolicy.data?.content?.[locale as 'pl' | 'en'];

  if (!content) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">
                {locale === 'pl' ? 'Polityka prywatności nie jest jeszcze dostępna.' : 'Privacy policy is not yet available.'}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold">
              {locale === 'pl' ? 'Polityka Prywatności' : 'Privacy Policy'}
            </CardTitle>
            {privacyPolicy.data?.lastUpdated && (
              <p className="text-sm text-muted-foreground">
                {locale === 'pl' ? 'Ostatnia aktualizacja: ' : 'Last updated: '}
                {new Date(privacyPolicy.data.lastUpdated).toLocaleDateString(
                  locale === 'pl' ? 'pl-PL' : 'en-US',
                  {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }
                )}
              </p>
            )}
          </CardHeader>
          <CardContent className="p-6 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mt-6 [&_h1]:mb-4 [&_h1]:leading-tight [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-5 [&_h2]:mb-3 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2 [&_h4]:text-base [&_h4]:font-semibold [&_h4]:mt-3 [&_h4]:mb-2 [&_h5]:text-sm [&_h5]:font-semibold [&_h5]:mt-3 [&_h5]:mb-2 [&_h6]:text-xs [&_h6]:font-semibold [&_h6]:mt-3 [&_h6]:mb-2 [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono [&_blockquote]:border-l-4 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:my-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground [&_ul]:pl-6 [&_ul]:my-2 [&_ol]:pl-6 [&_ol]:my-2 [&_li]:my-1 [&_p]:my-2 [&_p]:leading-relaxed [&_strong]:font-semibold [&_em]:italic [&_a]:text-primary [&_a]:underline [&_a:hover]:no-underline [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_img]:my-2">
            <div dangerouslySetInnerHTML={{ __html: content }} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}