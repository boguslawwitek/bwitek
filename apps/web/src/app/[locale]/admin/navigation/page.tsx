"use client"
import { trpc } from "@/utils/trpc";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {useTranslations} from 'next-intl';
import { Card, CardContent } from "@/components/ui/card";
import { useMutation } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable, type Column } from "@/components/admin/data-table";
import { NavigationForm } from "@/components/admin/navigation-form";
import { TopBarForm } from "@/components/admin/topbar-form";

export default function AdminPanelNavigation() {
    const t = useTranslations();
  
    const navigationItems = useQuery(trpc.content.getNavigation.queryOptions());
    const topBarItems = useQuery(trpc.content.getTopBar.queryOptions());
  
    const { mutate: createNavItem } = useMutation(trpc.content.createNavItem.mutationOptions({
      onMutate: () => {
        toast.loading(t("common.saving"));
      },
      onSuccess: () => {
        toast.success(t("common.saved"));
        navigationItems.refetch();
      },
      onError: (error: any) => {
        toast.error(error.message);
      },
      onSettled: () => {
        toast.dismiss();
      }
    }));
  
    const { mutate: updateNavItem } = useMutation(trpc.content.updateNavItem.mutationOptions({
      onMutate: () => {
        toast.loading(t("common.updating"));
      },
      onSuccess: () => {
        toast.success(t("common.updated"));
        navigationItems.refetch();
      },
      onError: (error: any) => {
        toast.error(error.message);
      },
      onSettled: () => {
        toast.dismiss();
      }
    }));
  
    const { mutate: deleteNavItem } = useMutation(trpc.content.deleteNavItem.mutationOptions({
      onMutate: () => {
        toast.loading(t("common.deleting"));
      },
      onSuccess: () => {
        toast.success(t("common.deleted"));
        navigationItems.refetch();
      },
      onError: (error: any) => {
        toast.error(error.message);
      },
      onSettled: () => {
        toast.dismiss();
      }
    }));
  
    const { mutate: changeNavigationOrder } = useMutation(trpc.content.changeNavigationOrder.mutationOptions({
      onMutate: () => {
        toast.loading(t("common.updating"));
      },
      onSuccess: () => {
        toast.success(t("common.updated"));
        navigationItems.refetch();
      },
      onError: (error: any) => {
        toast.error(error.message);
      },
      onSettled: () => {
        toast.dismiss();
      }
    }));
  
    const { mutate: createTopBarItem } = useMutation(trpc.content.createTopBarItem.mutationOptions({
      onMutate: () => {
        toast.loading(t("common.saving"));
      },
      onSuccess: () => {
        toast.success(t("common.saved"));
        topBarItems.refetch();
      },
      onError: (error: any) => {
        toast.error(error.message);
      },
      onSettled: () => {
        toast.dismiss();
      }
    }));
  
    const { mutate: updateTopBarItem } = useMutation(trpc.content.updateTopBarItem.mutationOptions({
      onMutate: () => {
        toast.loading(t("common.updating"));
      },
      onSuccess: () => {
        toast.success(t("common.updated"));
        topBarItems.refetch();
      },
      onError: (error: any) => {
        toast.error(error.message);
      },
      onSettled: () => {
        toast.dismiss();
      }
    }));
  
    const { mutate: deleteTopBarItem } = useMutation(trpc.content.deleteTopBarItem.mutationOptions({
      onMutate: () => {
        toast.loading(t("common.deleting"));
      },
      onSuccess: () => {
        toast.success(t("common.deleted"));
        topBarItems.refetch();
      },
      onError: (error: any) => {
        toast.error(error.message);
      },
      onSettled: () => {
        toast.dismiss();
      }
    }));
  
    const { mutate: changeTopBarOrder } = useMutation(trpc.content.changeTopBarOrder.mutationOptions({
      onMutate: () => {
        toast.loading(t("common.updating"));
      },
      onSuccess: () => {
        toast.success(t("common.updated"));
        topBarItems.refetch();
      },
      onError: (error: any) => {
        toast.error(error.message);
      },
      onSettled: () => {
        toast.dismiss();
      }
    }));
  
    const handleCreateNavItem = (data: any) => {
      const maxOrder = navigationItems.data?.reduce((max, item) => Math.max(max, item.order), 0) || 0;
      
      createNavItem({
        ...data,
        url: data.url || null,
        order: maxOrder + 1
      });
    };
  
    const handleUpdateNavItem = (id: string, data: any) => {
      const item = navigationItems.data?.find(item => item.id === id);
      if (!item) return;
      
      updateNavItem({
        id,
        label: data.label,
        url: data.url || null,
        external: data.external,
        newTab: data.newTab,
        isActive: data.isActive,
        order: item.order
      });
    };
  
    const handleDeleteNavItem = (id: string) => {
      deleteNavItem(id);
    };
  
    const handleChangeNavigationOrder = (id: string, direction: "up" | "down") => {
      changeNavigationOrder({
        id,
        direction
      });
    };
  
    const handleCreateTopBarItem = (data: any) => {
      const maxOrder = topBarItems.data?.reduce((max, item) => Math.max(max, item.order), 0) || 0;
      
      createTopBarItem({
        ...data,
        url: data.url || null,
        iconName: data.iconName || null,
        ...(data.iconProvider ? { iconProvider: data.iconProvider } : {}),
        order: maxOrder + 1
      });
    };
  
    const handleUpdateTopBarItem = (id: string, data: any) => {
      const item = topBarItems.data?.find(item => item.id === id);
      if (!item) return;
      
      updateTopBarItem({
        id,
        name: data.name,
        url: data.url || null,
        iconName: data.iconName || null,
        ...(data.iconProvider ? { iconProvider: data.iconProvider } : {}),
        external: data.external,
        newTab: data.newTab,
        order: item.order
      });
    };
  
    const handleDeleteTopBarItem = (id: string) => {
      deleteTopBarItem(id);
    };
  
    const handleChangeTopBarOrder = (id: string, direction: "up" | "down") => {
      changeTopBarOrder({
        id,
        direction
      });
    };
  
    // Column definitions
    const navigationColumns: Column[] = [
      {
        key: "label.pl",
        header: t("admin.navigation.labelPl"),
        render: (item) => item.label.pl,
        sortable: true,
        searchable: true
      },
      {
        key: "label.en",
        header: t("admin.navigation.labelEn"),
        render: (item) => item.label.en,
        sortable: true,
        searchable: true
      },
      {
        key: "url",
        header: t("admin.navigation.url"),
        render: (item) => item.url || "-",
        sortable: true,
        searchable: true
      },
      {
        key: "isActive",
        header: t("admin.navigation.active"),
        render: (item) => item.isActive ? t("common.yes") : t("common.no"),
        sortable: true
      },
      {
        key: "order",
        header: t("admin.navigation.order"),
        render: (item) => item.order,
        sortable: true
      }
    ];
  
    const topBarColumns: Column[] = [
      {
        key: "name.pl",
        header: t("admin.topBar.namePl"),
        render: (item) => item.name.pl,
        sortable: true,
        searchable: true
      },
      {
        key: "name.en",
        header: t("admin.topBar.nameEn"),
        render: (item) => item.name.en,
        sortable: true,
        searchable: true
      },
      {
        key: "iconName",
        header: t("admin.topBar.iconName"),
        render: (item) => item.iconName || "-",
        sortable: true,
        searchable: true
      },
      {
        key: "url",
        header: t("admin.topBar.url"),
        render: (item) => item.url || "-",
        sortable: true,
        searchable: true
      },
      {
        key: "order",
        header: t("admin.topBar.order"),
        render: (item) => item.order,
        sortable: true
      }
    ];
  
    if (navigationItems.isLoading || topBarItems.isLoading) {
      return <div>{t("common.loading")}</div>;
    }
  
    return (
      <Card>
        <CardContent className="p-6">
          <Tabs defaultValue="navigation">
            <TabsList className="w-full mb-6">
              <TabsTrigger value="navigation" className="flex-1">{t("admin.navigation.title")}</TabsTrigger>
              <TabsTrigger value="topbar" className="flex-1">{t("admin.topBar.title")}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="navigation">
              <DataTable
                title={t("admin.navigation.title")}
                addButtonText={t("admin.navigation.addNew")}
                columns={navigationColumns}
                data={navigationItems.data || []}
                FormComponent={NavigationForm}
                onAdd={handleCreateNavItem}
                onEdit={handleUpdateNavItem}
                onDelete={handleDeleteNavItem}
                onChangeOrder={handleChangeNavigationOrder}
                addDialogTitle={t("admin.navigation.addNewTitle")}
                editDialogTitle={t("admin.navigation.editTitle")}
                deleteDialogTitle={t("admin.navigation.deleteTitle")}
                deleteDialogConfirmText={t("admin.navigation.deleteConfirm")}
                showOrderButtons={true}
              />
            </TabsContent>
            
            <TabsContent value="topbar">
              <DataTable
                title={t("admin.topBar.title")}
                addButtonText={t("admin.topBar.addNew")}
                columns={topBarColumns}
                data={topBarItems.data || []}
                FormComponent={TopBarForm}
                onAdd={handleCreateTopBarItem}
                onEdit={handleUpdateTopBarItem}
                onDelete={handleDeleteTopBarItem}
                onChangeOrder={handleChangeTopBarOrder}
                addDialogTitle={t("admin.topBar.addNewTitle")}
                editDialogTitle={t("admin.topBar.editTitle")}
                deleteDialogTitle={t("admin.topBar.deleteTitle")}
                deleteDialogConfirmText={t("admin.topBar.deleteConfirm")}
                showOrderButtons={true}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    );
}
