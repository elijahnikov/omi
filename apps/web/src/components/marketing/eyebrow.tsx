import { cn } from "@omi/ui";
import { Badge } from "@omi/ui/badge";

interface EyebrowProps {
  children: React.ReactNode;
  className?: string;
}

export function Eyebrow({ children, className }: EyebrowProps) {
  return (
    <Badge className="w-max font-medium font-sans!" size="sm" variant={"mono"}>
      <span className={cn(className)}>{children}</span>
    </Badge>
  );
}
