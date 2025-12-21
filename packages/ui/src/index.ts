/**
 * @mini-apps/ui
 * Mini Apps 공용 UI 컴포넌트 라이브러리
 *
 * shadcn/ui 패턴 기반, React 19 + Tailwind CSS v4 지원
 */

// ============================================================
// Utilities
// ============================================================
export { cn } from "./lib/utils";

// ============================================================
// Hooks
// ============================================================
export { useToast, toast } from "./hooks/use-toast";

// ============================================================
// Basic UI Components
// ============================================================
export { Button, buttonVariants } from "./components/ui/button";
export type { ButtonProps } from "./components/ui/button";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from "./components/ui/card";

export { Input } from "./components/ui/input";
export { Label } from "./components/ui/label";
export { Badge, badgeVariants } from "./components/ui/badge";
export type { BadgeProps } from "./components/ui/badge";

// ============================================================
// Form Components
// ============================================================
export { Checkbox } from "./components/ui/checkbox";
export { RadioGroup, RadioGroupItem } from "./components/ui/radio-group";
export { Switch } from "./components/ui/switch";
export { Slider } from "./components/ui/slider";

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
} from "./components/ui/select";

// ============================================================
// Overlay Components
// ============================================================
export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "./components/ui/dialog";

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
} from "./components/ui/dropdown-menu";

export {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverAnchor,
} from "./components/ui/popover";

export {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "./components/ui/tooltip";

// ============================================================
// Feedback Components
// ============================================================
export {
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "./components/ui/toast";
export type { ToastProps, ToastActionElement } from "./components/ui/toast";

export { Toaster } from "./components/ui/toaster";
export { Progress } from "./components/ui/progress";
export { Skeleton } from "./components/ui/skeleton";

// ============================================================
// Navigation Components
// ============================================================
export { Tabs, TabsList, TabsTrigger, TabsContent } from "./components/ui/tabs";

export {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "./components/ui/accordion";

// ============================================================
// Data Display Components
// ============================================================
export { Avatar, AvatarImage, AvatarFallback } from "./components/ui/avatar";
export { Separator } from "./components/ui/separator";

// ============================================================
// Shared Components (Mini Apps 전용)
// ============================================================
export {
  ShareButtons,
  ResultCard,
  NumberInput,
  LoadingSpinner,
} from "./components/shared";

export type {
  ShareButtonsProps,
  ResultCardProps,
  NumberInputProps,
  LoadingSpinnerProps,
} from "./components/shared";
