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
import { ContactForm } from "@/components/admin/contact-form";
import { ChevronDown, ChevronUp } from "lucide-react";

type TranslatedField = {
  pl: string;
  en: string;
};

type ContactPageMetaFormData = {
  metaTitle?: TranslatedField;
  metaDescription?: TranslatedField;
  metaKeywords?: TranslatedField;
  ogImage?: string;
};

export default function AdminPanelContact() {
    const t = useTranslations();
  
  const contacts = useQuery(trpc.content.getContact.queryOptions());
  const contactPageMeta = useQuery(trpc.content.getContactPageMeta.queryOptions());

  const [isMetaExpanded, setIsMetaExpanded] = useState(false);

  const { mutate: updateContactPageMeta } = useMutation(trpc.content.updateContactPageMeta.mutationOptions({
    onMutate: () => {
      toast.loading(t("common.saving"));
    },
    onSuccess: () => {
      toast.success(t("common.saved"));
      contactPageMeta.refetch();
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
    onSettled: () => {
      toast.dismiss();
    }
  }));

  const [metaFormData, setMetaFormData] = useState<ContactPageMetaFormData>({
    metaTitle: { pl: "", en: "" },
    metaDescription: { pl: "", en: "" },
    metaKeywords: { pl: "", en: "" },
    ogImage: "",
  });

  useEffect(() => {
    const metaData = contactPageMeta.data;
    if (metaData) {
      setMetaFormData({
        metaTitle: metaData.metaTitle as TranslatedField || { pl: "", en: "" },
        metaDescription: metaData.metaDescription as TranslatedField || { pl: "", en: "" },
        metaKeywords: metaData.metaKeywords as TranslatedField || { pl: "", en: "" },
        ogImage: metaData.ogImage || "",
      });
    }
  }, [contactPageMeta.data]);

  const handleMetaFieldChange = (
    field: keyof ContactPageMetaFormData,
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

  const handleMetaSimpleFieldChange = (field: keyof ContactPageMetaFormData, value: string) => {
    setMetaFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleMetaSubmit = () => {
    updateContactPageMeta(metaFormData);
  };

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

  if (contacts.isLoading || contactPageMeta.isLoading) {
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
              <h3 className="text-lg font-semibold leading-none tracking-tight">{t("admin.metaTags.contactPageTitle")}</h3>
              <p className="text-sm text-muted-foreground mt-1">{t("admin.metaTags.contactPageDescription")}</p>
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
    </div>
  );
}
