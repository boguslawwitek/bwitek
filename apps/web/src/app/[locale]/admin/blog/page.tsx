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
import { Plus, Eye, Edit, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BlogCategoryForm } from "@/components/admin/blog-category-form";
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
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    type: 'post' | 'category';
    id: string;
    title: string;
  }>({
    isOpen: false,
    type: 'post',
    id: '',
    title: ''
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [metaFormData, setMetaFormData] = useState<BlogMetaFormData>({
    metaTitle: { pl: "", en: "" },
    metaDescription: { pl: "", en: "" },
    metaKeywords: { pl: "", en: "" },
    ogImage: "",
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

  const { mutate: deleteBlogPost } = useMutation(trpc.blog.deleteBlogPost.mutationOptions({
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
      setShowCategoryForm(false);
      setEditingCategory(null);
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
      setShowCategoryForm(false);
      setEditingCategory(null);
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
    setDeleteModal({
      isOpen: true,
      type: 'post',
      id,
      title
    });
  };

  const handleCreateCategory = (data: any) => {
    createBlogCategory(data);
  };

  const handleUpdateCategory = (id: string, data: any) => {
    updateBlogCategory({
      id,
      ...data,
    });
  };

  const handleDeleteCategory = (id: string, name: string) => {
    setDeleteModal({
      isOpen: true,
      type: 'category',
      id,
      title: name
    });
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      if (deleteModal.type === 'post') {
        await deleteBlogPost(deleteModal.id);
      } else {
        await deleteBlogCategory(deleteModal.id);
      }
    } finally {
      setIsDeleting(false);
      setDeleteModal({ isOpen: false, type: 'post', id: '', title: '' });
    }
  };

  const cancelDelete = () => {
    setDeleteModal({ isOpen: false, type: 'post', id: '', title: '' });
  };

  const handleEditCategory = (category: any) => {
    setEditingCategory(category);
    setShowCategoryForm(true);
  };

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
                  <div className="font-medium">{post.title?.pl || post.title?.en || "Untitled"}</div>
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
                      <Eye className="w-4 h-4 mr-1" />
                      {t("admin.blog.view")}
                    </Button>
                  </Link>
                  <Link href={`/admin/blog/${post.id}/edit`}>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-1" />
                      {t("admin.blog.edit")}
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeletePost(post.id, post.title?.pl || post.title?.en || "Untitled")}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
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

  const renderCategoriesTable = () => {
    if (!blogCategories.data || blogCategories.data.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          {t("admin.blog.noCategories")}
        </div>
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Icon</TableHead>
            <TableHead>Active</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {blogCategories.data.map((category: any) => (
            <TableRow key={category.id}>
              <TableCell>
                <div>
                  <div className="font-medium">{category.name?.pl || "Unnamed"}</div>
                  <div className="text-sm text-muted-foreground">{category.name?.en || "Unnamed"}</div>
                </div>
              </TableCell>
              <TableCell>{category.slug}</TableCell>
              <TableCell>
                <div className="max-w-xs truncate">
                  {category.description?.pl || category.description?.en || "No description"}
                </div>
              </TableCell>
              <TableCell>
                {category.iconName && (
                  <div className="text-sm">
                    {category.iconName} ({category.iconProvider})
                  </div>
                )}
              </TableCell>
              <TableCell>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  category.isActive 
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                    : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
                }`}>
                  {category.isActive ? "Active" : "Inactive"}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditCategory(category)}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    {t("admin.blog.editCategory")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteCategory(category.id, category.name?.pl || category.name?.en || "Unnamed")}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    {t("admin.blog.deleteCategory")}
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
            <Plus className="w-4 h-4 mr-2" />
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
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>{t("admin.blog.categoriesManagement")}</CardTitle>
                <Button onClick={() => setShowCategoryForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  {t("admin.blog.addCategory")}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {renderCategoriesTable()}
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
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
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
                      <Label>{t("admin.metaTags.ogImage")}</Label>
                      <Input
                        value={metaFormData.ogImage || ""}
                        onChange={(e) =>
                          handleMetaSimpleFieldChange("ogImage", e.target.value)
                        }
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

      {showCategoryForm && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => {
              setShowCategoryForm(false);
              setEditingCategory(null);
            }}
          />
          
          <div 
            className="relative bg-background border border-border shadow-xl p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4">
              {editingCategory ? t("admin.blog.editCategory") : t("admin.blog.addCategory")}
            </h2>
            <BlogCategoryForm
              initialData={editingCategory}
              onSubmit={editingCategory ? 
                (data) => handleUpdateCategory(editingCategory.id, data) : 
                handleCreateCategory
              }
              onCancel={() => {
                setShowCategoryForm(false);
                setEditingCategory(null);
              }}
            />
          </div>
        </div>
      )}

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        title={deleteModal.type === 'post' ? t("admin.blog.delete") : t("admin.blog.deleteCategory")}
        message={deleteModal.type === 'post' ? t("admin.blog.deleteConfirm") : t("admin.blog.deleteCategoryConfirm")}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        isLoading={isDeleting}
      />
    </div>
  );
} 