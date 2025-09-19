import * as React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

export interface BigOptionProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

const BigOption = React.forwardRef<HTMLDivElement, BigOptionProps>(
  ({ icon, title, subtitle, selected = false, onClick, className, disabled = false, ...props }, ref) => {
    return (
      <Card
        ref={ref}
        className={cn(
          "relative cursor-pointer transition-all duration-200 hover:shadow-md",
          "border-2 border-border bg-gradient-card",
          "p-6 text-center space-y-4",
          selected && "border-primary bg-primary/5 shadow-lg",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        onClick={disabled ? undefined : onClick}
        {...props}
      >
        {selected && (
          <div className="absolute -top-2 -right-2 bg-primary rounded-full p-1">
            <CheckCircle className="h-4 w-4 text-primary-foreground" />
          </div>
        )}
        
        <div className="flex justify-center text-4xl mb-4">
          {icon}
        </div>
        
        <div className="space-y-2">
          <h3 className="font-semibold text-lg">{title}</h3>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </Card>
    );
  }
);

BigOption.displayName = "BigOption";

export { BigOption };