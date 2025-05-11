import type { ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

export type FieldConfig = {
  name: string;
  type: "text" | "number" | "email" | "password" | "switch" | "select" | "custom";
  label: string;
  required?: boolean;
  customComponent?: (field: any, props: any) => ReactNode;
  options?: { value: string | number; label: string }[];
  validation?: (validator: z.ZodType<any, any>) => z.ZodType<any, any>;
  defaultValue?: any;
};

type EntityFormProps = {
  fields: FieldConfig[];
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  schema?: z.ZodType<any, any>;
};

export const EntityForm = ({
  fields,
  initialData,
  onSubmit,
  onCancel,
  schema,
}: EntityFormProps) => {
  const { t } = useTranslation();

  const generateSchema = () => {
    const schemaObj: Record<string, any> = {};

    fields.forEach((field) => {
      let validator: z.ZodType<any, any>;

      if (field.type === "number") {
        validator = z.number();
      } else if (field.type === "switch") {
        validator = z.boolean();
      } else if (field.type === "select") {
        validator = z.string();
      } else {
        validator = z.string();
      }

      if (field.required) {
        if (field.type === "number") {
          validator = (validator as z.ZodNumber).min(0, t("validation.required") as string);
        } else if (field.type !== "switch") {
          validator = (validator as z.ZodString).min(1, t("validation.required") as string);
        }
      } else {
        if (field.type !== "switch") {
          validator = validator.optional();
        }
      }

      if (field.validation) {
        validator = field.validation(validator);
      }

      const fieldPath = field.name.split(".");
      if (fieldPath.length > 1) {
        let currentObj = schemaObj;
        for (let i = 0; i < fieldPath.length - 1; i++) {
          if (!currentObj[fieldPath[i]]) {
            currentObj[fieldPath[i]] = {};
          }
          currentObj = currentObj[fieldPath[i]];
        }
        currentObj[fieldPath[fieldPath.length - 1]] = validator;
      } else {
        schemaObj[field.name] = validator;
      }
    });

    return z.object(processNestedSchema(schemaObj));
  };

  const processNestedSchema = (obj: Record<string, any>): Record<string, any> => {
    const result: Record<string, any> = {};
    
    Object.keys(obj).forEach((key) => {
      if (typeof obj[key] === 'object' && !(obj[key] instanceof z.ZodType)) {
        result[key] = z.object(processNestedSchema(obj[key]));
      } else {
        result[key] = obj[key];
      }
    });
    
    return result;
  };

  const getDefaultValues = () => {
    const defaults: Record<string, any> = {};
    
    fields.forEach((field) => {
      if (field.defaultValue !== undefined) {
        setNestedValue(defaults, field.name, field.defaultValue);
      } else {
        if (field.type === "switch") {
          setNestedValue(defaults, field.name, false);
        } else if (field.type === "number") {
          setNestedValue(defaults, field.name, 0);
        } else {
          setNestedValue(defaults, field.name, "");
        }
      }
    });
    
    if (initialData) {
      fields.forEach((field) => {
        const value = getNestedValue(initialData, field.name);
        if (value !== undefined) {
          setNestedValue(defaults, field.name, value);
        }
      });
    }
    
    return defaults;
  };

  const getNestedValue = (obj: any, path: string) => {
    const keys = path.split('.');
    let value = obj;
    
    for (const key of keys) {
      if (value === undefined || value === null) return undefined;
      value = value[key];
    }
    
    return value;
  };
  
  const setNestedValue = (obj: any, path: string, value: any) => {
    const keys = path.split('.');
    let current = obj;
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
  };

  const form = useForm({
    resolver: schema ? zodResolver(schema) : zodResolver(generateSchema()),
    defaultValues: getDefaultValues(),
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {fields.map((field) => (
          <FormField
            key={field.name}
            control={form.control}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label}</FormLabel>
                <FormControl>
                  {field.type === "text" || field.type === "email" || field.type === "password" ? (
                    <Input
                      type={field.type}
                      value={formField.value || ""}
                      onChange={formField.onChange}
                      onBlur={formField.onBlur}
                      name={formField.name}
                      ref={formField.ref}
                    />
                  ) : field.type === "number" ? (
                    <Input
                      type="number"
                      value={formField.value || ""}
                      onChange={(e) => formField.onChange(parseFloat(e.target.value))}
                      onBlur={formField.onBlur}
                      name={formField.name}
                      ref={formField.ref}
                    />
                  ) : field.type === "switch" ? (
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={formField.value}
                        onCheckedChange={formField.onChange}
                        name={formField.name}
                        ref={formField.ref}
                      />
                      <span>{formField.value ? t("common.yes") : t("common.no")}</span>
                    </div>
                  ) : field.type === "select" && field.options ? (
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={formField.value || ""}
                      onChange={(e) => formField.onChange(e.target.value === "" ? null : e.target.value)}
                      onBlur={formField.onBlur}
                      name={formField.name}
                      ref={formField.ref}
                    >
                      <option value="">{t("common.select")}</option>
                      {field.options.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : field.type === "custom" && field.customComponent ? (
                    field.customComponent(formField, form)
                  ) : null}
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            {t("common.cancel")}
          </Button>
          <Button type="submit">
            {initialData ? t("common.update") : t("common.add")}
          </Button>
        </div>
      </form>
    </Form>
  );
};
