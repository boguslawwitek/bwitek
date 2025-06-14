import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Icon } from '@/components/icon';

export interface EditActionProps {
  item: any;
  idField: string;
  editingItem: any;
  setEditingItem: (item: any) => void;
  onEdit?: (id: string, data: any) => void;
  FormComponent?: React.ComponentType<{
    initialData?: any;
    onSubmit: (data: any) => void;
    onCancel: () => void;
  }>;
  editDialogTitle?: string;
  isMobile?: boolean;
  t: (key: string) => string;
}

export const EditAction = ({
  item,
  idField,
  editingItem,
  setEditingItem,
  onEdit,
  FormComponent,
  editDialogTitle,
  isMobile = false,
  t
}: EditActionProps) => {
  return (
    <Dialog
      open={editingItem?.[idField] === item[idField]}
      onOpenChange={(open) =>
        setEditingItem(open ? item : null)
      }
    >
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className={isMobile ? "flex-1 min-w-0 text-xs py-1 h-auto" : ""}
        >
          <Icon 
            name="Pencil" 
            provider="lu" 
            className={isMobile ? "w-3 h-3 mr-1" : ""} 
          />
          {isMobile && t("common.edit")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editDialogTitle}</DialogTitle>
        </DialogHeader>
        {FormComponent && (
          <FormComponent
            initialData={item}
            onSubmit={(data: any) => {
              if (editingItem && onEdit) {
                onEdit(editingItem[idField], data);
                setEditingItem(null);
              }
            }}
            onCancel={() => setEditingItem(null)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export interface DeleteActionProps {
  item: any;
  idField: string;
  setItemToDelete: (id: string | null) => void;
  isMobile?: boolean;
  t: (key: string) => string;
}

export const DeleteAction = ({
  item,
  idField,
  setItemToDelete,
  isMobile = false,
  t
}: DeleteActionProps) => {
  return (
    <Dialog
      open={false}
      onOpenChange={(open) => {
        if (open) {
          setItemToDelete(item[idField]);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button 
          variant="destructive" 
          size="sm"
          className={isMobile ? "flex-1 min-w-0 text-xs py-1 h-auto" : ""}
        >
          <Icon 
            name="Trash" 
            provider="lu" 
            className={isMobile ? "w-3 h-3 mr-1" : ""} 
          />
          {isMobile && t("common.delete")}
        </Button>
      </DialogTrigger>
    </Dialog>
  );
};

export interface OrderActionsProps {
  item: any;
  idField: string;
  data: any[];
  onChangeOrder?: (id: string, direction: "up" | "down") => void;
  isMobile?: boolean;
  t: (key: string) => string;
}

export const OrderActions = ({
  item,
  idField,
  data,
  onChangeOrder,
  isMobile = false,
  t
}: OrderActionsProps) => {
  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className={isMobile ? "flex-1 min-w-0 text-xs py-1 h-auto" : ""}
        onClick={() => onChangeOrder && onChangeOrder(item[idField], "up")}
        disabled={item.order === 1}
      >
        <Icon 
          name="ArrowUp" 
          provider="lu" 
          className={isMobile ? "w-3 h-3 mr-1" : ""} 
        />
        {isMobile && t("common.moveUp")}
      </Button>
      <Button
        variant="outline"
        size="sm"
        className={isMobile ? "flex-1 min-w-0 text-xs py-1 h-auto" : ""}
        onClick={() => onChangeOrder && onChangeOrder(item[idField], "down")}
        disabled={item.order === Math.max(...data.map((i: any) => i.order))}
      >
        <Icon 
          name="ArrowDown" 
          provider="lu" 
          className={isMobile ? "w-3 h-3 mr-1" : ""} 
        />
        {isMobile && t("common.moveDown")}
      </Button>
    </>
  );
};
