import { Shield, TrendingUp, DollarSign, Zap, Code, Heart } from "lucide-react";
import { PriorityDial } from "@/components/ui/priority-dial";
import { useIntakeStore } from "@/store/useIntakeStore";
import type { Priorities } from "@/lib/graph";

const priorityOptions: Array<{
  key: keyof Priorities;
  label: string;
  description: string;
  icon: React.ReactNode;
}> = [
  {
    key: 'security',
    label: 'Security',
    description: 'Data protection and compliance',
    icon: <Shield className="h-4 w-4" />,
  },
  {
    key: 'scalability',
    label: 'Scalability',
    description: 'Handle growing traffic and data',
    icon: <TrendingUp className="h-4 w-4" />,
  },
  {
    key: 'cost',
    label: 'Cost Optimization',
    description: 'Minimize operational expenses',
    icon: <DollarSign className="h-4 w-4" />,
  },
  {
    key: 'latency',
    label: 'Low Latency',
    description: 'Fast response times',
    icon: <Zap className="h-4 w-4" />,
  },
  {
    key: 'developer_experience',
    label: 'Developer Experience',
    description: 'Easy to deploy and maintain',
    icon: <Code className="h-4 w-4" />,
  },
  {
    key: 'availability',
    label: 'High Availability',
    description: 'Minimize downtime and outages',
    icon: <Heart className="h-4 w-4" />,
  },
];

export function PrioritySection() {
  const { intake, setPriority } = useIntakeStore();

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Set Your Priorities</h2>
        <p className="text-muted-foreground">
          How important are these factors for your deployment?
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {priorityOptions.map((option) => (
          <PriorityDial
            key={option.key}
            label={option.label}
            description={option.description}
            icon={option.icon}
            value={intake.priorities[option.key]}
            onChange={(value) => setPriority(option.key, value)}
          />
        ))}
      </div>

      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          These priorities will influence the architecture recommendations
        </p>
      </div>
    </div>
  );
}