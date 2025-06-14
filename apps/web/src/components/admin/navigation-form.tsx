import { z } from "zod";
import { useTranslations } from "next-intl";
import { EntityForm, type FieldConfig } from "@/components/admin/entity-form";

type NavigationFormProps = {
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
};

export const NavigationForm = ({
  initialData,
  onSubmit,
  onCancel,
}: NavigationFormProps) => {
  const t = useTranslations();

  const fields: FieldConfig[] = [
    {
      name: "label.pl",
      type: "text",
      label: t("admin.navigation.labelPl"),
      required: true,
    },
    {
      name: "label.en",
      type: "text",
      label: t("admin.navigation.labelEn"),
      required: true,
    },
    {
      name: "url",
      type: "text",
      label: t("admin.navigation.url"),
    },
    {
      name: "external",
      type: "switch",
      label: t("admin.navigation.external"),
      defaultValue: false,
    },
    {
      name: "newTab",
      type: "switch",
      label: t("admin.navigation.newTab"),
      defaultValue: false,
    },
    {
      name: "isActive",
      type: "switch",
      label: t("admin.navigation.active"),
      defaultValue: true,
    },
  ];

  const schema = z.object({
    label: z.object({
      pl: z.string().min(1, t("components.validation.required") as string),
      en: z.string().min(1, t("components.validation.required") as string),
    }),
    url: z.string().nullable().optional(),
    external: z.boolean().default(false),
    newTab: z.boolean().default(false),
    isActive: z.boolean().default(true),
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
