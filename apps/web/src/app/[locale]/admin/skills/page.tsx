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
import { DataTable, type Column } from "@/components/admin/data-table";
import { SkillForm } from "@/components/admin/skill-form";
import { SkillCategoryForm } from "@/components/admin/skill-category-form";
import { ChevronDown, ChevronUp } from "lucide-react";
import FileUpload from "@/components/admin/file-upload";

type TranslatedField = {
  pl: string;
  en: string;
};

type SkillsPageMetaFormData = {
  metaTitle?: TranslatedField;
  metaDescription?: TranslatedField;
  metaKeywords?: TranslatedField;
  ogImage?: string;
};

export default function AdminPanelSkills() {
  const t = useTranslations();
  
  const skills = useQuery(trpc.content.getSkills.queryOptions());
  const categories = useQuery(trpc.content.getSkillCategories.queryOptions());
  const skillsPageMeta = useQuery(trpc.content.getSkillsPageMeta.queryOptions());

  const [isMetaExpanded, setIsMetaExpanded] = useState(false);

  const { mutate: updateSkillsPageMeta } = useMutation(trpc.content.updateSkillsPageMeta.mutationOptions({
    onMutate: () => {
      toast.loading(t("common.saving"));
    },
    onSuccess: () => {
      toast.success(t("common.saved"));
      skillsPageMeta.refetch();
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
    onSettled: () => {
      toast.dismiss();
    }
  }));

  // Meta tags state
  const [metaFormData, setMetaFormData] = useState<SkillsPageMetaFormData>({
    metaTitle: { pl: "", en: "" },
    metaDescription: { pl: "", en: "" },
    metaKeywords: { pl: "", en: "" },
    ogImage: "",
  });

  useEffect(() => {
    const metaData = skillsPageMeta.data;
    if (metaData) {
      setMetaFormData({
        metaTitle: metaData.metaTitle as TranslatedField || { pl: "", en: "" },
        metaDescription: metaData.metaDescription as TranslatedField || { pl: "", en: "" },
        metaKeywords: metaData.metaKeywords as TranslatedField || { pl: "", en: "" },
        ogImage: metaData.ogImage || "",
      });
    }
  }, [skillsPageMeta.data]);

  const handleMetaFieldChange = (
    field: keyof SkillsPageMetaFormData,
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

  const handleMetaSimpleFieldChange = (field: keyof SkillsPageMetaFormData, value: string) => {
    setMetaFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleMetaSubmit = () => {
    // Sprawdź czy ogImage zostało usunięte
    const originalOgImage = skillsPageMeta.data?.ogImage || "";
    const newOgImage = metaFormData.ogImage || "";
    
    if (originalOgImage && !newOgImage) {
      // Zdjęcie zostało usunięte - usuń plik
      deleteOldImage({ url: originalOgImage });
    }
    
    updateSkillsPageMeta(metaFormData);
  };

  const { mutate: createSkill } = useMutation(trpc.content.createSkill.mutationOptions({
    onMutate: () => {
      toast.loading(t("common.saving"));
    },
    onSuccess: () => {
      toast.success(t("common.saved"));
      skills.refetch();
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
    onSettled: () => {
      toast.dismiss();
    }
  }));

  const { mutate: updateSkill } = useMutation(trpc.content.updateSkill.mutationOptions({
    onMutate: () => {
      toast.loading(t("common.updating"));
    },
    onSuccess: () => {
      toast.success(t("common.updated"));
      skills.refetch();
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
    onSettled: () => {
      toast.dismiss();
    }
  }));

  const { mutate: deleteSkill } = useMutation(trpc.content.deleteSkill.mutationOptions({
    onMutate: () => {
      toast.loading(t("common.deleting"));
    },
    onSuccess: () => {
      toast.success(t("common.deleted"));
      skills.refetch();
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
    onSettled: () => {
      toast.dismiss();
    }
  }));

  const { mutate: changeSkillOrder } = useMutation(trpc.content.changeSkillOrder.mutationOptions({
    onMutate: () => {
      toast.loading(t("common.updating"));
    },
    onSuccess: () => {
      toast.success(t("common.updated"));
      skills.refetch();
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
    onSettled: () => {
      toast.dismiss();
    }
  }));

  const { mutate: createCategory } = useMutation(trpc.content.createSkillCategory.mutationOptions({
    onMutate: () => {
      toast.loading(t("common.saving"));
    },
    onSuccess: () => {
      toast.success(t("common.saved"));
      categories.refetch();
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
    onSettled: () => {
      toast.dismiss();
    }
  }));

  const { mutate: updateCategory } = useMutation(trpc.content.updateSkillCategory.mutationOptions({
    onMutate: () => {
      toast.loading(t("common.updating"));
    },
    onSuccess: () => {
      toast.success(t("common.updated"));
      categories.refetch();
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
    onSettled: () => {
      toast.dismiss();
    }
  }));

  const { mutate: deleteCategory } = useMutation(trpc.content.deleteSkillCategory.mutationOptions({
    onMutate: () => {
      toast.loading(t("common.deleting"));
    },
    onSuccess: () => {
      toast.success(t("common.deleted"));
      categories.refetch();
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
    onSettled: () => {
      toast.dismiss();
    }
  }));

  const { mutate: changeCategoryOrder } = useMutation(trpc.content.changeSkillCategoryOrder.mutationOptions({
    onMutate: () => {
      toast.loading(t("common.updating"));
    },
    onSuccess: () => {
      toast.success(t("common.updated"));
      categories.refetch();
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

  const handleCreateSkill = (data: any) => {
    const maxOrder = skills.data?.reduce((max, skill) => Math.max(max, skill.order), 0) || 0;
    
    createSkill({
      ...data,
      iconName: data.iconName || null,
      iconProvider: data.iconProvider || null,
      order: maxOrder + 1
    });
  };

  const handleUpdateSkill = (id: string, data: any) => {
    const skill = skills.data?.find(s => s.id === id);
    if (!skill) return;
    
    updateSkill({
      id,
      name: data.name,
      categoryId: data.categoryId,
      iconName: data.iconName || null,
      iconProvider: data.iconProvider || null,
      isActive: data.isActive,
      order: skill.order
    });
  };

  const handleDeleteSkill = (id: string) => {
    deleteSkill(id);
  };

  const handleChangeSkillOrder = (id: string, direction: "up" | "down") => {
    changeSkillOrder({
      id,
      direction
    });
  };

  const handleCreateCategory = (data: any) => {
    createCategory(data);
  };

  const handleUpdateCategory = (id: string, data: any) => {
    updateCategory({
      id,
      name: data.name
    });
  };

  const handleDeleteCategory = (id: string) => {
    deleteCategory(id);
  };

  const handleChangeCategoryOrder = (id: string, direction: "up" | "down") => {
    changeCategoryOrder({
      id,
      direction
    });
  };

  const categoryColumns: Column[] = [
    {
      key: "name.pl",
      header: t("admin.skills.namePl"),
      render: (item) => item.name.pl,
      sortable: true,
      searchable: true
    },
    {
      key: "name.en",
      header: t("admin.skills.nameEn"),
      render: (item) => item.name.en,
      sortable: true,
      searchable: true
    },
    {
      key: "order",
      header: t("admin.skills.order"),
      render: (item) => item.order,
      sortable: true
    }
  ];

  const skillColumns: Column[] = [
    {
      key: "name.pl",
      header: t("admin.skills.namePl"),
      render: (item) => item.name.pl,
      sortable: true,
      searchable: true
    },
    {
      key: "name.en",
      header: t("admin.skills.nameEn"),
      render: (item) => item.name.en,
      sortable: true,
      searchable: true
    },
    {
      key: "category",
      header: t("admin.skills.category"),
      render: (item) => item.category ? `${item.category.pl} / ${item.category.en}` : "-",
      sortable: true,
      searchable: true
    },
    {
      key: "icon",
      header: t("admin.skills.icon"),
      render: (item) => {
        if (!item.iconName) return "-";
        return item.iconProvider ? `${item.iconName} (${item.iconProvider})` : item.iconName;
      },
      sortable: true,
      searchable: true
    },
    {
      key: "isActive",
      header: t("admin.skills.active"),
      render: (item) => item.isActive ? t("common.yes") : t("common.no"),
      sortable: true
    },
    {
      key: "order",
      header: t("admin.skills.order"),
      render: (item) => item.order,
      sortable: true
    }
  ];

  if (skills.isLoading || categories.isLoading || skillsPageMeta.isLoading) {
    return <div>{t("common.loading")}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Meta Tags Section */}
      <Card>
        <div 
          className="p-6 cursor-pointer hover:bg-muted/50 transition-colors border-b"
          onClick={() => setIsMetaExpanded(!isMetaExpanded)}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold leading-none tracking-tight">{t("admin.metaTags.skillsPageTitle")}</h3>
              <p className="text-sm text-muted-foreground mt-1">{t("admin.metaTags.skillsPageDescription")}</p>
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

      {/* Skills DataTables */}
      <Card>
        <CardContent className="p-6">
          <DataTable
            title={t("admin.skills.categoriesTitle")}
            addButtonText={t("admin.skills.addNewCategory")}
            columns={categoryColumns}
            data={categories.data || []}
            FormComponent={SkillCategoryForm}
            onAdd={handleCreateCategory}
            onEdit={handleUpdateCategory}
            onDelete={handleDeleteCategory}
            onChangeOrder={handleChangeCategoryOrder}
            addDialogTitle={t("admin.skills.addNewCategoryTitle")}
            editDialogTitle={t("admin.skills.editCategoryTitle")}
            deleteDialogTitle={t("admin.skills.deleteCategoryTitle")}
            deleteDialogConfirmText={t("admin.skills.deleteCategoryConfirm")}
            showOrderButtons={true}
          />

          <DataTable
            title={t("admin.skills.title")}
            addButtonText={t("admin.skills.addNew")}
            columns={skillColumns}
            data={skills.data || []}
            FormComponent={SkillForm}
            onAdd={handleCreateSkill}
            onEdit={handleUpdateSkill}
            onDelete={handleDeleteSkill}
            onChangeOrder={handleChangeSkillOrder}
            addDialogTitle={t("admin.skills.addNewTitle")}
            editDialogTitle={t("admin.skills.editTitle")}
            deleteDialogTitle={t("admin.skills.deleteTitle")}
            deleteDialogConfirmText={t("admin.skills.deleteConfirm")}
            showOrderButtons={true}
          />
        </CardContent>
      </Card>
    </div>
  );
}
