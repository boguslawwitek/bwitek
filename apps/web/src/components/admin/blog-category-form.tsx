import { useTranslations } from "next-intl";
import { z } from "zod";
import { EntityForm, type FieldConfig } from "@/components/admin/entity-form";

type BlogCategoryFormProps = {
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
};

export const BlogCategoryForm = ({
  initialData,
  onSubmit,
  onCancel,
}: BlogCategoryFormProps) => {
  const t = useTranslations();

  const fields: FieldConfig[] = [
    {
      name: "name.pl",
      type: "text",
      label: t("admin.blog.categoryNamePl"),
      required: true,
    },
    {
      name: "name.en",
      type: "text",
      label: t("admin.blog.categoryNameEn"),
      required: true,
    },
    {
      name: "slug",
      type: "text",
      label: t("admin.blog.categorySlug"),
      required: true,
    },
    {
      name: "description.pl",
      type: "textarea",
      label: t("admin.blog.categoryDescriptionPl"),
    },
    {
      name: "description.en",
      type: "textarea",
      label: t("admin.blog.categoryDescriptionEn"),
    },
    {
      name: "iconName",
      type: "text",
      label: t("admin.blog.iconName"),
    },
    {
      name: "iconProvider",
      type: "select",
      label: t("admin.blog.iconProvider"),
      options: [
        { value: "", label: t("common.select") },
        { value: "lucide", label: "Lucide React" },
        { value: "simple-icons", label: "Simple Icons" }
      ]
    },
    {
      name: "isActive",
      type: "switch",
      label: t("admin.blog.categoryActive"),
      defaultValue: true,
    },
  ];

  const schema = z.object({
    name: z.object({
      pl: z.string().min(1, t("components.validation.required") as string),
      en: z.string().min(1, t("components.validation.required") as string),
    }),
    slug: z.string().min(1, t("components.validation.required") as string),
    description: z.object({
      pl: z.string().optional(),
      en: z.string().optional(),
    }).optional(),
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