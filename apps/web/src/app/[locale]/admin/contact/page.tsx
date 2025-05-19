"use client"
import { trpc } from "@/utils/trpc";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {useTranslations} from 'next-intl';
import { Card, CardContent } from "@/components/ui/card";
import { useMutation } from "@tanstack/react-query";
import { DataTable, type Column } from "@/components/admin/data-table";
import { ContactForm } from "@/components/admin/contact-form";

export default function AdminPanelContact() {
    const t = useTranslations();
  
  const contacts = useQuery(trpc.content.getContact.queryOptions());

  const { mutate: createContact } = useMutation(trpc.content.createContact.mutationOptions({
    onMutate: () => {
      toast.loading(t("common.saving"));
    },
    onSuccess: () => {
      toast.success(t("common.saved"));
      contacts.refetch();
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
    onSettled: () => {
      toast.dismiss();
    }
  }));

  const { mutate: updateContact } = useMutation(trpc.content.updateContact.mutationOptions({
    onMutate: () => {
      toast.loading(t("common.updating"));
    },
    onSuccess: () => {
      toast.success(t("common.updated"));
      contacts.refetch();
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
    onSettled: () => {
      toast.dismiss();
    }
  }));

  const { mutate: deleteContact } = useMutation(trpc.content.deleteContact.mutationOptions({
    onMutate: () => {
      toast.loading(t("common.deleting"));
    },
    onSuccess: () => {
      toast.success(t("common.deleted"));
      contacts.refetch();
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
    onSettled: () => {
      toast.dismiss();
    }
  }));

  const { mutate: changeContactOrder } = useMutation(trpc.content.changeContactOrder.mutationOptions({
    onMutate: () => {
      toast.loading(t("common.updating"));
    },
    onSuccess: () => {
      toast.success(t("common.updated"));
      contacts.refetch();
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
    onSettled: () => {
      toast.dismiss();
    }
  }));

  const handleCreateContact = (data: any) => {
    const maxOrder = contacts.data?.reduce((max, item) => Math.max(max, item.order), 0) || 0;
    
    createContact({
      ...data,
      url: data.url || null,
      order: maxOrder + 1
    });
  };

  const handleUpdateContact = (id: string, data: any) => {
    const item = contacts.data?.find(item => item.id === id);
    if (!item) return;
    
    updateContact({
      id,
      name: data.name,
      url: data.url || null,
      external: data.external,
      newTab: data.newTab,
      order: item.order
    });
  };

  const handleDeleteContact = (id: string) => {
    deleteContact(id);
  };

  const handleChangeContactOrder = (id: string, direction: "up" | "down") => {
    changeContactOrder({
      id,
      direction
    });
  };

  const contactColumns: Column[] = [
    {
      key: "name.pl",
      header: t("admin.contact.namePl"),
      render: (item) => item.name.pl,
      sortable: true,
      searchable: true
    },
    {
      key: "name.en",
      header: t("admin.contact.nameEn"),
      render: (item) => item.name.en,
      sortable: true,
      searchable: true
    },
    {
      key: "url",
      header: t("admin.contact.url"),
      render: (item) => item.url || "-",
      sortable: true,
      searchable: true
    },
    {
      key: "order",
      header: t("admin.contact.order"),
      render: (item) => item.order,
      sortable: true
    }
  ];

  if (contacts.isLoading) {
    return <div>{t("common.loading")}</div>;
  }

  return (
    <Card>
      <CardContent className="p-6">
        <DataTable
          title={t("admin.contact.title")}
          addButtonText={t("admin.contact.addNew")}
          columns={contactColumns}
          data={contacts.data || []}
          FormComponent={ContactForm}
          onAdd={handleCreateContact}
          onEdit={handleUpdateContact}
          onDelete={handleDeleteContact}
          onChangeOrder={handleChangeContactOrder}
          addDialogTitle={t("admin.contact.addNewTitle")}
          editDialogTitle={t("admin.contact.editTitle")}
          deleteDialogTitle={t("admin.contact.deleteTitle")}
          deleteDialogConfirmText={t("admin.contact.deleteConfirm")}
          showOrderButtons={true}
        />
      </CardContent>
    </Card>
  );
}
