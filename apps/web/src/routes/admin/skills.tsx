import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { trpc } from "@/utils/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { SkillForm } from "@/components/dashboard/skill-form";
import { SkillCategoryForm } from "@/components/dashboard/skill-category-form";

function SkillsRoute() {
  const { t } = useTranslation();
  
  const skills = useQuery(trpc.content.getSkills.queryOptions());
  const categories = useQuery(trpc.content.getSkillCategories.queryOptions());

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

  if (skills.isLoading || categories.isLoading) {
    return <div>{t("common.loading")}</div>;
  }

  return (
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
  );
}

export const Route = createFileRoute("/admin/skills")({
  component: SkillsRoute,
});
