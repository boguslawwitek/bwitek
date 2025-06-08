"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Icon } from '@/components/icon';
import CommentForm from "./comment-form";
import type { Comment, CommentFormData } from "./types";

interface CommentItemProps {
  comment: Comment;
  isReply?: boolean;
  replyingTo: string | null;
  onReplyClick: (commentId: string) => void;
  formData: CommentFormData;
  errors: Partial<CommentFormData>;
  onInputChange: (field: keyof CommentFormData, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancelReply: () => void;
  isSubmitting: boolean;
  t: any;
}

export default function CommentItem({ 
  comment, 
  isReply = false, 
  replyingTo, 
  onReplyClick, 
  formData, 
  errors, 
  onInputChange, 
  onSubmit, 
  onCancelReply, 
  isSubmitting, 
  t 
}: CommentItemProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`${isReply ? 'ml-6 mt-3' : 'mb-6'}`}>
      <Card className={`${isReply 
        ? 'border border-rose-200 dark:border-rose-700 py-0' 
        : 'border border-gray-200 dark:border-gray-700 py-0'
      }`}>
        <CardContent className={`${isReply ? 'p-3' : 'p-4'}`}>
          <div className="flex gap-2">
            <div className={`w-8 h-8 ${isReply 
              ? 'bg-rose-50 dark:bg-rose-900/10' 
              : 'bg-rose-100 dark:bg-rose-900/20'
            } rounded-full flex items-center justify-center flex-shrink-0 mt-1`}>
              <Icon name="User" provider="lu" className="text-rose-600 dark:text-rose-400" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`font-medium ${isReply 
                      ? 'text-gray-700 dark:text-gray-300 text-sm' 
                      : 'text-gray-900 dark:text-gray-100'
                    }`}>
                      {comment.authorName}
                    </span>
                    {comment.authorWebsite && (
                      <a 
                        href={comment.authorWebsite} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 transition-colors"
                      >
                        <Icon name="Globe" provider="lu" className="text-rose-600 dark:text-rose-400" />
                      </a>
                    )}
                    {isReply && (
                      <span className="text-xs bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 px-2 py-0.5 rounded-full">
                        {t('comments.reply')}
                      </span>
                    )}
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <Icon name="Calendar" provider="lu" className="text-rose-600 dark:text-rose-400" />
                      {formatDate(comment.createdAt)}
                    </div>
                  </div>
                </div>
                
                {!isReply && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onReplyClick(comment.id)}
                    className="text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors text-sm px-2 py-1 h-auto"
                  >
                    <Icon name="Reply" provider="lu" className="mr-1" />
                    {t('comments.replyButton')}
                  </Button>
                )}
              </div>
              
              <div className={`${isReply 
                ? 'text-gray-700 dark:text-gray-300 text-sm' 
                : 'text-gray-800 dark:text-gray-200'
              } leading-relaxed`}>
                {comment.content.split('\n').map((line, index) => (
                  <p key={index} className={index > 0 ? 'mt-2' : ''}>
                    {line}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3 space-y-3">
          {comment.replies.map((reply) => (
            <CommentItem 
              key={reply.id} 
              comment={reply} 
              isReply={true}
              replyingTo={replyingTo}
              onReplyClick={onReplyClick}
              formData={formData}
              errors={errors}
              onInputChange={onInputChange}
              onSubmit={onSubmit}
              onCancelReply={onCancelReply}
              isSubmitting={isSubmitting}
              t={t}
            />
          ))}
        </div>
      )}
      
      {replyingTo === comment.id && (
        <div className="mt-4 ml-6">
          <CommentForm 
            isReply={true}
            formData={formData}
            errors={errors}
            onInputChange={onInputChange}
            onSubmit={onSubmit}
            onCancel={onCancelReply}
            isSubmitting={isSubmitting}
            t={t}
          />
        </div>
      )}
    </div>
  );
} 