import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { trpc } from "@/utils/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { ProjectForm } from "@/components/dashboard/project-form";

function ProjectsRoute() {
  const { t } = useTranslation();
  
  const projects = useQuery(trpc.content.getProjects.queryOptions());

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

  const handleCreateProject = (data: any) => {
    const maxOrder = projects.data?.reduce((max, project) => Math.max(max, project.order), 0) || 0;
    
    createProject({
      ...data,
      url: data.url || null,
      repoUrl: data.repoUrl || null,
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

  if (projects.isLoading) {
    return <div>{t("common.loading")}</div>;
  }

  return (
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
  );
}

export const Route = createFileRoute("/admin/projects")({
  component: ProjectsRoute,
});
