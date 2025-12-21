import React, { useState } from "react";
import { Button } from "@mini-apps/ui";
import { Card } from "@mini-apps/ui";
import { Input } from "@mini-apps/ui";
import { Trash2, Edit2, Check, X } from "lucide-react";
import type { WheelItem } from "@/types";

interface ItemListProps {
  items: WheelItem[];
  onRemove: (id: string) => void;
  onUpdate: (id: string, label: string) => void;
  disabled?: boolean;
}

export const ItemList: React.FC<ItemListProps> = ({
  items,
  onRemove,
  onUpdate,
  disabled,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const startEdit = (item: WheelItem) => {
    setEditingId(item.id);
    setEditValue(item.label);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };

  const saveEdit = (id: string) => {
    if (editValue.trim()) {
      onUpdate(id, editValue.trim());
    }
    cancelEdit();
  };

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <Card key={item.id} className="p-3 bg-gray-50 border-gray-200">
          <div className="flex items-center gap-3">
            <div
              className="w-5 h-5 rounded-full flex-shrink-0 shadow-sm"
              style={{ backgroundColor: item.color }}
            />
            {editingId === item.id ? (
              <>
                <Input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="flex-1 border-gray-300"
                  maxLength={50}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveEdit(item.id);
                    if (e.key === "Escape") cancelEdit();
                  }}
                />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => saveEdit(item.id)}
                  className="hover:bg-gray-200 text-green-600"
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={cancelEdit}
                  className="hover:bg-gray-200 text-gray-600"
                >
                  <X className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <span className="flex-1 truncate font-medium text-gray-800">
                  {item.label}
                </span>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => startEdit(item)}
                  disabled={disabled}
                  className="hover:bg-gray-200 text-gray-600"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => onRemove(item.id)}
                  disabled={disabled}
                  className="hover:bg-gray-200 text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};
