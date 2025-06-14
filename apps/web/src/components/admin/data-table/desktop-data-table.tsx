import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Icon } from '@/components/icon';
import { cn } from "@/lib/utils";
import type { DesktopDataTableProps } from "./types";
import { EditAction, DeleteAction, OrderActions } from "./data-table-actions";

export const DesktopDataTable = ({
  columns,
  data,
  sortColumn,
  sortDirection,
  setSortColumn,
  setSortDirection,
  onEdit,
  onDelete,
  onChangeOrder,
  editingItem,
  setEditingItem,
  setItemToDelete,
  FormComponent,
  editDialogTitle,
  showOrderButtons,
  orderingMode,
  idField,
  t,
  customActions
}: DesktopDataTableProps) => {
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  return (
    <div className="rounded-md border">
      <div className="relative w-full overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead 
                  key={column.key}
                  className={cn(column.sortable && "cursor-pointer hover:bg-muted")}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-1">
                    {column.header}
                    {column.sortable && sortColumn === column.key && (
                      <Icon 
                        name={sortDirection === 'asc' ? "ArrowUp" : "ArrowDown"} 
                        provider="lu"
                        className="h-3 w-3" 
                      />
                    )}
                  </div>
                </TableHead>
              ))}
              {(onEdit || onDelete || onChangeOrder || customActions) && (
                <TableHead className="text-right">
                  {t("common.actions")}
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item[idField]}>
                {columns.map((column) => (
                  <TableCell key={`${item[idField]}-${column.key}`}>
                    {column.render ? column.render(item) : item[column.key] || "-"}
                  </TableCell>
                ))}
                {(onEdit || onDelete || onChangeOrder || customActions) && (
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {onEdit && (
                        <EditAction
                          item={item}
                          idField={idField}
                          editingItem={editingItem}
                          setEditingItem={setEditingItem}
                          onEdit={onEdit}
                          FormComponent={FormComponent}
                          editDialogTitle={editDialogTitle}
                          t={t}
                        />
                      )}
                      {showOrderButtons && onChangeOrder && orderingMode && (
                        <OrderActions
                          item={item}
                          idField={idField}
                          data={data}
                          onChangeOrder={onChangeOrder}
                          t={t}
                        />
                      )}
                      {onDelete && (
                        <DeleteAction
                          item={item}
                          idField={idField}
                          setItemToDelete={setItemToDelete}
                          t={t}
                        />
                      )}
                      {customActions && customActions(item)}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
