import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold cursor-pointer transition-all duration-normal ease-out-expo focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dajaem-green focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:animate-press",
  {
    variants: {
      variant: {
        // DaJaem Primary Green - 주요 CTA
        default:
          "bg-dajaem-green text-white shadow-md hover:bg-dajaem-green-600 hover:shadow-glow-green active:bg-dajaem-green-700",
        // DaJaem Secondary Yellow - 강조/알림
        secondary:
          "bg-dajaem-yellow text-gray-900 shadow-md hover:bg-dajaem-yellow-400 hover:shadow-glow-yellow active:bg-dajaem-yellow-600",
        // Destructive Red - 삭제/경고
        destructive:
          "bg-dajaem-red text-white shadow-md hover:bg-red-600 hover:shadow-glow-red active:bg-red-700",
        // Outline - 보조 액션
        outline:
          "border-2 border-dajaem-green bg-transparent text-dajaem-green shadow-sm hover:bg-dajaem-green hover:text-white",
        // Ghost - 텍스트 스타일
        ghost:
          "text-dajaem-green hover:bg-dajaem-green-50 dark:hover:bg-dajaem-green-900/20",
        // Link - 인라인 링크
        link:
          "text-dajaem-green underline-offset-4 hover:underline",
        // Neumorphism - 프리미엄 3D 효과
        neumorphism:
          "bg-dajaem-grey text-gray-700 shadow-neumorphism hover:shadow-neumorphism-sm active:shadow-inner dark:bg-gray-800 dark:text-gray-100 dark:shadow-neumorphism-dark",
        // Purple Accent - 랭킹/정답
        accent:
          "bg-dajaem-purple text-white shadow-md hover:bg-purple-700 hover:shadow-glow-purple active:bg-purple-800",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-11 rounded-lg px-8 text-base",
        xl: "h-14 rounded-xl px-10 text-lg font-bold",
        icon: "h-10 w-10 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
