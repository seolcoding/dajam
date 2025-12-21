import React, { useState } from "react";
import { Input } from "@mini-apps/ui";
import { Button } from "@mini-apps/ui";
import { Plus } from "lucide-react";

interface ItemInputProps {
  onAdd: (label: string) => void;
  disabled?: boolean;
}

export const ItemInput: React.FC<ItemInputProps> = ({ onAdd, disabled }) => {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onAdd(input.trim());
      setInput("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        type="text"
        placeholder="항목 입력 (Enter)"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={disabled}
        maxLength={50}
        className="border-gray-300 focus:ring-purple-500 focus:border-purple-500"
      />
      <Button
        type="submit"
        size="icon"
        disabled={disabled || !input.trim()}
        className="bg-purple-600 hover:bg-purple-700 text-white"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </form>
  );
};
