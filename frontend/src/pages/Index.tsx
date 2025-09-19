import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Rocket, Cloud, Code, Zap, Shield, Users } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Cloud className="h-6 w-6" />,
      title: "Multi-Cloud Support",
      description: "Deploy to AWS, GCP, or Azure with intelligent recommendations"
    },
    {
      icon: <Code className="h-6 w-6" />,
      title: "Infrastructure as Code",
      description: "Generate production-ready Terraform and CDKTF configurations"
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "AI-Powered Design",
      description: "Get intelligent architecture suggestions based on your requirements"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Security First",
      description: "Built-in best practices for compliance and security"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-card">
        <div className="container mx-auto px-4 py-24">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
              Cloud Infrastructure Designer
            </Badge>
            
            <h1 className="text-5xl font-bold tracking-tight mb-6">
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                UnifiedCloud
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Design and export cloud infrastructure with AI assistance. 
              From requirements to production-ready Terraform in minutes.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => navigate('/intake')}
                className="bg-gradient-primary text-lg px-8 py-6 h-auto"
              >
                <Rocket className="h-5 w-5 mr-2" />
                Start Designing
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                className="text-lg px-8 py-6 h-auto"
              >
                <Users className="h-5 w-5 mr-2" />
                View Examples
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Powerful Features</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to design and deploy scalable cloud infrastructure
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow bg-gradient-card border-0">
              <div className="flex justify-center mb-4 text-primary">
                {feature.icon}
              </div>
              <h3 className="font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-muted/50 py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
           <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
             Join thousands of developers who trust UnifiedCloud for their infrastructure needs
           </p>
          
          <Button 
            size="lg" 
            onClick={() => navigate('/intake')}
            className="bg-gradient-primary text-lg px-8 py-6 h-auto"
          >
            <Rocket className="h-5 w-5 mr-2" />
            Create Your First Project
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
