import { cn } from "@/lib/utils";

interface AvatarProps {
  src: string;
  alt: string;
  size?: "sm" | "md" | "lg" | "xl";
  isOnline?: boolean;
  className?: string;
}

const sizes = {
  sm: "h-10 w-10",
  md: "h-12 w-12",
  lg: "h-16 w-16",
  xl: "h-24 w-24",
};

const indicatorSizes = {
  sm: "h-2.5 w-2.5 bottom-0 right-0",
  md: "h-3 w-3 bottom-0 right-0",
  lg: "h-4 w-4 bottom-0.5 right-0.5",
  xl: "h-5 w-5 bottom-1 right-1",
};

export function Avatar({ src, alt, size = "md", isOnline, className }: AvatarProps) {
  return (
    <div className={cn("relative shrink-0", className)}>
      <img
        src={src}
        alt={alt}
        className={cn(
          sizes[size],
          "rounded-full object-cover ring-2 ring-background shadow-soft"
        )}
      />
      {isOnline !== undefined && (
        <span
          className={cn(
            "absolute rounded-full ring-2 ring-background",
            indicatorSizes[size],
            isOnline ? "bg-online" : "bg-offline"
          )}
        />
      )}
    </div>
  );
}
