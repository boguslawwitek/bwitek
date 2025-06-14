import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import type { MobileDataCardProps, Column } from "./types";
import { EditAction, DeleteAction, OrderActions } from "./data-table-actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export const MobileDataCard = ({ 
  item, 
  columns, 
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
  data, 
  idField, 
  t, 
  customActions 
}: MobileDataCardProps) => {
  // Separate columns by priority
  const highPriorityColumns = columns.filter((col: Column) => col.priority === 'high');
  const mediumPriorityColumns = columns.filter((col: Column) => col.priority === 'medium');
  const lowPriorityColumns = columns.filter((col: Column) => col.priority === 'low' || !col.priority);

  const renderColumnValue = (column: Column, item: any) => {
    const content = column.render ? column.render(item) : item[column.key] || "-";
    return content;
  };

  return (
    <Card className="mb-2 overflow-hidden">
      <CardContent className="p-2 sm:p-4">
        {/* High priority fields - always visible, larger text */}
        {highPriorityColumns.length > 0 && (
          <div className="space-y-1 mb-2">
            {highPriorityColumns.map((column: Column) => (
              <div key={column.key}>
                <div className="font-medium text-base truncate w-full" title={typeof renderColumnValue(column, item) === 'string' ? renderColumnValue(column, item) : undefined}>
                  {renderColumnValue(column, item)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Medium priority fields */}
        {mediumPriorityColumns.length > 0 && (
          <div className="space-y-1 mb-2">
            {mediumPriorityColumns.map((column: Column) => (
              <div key={column.key} className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-sm">
                <span className="text-muted-foreground font-medium">{column.header}:</span>
                <span className="truncate w-full sm:max-w-[180px] sm:text-right" title={typeof renderColumnValue(column, item) === 'string' ? renderColumnValue(column, item) : undefined}>
                  {renderColumnValue(column, item)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Low priority fields - collapsible */}
        {lowPriorityColumns.length > 0 && (
          <details className="mb-2">
            <summary className="text-sm text-muted-foreground cursor-pointer hover:text-foreground">
              {t("common.showMore")} ({lowPriorityColumns.length})
            </summary>
            <div className="mt-2 space-y-1">
              {lowPriorityColumns.map((column: Column) => (
                <div key={column.key} className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-sm">
                  <span className="text-muted-foreground font-medium">{column.header}:</span>
                  <span className="truncate w-full sm:max-w-[180px] sm:text-right" title={typeof renderColumnValue(column, item) === 'string' ? renderColumnValue(column, item) : undefined}>
                    {renderColumnValue(column, item)}
                  </span>
                </div>
              ))}
            </div>
          </details>
        )}

        {/* Actions */}
        {(onEdit || onDelete || onChangeOrder || customActions) && (
          <div className="flex flex-wrap gap-1 pt-2 border-t">
            {onDelete && (
              <DeleteAction
                item={item}
                idField={idField}
                setItemToDelete={setItemToDelete}
                isMobile={true}
                t={t}
              />
            )}
            {onEdit && (
              <EditAction
                item={item}
                idField={idField}
                editingItem={editingItem}
                setEditingItem={setEditingItem}
                onEdit={onEdit}
                FormComponent={FormComponent}
                editDialogTitle={editDialogTitle}
                isMobile={true}
                t={t}
              />
            )}

            {showOrderButtons && onChangeOrder && orderingMode && (
              <OrderActions
                item={item}
                idField={idField}
                data={data}
                onChangeOrder={onChangeOrder}
                isMobile={true}
                t={t}
              />
            )}
            
            {customActions && (
              <div className="flex flex-wrap gap-1 w-full mt-1">
                {customActions(item)}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
