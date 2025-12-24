import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const inputVariants = cva(
  "flex w-full rounded-lg border bg-transparent px-4 py-2.5 text-base transition-all duration-normal ease-out-expo file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        // Default - 기본 입력창
        default:
          "border-input shadow-sm focus-visible:ring-2 focus-visible:ring-dajaem-green focus-visible:border-dajaem-green",
        // Neumorphism - 뉴모피즘 스타일
        neumorphism:
          "border-0 bg-dajaem-grey shadow-neumorphism-sm focus-visible:shadow-inner dark:bg-gray-800 dark:shadow-neumorphism-dark",
        // Outline - 강조 테두리
        outline:
          "border-2 border-gray-300 focus-visible:border-dajaem-green focus-visible:ring-0 dark:border-gray-600",
        // Filled - 채워진 배경
        filled:
          "border-0 bg-gray-100 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-dajaem-green dark:bg-gray-800 dark:focus-visible:bg-gray-700",
        // Error - 오류 상태
        error:
          "border-2 border-dajaem-red bg-red-50 focus-visible:ring-2 focus-visible:ring-dajaem-red dark:bg-red-900/20",
        // Success - 성공 상태
        success:
          "border-2 border-dajaem-green bg-dajaem-green-50 focus-visible:ring-2 focus-visible:ring-dajaem-green dark:bg-dajaem-green-900/20",
      },
      inputSize: {
        default: "h-11",
        sm: "h-9 px-3 text-sm",
        lg: "h-14 px-5 text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      inputSize: "default",
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant, inputSize, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ variant, inputSize }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input, inputVariants };
