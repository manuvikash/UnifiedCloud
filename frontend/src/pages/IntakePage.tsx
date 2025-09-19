import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Rocket, Loader2 } from "lucide-react";
import { TechStackSelector } from "@/components/intake/TechStackSelector";
import { ProductTypeSelector } from "@/components/intake/ProductTypeSelector";
import { PrioritySection } from "@/components/intake/PrioritySection";
import { useIntakeStore } from "@/store/useIntakeStore";
import { useGraphStore } from "@/store/useGraphStore";
import { useChatStore } from "@/store/useChatStore";
import { createSampleGraph } from "@/lib/graph";

const steps = [
  { id: 0, title: "Product Type", component: ProductTypeSelector },
  { id: 1, title: "Tech Stack", component: TechStackSelector },
  { id: 2, title: "Priorities", component: PrioritySection },
];

export default function IntakePage() {
  const navigate = useNavigate();
  const { intake, currentStep, setCurrentStep, isComplete } = useIntakeStore();
  const { setGraph } = useGraphStore();
  const { sendMessage } = useChatStore();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isDesigning, setIsDesigning] = useState(false);

  const CurrentStepComponent = steps[currentStepIndex].component;
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      setCurrentStep(currentStepIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
      setCurrentStep(currentStepIndex - 1);
    }
  };

  const handleDesign = async () => {
    if (isComplete()) {
      setIsDesigning(true);
      
      try {
        // Generate initial infrastructure based on intake
        const message = "Please design a cloud infrastructure based on my requirements. Generate the initial architecture.";
        await sendMessage(message);
        
        // Navigate to designer page
        navigate("/designer");
      } catch (error) {
        console.error('Error generating initial design:', error);
        
        // Fallback to sample graph if API call fails
        const graph = createSampleGraph(intake);
        setGraph(graph);
        navigate("/designer");
      } finally {
        setIsDesigning(false);
      }
    }
  };

  const canGoNext = () => {
    switch (currentStepIndex) {
      case 0: return true; // Product type always has a default
      case 1: return intake.techStack.frontend || intake.techStack.backend; // At least frontend or backend
      case 2: return true; // Priorities always have defaults
      default: return false;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-gradient-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                UnifiedCloud
              </h1>
              <p className="text-muted-foreground mt-1">
                Cloud Infrastructure Designer
              </p>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-muted-foreground">
                Step {currentStepIndex + 1} of {steps.length}
              </div>
              <div className="text-lg font-semibold">
                {steps[currentStepIndex].title}
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 shadow-lg bg-gradient-card border-0">
            <CurrentStepComponent />
          </Card>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStepIndex === 0}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Previous</span>
            </Button>

            <div className="flex items-center space-x-2">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index <= currentStepIndex
                      ? "bg-primary"
                      : "bg-muted"
                  }`}
                />
              ))}
            </div>

            {currentStepIndex < steps.length - 1 ? (
              <Button
                onClick={handleNext}
                disabled={!canGoNext()}
                className="flex items-center space-x-2 bg-gradient-primary"
              >
                <span>Next</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleDesign}
                disabled={!isComplete() || isDesigning}
                className="flex items-center space-x-2 bg-gradient-primary"
                size="lg"
              >
                {isDesigning ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Rocket className="h-4 w-4" />
                )}
                <span>{isDesigning ? "Designing..." : "Design my deployment"}</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}