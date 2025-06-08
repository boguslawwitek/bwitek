"use client"
import { trpc } from "@/utils/trpc";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {useTranslations, useLocale} from 'next-intl';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "@tanstack/react-query";
import { Icon } from '@/components/icon';
import FileUpload from "@/components/admin/file-upload";

type TranslatedField = {
  pl: string;
  en: string;
};

type HomepageFormData = {
  welcomeText: TranslatedField;
  specializationText: TranslatedField;
  aboutMeText: TranslatedField;
  metaTitle?: TranslatedField;
  metaDescription?: TranslatedField;
  metaKeywords?: TranslatedField;
  ogImage?: string;
};

export default function AdminPanel() {
  const t = useTranslations();
  const currentLang = useLocale();

  const homepage = useQuery(trpc.content.getHomepage.queryOptions());
  const [isMetaExpanded, setIsMetaExpanded] = useState(false);
  
  const { mutate: updateHomepage } = useMutation(trpc.content.updateHomepage.mutationOptions({
    onMutate: () => {
      toast.loading(t("common.saving"));
    },
    onSuccess: () => {
      toast.success(t("common.saved"));
      homepage.refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
    onSettled: () => {
      toast.dismiss();
    }
  }));

  const { mutate: deleteOldImage } = useMutation(
    trpc.upload.deleteImageByUrl.mutationOptions({
      onError: (error: any) => {
        console.warn("Failed to delete old image:", error);
      }
    })
  );

  const [formData, setFormData] = useState<HomepageFormData>({
    welcomeText: { pl: "", en: "" },
    specializationText: { pl: "", en: "" },
    aboutMeText: { pl: "", en: "" },
    metaTitle: { pl: "", en: "" },
    metaDescription: { pl: "", en: "" },
    metaKeywords: { pl: "", en: "" },
    ogImage: "",
  });

  useEffect(() => {
    const homepageData = homepage.data;
    if (homepageData) {
      setFormData({
        welcomeText: homepageData.welcomeText as TranslatedField,
        specializationText: homepageData.specializationText as TranslatedField,
        aboutMeText: homepageData.aboutMeText as TranslatedField,
        metaTitle: homepageData.metaTitle as TranslatedField || { pl: "", en: "" },
        metaDescription: homepageData.metaDescription as TranslatedField || { pl: "", en: "" },
        metaKeywords: homepageData.metaKeywords as TranslatedField || { pl: "", en: "" },
        ogImage: homepageData.ogImage || "",
      });
    }
  }, [homepage.data]);

  const handleFieldChange = (
    field: keyof HomepageFormData,
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

  const handleSimpleFieldChange = (field: keyof HomepageFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = () => {
    const originalOgImage = homepage.data?.ogImage || "";
    const newOgImage = formData.ogImage || "";
    
    if (originalOgImage && !newOgImage) {
      deleteOldImage({ url: originalOgImage });
    }
    
    updateHomepage(formData);
  };

  if (homepage.isLoading) {
    return <div>{t("common.loading")}</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("admin.homepage.title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <Label>{t("admin.homepage.welcomeText")}</Label>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Polski</Label>
              <Textarea
                value={formData.welcomeText.pl}
                onChange={(e) =>
                  handleFieldChange("welcomeText", "pl", e.target.value)
                }
                placeholder={t("admin.homepage.welcomePlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label>English</Label>
              <Textarea
                value={formData.welcomeText.en}
                onChange={(e) =>
                  handleFieldChange("welcomeText", "en", e.target.value)
                }
                placeholder={t("admin.homepage.welcomePlaceholder")}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Label>{t("admin.homepage.specializationText")}</Label>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Polski</Label>
              <Textarea
                value={formData.specializationText.pl}
                onChange={(e) =>
                  handleFieldChange("specializationText", "pl", e.target.value)
                }
                placeholder={t("admin.homepage.specializationPlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label>English</Label>
              <Textarea
                value={formData.specializationText.en}
                onChange={(e) =>
                  handleFieldChange("specializationText", "en", e.target.value)
                }
                placeholder={t("admin.homepage.specializationPlaceholder")}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Label>{t("admin.homepage.aboutMeText")}</Label>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Polski</Label>
              <Textarea
                value={formData.aboutMeText.pl}
                onChange={(e) =>
                  handleFieldChange("aboutMeText", "pl", e.target.value)
                }
                placeholder={t("admin.homepage.aboutMePlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label>English</Label>
              <Textarea
                value={formData.aboutMeText.en}
                onChange={(e) =>
                  handleFieldChange("aboutMeText", "en", e.target.value)
                }
                placeholder={t("admin.homepage.aboutMePlaceholder")}
              />
            </div>
          </div>
        </div>

        <div className="border-t my-6">
          <div 
            className="flex items-center justify-between py-4 cursor-pointer hover:bg-muted/50 transition-colors rounded"
            onClick={() => setIsMetaExpanded(!isMetaExpanded)}
          >
            <div>
              <h3 className="text-lg font-medium">{t("admin.metaTags.title")}</h3>
              <p className="text-sm text-muted-foreground">{t("admin.metaTags.description")}</p>
            </div>
            {isMetaExpanded ? (
              <Icon name="ChevronUp" provider="lu" className="h-4 w-4" />
            ) : (
              <Icon name="ChevronDown" provider="lu" className="h-4 w-4" />
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
                      value={formData.metaTitle?.pl || ""}
                      onChange={(e) =>
                        handleFieldChange("metaTitle", "pl", e.target.value)
                      }
                      placeholder={t("admin.metaTags.metaTitlePlaceholder")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>English</Label>
                    <Input
                      value={formData.metaTitle?.en || ""}
                      onChange={(e) =>
                        handleFieldChange("metaTitle", "en", e.target.value)
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
                      value={formData.metaDescription?.pl || ""}
                      onChange={(e) =>
                        handleFieldChange("metaDescription", "pl", e.target.value)
                      }
                      placeholder={t("admin.metaTags.metaDescriptionPlaceholder")}
                      className="min-h-[80px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>English</Label>
                    <Textarea
                      value={formData.metaDescription?.en || ""}
                      onChange={(e) =>
                        handleFieldChange("metaDescription", "en", e.target.value)
                      }
                      placeholder={t("admin.metaTags.metaDescriptionPlaceholder")}
                      className="min-h-[80px]"
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
                      value={formData.metaKeywords?.pl || ""}
                      onChange={(e) =>
                        handleFieldChange("metaKeywords", "pl", e.target.value)
                      }
                      placeholder={t("admin.metaTags.metaKeywordsPlaceholder")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>English</Label>
                    <Input
                      value={formData.metaKeywords?.en || ""}
                      onChange={(e) =>
                        handleFieldChange("metaKeywords", "en", e.target.value)
                      }
                      placeholder={t("admin.metaTags.metaKeywordsPlaceholder")}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <FileUpload
                  value={formData.ogImage || ""}
                  onChange={(url) => handleSimpleFieldChange("ogImage", url)}
                  onOldFileDelete={(oldUrl) => deleteOldImage({ url: oldUrl })}
                  category="meta"
                  label={t("admin.metaTags.ogImage")}
                  placeholder={t("admin.metaTags.ogImagePlaceholder")}
                />
              </div>
            </div>
          )}
        </div>

        <Button onClick={handleSubmit}>{t("common.save")}</Button>
      </CardContent>
    </Card>
  );
}
