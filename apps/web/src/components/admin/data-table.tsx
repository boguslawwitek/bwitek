import type { ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useTranslations } from "next-intl";
import { useState, useEffect, useMemo } from "react";
import { Icon } from '@/components/icon';

export type Column = {
  key: string;
  header: string;
  render?: (item: any) => ReactNode;
  sortable?: boolean;
  searchable?: boolean;
};

type DataTableProps = {
  title: string;
  addButtonText: string;
  columns: Column[];
  data: any[];
  FormComponent: React.ComponentType<{
    initialData?: any;
    onSubmit: (data: any) => void;
    onCancel: () => void;
  }>;
  onAdd: (data: any) => void;
  onEdit?: (id: string, data: any) => void;
  onDelete?: (id: string) => void;
  onChangeOrder?: (id: string, direction: "up" | "down") => void;
  addDialogTitle: string;
  editDialogTitle: string;
  deleteDialogTitle: string;
  deleteDialogConfirmText: string;
  showOrderButtons?: boolean;
  idField?: string;
};

export const DataTable = ({
  title,
  addButtonText,
  columns,
  data,
  FormComponent,
  onAdd,
  onEdit,
  onDelete,
  onChangeOrder,
  addDialogTitle,
  editDialogTitle,
  deleteDialogTitle,
  deleteDialogConfirmText,
  showOrderButtons = false,
  idField = "id",
}: DataTableProps) => {
  const t = useTranslations();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [orderingMode, setOrderingMode] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);

  const handleAdd = (data: any) => {
    onAdd(data);
    setIsAddDialogOpen(false);
  };

  const handleEdit = (data: any) => {
    if (editingItem && onEdit) {
      onEdit(editingItem[idField], data);
      setEditingItem(null);
    }
  };

  const handleDelete = () => {
    if (itemToDelete && onDelete) {
      onDelete(itemToDelete);
      setItemToDelete(null);
    }
  };

  const handleSort = (key: string) => {
    setSortConfig((prevSortConfig) => {
      if (!prevSortConfig || prevSortConfig.key !== key) {
        return { key, direction: 'asc' };
      }
      
      if (prevSortConfig.direction === 'asc') {
        return { key, direction: 'desc' };
      }
      
      return null;
    });
  };

  useEffect(() => {
    if (orderingMode) {
      setSortConfig(null);
      setSearchTerm("");
    }
  }, [orderingMode]);

  const getNestedValue = (obj: any, path: string) => {
    if (!obj) return '';
    
    const column = columns.find(c => c.key === path);
    if (column && column.render) {
      const rendered = column.render(obj);

      if (typeof rendered !== 'object') {
        return rendered;
      }
    }
    
    const keys = path.split('.');
    let value = obj;
    
    for (const key of keys) {
      if (value === null || value === undefined) return '';
      value = value[key];
    }
    
    return value === null || value === undefined ? '' : value;
  };

  const filteredAndSortedData = useMemo(() => {
    let result = data;
    
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      result = data.filter((item) => {
        return columns.some((column) => {
          if (!column.searchable) return false;
          
          const value = getNestedValue(item, column.key);
          return String(value || '').toLowerCase().includes(lowerCaseSearchTerm);
        });
      });
    }
    
    if (sortConfig && !orderingMode) {
      result = [...result].sort((a, b) => {
        const aValue = getNestedValue(a, sortConfig.key);
        const bValue = getNestedValue(b, sortConfig.key);
        
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
        }
        
        const aString = String(aValue || '');
        const bString = String(bValue || '');
        
        return sortConfig.direction === 'asc' 
          ? aString.localeCompare(bString)
          : bString.localeCompare(aString);
      });
    } else if (orderingMode) {
      result = [...result].sort((a, b) => a.order - b.order);
    }
    
    return result;
  }, [data, searchTerm, columns, sortConfig, orderingMode]);

  return (
    <Card className="mt-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <div className="flex space-x-2">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>{addButtonText}</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{addDialogTitle}</DialogTitle>
              </DialogHeader>
              <FormComponent
                onSubmit={handleAdd}
                onCancel={() => setIsAddDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <div className="px-6 pb-2 flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex items-center space-x-2">
          {showOrderButtons && onChangeOrder && (
            <div className="flex items-center space-x-2">
              <Switch 
                id="ordering-mode" 
                checked={orderingMode} 
                onCheckedChange={setOrderingMode}
              />
              <Label htmlFor="ordering-mode" className="text-sm font-medium">
                {t("common.changeOrder")}
              </Label>
            </div>
          )}
        </div>
        <Input
          className="max-w-xs"
          placeholder={t("common.search")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          disabled={orderingMode}
        />
      </div>
      <CardContent>
        <div className="overflow-x-auto max-w-full">
          <div className="rounded-md border">
            <Table className="min-w-max">
              <TableHeader>
                <TableRow>
                  {columns.map((column) => {
                    const isTextColumn = column.key.includes('title') || column.key === 'url';
                    return (
                      <TableHead 
                        key={column.key}
                        className={`${isTextColumn ? "min-w-[200px] max-w-[300px]" : "whitespace-nowrap"} ${column.sortable && !orderingMode ? "cursor-pointer hover:bg-muted" : ""}`}
                        onClick={() => column.sortable && !orderingMode && handleSort(column.key)}
                      >
                        <div className="flex items-center select-none">
                          {column.header}
                          {sortConfig && sortConfig.key === column.key && (
                            <span className="ml-1">
                              {sortConfig.direction === 'asc' ? '▲' : '▼'}
                            </span>
                          )}
                        </div>
                      </TableHead>
                    );
                  })}
                  {(onEdit || onDelete || (onChangeOrder && orderingMode)) && (
                    <TableHead className="select-none whitespace-nowrap">{t("common.actions")}</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedData.map((item, index) => (
                  <TableRow key={item[idField]}>
                    {columns.map((column) => {
                      const content = column.render
                        ? column.render(item)
                        : item[column.key] || "-";
                      
                      const isTextColumn = column.key.includes('title') || column.key === 'url';
                      
                      return (
                        <TableCell key={`${item[idField]}-${column.key}`} className={isTextColumn ? "min-w-[200px] max-w-[300px]" : "whitespace-nowrap"}>
                          {isTextColumn ? (
                            <div 
                              className="truncate" 
                              title={typeof content === 'string' ? content : String(content)}
                            >
                              {content}
                            </div>
                          ) : (
                            content
                          )}
                        </TableCell>
                      );
                    })}
                    {(onEdit || onDelete || onChangeOrder) && (
                      <TableCell className="whitespace-nowrap">
                        <div className="flex gap-2">
                          {onEdit && (
                            <Dialog
                              open={editingItem?.[idField] === item[idField]}
                              onOpenChange={(open) =>
                                setEditingItem(open ? item : null)
                              }
                            >
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  {t("common.edit")}
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>{editDialogTitle}</DialogTitle>
                                </DialogHeader>
                                <FormComponent
                                  initialData={item}
                                  onSubmit={handleEdit}
                                  onCancel={() => setEditingItem(null)}
                                />
                              </DialogContent>
                            </Dialog>
                          )}
                          {showOrderButtons && onChangeOrder && orderingMode && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onChangeOrder(item[idField], "up")}
                                disabled={item.order === 1}
                              >
                                <Icon name="ArrowUp" provider="lu" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onChangeOrder(item[idField], "down")}
                                disabled={item.order === Math.max(...data.map(i => i.order))}
                              >
                                <Icon name="ArrowDown" provider="lu" />
                              </Button>
                            </>
                          )}
                          {onDelete && (
                            <Dialog
                              open={itemToDelete === item[idField]}
                              onOpenChange={(open) =>
                                setItemToDelete(open ? item[idField] : null)
                              }
                            >
                              <DialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                  {t("common.delete")}
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>{deleteDialogTitle}</DialogTitle>
                                </DialogHeader>
                                <div className="py-4">
                                  <p>{deleteDialogConfirmText}</p>
                                </div>
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    onClick={() => setItemToDelete(null)}
                                  >
                                    {t("common.cancel")}
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    onClick={handleDelete}
                                  >
                                    {t("common.delete")}
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
