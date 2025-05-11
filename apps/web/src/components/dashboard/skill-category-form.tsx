import { useTranslation } from "react-i18next";
import { z } from "zod";
import { EntityForm, type FieldConfig } from "./entity-form";

type SkillCategoryFormProps = {
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
};

export const SkillCategoryForm = ({
  initialData,
  onSubmit,
  onCancel,
}: SkillCategoryFormProps) => {
  const { t } = useTranslation();

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
  ];

  const schema = z.object({
    name: z.object({
      pl: z.string().min(1, t("validation.required") as string),
      en: z.string().min(1, t("validation.required") as string),
    }),
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
