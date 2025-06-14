"use client"
import { useParams } from "next/navigation";
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from '@/components/icon';
import Link from "next/link";
import { trpc } from "@/utils/trpc";
import { useQuery } from "@tanstack/react-query";
import ArticleContent from "@/components/admin/article-content";

export default function ViewBlogPostPage() {
  const params = useParams();
  const t = useTranslations();
  const postId = params.id as string;
  
  const { data: post, isLoading } = useQuery(
    trpc.blog.getBlogPostById.queryOptions(postId)
  );

  if (isLoading) {
    return <div>{t("common.loading")}</div>;
  }

  if (!post) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold">{t("admin.blog.postNotFound")}</h2>
        <Link href="/admin/blog">
          <Button className="mt-4">
            <Icon name="ArrowLeft" provider="lu" className="w-4 h-4 mr-2" />
            {t("common.back")}
          </Button>
        </Link>
      </div>
    );
  }

  const formatDate = (date: string | null) => {
    if (!date) return t("admin.blog.neverPublished");
    return new Date(date).toLocaleDateString('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-col md:flex-row">
        <div className="flex items-center gap-4 flex-col md:flex-row">
          <Link href="/admin/blog">
            <Button variant="outline" size="sm">
              <Icon name="ArrowLeft" provider="lu" className="w-4 h-4 mr-2" />
              {t("common.back")}
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">{post.title?.pl || post.title?.en || t('common.untitled')}</h1>
        </div>
        <Link href={`/admin/blog/${postId}/edit`}>
          <Button>
            <Icon name="Pencil" provider="lu" className="w-4 h-4 mr-2" />
            {t("admin.blog.edit")}
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("admin.blog.postInfo")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Badge variant={post.isPublished ? "default" : "secondary"}>
                {post.isPublished ? t("admin.blog.published") : t("admin.blog.draft")}
              </Badge>
              {post.isFeatured && (
                <Badge variant="outline">
                  {t("admin.blog.featured")}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Icon name="Calendar" provider="lu" className="w-4 h-4" />
              {formatDate(post.publishedAt)}
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Icon name="Eye" provider="lu" className="w-4 h-4" />
              {post.viewCount || 0} {t("admin.blog.views")}
            </div>
            
            {post.category && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon name="Tag" provider="lu" className="w-4 h-4" />
                {post.category.name?.pl || post.category.name?.en}
              </div>
            )}
          </div>
          
          <div className="text-sm text-muted-foreground">
            <strong>Slug:</strong> {post.slug}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🇵🇱 {t("admin.blog.polishVersion")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">{t("admin.blog.title")}</h3>
              <p className="text-lg">{post.title?.pl || t("admin.blog.noContent")}</p>
            </div>
            
            {post.excerpt?.pl && (
              <div>
                <h3 className="font-semibold mb-2">{t("admin.blog.excerpt")}</h3>
                <p className="text-sm text-muted-foreground">{post.excerpt.pl}</p>
              </div>
            )}
            
            <div>
              <h3 className="font-semibold mb-2">{t("admin.blog.content")}</h3>
              <ArticleContent content={post.content?.pl || t("admin.blog.noContent")} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🇬🇧 {t("admin.blog.englishVersion")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">{t("admin.blog.title")}</h3>
              <p className="text-lg">{post.title?.en || t("admin.blog.noContent")}</p>
            </div>
            
            {post.excerpt?.en && (
              <div>
                <h3 className="font-semibold mb-2">{t("admin.blog.excerpt")}</h3>
                <p className="text-sm text-muted-foreground">{post.excerpt.en}</p>
              </div>
            )}
            
            <div>
              <h3 className="font-semibold mb-2">{t("admin.blog.content")}</h3>
              <ArticleContent content={post.content?.en || t("admin.blog.noContent")} />
            </div>
          </CardContent>
        </Card>
      </div>

      {(post.metaTitle?.pl || post.metaTitle?.en || post.metaDescription?.pl || post.metaDescription?.en) && (
        <Card>
          <CardHeader>
            <CardTitle>{t("admin.metaTags.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <h3 className="font-semibold mb-3">🇵🇱 Polski</h3>
                <div className="space-y-3">
                  {post.metaTitle?.pl && (
                    <div>
                      <strong>{t("admin.metaTags.metaTitle")}:</strong>
                      <p className="text-sm text-muted-foreground">{post.metaTitle.pl}</p>
                    </div>
                  )}
                  {post.metaDescription?.pl && (
                    <div>
                      <strong>{t("admin.metaTags.metaDescription")}:</strong>
                      <p className="text-sm text-muted-foreground">{post.metaDescription.pl}</p>
                    </div>
                  )}
                  {post.metaKeywords?.pl && (
                    <div>
                      <strong>{t("admin.metaTags.metaKeywords")}:</strong>
                      <p className="text-sm text-muted-foreground">{post.metaKeywords.pl}</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">🇬🇧 English</h3>
                <div className="space-y-3">
                  {post.metaTitle?.en && (
                    <div>
                      <strong>{t("admin.metaTags.metaTitle")}:</strong>
                      <p className="text-sm text-muted-foreground">{post.metaTitle.en}</p>
                    </div>
                  )}
                  {post.metaDescription?.en && (
                    <div>
                      <strong>{t("admin.metaTags.metaDescription")}:</strong>
                      <p className="text-sm text-muted-foreground">{post.metaDescription.en}</p>
                    </div>
                  )}
                  {post.metaKeywords?.en && (
                    <div>
                      <strong>{t("admin.metaTags.metaKeywords")}:</strong>
                      <p className="text-sm text-muted-foreground">{post.metaKeywords.en}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {post.ogImage && (
              <div className="mt-4">
                <strong>{t("admin.metaTags.ogImage")}:</strong>
                <p className="text-sm text-muted-foreground break-all">{post.ogImage}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
} 