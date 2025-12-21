import { create } from "zustand";
import type { WheelItem, SpinResult, WheelSettings } from "@/types";
import { generateColor, storage } from "@/lib/utils";

interface WheelStore {
  items: WheelItem[];
  currentRotation: number;
  currentIndex: number | null;
  isSpinning: boolean;
  history: SpinResult[];
  settings: WheelSettings;
  selectedResult: SpinResult | null;

  // Actions
  addItem: (label: string) => void;
  addItems: (labels: string[]) => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, label: string) => void;
  clearItems: () => void;
  setCurrentRotation: (rotation: number) => void;
  setCurrentIndex: (index: number | null) => void;
  setIsSpinning: (spinning: boolean) => void;
  addResult: (result: SpinResult) => void;
  setSelectedResult: (result: SpinResult | null) => void;
  clearHistory: () => void;
  updateSettings: (settings: Partial<WheelSettings>) => void;
  loadFromStorage: () => void;
}

export const useWheelStore = create<WheelStore>((set, get) => ({
  items: [],
  currentRotation: 0,
  currentIndex: null,
  isSpinning: false,
  history: [],
  settings: {
    soundEnabled: true,
    confettiEnabled: true,
    animationDuration: 5000,
  },
  selectedResult: null,

  addItem: (label) => {
    const trimmed = label.trim();
    if (!trimmed) return;

    const items = get().items;
    const newItem: WheelItem = {
      id: crypto.randomUUID(),
      label: trimmed,
      color: generateColor(items.length),
      weight: 1,
    };

    const newItems = [...items, newItem];
    set({ items: newItems });
    storage.saveItems(newItems);
  },

  addItems: (labels) => {
    const items = get().items;
    const validLabels = labels.map((l) => l.trim()).filter((l) => l.length > 0);
    if (validLabels.length === 0) return;

    const newItems: WheelItem[] = validLabels.map((label, index) => ({
      id: crypto.randomUUID(),
      label,
      color: generateColor(items.length + index),
      weight: 1,
    }));

    const updatedItems = [...items, ...newItems];
    set({ items: updatedItems });
    storage.saveItems(updatedItems);
  },

  removeItem: (id) => {
    const items = get().items.filter((item) => item.id !== id);
    // Regenerate colors
    const recoloredItems = items.map((item, index) => ({
      ...item,
      color: generateColor(index),
    }));
    set({ items: recoloredItems });
    storage.saveItems(recoloredItems);
  },

  updateItem: (id, label) => {
    const trimmed = label.trim();
    if (!trimmed) return;

    const items = get().items.map((item) =>
      item.id === id ? { ...item, label: trimmed } : item
    );
    set({ items });
    storage.saveItems(items);
  },

  clearItems: () => {
    set({ items: [] });
    storage.saveItems([]);
  },

  setCurrentRotation: (rotation) => {
    set({ currentRotation: rotation });
  },

  setCurrentIndex: (index) => {
    set({ currentIndex: index });
  },

  setIsSpinning: (spinning) => {
    set({ isSpinning: spinning });
  },

  addResult: (result) => {
    const history = [result, ...get().history].slice(0, 100); // Keep last 100
    set({ history });
    storage.saveHistory(history);
  },

  setSelectedResult: (result) => {
    set({ selectedResult: result });
  },

  clearHistory: () => {
    set({ history: [] });
    storage.clearHistory();
  },

  updateSettings: (newSettings) => {
    set({ settings: { ...get().settings, ...newSettings } });
  },

  loadFromStorage: () => {
    const items = storage.getItems();
    const history = storage.getHistory();
    set({ items, history });
  },
}));
