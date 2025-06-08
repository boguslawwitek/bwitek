"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from '@/components/icon';
import { TurnstileWrapper, type TurnstileRef } from "@/components/turnstile";
import { useRef } from "react";
import type { CommentFormData } from "./types";

interface CommentFormProps {
  isReply?: boolean;
  formData: CommentFormData;
  errors: Partial<CommentFormData>;
  onInputChange: (field: keyof CommentFormData, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel?: () => void;
  isSubmitting: boolean;
  t: any;
}

export default function CommentForm({ 
  isReply = false, 
  formData, 
  errors, 
  onInputChange, 
  onSubmit, 
  onCancel, 
  isSubmitting, 
  t 
}: CommentFormProps) {
  const turnstileRef = useRef<TurnstileRef>(null);

  const handleTurnstileVerify = (token: string) => {
    onInputChange('turnstileToken', token);
  };

  const handleTurnstileError = () => {
    onInputChange('turnstileToken', '');
  };
  return (
    <Card className={`${isReply ? 'border border-rose-200 dark:border-rose-800 py-6' : 'border border-gray-200 dark:border-gray-800 py-6'}`}>
      <CardHeader className="flex flex-row items-center gap-2">
        <Icon name="MessageCircle" provider="lu" className="text-rose-600 dark:text-rose-400" />
        <CardTitle>{t('comments.addComment')}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="authorName">{t('comments.form.name')} *</Label>
              <Input
                id="authorName"
                value={formData.authorName}
                onChange={(e) => onInputChange('authorName', e.target.value)}
                className={errors.authorName ? 'border-rose-500' : ''}
                placeholder={t('comments.form.namePlaceholder')}
              />
              {errors.authorName && (
                <p className="text-sm text-rose-500">{errors.authorName}</p>
              )}
            </div>
            
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="authorEmail">{t('comments.form.email')} *</Label>
              <Input
                id="authorEmail"
                type="email"
                value={formData.authorEmail}
                onChange={(e) => onInputChange('authorEmail', e.target.value)}
                className={errors.authorEmail ? 'border-rose-500' : ''}
                placeholder={t('comments.form.emailPlaceholder')}
              />
              {errors.authorEmail && (
                <p className="text-sm text-rose-500">{errors.authorEmail}</p>
              )}
            </div>
          </div>
          
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="authorWebsite">{t('comments.form.website')}</Label>
            <Input
              id="authorWebsite"
              value={formData.authorWebsite}
              onChange={(e) => onInputChange('authorWebsite', e.target.value)}
              className={errors.authorWebsite ? 'border-rose-500' : ''}
              placeholder={t('comments.form.websitePlaceholder')}
            />
            {errors.authorWebsite && (
              <p className="text-sm text-rose-500">{errors.authorWebsite}</p>
            )}
          </div>
          
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="content">{t('comments.form.content')} *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => onInputChange('content', e.target.value)}
              className={`min-h-[120px] ${errors.content ? 'border-rose-500' : ''}`}
              placeholder={t('comments.form.contentPlaceholder')}
            />
            {errors.content && (
              <p className="text-sm text-rose-500">{errors.content}</p>
            )}
          </div>
          
          <div className="grid w-full items-center gap-1.5">
            <TurnstileWrapper
              ref={turnstileRef}
              onVerify={handleTurnstileVerify}
              onError={handleTurnstileError}
              onExpire={handleTurnstileError}
            />
            {errors.turnstileToken && (
              <p className="text-sm text-rose-500">{errors.turnstileToken}</p>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className={`bg-rose-600 hover:bg-rose-700 text-white ${isReply ? '' : 'w-full'}`}
            >
              {isSubmitting ? t('common.saving') : t('comments.form.submit')}
            </Button>
            
            {isReply && onCancel && (
              <Button 
                type="button" 
                variant="outline"
                onClick={onCancel}
              >
                {t('common.cancel')}
              </Button>
            )}
          </div>
        </form>
        
        {!isReply && (
          <div className="mt-4 p-3 bg-rose-50 dark:bg-rose-900/20 rounded text-sm text-rose-700 dark:text-rose-300">
            {t('comments.moderationNotice')}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 