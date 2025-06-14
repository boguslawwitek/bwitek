import { useTranslations } from "next-intl";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { EntityForm, type FieldConfig } from "@/components/admin/entity-form";

type SkillFormProps = {
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
};

export const SkillForm = ({
  initialData,
  onSubmit,
  onCancel,
}: SkillFormProps) => {
  const t = useTranslations();
  const { data: categories } = useQuery(trpc.content.getSkillCategories.queryOptions());

  const fields: FieldConfig[] = [
    {
      name: "name.pl",
      type: "text",
      label: t("admin.skills.namePl"),
      required: true,
    },
    {
      name: "name.en",
      type: "text",
      label: t("admin.skills.nameEn"),
      required: true,
    },
    {
      name: "categoryId",
      type: "select",
      label: t("admin.skills.category"),
      options: categories?.map(category => ({
        value: category.id,
        label: `${category.name.pl} / ${category.name.en}`
      })) || [],
    },
    {
      name: "iconName",
      type: "text",
      label: t("admin.skills.iconName"),
    },
    {
      name: "iconProvider",
      type: "select",
      label: t("admin.skills.iconProvider"),
      options: [
        { value: "", label: t("common.select") },
        { value: "lucide", label: "Lucide React" },
        { value: "simple-icons", label: "Simple Icons" }
      ]
    },
    {
      name: "isActive",
      type: "switch",
      label: t("admin.skills.active"),
      defaultValue: true,
    },
  ];

  const schema = z.object({
    name: z.object({
      pl: z.string().min(1, t("components.validation.required") as string),
      en: z.string().min(1, t("components.validation.required") as string),
    }),
    categoryId: z.string().nullable(),
    iconName: z.string().optional().nullable(),
    iconProvider: z.string().optional().nullable(),
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
