import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-all duration-fast ease-out-expo focus:outline-none focus:ring-2 focus:ring-dajaem-green focus:ring-offset-2",
  {
    variants: {
      variant: {
        // Default - DaJaem Green
        default:
          "border-transparent bg-dajaem-green text-white shadow-sm hover:bg-dajaem-green-600",
        // Secondary - DaJaem Yellow
        secondary:
          "border-transparent bg-dajaem-yellow text-gray-900 shadow-sm hover:bg-dajaem-yellow-400",
        // Destructive - DaJaem Red
        destructive:
          "border-transparent bg-dajaem-red text-white shadow-sm hover:bg-red-600",
        // Outline - 테두리만
        outline:
          "border-2 border-dajaem-green text-dajaem-green bg-transparent hover:bg-dajaem-green-50 dark:hover:bg-dajaem-green-900/20",
        // Success - 성공/정답
        success:
          "border-transparent bg-dajaem-green-500 text-white shadow-sm animate-bounce-in",
        // Warning - 경고
        warning:
          "border-transparent bg-dajaem-yellow-500 text-gray-900 shadow-sm",
        // Info - 정보
        info: "border-transparent bg-dajaem-blue text-white shadow-sm",
        // Accent - 강조/랭킹
        accent:
          "border-transparent bg-dajaem-purple text-white shadow-sm hover:bg-purple-700",
        // Rank - 순위 표시
        rank: "border-2 border-dajaem-purple bg-purple-50 text-dajaem-purple font-bold dark:bg-purple-900/30",
        // Live - 실시간 표시
        live: "border-transparent bg-dajaem-red text-white shadow-glow-red animate-pulse",
        // New - 신규 표시
        new: "border-transparent bg-gradient-to-r from-dajaem-green to-dajaem-teal text-white shadow-sm",
        // Ghost - 투명
        ghost:
          "border-0 bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700",
      },
      size: {
        default: "px-3 py-1 text-xs",
        sm: "px-2 py-0.5 text-[10px]",
        lg: "px-4 py-1.5 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
