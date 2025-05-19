import { z } from "zod";
import { useTranslations } from "next-intl";
import { EntityForm, type FieldConfig } from "@/components/admin/entity-form";

type ContactFormProps = {
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
};

export const ContactForm = ({
  initialData,
  onSubmit,
  onCancel,
}: ContactFormProps) => {
  const t = useTranslations();

  const fields: FieldConfig[] = [
    {
      name: "name.pl",
      type: "text",
      label: t("admin.contact.namePl"),
      required: true,
    },
    {
      name: "name.en",
      type: "text",
      label: t("admin.contact.nameEn"),
      required: true,
    },
    {
      name: "iconName",
      type: "text",
      label: t("admin.contact.iconName"),
    },
    {
      name: "iconProvider",
      type: "select",
      label: t("admin.contact.iconProvider"),
      options: [
        { value: "", label: t("common.select") },
        { value: "lucide", label: "Lucide React" },
        { value: "simple-icons", label: "Simple Icons" }
      ]
    },
    {
      name: "url",
      type: "text",
      label: t("admin.contact.url"),
    },
    {
      name: "external",
      type: "switch",
      label: t("admin.contact.external"),
      defaultValue: false,
    },
    {
      name: "newTab",
      type: "switch",
      label: t("admin.contact.newTab"),
      defaultValue: false,
    },
  ];

  const schema = z.object({
    name: z.object({
      pl: z.string().min(1, t("validation.required") as string),
      en: z.string().min(1, t("validation.required") as string),
    }),
    iconName: z.string().nullable().optional(),
    iconProvider: z.string().nullable().optional(),
    url: z.string().nullable().optional(),
    external: z.boolean().default(false),
    newTab: z.boolean().default(false),
  });

  return (
    <EntityForm
      fields={fields}
      initialData={initialData}
      onSubmit={onSubmit}
      onCancel={onCancel}
      schema={schema}
    />
  );
};
