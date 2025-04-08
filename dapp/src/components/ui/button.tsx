import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "w-full rounded-xl font-medium transition-colors",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    // 移动端默认文字大小小一点
    "text-base",
    // PC端文字大小
    "md:text-lg",
  ].join(" "),
  {
    variants: {
      variant: {
        primary: "bg-[#3730A3] hover:bg-[#312E81] text-white",
        secondary: "bg-[#141416] hover:bg-[#1a1a1f] text-white",
        outline:
          "border-2 border-[#3730A3] text-[#3730A3] hover:bg-[#3730A3] hover:text-white",
        ghost: "bg-transparent hover:bg-[#141416] text-white",
      },
      size: {
        // 响应式大小设计
        default: [
          // 移动端默认内边距小一点
          "px-4 py-3",
          // PC端内边距大一点
          "md:px-4 md:py-4",
        ].join(" "),
        sm: ["px-3 py-2 text-sm", "md:px-3 md:py-2 md:text-base"].join(" "),
        lg: ["px-5 py-4 text-base", "md:px-6 md:py-5 md:text-xl"].join(" "),
      },
      fullWidth: {
        true: "w-full",
        false: ["w-auto min-w-[120px]", "md:min-w-[160px]"].join(" "),
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
      fullWidth: true,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
