import { Code, Database, Shield, Server, Package } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useIntakeStore } from "@/store/useIntakeStore";

const techStackFields = [
  {
    id: 'frontend' as const,
    title: 'Frontend',
    subtitle: 'React, Vue, Angular, vanilla JS, etc.',
    icon: <Code className="h-6 w-6" />,
    placeholder: 'e.g., React, Vue.js, Angular'
  },
  {
    id: 'backend' as const,
    title: 'Backend',
    subtitle: 'Node.js, Python, Java, Go, etc.',
    icon: <Server className="h-6 w-6" />,
    placeholder: 'e.g., Node.js, Python Flask, Java Spring'
  },
  {
    id: 'database' as const,
    title: 'Database',
    subtitle: 'PostgreSQL, MySQL, MongoDB, etc.',
    icon: <Database className="h-6 w-6" />,
    placeholder: 'e.g., PostgreSQL, MongoDB, Redis'
  },
  {
    id: 'authentication' as const,
    title: 'Authentication',
    subtitle: 'Auth0, Firebase Auth, custom JWT, etc.',
    icon: <Shield className="h-6 w-6" />,
    placeholder: 'e.g., Auth0, Firebase Auth, OAuth2'
  },
  {
    id: 'other' as const,
    title: 'Other Services',
    subtitle: 'CDN, message queues, monitoring, etc.',
    icon: <Package className="h-6 w-6" />,
    placeholder: 'e.g., Redis, RabbitMQ, Elasticsearch'
  },
];

export function TechStackSelector() {
  const { intake, setTechStackField } = useIntakeStore();

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">What's your tech stack?</h2>
        <p className="text-muted-foreground">
          Tell us about the technologies and services you're using
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {techStackFields.map((field) => (
          <Card key={field.id} className="p-6 space-y-4 bg-gradient-card border-0">
            <div className="flex items-center space-x-3">
              <div className="text-primary">
                {field.icon}
              </div>
              <div>
                <h3 className="font-semibold">{field.title}</h3>
                <p className="text-sm text-muted-foreground">{field.subtitle}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor={field.id} className="sr-only">
                {field.title}
              </Label>
              <Input
                id={field.id}
                placeholder={field.placeholder}
                value={intake.techStack[field.id]}
                onChange={(e) => setTechStackField(field.id, e.target.value)}
                className="w-full"
              />
            </div>
          </Card>
        ))}
      </div>

      {(intake.techStack.frontend || intake.techStack.backend) && (
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 text-sm text-muted-foreground bg-muted/50 px-3 py-2 rounded-lg">
            <Code className="h-4 w-4 text-green-600" />
            <span>Tech stack details captured</span>
          </div>
        </div>
      )}
    </div>
  );
}