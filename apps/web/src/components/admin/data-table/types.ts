import type { ReactNode } from "react";

export type Column = {
  key: string;
  header: string;
  render?: (item: any) => ReactNode;
  sortable?: boolean;
  searchable?: boolean;
  priority?: 'high' | 'medium' | 'low';
};

export interface ResponsiveDataTableProps {
  title: string;
  addButtonText: string;
  columns: Column[];
  data: any[];
  FormComponent?: React.ComponentType<{
    initialData?: any;
    onSubmit: (data: any) => void;
    onCancel: () => void;
  }>;
  onAdd?: (data: any) => void;
  onEdit?: (id: string, data: any) => void;
  onDelete?: (id: string) => void;
  onChangeOrder?: (id: string, direction: "up" | "down") => void;
  addDialogTitle?: string;
  editDialogTitle?: string;
  deleteDialogTitle?: string;
  deleteDialogConfirmText?: string;
  showOrderButtons?: boolean;
  showAddButton?: boolean;
  idField?: string;
  searchPlaceholder?: string;
  customActions?: (item: any) => ReactNode;
}

export interface MobileDataCardProps {
  item: any;
  columns: Column[];
  onEdit?: (id: string, data: any) => void;
  onDelete?: (id: string) => void;
  onChangeOrder?: (id: string, direction: "up" | "down") => void;
  editingItem: any;
  setEditingItem: (item: any) => void;
  setItemToDelete: (id: string | null) => void;
  FormComponent?: React.ComponentType<{
    initialData?: any;
    onSubmit: (data: any) => void;
    onCancel: () => void;
  }>;
  editDialogTitle?: string;
  deleteDialogTitle?: string;
  deleteDialogConfirmText?: string;
  showOrderButtons?: boolean;
  orderingMode?: boolean;
  data: any[];
  idField: string;
  t: (key: string) => string;
  customActions?: (item: any) => ReactNode;
}

export interface DesktopDataTableProps {
  columns: Column[];
  data: any[];
  sortColumn: string | null;
  sortDirection: 'asc' | 'desc';
  setSortColumn: (column: string | null) => void;
  setSortDirection: (direction: 'asc' | 'desc') => void;
  onEdit?: (id: string, data: any) => void;
  onDelete?: (id: string) => void;
  onChangeOrder?: (id: string, direction: "up" | "down") => void;
  editingItem: any;
  setEditingItem: (item: any) => void;
  setItemToDelete: (id: string | null) => void;
  FormComponent?: React.ComponentType<{
    initialData?: any;
    onSubmit: (data: any) => void;
    onCancel: () => void;
  }>;
  editDialogTitle?: string;
  showOrderButtons?: boolean;
  orderingMode?: boolean;
  idField: string;
  t: (key: string) => string;
  customActions?: (item: any) => ReactNode;
}
