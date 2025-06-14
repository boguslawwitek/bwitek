import { z } from "zod";
import { useTranslations } from "next-intl";
import { EntityForm, type FieldConfig } from "@/components/admin/entity-form";

type ProjectFormProps = {
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
};

export const ProjectForm = ({
  initialData,
  onSubmit,
  onCancel,
}: ProjectFormProps) => {
  const t = useTranslations();

  const fields: FieldConfig[] = [
    {
      name: "title.pl",
      type: "text",
      label: t("admin.projects.titlePl"),
      required: true,
    },
    {
      name: "title.en",
      type: "text",
      label: t("admin.projects.titleEn"),
      required: true,
    },
    {
      name: "description.pl",
      type: "textarea",
      label: t("admin.projects.descriptionPl"),
      required: true,
    },
    {
      name: "description.en",
      type: "textarea",
      label: t("admin.projects.descriptionEn"),
      required: true,
    },
    {
      name: "url",
      type: "text",
      label: t("admin.projects.url"),
    },
    {
      name: "repoUrl",
      type: "text",
      label: t("admin.projects.repoUrl"),
    },
    {
      name: "repoUrl2",
      type: "text",
      label: t("admin.projects.repoUrl2"),
    },
    {
      name: "imageUrl",
      type: "text",
      label: t("admin.projects.imageUrl"),
    },
    {
      name: "isActive",
      type: "switch",
      label: t("admin.projects.active"),
      defaultValue: true,
    },
  ];

  const schema = z.object({
    title: z.object({
      pl: z.string().min(1, t("components.validation.required") as string),
      en: z.string().min(1, t("components.validation.required") as string),
    }),
    description: z.object({
      pl: z.string().min(1, t("components.validation.required") as string),
      en: z.string().min(1, t("components.validation.required") as string),
    }),
    url: z.string().nullable().optional(),
    repoUrl: z.string().nullable().optional(),
    repoUrl2: z.string().nullable().optional(),
    imageUrl: z.string().nullable().optional(),
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
