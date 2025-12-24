import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const cardVariants = cva(
  "rounded-xl text-card-foreground transition-all duration-normal ease-out-expo",
  {
    variants: {
      variant: {
        // Default - 기본 카드
        default: "border bg-card shadow-sm",
        // Elevated - 호버 시 부상 효과
        elevated:
          "border bg-card shadow-md hover:shadow-card-hover hover:-translate-y-1",
        // Neumorphism - 뉴모피즘 3D 효과
        neumorphism:
          "bg-dajaem-grey shadow-neumorphism border-0 dark:bg-gray-800 dark:shadow-neumorphism-dark",
        // Glass - 글래스모피즘
        glass:
          "bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border border-white/20 shadow-lg",
        // Outline - 테두리 강조
        outline:
          "border-2 border-dajaem-green bg-transparent hover:bg-dajaem-green-50 dark:hover:bg-dajaem-green-900/20",
        // Glow - 발광 효과 (정답, 성공)
        glow: "border-2 border-dajaem-green bg-dajaem-green-50 shadow-glow-green dark:bg-dajaem-green-900/30",
        // Error - 오류 상태
        error:
          "border-2 border-dajaem-red bg-red-50 shadow-glow-red dark:bg-red-900/30",
        // Warning - 경고 상태
        warning:
          "border-2 border-dajaem-yellow bg-yellow-50 shadow-glow-yellow dark:bg-yellow-900/30",
        // Interactive - 클릭 가능한 카드
        interactive:
          "border bg-card shadow-sm cursor-pointer hover:shadow-md hover:border-dajaem-green active:scale-[0.98] active:shadow-sm",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant }), className)}
      {...props}
    />
  )
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "font-bold leading-none tracking-tight text-lg",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground mt-1", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  cardVariants,
};
