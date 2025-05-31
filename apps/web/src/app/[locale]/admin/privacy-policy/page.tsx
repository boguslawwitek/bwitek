"use client"
import { trpc } from "@/utils/trpc";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {useTranslations} from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "@tanstack/react-query";
import { ChevronDown, ChevronUp } from "lucide-react";
import FileUpload from "@/components/admin/file-upload";
import RichTextEditor from "@/components/admin/rich-text-editor";

type TranslatedField = {
  pl: string;
  en: string;
};

type PrivacyPolicyPageMetaFormData = {
  metaTitle?: TranslatedField;
  metaDescription?: TranslatedField;
  metaKeywords?: TranslatedField;
  ogImage?: string;
};

type PrivacyPolicyFormData = {
  content: TranslatedField;
};

export default function AdminPanelPrivacyPolicy() {
    const t = useTranslations();
  
    const privacyPolicy = useQuery(trpc.content.getPrivacyPolicy.queryOptions());
    const privacyPolicyPageMeta = useQuery(trpc.content.getPrivacyPolicyPageMeta.queryOptions());

    const [isMetaExpanded, setIsMetaExpanded] = useState(false);

    const { mutate: updatePrivacyPolicyPageMeta } = useMutation(trpc.content.updatePrivacyPolicyPageMeta.mutationOptions({
      onMutate: () => {
        toast.loading(t("common.saving"));
      },
      onSuccess: () => {
        toast.success(t("common.saved"));
        privacyPolicyPageMeta.refetch();
      },
      onError: (error: any) => {
        toast.error(error.message);
      },
      onSettled: () => {
        toast.dismiss();
      }
    }));

    const { mutate: updatePrivacyPolicy } = useMutation(trpc.content.updatePrivacyPolicy.mutationOptions({
      onMutate: () => {
        toast.loading(t("common.saving"));
      },
      onSuccess: () => {
        toast.success(t("common.saved"));
        privacyPolicy.refetch();
      },
      onError: (error: any) => {
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

    const [metaFormData, setMetaFormData] = useState<PrivacyPolicyPageMetaFormData>({
      metaTitle: { pl: "", en: "" },
      metaDescription: { pl: "", en: "" },
      metaKeywords: { pl: "", en: "" },
      ogImage: "",
    });

    const [privacyPolicyFormData, setPrivacyPolicyFormData] = useState<PrivacyPolicyFormData>({
      content: { pl: "", en: "" },
    });

    useEffect(() => {
      const metaData = privacyPolicyPageMeta.data;
      if (metaData) {
        setMetaFormData({
          metaTitle: metaData.metaTitle as TranslatedField || { pl: "", en: "" },
          metaDescription: metaData.metaDescription as TranslatedField || { pl: "", en: "" },
          metaKeywords: metaData.metaKeywords as TranslatedField || { pl: "", en: "" },
          ogImage: metaData.ogImage || "",
        });
      }
    }, [privacyPolicyPageMeta.data]);

    useEffect(() => {
      const policyData = privacyPolicy.data;
      if (policyData) {
        setPrivacyPolicyFormData({
          content: policyData.content as TranslatedField || { pl: "", en: "" },
        });
      }
    }, [privacyPolicy.data]);

    const handleMetaFieldChange = (
      field: keyof PrivacyPolicyPageMetaFormData,
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

    const handleMetaSimpleFieldChange = (field: keyof PrivacyPolicyPageMetaFormData, value: string) => {
      setMetaFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

    const handlePrivacyPolicyFieldChange = (lang: "pl" | "en", value: string) => {
      setPrivacyPolicyFormData((prev) => ({
        ...prev,
        content: {
          ...prev.content,
          [lang]: value,
        },
      }));
    };

    const handleMetaSubmit = () => {
      const originalOgImage = privacyPolicyPageMeta.data?.ogImage || "";
      const newOgImage = metaFormData.ogImage || "";
      
      if (originalOgImage && !newOgImage) {
        deleteOldImage({ url: originalOgImage });
      }
      
      updatePrivacyPolicyPageMeta(metaFormData);
    };

    const handlePrivacyPolicySubmit = () => {
      updatePrivacyPolicy(privacyPolicyFormData);
    };
  
    if (privacyPolicy.isLoading || privacyPolicyPageMeta.isLoading) {
      return <div>{t("common.loading")}</div>;
    }

    return (
      <div className="space-y-6">
        <Card>
          <div 
            className="p-6 cursor-pointer hover:bg-muted/50 transition-colors border-b"
            onClick={() => setIsMetaExpanded(!isMetaExpanded)}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold leading-none tracking-tight">Privacy Policy Page Meta Tags</h3>
                <p className="text-sm text-muted-foreground mt-1">SEO settings for privacy policy page</p>
              </div>
              {isMetaExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </div>
          </div>
          {isMetaExpanded && (
            <CardContent className="space-y-6">
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
                      className="min-h-[80px]"
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
                  onOldFileDelete={(oldUrl) => deleteOldImage({ url: oldUrl })}
                  category="meta"
                  label={t("admin.metaTags.ogImage")}
                  placeholder={t("admin.metaTags.ogImagePlaceholder")}
                />
              </div>

              <Button onClick={handleMetaSubmit}>{t("common.save")}</Button>
            </CardContent>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Privacy Policy Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Label>Polish Content</Label>
              <RichTextEditor
                content={privacyPolicyFormData.content.pl}
                onChange={(content) => handlePrivacyPolicyFieldChange("pl", content)}
                placeholder={t("newsletter.contentPlaceholders.privacyPolicyPl")}
              />
            </div>

            <div className="space-y-4">
              <Label>English Content</Label>
              <RichTextEditor
                content={privacyPolicyFormData.content.en}
                onChange={(content) => handlePrivacyPolicyFieldChange("en", content)}
                placeholder={t("newsletter.contentPlaceholders.privacyPolicyEn")}
              />
            </div>

            <Button onClick={handlePrivacyPolicySubmit}>{t("common.save")}</Button>
          </CardContent>
        </Card>
      </div>
    );
}