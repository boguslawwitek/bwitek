import { z } from "zod";
import { useTranslations } from "next-intl";
import { EntityForm, type FieldConfig } from "@/components/admin/entity-form";

type TopBarFormProps = {
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
};

export const TopBarForm = ({
  initialData,
  onSubmit,
  onCancel,
}: TopBarFormProps) => {
  const t = useTranslations();

  const fields: FieldConfig[] = [
    {
      name: "name.pl",
      type: "text",
      label: t("admin.topBar.namePl"),
      required: true,
    },
    {
      name: "name.en",
      type: "text",
      label: t("admin.topBar.nameEn"),
      required: true,
    },
    {
      name: "iconName",
      type: "text",
      label: t("admin.topBar.iconName"),
    },
    {
      name: "iconProvider",
      type: "select",
      label: t("admin.topBar.iconProvider"),
      options: [
        { value: "", label: t("common.select") },
        { value: "lucide", label: "Lucide React" },
        { value: "simple-icons", label: "Simple Icons" }
      ]
    },
    {
      name: "url",
      type: "text",
      label: t("admin.topBar.url"),
    },
    {
      name: "external",
      type: "switch",
      label: t("admin.topBar.external"),
      defaultValue: false,
    },
    {
      name: "newTab",
      type: "switch",
      label: t("admin.topBar.newTab"),
      defaultValue: false,
    },
  ];

  const schema = z.object({
    name: z.object({
      pl: z.string().min(1, t("components.validation.required") as string),
      en: z.string().min(1, t("components.validation.required") as string),
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
