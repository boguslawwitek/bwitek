import { useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
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
import { Icon } from '@/components/icon';
import { MobileDataCard } from "./mobile-data-card";
import { DesktopDataTable } from "./desktop-data-table";
import { type ResponsiveDataTableProps } from "./types";

const ResponsiveDataTable = ({
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
  showAddButton = true,
  idField = "id",
  searchPlaceholder = "Search",
  customActions,
}: ResponsiveDataTableProps) => {
  const t = useTranslations();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [orderingMode, setOrderingMode] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    
    return data.filter(item => {
      return columns.some(column => {
        if (!column.searchable) return false;
        
        const value = item[column.key];
        if (!value) return false;
        
        return value.toString().toLowerCase().includes(searchTerm.toLowerCase());
      });
    });
  }, [data, searchTerm, columns]);

  // Sort data based on sort column and direction
  const filteredAndSortedData = useMemo(() => {
    if (!sortColumn) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];
      
      if (aValue === bValue) return 0;
      
      const comparison = aValue > bValue ? 1 : -1;
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortColumn, sortDirection]);

  // Handle delete
  const handleDelete = () => {
    if (itemToDelete && onDelete) {
      onDelete(itemToDelete);
      setItemToDelete(null);
    }
  };

  return (
    <Card className="mt-4">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <CardTitle>{title}</CardTitle>
        <div className="flex space-x-2 w-full sm:w-auto">
          {showAddButton && onAdd && (
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto">{addButtonText}</Button>
              </DialogTrigger>
              <DialogContent className="max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{addDialogTitle}</DialogTitle>
                </DialogHeader>
                {FormComponent && (
                  <FormComponent
                    onSubmit={(data: any) => {
                      if (onAdd) {
                        onAdd(data);
                        setAddDialogOpen(false);
                      }
                    }}
                    onCancel={() => setAddDialogOpen(false)}
                  />
                )}
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row justify-between gap-2 mb-4">
          <div className="max-w-sm">
            <Input
              placeholder={searchPlaceholder == "Search" ? t("common.search") : searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          {showOrderButtons && onChangeOrder && (
            <div className="flex items-center space-x-2">
              <Switch
                id="ordering-mode"
                checked={orderingMode}
                onCheckedChange={setOrderingMode}
              />
              <Label htmlFor="ordering-mode">{t("common.changeOrder")}</Label>
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block">
          {filteredAndSortedData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? t("common.noResults") : t("common.noData")}
            </div>
          ) : (
            <DesktopDataTable
              columns={columns}
              data={filteredAndSortedData}
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              setSortColumn={setSortColumn}
              setSortDirection={setSortDirection}
              onEdit={onEdit}
              onDelete={onDelete}
              onChangeOrder={onChangeOrder}
              editingItem={editingItem}
              setEditingItem={setEditingItem}
              setItemToDelete={setItemToDelete}
              FormComponent={FormComponent}
              editDialogTitle={editDialogTitle}
              showOrderButtons={showOrderButtons}
              orderingMode={orderingMode}
              idField={idField}
              t={t}
              customActions={customActions}
            />
          )}
        </div>

        {/* Mobile Card View */}
        <div className="block lg:hidden">
          {filteredAndSortedData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? t("common.noResults") : t("common.noData")}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAndSortedData.map((item) => (
                <MobileDataCard
                  key={item[idField]}
                  item={item}
                  columns={columns}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onChangeOrder={onChangeOrder}
                  editingItem={editingItem}
                  setEditingItem={setEditingItem}
                  setItemToDelete={setItemToDelete}
                  FormComponent={FormComponent}
                  editDialogTitle={editDialogTitle}
                  deleteDialogTitle={deleteDialogTitle}
                  deleteDialogConfirmText={deleteDialogConfirmText}
                  showOrderButtons={showOrderButtons}
                  orderingMode={orderingMode}
                  data={data}
                  idField={idField}
                  t={t}
                  customActions={customActions}
                />
              ))}
            </div>
          )}
        </div>

        {/* Delete Dialog */}
        {itemToDelete && (
          <Dialog
            open={!!itemToDelete}
            onOpenChange={(open) => !open && setItemToDelete(null)}
          >
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
      </CardContent>
    </Card>
  );
};

// Re-export components for direct access
export * from "./types";
export * from "./mobile-data-card";
export * from "./desktop-data-table";

// Export the main component
export { ResponsiveDataTable };
