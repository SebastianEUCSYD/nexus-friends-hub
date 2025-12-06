import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
  children?: React.ReactNode;
  leftAction?: React.ReactNode;
}

export function PageHeader({ title, subtitle, className, children, leftAction }: PageHeaderProps) {
  return (
    <header className={cn("pt-safe px-4 pb-4 bg-background", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {leftAction}
          <div>
            <h1 className="text-2xl font-bold text-foreground">{title}</h1>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
        </div>
        {children}
      </div>
    </header>
  );
}
