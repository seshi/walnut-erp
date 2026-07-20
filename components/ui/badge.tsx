import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default:     "bg-stone-100 text-stone-700",
        outline:     "border border-stone-300 text-stone-600",
        success:     "bg-emerald-50 text-emerald-700",
        warning:     "bg-amber-50 text-amber-700",
        danger:      "bg-red-50 text-red-700",
        gold:        "bg-yellow-50 text-yellow-800",
        walnut:      "bg-stone-800 text-stone-100",
        blue:        "bg-blue-50 text-blue-700",
        purple:      "bg-purple-50 text-purple-700",
        sky:         "bg-sky-50 text-sky-700",
        indigo:      "bg-indigo-50 text-indigo-700",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
