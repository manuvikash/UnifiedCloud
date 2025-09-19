import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Download, Play, Menu, Loader2, Coins } from "lucide-react";
import { Designer } from "@/components/designer/Designer";
import { ChatPanel } from "@/components/designer/ChatPanel";
import { NodeDrawer } from "@/components/designer/NodeDrawer";
import { MockModeIndicator } from "@/components/MockModeIndicator";
import { DebugPanel } from "@/components/DebugPanel";
import { BackendUnreachable } from "@/components/BackendUnreachable";
import { useGraphStore } from "@/store/useGraphStore";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { config } from "@/lib/config";
import { backendConnectivity, ConnectivityStatus } from "@/lib/backendConnectivity";
import { apiService } from "@/lib/apiService";
import { graphToChatFormat } from "@/lib/chatResponseParser";

export default function DesignerPage() {
  const { selectedNodeId, isDirty, graph } = useGraphStore();
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [connectivityStatus, setConnectivityStatus] = useState<ConnectivityStatus | null>(null);
  const [isCheckingConnectivity, setIsCheckingConnectivity] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const isMobile = useIsMobile();
  const { toast } = useToast();

  // Check backend connectivity on component mount
  useEffect(() => {
    const checkConnectivity = async () => {
      setIsCheckingConnectivity(true);
      try {
        const status = await backendConnectivity.checkConnectivity();
        setConnectivityStatus(status);
      } catch (error) {
        console.error('Error checking connectivity:', error);
        setConnectivityStatus({ 
          isReachable: false, 
          error: 'Failed to check connectivity' 
        });
      } finally {
        setIsCheckingConnectivity(false);
      }
    };

    checkConnectivity();
  }, []);

  const handleRetryConnection = async () => {
    setIsCheckingConnectivity(true);
    try {
      const status = await backendConnectivity.checkConnectivity(true);
      setConnectivityStatus(status);
    } catch (error) {
      console.error('Error retrying connectivity:', error);
    } finally {
      setIsCheckingConnectivity(false);
    }
  };

  const handleExport = async () => {
    if (graph.nodes.length === 0) {
      toast({
        title: "No infrastructure to export",
        description: "Please add some components to your design first.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);

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
      
      toast({
        title: "Export failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      // Note: Could add fallback local generation here if needed
      // For now, we only support API-based exports
    } finally {
      setIsExporting(false);
    }
  };

  // Calculate total monthly cost from all nodes
  const calculateTotalCost = () => {
    let totalCost = 0;
    let hasValidCosts = false;

    console.log('🔍 Cost Calculation Debug:');
    console.log('📊 Total nodes:', graph.nodes.length);

    graph.nodes.forEach((node, index) => {
      console.log(`Node ${index}:`, {
        id: node.id,
        label: node.label,
        cost: node.props.cost,
        multiplier: node.props.multiplier,
        allProps: node.props
      });

      if (node.props.cost) {
        // Parse cost strings like "25/mo", "120/mo", "0/mo", "45.50/mo"
        const costMatch = node.props.cost.match(/(\d+(?:\.\d+)?)/);
        console.log(`  Cost match for "${node.props.cost}":`, costMatch);
        
        if (costMatch) {
          const cost = parseFloat(costMatch[1]);
          const multiplier = node.props.multiplier || 1;
          const nodeCost = cost * multiplier;
          
          console.log(`  Parsed cost: ${cost}, multiplier: ${multiplier}, total: ${nodeCost}`);
          
          // Only count non-zero costs
          if (cost > 0) {
            totalCost += nodeCost;
            hasValidCosts = true;
            console.log(`  ✅ Added ${nodeCost} to total (running total: ${totalCost})`);
          } else if (cost === 0) {
            // Still consider zero costs as valid (like free tiers)
            hasValidCosts = true;
            console.log(`  ✅ Zero cost counted as valid`);
          }
        } else {
          console.log(`  ❌ No valid cost match found`);
        }
      } else {
        console.log(`  ⚠️ No cost property found`);
      }
    });

    console.log('💰 Final total cost:', totalCost);
    console.log('✅ Has valid costs:', hasValidCosts);
    
    return hasValidCosts ? totalCost : null;
  };

  const totalCost = calculateTotalCost();

  // Debug: Log the current graph whenever it changes
  console.log('📈 Current graph state:', {
    nodeCount: graph.nodes.length,
    edgeCount: graph.edges.length,
    nodes: graph.nodes.map(n => ({ 
      id: n.id, 
      label: n.label, 
      cost: n.props?.cost,
      multiplier: n.props?.multiplier 
    }))
  });

  // Format cost for display
  const formatCost = (cost: number) => {
    if (cost >= 1000) {
      return `${(cost / 1000).toFixed(1)}k`;
    }
    return cost.toFixed(0);
  };

  // Show loading state while checking connectivity
  if (isCheckingConnectivity) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Checking backend connectivity...</p>
        </div>
      </div>
    );
  }

  // Show backend unreachable page if not in mock mode and backend is not reachable
  if (!config.enableMockMode && connectivityStatus && !connectivityStatus.isReachable) {
    return (
      <BackendUnreachable 
        onRetry={handleRetryConnection}
        status={connectivityStatus}
      />
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top Toolbar */}
      <div className="border-b bg-gradient-card px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                UnifiedCloud Designer
              </h1>
              {/* Mobile Cost Display */}
              {totalCost !== null && (
                <div className="sm:hidden flex items-center space-x-1 mt-1">
                  <Coins className="h-3 w-3 text-green-600" />
                  <span className="text-xs font-medium text-green-600">${formatCost(totalCost)}/mo</span>
                </div>
              )}
            </div>
            {isDirty && (
              <div className="flex items-center space-x-1 text-amber-600 text-sm">
                <div className="w-2 h-2 bg-amber-600 rounded-full animate-pulse" />
                <span>Unsaved changes</span>
              </div>
            )}
          </div>

          {/* Total Cost Display */}
          {totalCost !== null && (
            <div className="hidden sm:flex items-center space-x-2 bg-muted/50 px-3 py-1.5 rounded-lg border">
              <Coins className="h-4 w-4 text-green-600" />
              <div className="text-sm">
                <span className="text-muted-foreground">Total:</span>
                <span className="ml-1 font-semibold text-green-600">${formatCost(totalCost)}/mo</span>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              onClick={handleExport}
              disabled={isExporting}
              className="bg-gradient-primary flex items-center space-x-1"
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              <span>{isExporting ? "Exporting..." : "Export"}</span>
            </Button>

            {isMobile && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMobileChat(true)}
                className="flex items-center space-x-1"
              >
                <Menu className="h-4 w-4" />
                <span>Chat</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Designer Canvas */}
        <div className="flex-1 relative">
          <Designer />
        </div>

        {/* Desktop Chat Panel */}
        {!isMobile && (
          <>
            <Separator orientation="vertical" />
            <div className="w-96 flex-shrink-0">
              <ChatPanel />
            </div>
          </>
        )}
      </div>

      {/* Mobile Chat Sheet */}
      {isMobile && (
        <Sheet open={showMobileChat} onOpenChange={setShowMobileChat}>
          <div className="h-[80vh]">
            <ChatPanel />
          </div>
        </Sheet>
      )}

      {/* Node Details Drawer */}
      <NodeDrawer
        open={!!selectedNodeId}
        onOpenChange={(open) => {
          if (!open) {
            useGraphStore.getState().selectNode(null);
          }
        }}
      />
      
      {/* Mock Mode Indicator */}
      <MockModeIndicator />
      
      {/* Debug Panel - Only show in mock mode */}
      {config.enableMockMode && <DebugPanel />}
    </div>
  );
}