"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { useTranslations } from "next-intl";
import { Icon } from '@/components/icon';
import { toast } from "sonner";
import CommentForm from "./comment-form";
import CommentItem from "./comment-item";
import type { Comment, CommentFormData } from "./types";

interface CommentsSectionProps {
  postId: string;
}

export default function CommentsSection({ postId }: CommentsSectionProps) {
  const t = useTranslations();
  const queryClient = useQueryClient();
  
  if (!postId || typeof postId !== 'string' || postId.trim() === '') {
    return (
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Icon name="MessageCircle" provider="lu" className="text-red-600 dark:text-red-400" />
          {t('comments.title')}
        </h2>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>{t('comments.loadError')}</p>
        </div>
      </div>
    );
  }
  
  const [formData, setFormData] = useState<CommentFormData>({
    authorName: '',
    authorEmail: '',
    authorWebsite: '',
    content: '',
    turnstileToken: ''
  });
  
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<CommentFormData>>({});

  const { data: comments = [], isLoading } = useQuery(
    trpc.comments.getApprovedComments.queryOptions({ postId })
  );

  const addCommentMutation = useMutation(
    trpc.comments.createComment.mutationOptions({
      onSuccess: () => {
        toast.success(t('comments.form.success'));
        setFormData({ authorName: '', authorEmail: '', authorWebsite: '', content: '', turnstileToken: '' });
        setReplyingTo(null);
        setErrors({});
        queryClient.invalidateQueries({ queryKey: ['comments', 'getApprovedComments'] });
      },
      onError: (error) => {
        toast.error(t('comments.form.error'));
        console.error('Error adding comment:', error);
      }
    })
  );

  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<CommentFormData> = {};

    if (!formData.authorName.trim()) {
      newErrors.authorName = t('components.validation.required');
    }

    if (!formData.authorEmail.trim()) {
      newErrors.authorEmail = t('components.validation.required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.authorEmail)) {
      newErrors.authorEmail = t('components.validation.invalid');
    }

    if (formData.authorWebsite && !/^https?:\/\/.+/.test(formData.authorWebsite)) {
      newErrors.authorWebsite = t('components.validation.invalidUrl');
    }

    if (!formData.content.trim()) {
      newErrors.content = t('components.validation.required');
    } else if (formData.content.trim().length < 10) {
      newErrors.content = t('components.validation.minLength', { min: 10 });
    }

    if (!formData.turnstileToken) {
      newErrors.turnstileToken = t('components.validation.turnstileRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, t]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    addCommentMutation.mutate({
      postId,
      parentId: replyingTo || undefined,
      authorName: formData.authorName,
      authorEmail: formData.authorEmail,
      authorWebsite: formData.authorWebsite || undefined,
      content: formData.content,
      turnstileToken: formData.turnstileToken,
    });
  }, [validateForm, addCommentMutation, postId, replyingTo, formData]);

  const handleInputChange = useCallback((field: keyof CommentFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const handleCancelReply = useCallback(() => {
    setReplyingTo(null);
  }, []);

  const handleReplyClick = useCallback((commentId: string) => {
    setReplyingTo(replyingTo === commentId ? null : commentId);
  }, [replyingTo]);

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100 flex items-center gap-2">
        <Icon name="MessageCircle" provider="lu" className="text-red-600 dark:text-red-400" />
        {t('comments.title')} ({comments.length})
      </h2>
      
      {isLoading ? (
        <div className="text-center py-6">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{t('common.loading')}</p>
        </div>
      ) : comments.length > 0 ? (
        <div className="mb-6 space-y-4">
          {comments.map((comment) => (
            <CommentItem 
              key={comment.id} 
              comment={comment}
              replyingTo={replyingTo}
              onReplyClick={handleReplyClick}
              formData={formData}
              errors={errors}
              onInputChange={handleInputChange}
              onSubmit={handleSubmit}
              onCancelReply={handleCancelReply}
              isSubmitting={addCommentMutation.isPending}
              t={t}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-gray-500 dark:text-gray-400">
          <Icon name="MessageCircle" provider="lu" className="mx-auto mb-3 opacity-50" />
          <p className="text-sm">{t('comments.noComments')}</p>
        </div>
      )}
      
      {!replyingTo && (
        <CommentForm 
          formData={formData}
          errors={errors}
          onInputChange={handleInputChange}
          onSubmit={handleSubmit}
          isSubmitting={addCommentMutation.isPending}
          t={t}
        />
      )}
    </div>
  );
} 