"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icon } from '@/components/icon';
import { cn } from "@/lib/utils";
import { trpc } from "@/utils/trpc";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslations } from 'next-intl';

interface FileUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onClear?: () => void;
  onOldFileDelete?: (oldUrl: string) => void;
  category?: "blog" | "meta" | "general";
  accept?: string;
  maxSize?: number;
  className?: string;
  label?: string;
  placeholder?: string;
}

const getFullImageUrl = (url: string): string => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  if (url.startsWith('/api/uploads/')) {
    return `${process.env.NEXT_PUBLIC_SERVER_URL}${url}`;
  }
  if (url.startsWith('/uploads/')) {
    return `${process.env.NEXT_PUBLIC_SERVER_URL}/api${url}`;
  }
  return url;
};

export default function FileUpload({
  value,
  onChange,
  onClear,
  onOldFileDelete,
  category = "general",
  accept = "image/*",
  maxSize = 5 * 1024 * 1024, // 5MB
  className,
  label,
  placeholder = "Upload an image or enter URL",
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [urlInput, setUrlInput] = useState(value || "");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = useTranslations();

  const { mutate: uploadImage, isPending } = useMutation(
    trpc.upload.uploadImage.mutationOptions({
      onSuccess: (data: any) => {
        if (value && value !== data.url && onOldFileDelete) {
          onOldFileDelete(value);
        }
        
        onChange(data.url);
        setUrlInput(data.url);
        toast.success("Image uploaded successfully");
      },
      onError: (error: any) => {
        toast.error(error.message);
      },
    })
  );

  const handleFileSelect = useCallback(
    async (file: File) => {
      if (file.size > maxSize) {
        toast.error(`File too large. Maximum size is ${Math.round(maxSize / 1024 / 1024)}MB`);
        return;
      }

      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        const data = base64.split(",")[1];

        uploadImage({
          file: {
            name: file.name,
            type: file.type,
            size: file.size,
            data,
          },
          category,
        });
      };
      reader.readAsDataURL(file);
    },
    [maxSize, uploadImage, category]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      if (files[0]) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files?.[0]) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect]
  );

  const handleUrlChange = (url: string) => {
    setUrlInput(url);
    onChange(url);
  };

  const handleClear = () => {
    setUrlInput("");
    onChange("");
    if (onClear) onClear();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemove = () => {
    if (value && onOldFileDelete) {
      onOldFileDelete(value);
    }
    onChange("");
    setUrlInput("");
  };

  return (
    <div className={cn("space-y-4", className)}>
      {label && <Label>{label}</Label>}
      
      {value && (
        <div className="relative inline-block">
          <img
            src={getFullImageUrl(value)}
            alt="Preview"
            className="max-w-xs max-h-32 object-cover rounded-lg border"
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
            onClick={handleRemove}
          >
            <Icon name="X" provider="lu" className="h-3 w-3" />
          </Button>
        </div>
      )}

      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
          isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25",
          isPending && "opacity-50 pointer-events-none"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileInputChange}
          className="hidden"
        />

        {isPending ? (
          <div className="flex flex-col items-center gap-2">
            <Icon name="Loader" provider="lu" className="h-8 w-8 animate-spin" />
            <p className="text-sm text-muted-foreground">{t("fileUpload.uploading")}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <Icon name="Image" provider="lu" className="h-8 w-8 text-muted-foreground" />
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {t("fileUpload.dragAndDrop")}
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                <Icon name="Upload" provider="lu" className="h-4 w-4 mr-2" />
                {t("fileUpload.chooseFile")}
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Input
          type="url"
          placeholder={placeholder}
          value={urlInput}
          onChange={(e) => handleUrlChange(e.target.value)}
        />
        {urlInput && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClear}
          >
            {t("fileUpload.clear")}
          </Button>
        )}
      </div>
    </div>
  );
} 