import * as React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface VerifiedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  isVerified?: boolean;
}

export function VerifiedCard({
  className,
  isVerified = false,
  children,
  ...props
}: VerifiedCardProps) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-300",
        isVerified && "border-t-2 border-t-secondary",
        className,
      )}
      {...props}
    >
      {/* Optional soft background glow for verified items */}
      {isVerified && (
        <div className="absolute top-0 left-0 w-full h-12 bg-gradient-to-b from-secondary/5 to-transparent pointer-events-none" />
      )}
      {children}
    </Card>
  );
}
