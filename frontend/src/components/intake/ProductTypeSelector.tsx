import { Globe, Zap, Database, Radio, BarChart3 } from "lucide-react";
import { BigOption } from "@/components/ui/big-option";
import { useIntakeStore } from "@/store/useIntakeStore";

const productOptions = [
  {
    id: 'webapp' as const,
    title: 'Web Application',
    subtitle: 'Interactive web apps with user interfaces',
    icon: <Globe className="h-8 w-8" />,
  },
  {
    id: 'api' as const,
    title: 'API Service',
    subtitle: 'REST APIs and microservices',
    icon: <Zap className="h-8 w-8" />,
  },
  {
    id: 'data-pipeline' as const,
    title: 'Data Pipeline',
    subtitle: 'ETL and data processing workflows',
    icon: <Database className="h-8 w-8" />,
  },
  {
    id: 'realtime' as const,
    title: 'Real-time App',
    subtitle: 'Live updates and real-time communication',
    icon: <Radio className="h-8 w-8" />,
  },
  {
    id: 'batch' as const,
    title: 'Batch Processing',
    subtitle: 'Scheduled jobs and background tasks',
    icon: <BarChart3 className="h-8 w-8" />,
  },
];

export function ProductTypeSelector() {
  const { intake, setProductType } = useIntakeStore();

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">What are you building?</h2>
        <p className="text-muted-foreground">
          Choose the type of application you want to deploy
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {productOptions.map((option) => (
          <BigOption
            key={option.id}
            icon={option.icon}
            title={option.title}
            subtitle={option.subtitle}
            selected={intake.productType === option.id}
            onClick={() => setProductType(option.id)}
          />
        ))}
      </div>
    </div>
  );
}