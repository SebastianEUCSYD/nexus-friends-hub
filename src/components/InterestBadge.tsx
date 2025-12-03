import { cn } from "@/lib/utils";

interface InterestBadgeProps {
  interest: string;
  isSelected?: boolean;
  isShared?: boolean;
  onClick?: () => void;
  size?: "sm" | "md";
}

export function InterestBadge({ 
  interest, 
  isSelected, 
  isShared,
  onClick, 
  size = "md" 
}: InterestBadgeProps) {
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        "rounded-full font-medium transition-all duration-200",
        size === "sm" ? "px-3 py-1 text-xs" : "px-4 py-2 text-sm",
        isSelected || isShared
          ? "gradient-primary text-primary-foreground shadow-soft"
          : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        onClick && "cursor-pointer active:scale-95",
        !onClick && "cursor-default"
      )}
    >
      {interest}
    </button>
  );
}
