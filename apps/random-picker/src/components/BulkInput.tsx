import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@mini-apps/ui";
import { Button } from "@mini-apps/ui";
import { List } from "lucide-react";

interface BulkInputProps {
  onAdd: (labels: string[]) => void;
  disabled?: boolean;
}

export const BulkInput: React.FC<BulkInputProps> = ({ onAdd, disabled }) => {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");

  const handleSubmit = () => {
    const lines = text
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length > 0) {
      onAdd(lines);
      setText("");
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full" disabled={disabled}>
          <List className="h-4 w-4 mr-2" />
          일괄 입력
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>일괄 입력</DialogTitle>
          <DialogDescription>
            한 줄에 하나씩 항목을 입력하세요. (최대 50개)
          </DialogDescription>
        </DialogHeader>
        <textarea
          className="w-full h-64 p-3 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          placeholder="예시:&#10;사과&#10;바나나&#10;포도"
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={2000}
        />
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="border-gray-300 hover:bg-gray-100"
          >
            취소
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!text.trim()}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            추가
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
