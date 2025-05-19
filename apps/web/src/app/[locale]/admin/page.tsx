"use client"
import { trpc } from "@/utils/trpc";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {useTranslations, useLocale} from 'next-intl';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "@tanstack/react-query";

type TranslatedField = {
  pl: string;
  en: string;
};

type HomepageFormData = {
  welcomeText: TranslatedField;
  specializationText: TranslatedField;
  aboutMeText: TranslatedField;
};

export default function AdminPanel() {
  const t = useTranslations();
  const currentLang = useLocale();

  const homepage = useQuery(trpc.content.getHomepage.queryOptions());
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

  const [formData, setFormData] = useState<HomepageFormData>({
    welcomeText: { pl: "", en: "" },
    specializationText: { pl: "", en: "" },
    aboutMeText: { pl: "", en: "" },
  });

  useEffect(() => {
    const homepageData = homepage.data;
    if (homepageData) {
      setFormData({
        welcomeText: homepageData.welcomeText as TranslatedField,
        specializationText: homepageData.specializationText as TranslatedField,
        aboutMeText: homepageData.aboutMeText as TranslatedField,
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
        ...prev[field],
        [lang]: value,
      },
    }));
  };

  const handleSubmit = () => {
    updateHomepage(formData);
  };

  if (homepage.isLoading) {
    return <div>{t("common.loading")}</div>;
  }

  return (
    <Card className="max-w-4xl">
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

        <Button onClick={handleSubmit}>{t("common.save")}</Button>
      </CardContent>
    </Card>
  );
}
