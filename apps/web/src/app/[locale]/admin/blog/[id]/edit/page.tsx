"use client"
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Save, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { trpc } from "@/utils/trpc";
import { useMutation, useQuery } from "@tanstack/react-query";
import RichTextEditor from "@/components/admin/rich-text-editor";
import FileUpload from "@/components/admin/file-upload";

type TranslatedField = {
  pl: string;
  en: string;
};

type BlogPostFormData = {
  categoryId: string | null;
  title: TranslatedField;
  slug: string;
  content: TranslatedField;
  excerpt: TranslatedField;
  metaTitle: TranslatedField;
  metaDescription: TranslatedField;
  metaKeywords: TranslatedField;
  ogImage: string;
  isPublished: boolean;
  publishedAt: string;
  isFeatured: boolean;
};

export default function EditBlogPostPage() {
  const params = useParams();
  const t = useTranslations();
  const router = useRouter();
  const postId = params.id as string;
  
  const blogCategories = useQuery(trpc.blog.getBlogCategories.queryOptions());
  const { data: post, isLoading: isPostLoading } = useQuery(
    trpc.blog.getBlogPostById.queryOptions(postId)
  );
  
  const [isMetaExpanded, setIsMetaExpanded] = useState(false);
  const [formData, setFormData] = useState<BlogPostFormData>({
    categoryId: null,
    title: { pl: "", en: "" },
    slug: "",
    content: { pl: "", en: "" },
    excerpt: { pl: "", en: "" },
    metaTitle: { pl: "", en: "" },
    metaDescription: { pl: "", en: "" },
    metaKeywords: { pl: "", en: "" },
    ogImage: "",
    isPublished: false,
    publishedAt: "",
    isFeatured: false,
  });

  const { mutate: deleteOldImage } = useMutation(
    trpc.upload.deleteImageByUrl.mutationOptions({
      onError: (error: any) => {
        console.warn("Failed to delete old image:", error);
      }
    })
  );

  useEffect(() => {
    if (post) {
      setFormData({
        categoryId: post.categoryId,
        title: post.title as TranslatedField || { pl: "", en: "" },
        slug: post.slug,
        content: post.content as TranslatedField || { pl: "", en: "" },
        excerpt: post.excerpt as TranslatedField || { pl: "", en: "" },
        metaTitle: post.metaTitle as TranslatedField || { pl: "", en: "" },
        metaDescription: post.metaDescription as TranslatedField || { pl: "", en: "" },
        metaKeywords: post.metaKeywords as TranslatedField || { pl: "", en: "" },
        ogImage: post.ogImage || "",
        isPublished: post.isPublished,
        publishedAt: post.publishedAt ? new Date(post.publishedAt).toISOString().slice(0, 16) : "",
        isFeatured: post.isFeatured,
      });
    }
  }, [post]);

  const { mutate: updateBlogPost, isPending } = useMutation(trpc.blog.updateBlogPost.mutationOptions({
    onMutate: () => {
      toast.loading(t("common.updating"));
    },
    onSuccess: () => {
      toast.success(t("common.updated"));
      router.push("/admin/blog");
    },
    onError: (error) => {
      toast.error(error.message);
    },
    onSettled: () => {
      toast.dismiss();
    }
  }));

  const handleFieldChange = (
    field: keyof BlogPostFormData,
    lang: "pl" | "en",
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: {
        ...(prev[field] as TranslatedField),
        [lang]: value,
      },
    }));
  };

  const handleSimpleFieldChange = (field: keyof BlogPostFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (lang: "pl" | "en", value: string) => {
    handleFieldChange("title", lang, value);
  };

  const handleSubmit = () => {
    if (!formData.title.pl || !formData.title.en || !formData.slug) {
      toast.error(t("validation.required"));
      return;
    }

    if (!post?.id) {
      toast.error("Post ID not found");
      return;
    }

    const originalOgImage = post.ogImage || "";
    const newOgImage = formData.ogImage || "";
    
    if (originalOgImage && !newOgImage) {
      deleteOldImage({ url: originalOgImage });
    }

    const submitData = {
      id: post.id,
      ...formData,
      publishedAt: formData.isPublished && formData.publishedAt ? formData.publishedAt : undefined,
    };

    updateBlogPost(submitData);
  };

  if (isPostLoading || blogCategories.isLoading) {
    return <div>{t("common.loading")}</div>;
  }

  if (!post) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold">{t("admin.blog.postNotFound")}</h2>
        <Link href="/admin/blog">
          <Button className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("common.back")}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/blog">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("common.back")}
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">{t("admin.blog.editPost")}</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("admin.blog.basicInfo")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>{t("admin.blog.title")}</Label>
                <Tabs defaultValue="pl" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="pl">Polski</TabsTrigger>
                    <TabsTrigger value="en">English</TabsTrigger>
                  </TabsList>
                  <TabsContent value="pl" className="space-y-2">
                    <Input
                      value={formData.title.pl}
                      onChange={(e) => handleTitleChange("pl", e.target.value)}
                      placeholder={t("admin.blog.titlePlaceholder")}
                    />
                  </TabsContent>
                  <TabsContent value="en" className="space-y-2">
                    <Input
                      value={formData.title.en}
                      onChange={(e) => handleTitleChange("en", e.target.value)}
                      placeholder={t("admin.blog.titlePlaceholder")}
                    />
                  </TabsContent>
                </Tabs>
              </div>

              <div className="space-y-2">
                <Label>{t("admin.blog.slug")}</Label>
                <Input
                  value={formData.slug}
                  onChange={(e) => handleSimpleFieldChange("slug", e.target.value)}
                  placeholder={t("admin.blog.slugPlaceholder")}
                />
              </div>

              <div className="space-y-4">
                <Label>{t("admin.blog.content")}</Label>
                <Tabs defaultValue="pl" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="pl">Polski</TabsTrigger>
                    <TabsTrigger value="en">English</TabsTrigger>
                  </TabsList>
                  <TabsContent value="pl">
                    <RichTextEditor
                      content={formData.content.pl}
                      onChange={(content) => handleFieldChange("content", "pl", content)}
                      placeholder={t("admin.blog.contentPlaceholder")}
                    />
                  </TabsContent>
                  <TabsContent value="en">
                    <RichTextEditor
                      content={formData.content.en}
                      onChange={(content) => handleFieldChange("content", "en", content)}
                      placeholder={t("admin.blog.contentPlaceholder")}
                    />
                  </TabsContent>
                </Tabs>
              </div>

              <div className="space-y-4">
                <Label>{t("admin.blog.excerpt")}</Label>
                <Tabs defaultValue="pl" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="pl">Polski</TabsTrigger>
                    <TabsTrigger value="en">English</TabsTrigger>
                  </TabsList>
                  <TabsContent value="pl">
                    <Textarea
                      value={formData.excerpt.pl}
                      onChange={(e) => handleFieldChange("excerpt", "pl", e.target.value)}
                      placeholder={t("admin.blog.excerptPlaceholder")}
                      rows={3}
                    />
                  </TabsContent>
                  <TabsContent value="en">
                    <Textarea
                      value={formData.excerpt.en}
                      onChange={(e) => handleFieldChange("excerpt", "en", e.target.value)}
                      placeholder={t("admin.blog.excerptPlaceholder")}
                      rows={3}
                    />
                  </TabsContent>
                </Tabs>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setIsMetaExpanded(!isMetaExpanded)}
              >
                <CardTitle>{t("admin.metaTags.title")}</CardTitle>
                {isMetaExpanded ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </CardHeader>
            {isMetaExpanded && (
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label>{t("admin.metaTags.metaTitle")}</Label>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Polski</Label>
                      <Input
                        value={formData.metaTitle.pl}
                        onChange={(e) => handleFieldChange("metaTitle", "pl", e.target.value)}
                        placeholder={t("admin.metaTags.metaTitlePlaceholder")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>English</Label>
                      <Input
                        value={formData.metaTitle.en}
                        onChange={(e) => handleFieldChange("metaTitle", "en", e.target.value)}
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
                        value={formData.metaDescription.pl}
                        onChange={(e) => handleFieldChange("metaDescription", "pl", e.target.value)}
                        placeholder={t("admin.metaTags.metaDescriptionPlaceholder")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>English</Label>
                      <Textarea
                        value={formData.metaDescription.en}
                        onChange={(e) => handleFieldChange("metaDescription", "en", e.target.value)}
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
                        value={formData.metaKeywords.pl}
                        onChange={(e) => handleFieldChange("metaKeywords", "pl", e.target.value)}
                        placeholder={t("admin.metaTags.metaKeywordsPlaceholder")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>English</Label>
                      <Input
                        value={formData.metaKeywords.en}
                        onChange={(e) => handleFieldChange("metaKeywords", "en", e.target.value)}
                        placeholder={t("admin.metaTags.metaKeywordsPlaceholder")}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <FileUpload
                    value={formData.ogImage || ""}
                    onChange={(url) => handleSimpleFieldChange("ogImage", url)}
                    onOldFileDelete={(oldUrl) => deleteOldImage({ url: oldUrl })}
                    category="meta"
                    label={t("admin.metaTags.ogImage")}
                    placeholder={t("admin.metaTags.ogImagePlaceholder")}
                  />
                </div>
              </CardContent>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("admin.blog.publishSettings")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t("admin.blog.category")}</Label>
                <Select
                  value={formData.categoryId || "none"}
                  onValueChange={(value: string) => handleSimpleFieldChange("categoryId", value === "none" ? null : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("admin.blog.selectCategory")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t("admin.blog.noCategory")}</SelectItem>
                    {blogCategories.data?.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name?.pl || category.name?.en || "Unnamed Category"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isPublished"
                  checked={formData.isPublished}
                  onCheckedChange={(checked) => handleSimpleFieldChange("isPublished", checked)}
                />
                <Label htmlFor="isPublished">{t("admin.blog.publish")}</Label>
              </div>

              {formData.isPublished && (
                <div className="space-y-2">
                  <Label>{t("admin.blog.publishDate")}</Label>
                  <Input
                    type="datetime-local"
                    value={formData.publishedAt}
                    onChange={(e) => handleSimpleFieldChange("publishedAt", e.target.value)}
                  />
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onCheckedChange={(checked) => handleSimpleFieldChange("isFeatured", checked)}
                />
                <Label htmlFor="isFeatured">{t("admin.blog.featured")}</Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-2">
              <Button 
                onClick={handleSubmit} 
                className="w-full" 
                disabled={isPending}
              >
                <Save className="w-4 h-4 mr-2" />
                {t("admin.blog.updatePost")}
              </Button>
              
              <Link href={`/admin/blog/${postId}`} className="block">
                <Button variant="outline" className="w-full">
                  {t("admin.blog.viewPost")}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 