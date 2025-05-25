"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  MessageCircle, 
  Check, 
  X, 
  Trash2, 
  Eye, 
  Calendar, 
  User, 
  Mail, 
  Globe,
  ChevronLeft,
  ChevronRight,
  Filter,
  Reply
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import DeleteConfirmationModal from "@/components/admin/delete-confirmation-modal";

interface Comment {
  id: string;
  postId: string;
  parentId: string | null;
  authorName: string;
  authorEmail: string;
  authorWebsite: string | null;
  content: string;
  isApproved: boolean;
  ipAddress: string | null;
  createdAt: string;
  postTitle: { pl: string; en: string } | null;
  postSlug: string | null;
  parentComment: {
    id: string;
    authorName: string;
    content: string;
  } | null;
}

export default function CommentsAdminPage() {
  const t = useTranslations();
  const locale = useLocale();
  const queryClient = useQueryClient();
  
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    commentId: string | null;
    authorName: string;
  }>({
    isOpen: false,
    commentId: null,
    authorName: ''
  });
  
  const limit = 20;

  const { data: commentsData, isLoading } = useQuery(
    trpc.comments.getAllComments.queryOptions({
      page: currentPage,
      limit,
      status: statusFilter,
    })
  );

  const { data: stats } = useQuery(
    trpc.comments.getCommentsStats.queryOptions()
  );

  const updateStatusMutation = useMutation(
    trpc.comments.updateCommentStatus.mutationOptions({
      onSuccess: async () => {
        toast.success(t('admin.comments.statusUpdated'));
        await queryClient.invalidateQueries();
      },
      onError: (error) => {
        toast.error(t('admin.comments.updateError'));
        console.error('Error updating comment status:', error);
      }
    })
  );

  const deleteCommentMutation = useMutation(
    trpc.comments.deleteComment.mutationOptions({
      onSuccess: async () => {
        toast.success(t('admin.comments.deleted'));
        await queryClient.invalidateQueries();
        setDeleteModal({ isOpen: false, commentId: null, authorName: '' });
      },
      onError: (error) => {
        toast.error(t('admin.comments.deleteError'));
        console.error('Error deleting comment:', error);
      }
    })
  );

  const handleStatusUpdate = (commentId: string, isApproved: boolean) => {
    updateStatusMutation.mutate({ commentId, isApproved });
  };

  const handleDeleteClick = (commentId: string, authorName: string) => {
    setDeleteModal({
      isOpen: true,
      commentId,
      authorName
    });
  };

  const handleDeleteConfirm = () => {
    if (deleteModal.commentId) {
      deleteCommentMutation.mutate({ commentId: deleteModal.commentId });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, commentId: null, authorName: '' });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPostTitle = (comment: Comment) => {
    if (!comment.postTitle) {
      return t('blog.articleNotFound');
    }
    
    const title = locale === 'pl' ? comment.postTitle.pl : comment.postTitle.en;
    
    const fallbackTitle = locale === 'pl' ? comment.postTitle.en : comment.postTitle.pl;
    
    return title?.trim() || fallbackTitle?.trim() || t('blog.articleNotFound');
  };

  const filteredComments = (commentsData?.comments as Comment[] | undefined)?.filter(comment => 
    searchTerm === '' || 
    comment.authorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comment.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getPostTitle(comment).toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <>
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                <MessageCircle size={32} className="text-red-600 dark:text-red-400" />
                {t('admin.comments.title')}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {t('admin.comments.description')}
              </p>
            </div>
          </div>
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('admin.comments.pending')}</p>
                    <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
                    <MessageCircle size={24} className="text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('admin.comments.approved')}</p>
                    <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                    <Check size={24} className="text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('admin.comments.total')}</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                    <MessageCircle size={24} className="text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder={t('admin.comments.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={(value: 'all' | 'pending' | 'approved') => setStatusFilter(value)}>
                  <SelectTrigger className="w-48">
                    <Filter size={16} className="mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('admin.comments.all')}</SelectItem>
                    <SelectItem value="pending">{t('admin.comments.pending')}</SelectItem>
                    <SelectItem value="approved">{t('admin.comments.approved')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">{t('common.loading')}</p>
          </div>
        ) : filteredComments.length > 0 ? (
          <div className="space-y-4">
            {filteredComments.map((comment) => (
              <Card key={comment.id} className="border border-gray-200 dark:border-gray-700">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                        <User size={20} className="text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                            {comment.authorName}
                          </h3>
                          <Badge variant={comment.isApproved ? "default" : "secondary"}>
                            {comment.isApproved ? t('admin.comments.statusApproved') : t('admin.comments.statusPending')}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-1">
                          <div className="flex items-center gap-1">
                            <Mail size={12} />
                            {comment.authorEmail}
                          </div>
                          {comment.authorWebsite && (
                            <div className="flex items-center gap-1">
                              <Globe size={12} />
                              <a href={comment.authorWebsite} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                {comment.authorWebsite}
                              </a>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Calendar size={12} />
                            {formatDate(comment.createdAt)}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {!comment.isApproved && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusUpdate(comment.id, true)}
                          disabled={updateStatusMutation.isPending}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Check size={16} className="mr-1" />
                          {t('admin.comments.approve')}
                        </Button>
                      )}
                      
                      {comment.isApproved && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusUpdate(comment.id, false)}
                          disabled={updateStatusMutation.isPending}
                        >
                          <X size={16} className="mr-1" />
                          {t('admin.comments.reject')}
                        </Button>
                      )}
                      
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteClick(comment.id, comment.authorName)}
                        disabled={deleteCommentMutation.isPending}
                      >
                        <Trash2 size={16} className="mr-1" />
                        {t('admin.comments.delete')}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('admin.comments.article')}</span>
                      {comment.postSlug ? (
                        <Link 
                          href={`/${locale}/blog/${comment.postSlug}`}
                          className="text-sm text-red-600 dark:text-red-400 hover:underline flex items-center gap-1"
                        >
                          <Eye size={12} />
                          {getPostTitle(comment)}
                        </Link>
                      ) : (
                        <span className="text-sm text-gray-500">{getPostTitle(comment)}</span>
                      )}
                    </div>
                    
                    {comment.parentComment && (
                      <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                        <div className="flex items-center gap-2 mb-2">
                          <Reply size={14} className="text-blue-600 dark:text-blue-400" />
                          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                            {t('admin.comments.replyTo')} {comment.parentComment.authorName}
                          </span>
                        </div>
                        <p className="text-sm text-blue-600 dark:text-blue-400 italic">
                          "{comment.parentComment.content}"
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {comment.content.split('\n').map((line, index) => (
                        <span key={index}>
                          {line}
                          {index < comment.content.split('\n').length - 1 && <br />}
                        </span>
                      ))}
                    </p>
                  </div>
                  
                  {comment.parentId && (
                    <div className="mt-2">
                      <Badge variant="outline" className="text-xs">
                        {t('admin.comments.replyToComment')}
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <MessageCircle size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm ? t('admin.comments.noCommentsFound') : t('admin.comments.noComments')}
              </p>
            </CardContent>
          </Card>
        )}

        {commentsData && commentsData.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={16} className="mr-1" />
              {t('admin.comments.previous')}
            </Button>
            
            <div className="flex items-center gap-2">
              {Array.from({ length: commentsData.totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={page === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className="w-10"
                >
                  {page}
                </Button>
              ))}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(commentsData.totalPages, prev + 1))}
              disabled={currentPage === commentsData.totalPages}
            >
              {t('admin.comments.next')}
              <ChevronRight size={16} className="ml-1" />
            </Button>
          </div>
        )}
      </div>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        title={t('admin.comments.deleteTitle')}
        message={t('admin.comments.deleteMessage', { authorName: deleteModal.authorName })}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        isLoading={deleteCommentMutation.isPending}
      />
    </>
  );
} 