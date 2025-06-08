"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { trpc } from "@/utils/trpc";
import { toast } from "sonner";
import { Icon } from '@/components/icon';

export default function NewsletterNotifications() {
  const t = useTranslations();
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<'pl' | 'en' | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch data
  const { data: articles, isLoading: articlesLoading } = useQuery(
    trpc.blog.getBlogPosts.queryOptions({
      published: true,
      limit: 50,
    })
  );

  const { data: stats, refetch: refetchStats } = useQuery(
    trpc.newsletter.getStats.queryOptions()
  );

  const sendNewsletterMutation = useMutation(
    trpc.newsletter.sendNewsletter.mutationOptions({
      onSuccess: (data) => {
        const languageKey = data.language === 'pl' ? 'polish' : 'english';
        const message = t('newsletter.admin.send.successMessage', {
          count: data.recipientCount,
          language: t(`newsletter.admin.send.${languageKey}`)
        });
        
        toast.success(message);
        setIsConfirmModalOpen(false);
        setSelectedArticle(null);
        setSelectedLanguage(null);
        refetchStats();
      },
      onError: (error) => {
        toast.error(error.message);
      },
      onSettled: () => {
        setIsProcessing(false);
      },
    })
  );

  const handleSendNewsletter = () => {
    if (!selectedArticle || !selectedLanguage) {
      toast.error(t('newsletter.admin.send.selectArticleFirst'));
      return;
    }

    setIsProcessing(true);
    sendNewsletterMutation.mutate({
      articleId: selectedArticle,
      language: selectedLanguage,
    });
  };

  const openConfirmModal = (language: 'pl' | 'en') => {
    if (!selectedArticle) {
      toast.error(t('newsletter.admin.send.selectArticleFirst'));
      return;
    }
    setSelectedLanguage(language);
    setIsConfirmModalOpen(true);
  };

  const getSubscriberCount = (language: 'pl' | 'en') => {
    if (!stats) return 0;
    return language === 'pl' ? stats.polish.count : stats.english.count;
  };

  const selectedArticleData = articles?.find(post => post.id === selectedArticle);

  return (
    <div className="space-y-6">
      {/* Newsletter Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Users" provider="lu" className="h-5 w-5" />
            {t('newsletter.admin.stats.title')}
          </CardTitle>
          <CardDescription>
            {t('newsletter.admin.stats.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stats ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.polish.count}
                </div>
                <div className="text-sm text-muted-foreground">{t('newsletter.admin.stats.polish')}</div>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {stats.english.count}
                </div>
                <div className="text-sm text-muted-foreground">{t('newsletter.admin.stats.english')}</div>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {stats.total.count}
                </div>
                <div className="text-sm text-muted-foreground">{t('newsletter.admin.stats.total')}</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Icon name="Loader" provider="lu" className="h-6 w-6 animate-spin mx-auto mb-2" />
              <p className="text-muted-foreground">{t('newsletter.admin.stats.loading')}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Send Newsletter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Send" provider="lu" className="h-5 w-5" />
            {t('newsletter.admin.send.title')}
          </CardTitle>
          <CardDescription>
            {t('newsletter.admin.send.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="article-select">{t('newsletter.admin.send.selectArticle')}</Label>
            <Select
              value={selectedArticle || ""}
              onValueChange={(value) => setSelectedArticle(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('newsletter.admin.send.articlePlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {articlesLoading ? (
                  <div className="p-2 text-center">
                    <Icon name="Loader" provider="lu" className="h-4 w-4 animate-spin mx-auto" />
                  </div>
                ) : (
                  articles?.map((post) => {
                    const title = typeof post.title === 'string' ? JSON.parse(post.title) : post.title;
                    return (
                    <SelectItem key={post.id} value={post.id}>
                      <div className="flex flex-col items-start">
                        <span className="font-medium">
                            {title?.pl || title?.en || t('common.untitled')}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {post.publishedAt 
                            ? new Date(post.publishedAt).toLocaleDateString()
                              : t('common.draft')
                          }
                        </span>
                      </div>
                    </SelectItem>
                    );
                  })
                )}
              </SelectContent>
            </Select>
          </div>

          {selectedArticleData && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">{t('newsletter.admin.send.preview')}</h4>
              <div className="space-y-1 text-sm">
                {(() => {
                  const title = typeof selectedArticleData.title === 'string' 
                    ? JSON.parse(selectedArticleData.title) 
                    : selectedArticleData.title;
                  return (
                    <>
                      <p><strong>{t('newsletter.admin.send.polishTitle')}</strong> {title?.pl || t('newsletter.admin.send.notAvailable')}</p>
                      <p><strong>{t('newsletter.admin.send.englishTitle')}</strong> {title?.en || t('newsletter.admin.send.notAvailable')}</p>
                      <p><strong>{t('newsletter.admin.send.slug')}</strong> {selectedArticleData.slug}</p>
                      <p><strong>{t('newsletter.admin.send.status')}</strong> {selectedArticleData.isPublished ? t('newsletter.admin.send.published') : t('newsletter.admin.send.draft')}</p>
                    </>
                  );
                })()}
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <Button
              onClick={() => openConfirmModal('pl')}
              disabled={!selectedArticle || isProcessing}
              className="flex-1"
              variant="default"
            >
              <Icon name="Mail" provider="lu" className="mr-2 h-4 w-4" />
              {t('newsletter.admin.send.sendToPolish')} ({getSubscriberCount('pl')})
            </Button>
            <Button
              onClick={() => openConfirmModal('en')}
              disabled={!selectedArticle || isProcessing}
              className="flex-1"
              variant="default"
            >
              <Icon name="Mail" provider="lu" className="mr-2 h-4 w-4" />
              {t('newsletter.admin.send.sendToEnglish')} ({getSubscriberCount('en')})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Modal */}
      <Dialog open={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon name="AlertTriangle" provider="lu" className="h-5 w-5 text-yellow-500" />
              {t('newsletter.admin.send.confirmTitle')}
            </DialogTitle>
            <DialogDescription>
              {t('newsletter.admin.send.confirmDescription')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              {(() => {
                const title = selectedArticleData?.title 
                  ? (typeof selectedArticleData.title === 'string' 
                      ? JSON.parse(selectedArticleData.title) 
                      : selectedArticleData.title)
                  : null;
                return (
                  <>
              <p className="text-sm">
                      <strong>{t('newsletter.admin.send.confirmDetails.article')}</strong> {title?.[selectedLanguage!] || title?.pl || t('common.untitled')}
              </p>
              <p className="text-sm mt-1">
                      <strong>{t('newsletter.admin.send.confirmDetails.language')}</strong> {selectedLanguage === 'pl' ? t('newsletter.languages.polish') : t('newsletter.languages.english')}
              </p>
              <p className="text-sm mt-1">
                      <strong>{t('newsletter.admin.send.confirmDetails.recipients')}</strong> {selectedLanguage ? getSubscriberCount(selectedLanguage) : 0} {t('newsletter.admin.send.confirmDetails.subscribers')}
              </p>
                  </>
                );
              })()}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsConfirmModalOpen(false)}
              disabled={isProcessing}
            >
              {t('newsletter.admin.send.cancel')}
            </Button>
            <Button
              onClick={handleSendNewsletter}
              disabled={isProcessing}
              className="bg-red-600 hover:bg-red-700"
            >
              {isProcessing ? (
                <>
                  <Icon name="Loader" provider="lu" className="mr-2 h-4 w-4 animate-spin" />
                  {t('newsletter.admin.send.sending')}
                </>
              ) : (
                <>
                  <Icon name="Send" provider="lu" className="mr-2 h-4 w-4" />
                  {t('newsletter.admin.send.confirm')}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}