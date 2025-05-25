"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle } from "lucide-react";
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
  return (
    <Card className={`${isReply ? 'border border-red-200 dark:border-red-800 py-0' : 'border border-gray-200 dark:border-gray-800 py-0'}`}>
      <CardContent className="p-6">
        {!isReply && (
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <MessageCircle size={18} className="text-red-600 dark:text-red-400" />
            {t('comments.addComment')}
          </h2>
        )}
        
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="authorName">{t('comments.form.name')} *</Label>
              <Input
                id="authorName"
                value={formData.authorName}
                onChange={(e) => onInputChange('authorName', e.target.value)}
                className={errors.authorName ? 'border-red-500' : ''}
                placeholder={t('comments.form.namePlaceholder')}
              />
              {errors.authorName && (
                <p className="text-sm text-red-500">{errors.authorName}</p>
              )}
            </div>
            
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="authorEmail">{t('comments.form.email')} *</Label>
              <Input
                id="authorEmail"
                type="email"
                value={formData.authorEmail}
                onChange={(e) => onInputChange('authorEmail', e.target.value)}
                className={errors.authorEmail ? 'border-red-500' : ''}
                placeholder={t('comments.form.emailPlaceholder')}
              />
              {errors.authorEmail && (
                <p className="text-sm text-red-500">{errors.authorEmail}</p>
              )}
            </div>
          </div>
          
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="authorWebsite">{t('comments.form.website')}</Label>
            <Input
              id="authorWebsite"
              value={formData.authorWebsite}
              onChange={(e) => onInputChange('authorWebsite', e.target.value)}
              className={errors.authorWebsite ? 'border-red-500' : ''}
              placeholder={t('comments.form.websitePlaceholder')}
            />
            {errors.authorWebsite && (
              <p className="text-sm text-red-500">{errors.authorWebsite}</p>
            )}
          </div>
          
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="content">{t('comments.form.content')} *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => onInputChange('content', e.target.value)}
              className={`min-h-[120px] ${errors.content ? 'border-red-500' : ''}`}
              placeholder={t('comments.form.contentPlaceholder')}
            />
            {errors.content && (
              <p className="text-sm text-red-500">{errors.content}</p>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className={`bg-red-600 hover:bg-red-700 text-white ${isReply ? '' : 'w-full'}`}
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
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded text-sm text-red-700 dark:text-red-300">
            {t('comments.moderationNotice')}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 