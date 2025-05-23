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
import { ProjectForm } from "@/components/admin/project-form";
import { ChevronDown, ChevronUp } from "lucide-react";

type TranslatedField = {
  pl: string;
  en: string;
};

type ProjectsPageMetaFormData = {
  metaTitle?: TranslatedField;
  metaDescription?: TranslatedField;
  metaKeywords?: TranslatedField;
  ogImage?: string;
};

export default function AdminPanelProjects() {
    const t = useTranslations();
  
    const projects = useQuery(trpc.content.getProjects.queryOptions());
    const projectsPageMeta = useQuery(trpc.content.getProjectsPageMeta.queryOptions());

    const [isMetaExpanded, setIsMetaExpanded] = useState(false);

    const { mutate: updateProjectsPageMeta } = useMutation(trpc.content.updateProjectsPageMeta.mutationOptions({
      onMutate: () => {
        toast.loading(t("common.saving"));
      },
      onSuccess: () => {
        toast.success(t("common.saved"));
        projectsPageMeta.refetch();
      },
      onError: (error: any) => {
        toast.error(error.message);
      },
      onSettled: () => {
        toast.dismiss();
      }
    }));
  
    const { mutate: createProject } = useMutation(trpc.content.createProject.mutationOptions({
      onMutate: () => {
        toast.loading(t("common.saving"));
      },
      onSuccess: () => {
        toast.success(t("common.saved"));
        projects.refetch();
      },
      onError: (error: any) => {
        toast.error(error.message);
      },
      onSettled: () => {
        toast.dismiss();
      }
    }));
  
    const { mutate: updateProject } = useMutation(trpc.content.updateProject.mutationOptions({
      onMutate: () => {
        toast.loading(t("common.updating"));
      },
      onSuccess: () => {
        toast.success(t("common.updated"));
        projects.refetch();
      },
      onError: (error: any) => {
        toast.error(error.message);
      },
      onSettled: () => {
        toast.dismiss();
      }
    }));
  
    const { mutate: deleteProject } = useMutation(trpc.content.deleteProject.mutationOptions({
      onMutate: () => {
        toast.loading(t("common.deleting"));
      },
      onSuccess: () => {
        toast.success(t("common.deleted"));
        projects.refetch();
      },
      onError: (error: any) => {
        toast.error(error.message);
      },
      onSettled: () => {
        toast.dismiss();
      }
    }));
  
    const { mutate: changeProjectOrder } = useMutation(trpc.content.changeProjectOrder.mutationOptions({
      onMutate: () => {
        toast.loading(t("common.updating"));
      },
      onSuccess: () => {
        toast.success(t("common.updated"));
        projects.refetch();
      },
      onError: (error: any) => {
        toast.error(error.message);
      },
      onSettled: () => {
        toast.dismiss();
      }
    }));

    const [metaFormData, setMetaFormData] = useState<ProjectsPageMetaFormData>({
      metaTitle: { pl: "", en: "" },
      metaDescription: { pl: "", en: "" },
      metaKeywords: { pl: "", en: "" },
      ogImage: "",
    });

    useEffect(() => {
      const metaData = projectsPageMeta.data;
      if (metaData) {
        setMetaFormData({
          metaTitle: metaData.metaTitle as TranslatedField || { pl: "", en: "" },
          metaDescription: metaData.metaDescription as TranslatedField || { pl: "", en: "" },
          metaKeywords: metaData.metaKeywords as TranslatedField || { pl: "", en: "" },
          ogImage: metaData.ogImage || "",
        });
      }
    }, [projectsPageMeta.data]);

    const handleMetaFieldChange = (
      field: keyof ProjectsPageMetaFormData,
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

    const handleMetaSimpleFieldChange = (field: keyof ProjectsPageMetaFormData, value: string) => {
      setMetaFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

    const handleMetaSubmit = () => {
      updateProjectsPageMeta(metaFormData);
    };
  
    const handleCreateProject = (data: any) => {
      const maxOrder = projects.data?.reduce((max, project) => Math.max(max, project.order), 0) || 0;
      
      createProject({
        ...data,
        url: data.url || null,
        repoUrl: data.repoUrl || null,
        repoUrl2: data.repoUrl2 || null,
        imageUrl: data.imageUrl || null,
        order: maxOrder + 1
      });
    };
  
    const handleUpdateProject = (id: string, data: any) => {
      const project = projects.data?.find(p => p.id === id);
      if (!project) return;
      
      updateProject({
        id,
        title: data.title,
        description: data.description,
        url: data.url || null,
        repoUrl: data.repoUrl || null,
        repoUrl2: data.repoUrl2 || null,
        imageUrl: data.imageUrl || null,
        isActive: data.isActive,
        order: project.order
      });
    };
  
    const handleDeleteProject = (id: string) => {
      deleteProject(id);
    };
  
    const handleChangeProjectOrder = (id: string, direction: "up" | "down") => {
      changeProjectOrder({
        id,
        direction
      });
    };
  
    const projectColumns: Column[] = [
      {
        key: "title.pl",
        header: t("admin.projects.titlePl"),
        render: (item) => item.title.pl,
        sortable: true,
        searchable: true
      },
      {
        key: "title.en",
        header: t("admin.projects.titleEn"),
        render: (item) => item.title.en,
        sortable: true,
        searchable: true
      },
      {
        key: "url",
        header: t("admin.projects.url"),
        render: (item) => item.url || "-",
        sortable: true,
        searchable: true
      },
      {
        key: "isActive",
        header: t("admin.projects.active"),
        render: (item) => item.isActive ? t("common.yes") : t("common.no"),
        sortable: true
      },
      {
        key: "order",
        header: t("admin.projects.order"),
        render: (item) => item.order,
        sortable: true
      }
    ];
  
    if (projects.isLoading || projectsPageMeta.isLoading) {
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
                <h3 className="text-lg font-semibold leading-none tracking-tight">{t("admin.metaTags.projectsPageTitle")}</h3>
                <p className="text-sm text-muted-foreground mt-1">{t("admin.metaTags.projectsPageDescription")}</p>
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
                <Label>{t("admin.metaTags.ogImage")}</Label>
                <Input
                  value={metaFormData.ogImage || ""}
                  onChange={(e) =>
                    handleMetaSimpleFieldChange("ogImage", e.target.value)
                  }
                  placeholder={t("admin.metaTags.ogImagePlaceholder")}
                />
              </div>

              <Button onClick={handleMetaSubmit}>{t("common.save")}</Button>
            </CardContent>
          )}
        </Card>

        <Card>
          <CardContent className="p-6">
            <DataTable
              title={t("admin.projects.title")}
              addButtonText={t("admin.projects.addNew")}
              columns={projectColumns}
              data={projects.data || []}
              FormComponent={ProjectForm}
              onAdd={handleCreateProject}
              onEdit={handleUpdateProject}
              onDelete={handleDeleteProject}
              onChangeOrder={handleChangeProjectOrder}
              addDialogTitle={t("admin.projects.addNewTitle")}
              editDialogTitle={t("admin.projects.editTitle")}
              deleteDialogTitle={t("admin.projects.deleteTitle")}
              deleteDialogConfirmText={t("admin.projects.deleteConfirm")}
              showOrderButtons={true}
            />
          </CardContent>
        </Card>
      </div>
    );
}
