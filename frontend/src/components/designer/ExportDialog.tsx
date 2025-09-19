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
import { Download, FileText, Copy, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useGraphStore } from '@/store/useGraphStore';
import { generateTerraform } from '@/lib/graph';
import { apiService } from '@/lib/apiService';
import { graphToChatFormat } from '@/lib/chatResponseParser';
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
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

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
    if (graph.nodes.length === 0) {
      toast({
        title: "No infrastructure to export",
        description: "Please add some components to your design first.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    setExportError(null);

    try {
      // Convert graph to chat API format
      const chatFormat = graphToChatFormat(graph);
      
      // Call terraform API
      const blob = await apiService.generateTerraform(chatFormat);
      
      // Download the zip file
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'terraform-export.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Export successful",
        description: "Downloaded terraform configuration files.",
      });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Export failed';
      setExportError(errorMessage);
      
      toast({
        title: "Export failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      // Fallback: download the generated code directly if API fails
      try {
        const code = activeTab === 'hcl' ? terraformCode : cdktfCode;
        const fallbackBlob = new Blob([code], { type: 'text/plain' });
        const url = URL.createObjectURL(fallbackBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `main.${activeTab === 'hcl' ? 'tf' : 'ts'}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast({
          title: "Fallback download",
          description: `Downloaded ${activeTab.toUpperCase()} file directly as fallback.`,
        });
      } catch (fallbackError) {
        console.error('Fallback download also failed:', fallbackError);
      }
    } finally {
      setIsExporting(false);
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

        {exportError && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {exportError}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex justify-between items-center pt-4">
          <div className="text-sm text-muted-foreground">
            {graph.nodes.length} resources • {graph.edges.length} connections
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleCopy} disabled={isExporting}>
              <Copy className="h-4 w-4 mr-2" />
              Copy Code
            </Button>
            <Button 
              onClick={handleDownload} 
              className="bg-gradient-primary"
              disabled={isExporting || graph.nodes.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              {isExporting ? 'Generating...' : 'Download .zip'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}