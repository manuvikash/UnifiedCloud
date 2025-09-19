import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Download, FileText, Copy } from 'lucide-react';
import { useGraphStore } from '@/store/useGraphStore';
import { generateTerraform } from '@/lib/graph';
import Editor from '@monaco-editor/react';
import { useToast } from '@/hooks/use-toast';

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExportDialog({ open, onOpenChange }: ExportDialogProps) {
  const { graph } = useGraphStore();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('hcl');

  // Generate Terraform code for all nodes
  const generateFullTerraform = () => {
    const nodeConfigs = graph.nodes.map(node => generateTerraform(node)).join('\n\n');
    
    const variables = `# Variables
variable "region" {
  description = "AWS region"
  type        = string
  default     = "us-west-2"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}

`;

    const outputs = `# Outputs
output "vpc_id" {
  description = "ID of the VPC"
  value       = try(aws_vpc.vpc-1.id, null)
}

output "load_balancer_dns" {
  description = "DNS name of the load balancer"
  value       = try(aws_lb.alb-1.dns_name, null)
}

`;

    return variables + nodeConfigs + '\n\n' + outputs;
  };

  const terraformCode = generateFullTerraform();
  const cdktfCode = `import { Construct } from "constructs";
import { App, TerraformStack } from "cdktf";
import { AwsProvider } from "@cdktf/provider-aws/lib/provider";
import { Vpc } from "@cdktf/provider-aws/lib/vpc";

class MyStack extends TerraformStack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    new AwsProvider(this, "AWS", {
      region: "us-west-2",
    });

    // Generated from unifiedCloud design
    ${graph.nodes.map(node => `
    // ${node.label} (${node.type})
    // Props: ${JSON.stringify(node.props, null, 2)}`).join('\n')}
  }
}

const app = new App();
new MyStack(app, "unified-cloud");
app.synth();`;

  const handleDownload = async () => {
    try {
      // In a real app, this would call an API endpoint
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ graph, format: activeTab }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `unified-cloud-${activeTab}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast({
          title: "Export successful",
          description: `Downloaded ${activeTab.toUpperCase()} configuration files.`,
        });
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      // Fallback: download the generated code directly
      const code = activeTab === 'hcl' ? terraformCode : cdktfCode;
      const blob = new Blob([code], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `main.${activeTab === 'hcl' ? 'tf' : 'ts'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Code downloaded",
        description: `Downloaded ${activeTab.toUpperCase()} file directly.`,
      });
    }
  };

  const handleCopy = async () => {
    const code = activeTab === 'hcl' ? terraformCode : cdktfCode;
    try {
      await navigator.clipboard.writeText(code);
      toast({
        title: "Copied to clipboard",
        description: "Code has been copied to your clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Export Infrastructure</span>
          </DialogTitle>
          <DialogDescription>
            Download your infrastructure configuration as Terraform or CDK for Terraform files.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="hcl">Plan (HCL)</TabsTrigger>
              <TabsTrigger value="cdktf">Plan (CDKTF→HCL)</TabsTrigger>
            </TabsList>

            <TabsContent value="hcl" className="flex-1 mt-4">
              <Card className="h-full p-4">
                <div className="h-full">
                  <Editor
                    height="500px"
                    defaultLanguage="hcl"
                    value={terraformCode}
                    options={{
                      readOnly: true,
                      minimap: { enabled: false },
                      fontSize: 12,
                      scrollBeyondLastLine: false,
                      wordWrap: 'on',
                    }}
                    theme="vs-dark"
                  />
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="cdktf" className="flex-1 mt-4">
              <Card className="h-full p-4">
                <div className="h-full">
                  <Editor
                    height="500px"
                    defaultLanguage="typescript"
                    value={cdktfCode}
                    options={{
                      readOnly: true,
                      minimap: { enabled: false },
                      fontSize: 12,
                      scrollBeyondLastLine: false,
                      wordWrap: 'on',
                    }}
                    theme="vs-dark"
                  />
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex justify-between items-center pt-4">
          <div className="text-sm text-muted-foreground">
            {graph.nodes.length} resources • {graph.edges.length} connections
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleCopy}>
              <Copy className="h-4 w-4 mr-2" />
              Copy Code
            </Button>
            <Button onClick={handleDownload} className="bg-gradient-primary">
              <Download className="h-4 w-4 mr-2" />
              Download .zip
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}