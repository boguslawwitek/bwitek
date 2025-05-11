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
import { useTranslation } from "react-i18next";
import { useState } from "react";

export type Column = {
  key: string;
  header: string;
  render?: (item: any) => ReactNode;
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
  const { t } = useTranslation();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

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

  return (
    <Card className="mt-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>{addButtonText}</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{addDialogTitle}</DialogTitle>
            </DialogHeader>
            <FormComponent
              onSubmit={handleAdd}
              onCancel={() => setIsAddDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead key={column.key}>{column.header}</TableHead>
                ))}
                {(onEdit || onDelete || onChangeOrder) && (
                  <TableHead>{t("common.actions")}</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item, index) => (
                <TableRow key={item[idField]}>
                  {columns.map((column) => (
                    <TableCell key={`${item[idField]}-${column.key}`}>
                      {column.render
                        ? column.render(item)
                        : item[column.key] || "-"}
                    </TableCell>
                  ))}
                  {(onEdit || onDelete || onChangeOrder) && (
                    <TableCell>
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
                            <DialogContent>
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
                        {showOrderButtons && onChangeOrder && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onChangeOrder(item[idField], "up")}
                              disabled={item.order === 1}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-4 w-4"
                              >
                                <path d="m18 15-6-6-6 6" />
                              </svg>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onChangeOrder(item[idField], "down")}
                              disabled={item.order === Math.max(...data.map(i => i.order))}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-4 w-4"
                              >
                                <path d="m6 9 6 6 6-6" />
                              </svg>
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
                            <DialogContent>
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
      </CardContent>
    </Card>
  );
};
