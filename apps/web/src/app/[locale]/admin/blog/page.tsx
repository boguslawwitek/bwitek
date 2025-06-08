"use client"
import { trpc } from "@/utils/trpc";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Icon } from '@/components/icon';
import Link from "next/link";
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BlogCategoryForm } from "@/components/admin/blog-category-form";
import FileUpload from "@/components/admin/file-upload";
import { DataTable, type Column } from "@/components/admin/data-table";
import DeleteConfirmationModal from "@/components/admin/delete-confirmation-modal";

type TranslatedField = {
  pl: string;
  en: string;
};

type BlogMetaFormData = {
  metaTitle?: TranslatedField;
  metaDescription?: TranslatedField;
  metaKeywords?: TranslatedField;
  ogImage?: string;
};

export default function AdminBlogPage() {
  const t = useTranslations();
  
  const blogPosts = useQuery(trpc.blog.getBlogPosts.queryOptions({}));
  const blogCategories = useQuery(trpc.blog.getBlogCategories.queryOptions());
  const blogPageMeta = useQuery(trpc.blog.getBlogPageMeta.queryOptions());
  
  const [isMetaExpanded, setIsMetaExpanded] = useState(false);
  const [metaFormData, setMetaFormData] = useState<BlogMetaFormData>({
    metaTitle: { pl: "", en: "" },
    metaDescription: { pl: "", en: "" },
    metaKeywords: { pl: "", en: "" },
    ogImage: "",
  });

  const [deletePostModal, setDeletePostModal] = useState<{
    isOpen: boolean;
    postId: string | null;
    postTitle: string;
  }>({
    isOpen: false,
    postId: null,
    postTitle: ""
  });

  const { mutate: updateBlogPageMeta } = useMutation(trpc.blog.updateBlogPageMeta.mutationOptions({
    onMutate: () => {
      toast.loading(t("common.saving"));
    },
    onSuccess: () => {
      toast.success(t("common.saved"));
      blogPageMeta.refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
    onSettled: () => {
      toast.dismiss();
    }
  }));

  const deleteBlogPostMutation = useMutation(trpc.blog.deleteBlogPost.mutationOptions({
    onMutate: () => {
      toast.loading(t("common.deleting"));
    },
    onSuccess: () => {
      toast.success(t("common.deleted"));
      blogPosts.refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
    onSettled: () => {
      toast.dismiss();
    }
  }));

  const { mutate: createBlogCategory } = useMutation(trpc.blog.createBlogCategory.mutationOptions({
    onMutate: () => {
      toast.loading(t("common.saving"));
    },
    onSuccess: () => {
      toast.success(t("common.saved"));
      blogCategories.refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
    onSettled: () => {
      toast.dismiss();
    }
  }));

  const { mutate: updateBlogCategory } = useMutation(trpc.blog.updateBlogCategory.mutationOptions({
    onMutate: () => {
      toast.loading(t("common.updating"));
    },
    onSuccess: () => {
      toast.success(t("common.updated"));
      blogCategories.refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
    onSettled: () => {
      toast.dismiss();
    }
  }));

  const { mutate: deleteBlogCategory } = useMutation(trpc.blog.deleteBlogCategory.mutationOptions({
    onMutate: () => {
      toast.loading(t("common.deleting"));
    },
    onSuccess: () => {
      toast.success(t("common.deleted"));
      blogCategories.refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
    onSettled: () => {
      toast.dismiss();
    }
  }));

  const { mutate: changeBlogCategoryOrder } = useMutation(trpc.blog.changeBlogCategoryOrder.mutationOptions({
    onMutate: () => {
      toast.loading(t("common.updating"));
    },
    onSuccess: () => {
      toast.success(t("common.updated"));
      blogCategories.refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
    onSettled: () => {
      toast.dismiss();
    }
  }));

  useEffect(() => {
    const metaData = blogPageMeta.data;
    if (metaData) {
      setMetaFormData({
        metaTitle: metaData.metaTitle as TranslatedField || { pl: "", en: "" },
        metaDescription: metaData.metaDescription as TranslatedField || { pl: "", en: "" },
        metaKeywords: metaData.metaKeywords as TranslatedField || { pl: "", en: "" },
        ogImage: metaData.ogImage || "",
      });
    }
  }, [blogPageMeta.data]);

  const handleMetaFieldChange = (
    field: keyof BlogMetaFormData,
    lang: "pl" | "en",
    value: string
  ) => {
    setMetaFormData((prev) => ({
      ...prev,
      [field]: {
        ...(prev[field] as TranslatedField),
        [lang]: value,
      },
    }));
  };

  const handleMetaSimpleFieldChange = (field: keyof BlogMetaFormData, value: string) => {
    setMetaFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleMetaSubmit = () => {
    updateBlogPageMeta(metaFormData);
  };

  const handleDeletePost = (id: string, title: string) => {
    setDeletePostModal({
      isOpen: true,
      postId: id,
      postTitle: title
    });
  };

  const handleDeletePostConfirm = () => {
    if (deletePostModal.postId) {
      deleteBlogPostMutation.mutate(deletePostModal.postId);
      setDeletePostModal({
        isOpen: false,
        postId: null,
        postTitle: ""
      });
    }
  };

  const handleDeletePostCancel = () => {
    setDeletePostModal({
      isOpen: false,
      postId: null,
      postTitle: ""
    });
  };

  const handleCreateCategory = (data: any) => {
    createBlogCategory(data);
  };

  const handleUpdateCategory = (id: string, data: any) => {
    const originalCategory = blogCategories.data?.find((cat: any) => cat.id === id);
    if (!originalCategory) {
      toast.error("Category not found");
      return;
    }
    
    updateBlogCategory({
      id,
      ...data,
      order: originalCategory.order,
      isActive: data.isActive !== undefined ? data.isActive : originalCategory.isActive,
    });
  };

  const handleDeleteCategory = (id: string) => {
    deleteBlogCategory(id);
  };

  const handleChangeOrder = (categoryId: string, direction: "up" | "down") => {
    changeBlogCategoryOrder({ id: categoryId, direction });
  };

  const categoryColumns: Column[] = [
    {
      key: "name.pl",
      header: t("admin.blog.categoryNamePl"),
      render: (item) => item.name?.pl || "Unnamed",
      sortable: true,
      searchable: true
    },
    {
      key: "name.en", 
      header: t("admin.blog.categoryNameEn"),
      render: (item) => item.name?.en || "Unnamed",
      sortable: true,
      searchable: true
    },
    {
      key: "iconName",
      header: t("admin.blog.iconName"),
      render: (item) => item.iconName ? `${item.iconName} (${item.iconProvider})` : "-",
      sortable: true,
      searchable: false
    },
    {
      key: "isActive",
      header: t("admin.blog.categoryActive"),
      render: (item) => item.isActive ? t("common.yes") : t("common.no"),
      sortable: true,
      searchable: false
    },
    {
      key: "order",
      header: t("admin.blog.order"),
      render: (item) => item.order,
      sortable: true,
      searchable: false
    }
  ];

  const getStatusBadge = (isPublished: boolean) => {
    return isPublished ? (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
        {t("admin.blog.published")}
      </span>
    ) : (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
        {t("admin.blog.draft")}
      </span>
    );
  };

  const formatDate = (date: string | null) => {
    if (!date) return t("admin.blog.neverPublished");
    return new Date(date).toLocaleDateString('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const renderPostsTable = () => {
    if (!blogPosts.data || blogPosts.data.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          {t("admin.blog.noPosts")}
        </div>
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("admin.blog.title")}</TableHead>
            <TableHead>{t("admin.blog.category")}</TableHead>
            <TableHead>{t("admin.blog.status")}</TableHead>
            <TableHead>{t("admin.blog.publishedAt")}</TableHead>
            <TableHead>{t("admin.blog.views")}</TableHead>
            <TableHead>{t("admin.blog.actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {blogPosts.data.map((post: any) => (
            <TableRow key={post.id}>
              <TableCell>
                <div>
                  <div className="font-medium">{post.title?.pl || post.title?.en || t('common.untitled')}</div>
                  <div className="text-sm text-muted-foreground">Slug: {post.slug}</div>
                </div>
              </TableCell>
              <TableCell>
                {post.category?.name?.pl || post.category?.name?.en || t("admin.blog.noCategory")}
              </TableCell>
              <TableCell>
                {getStatusBadge(post.isPublished)}
              </TableCell>
              <TableCell>
                {formatDate(post.publishedAt)}
              </TableCell>
              <TableCell>
                {post.viewCount || 0}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Link href={`/admin/blog/${post.id}`}>
                    <Button variant="outline" size="sm">
                      <Icon name="Eye" provider="lu" className="w-4 h-4 mr-1" />
                      {t("admin.blog.view")}
                    </Button>
                  </Link>
                  <Link href={`/admin/blog/${post.id}/edit`}>
                    <Button variant="outline" size="sm">
                      <Icon name="Edit" provider="lu" className="w-4 h-4 mr-1" />
                      {t("admin.blog.edit")}
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeletePost(post.id, post.title?.pl || post.title?.en || t('common.untitled'))}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Icon name="Trash2" provider="lu" className="w-4 h-4 mr-1" />
                    {t("admin.blog.delete")}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  if (blogPosts.isLoading || blogPageMeta.isLoading) {
    return <div>{t("common.loading")}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{t("admin.blog.title")}</h1>
        <Link href="/admin/blog/new">
          <Button>
            {/* <Plus className="w-4 h-4 mr-2" /> */}
            {t("admin.blog.newPost")}
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="posts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="posts">{t("admin.blog.posts")}</TabsTrigger>
          <TabsTrigger value="categories">{t("admin.blog.categories")}</TabsTrigger>
          <TabsTrigger value="meta">{t("admin.blog.pageSettings")}</TabsTrigger>
        </TabsList>

        <TabsContent value="posts">
          <Card>
            <CardHeader>
              <CardTitle>{t("admin.blog.postsManagement")}</CardTitle>
            </CardHeader>
            <CardContent>
              {renderPostsTable()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <Card>
            <CardContent className="p-6">
              <DataTable
                title={t("admin.blog.categoriesManagement")}
                addButtonText={t("admin.blog.addCategory")}
                columns={categoryColumns}
                data={blogCategories.data || []}
                FormComponent={BlogCategoryForm}
                onAdd={handleCreateCategory}
                onEdit={handleUpdateCategory}
                onDelete={handleDeleteCategory}
                onChangeOrder={handleChangeOrder}
                addDialogTitle={t("admin.blog.addCategory")}
                editDialogTitle={t("admin.blog.editCategory")}
                deleteDialogTitle={t("admin.blog.deleteCategory")}
                deleteDialogConfirmText={t("admin.blog.deleteCategoryConfirm")}
                showOrderButtons={true}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="meta">
          <Card>
            <CardHeader>
              <CardTitle>{t("admin.blog.pageMetaTags")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border-t">
                <div 
                  className="flex items-center justify-between py-4 cursor-pointer hover:bg-muted/50 transition-colors rounded"
                  onClick={() => setIsMetaExpanded(!isMetaExpanded)}
                >
                  <div>
                    <h3 className="text-lg font-medium">{t("admin.metaTags.title")}</h3>
                    <p className="text-sm text-muted-foreground">{t("admin.metaTags.description")}</p>
                  </div>
                  {isMetaExpanded ? (
                    <Icon name="ChevronUp" provider="lu" className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <Icon name="ChevronDown" provider="lu" className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>

                {isMetaExpanded && (
                  <div className="space-y-6 pb-4">
                    <div className="space-y-4">
                      <Label>{t("admin.metaTags.metaTitle")}</Label>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Polski</Label>
                          <Input
                            value={metaFormData.metaTitle?.pl || ""}
                            onChange={(e) =>
                              handleMetaFieldChange("metaTitle", "pl", e.target.value)
                            }
                            placeholder={t("admin.metaTags.metaTitlePlaceholder")}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>English</Label>
                          <Input
                            value={metaFormData.metaTitle?.en || ""}
                            onChange={(e) =>
                              handleMetaFieldChange("metaTitle", "en", e.target.value)
                            }
                            placeholder={t("admin.metaTags.metaTitlePlaceholder")}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label>{t("admin.metaTags.metaDescription")}</Label>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Polski</Label>
                          <Textarea
                            value={metaFormData.metaDescription?.pl || ""}
                            onChange={(e) =>
                              handleMetaFieldChange("metaDescription", "pl", e.target.value)
                            }
                            placeholder={t("admin.metaTags.metaDescriptionPlaceholder")}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>English</Label>
                          <Textarea
                            value={metaFormData.metaDescription?.en || ""}
                            onChange={(e) =>
                              handleMetaFieldChange("metaDescription", "en", e.target.value)
                            }
                            placeholder={t("admin.metaTags.metaDescriptionPlaceholder")}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label>{t("admin.metaTags.metaKeywords")}</Label>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Polski</Label>
                          <Input
                            value={metaFormData.metaKeywords?.pl || ""}
                            onChange={(e) =>
                              handleMetaFieldChange("metaKeywords", "pl", e.target.value)
                            }
                            placeholder={t("admin.metaTags.metaKeywordsPlaceholder")}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>English</Label>
                          <Input
                            value={metaFormData.metaKeywords?.en || ""}
                            onChange={(e) =>
                              handleMetaFieldChange("metaKeywords", "en", e.target.value)
                            }
                            placeholder={t("admin.metaTags.metaKeywordsPlaceholder")}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <FileUpload
                        value={metaFormData.ogImage || ""}
                        onChange={(url) => handleMetaSimpleFieldChange("ogImage", url)}
                        category="meta"
                        label={t("admin.metaTags.ogImage")}
                        placeholder={t("admin.metaTags.ogImagePlaceholder")}
                      />
                    </div>

                    <Button onClick={handleMetaSubmit}>
                      {t("common.save")}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <DeleteConfirmationModal
        isOpen={deletePostModal.isOpen}
        title={t("admin.blog.delete")}
        message={`${t("admin.blog.deleteConfirm")}\n\n"${deletePostModal.postTitle}"`}
        onConfirm={handleDeletePostConfirm}
        onCancel={handleDeletePostCancel}
        isLoading={deleteBlogPostMutation.isPending}
      />
    </div>
  );
} 