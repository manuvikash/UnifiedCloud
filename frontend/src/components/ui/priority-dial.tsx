import * as React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

export interface PriorityDialProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
}

const PriorityDial = React.forwardRef<HTMLDivElement, PriorityDialProps>(
  ({ label, value, onChange, description, icon, className, ...props }, ref) => {
    const handleValueChange = (values: number[]) => {
      onChange(values[0]);
    };

    return (
      <Card ref={ref} className={cn("p-4 space-y-4", className)} {...props}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {icon && <div className="text-lg">{icon}</div>}
            <div>
              <Label className="text-sm font-medium">{label}</Label>
              {description && (
                <p className="text-xs text-muted-foreground mt-1">{description}</p>
              )}
            </div>
          </div>
          <div className="text-lg font-semibold text-primary">
            {value}
          </div>
        </div>
        
        <div className="space-y-2">
          <Slider
            value={[value]}
            onValueChange={handleValueChange}
            max={10}
            min={1}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Low Priority</span>
            <span>High Priority</span>
          </div>
        </div>
      </Card>
    );
  }
);

PriorityDial.displayName = "PriorityDial";

export { PriorityDial };