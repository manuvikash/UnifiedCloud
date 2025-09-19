import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Settings, Download, Play, CheckCircle, Menu } from "lucide-react";
import { Designer } from "@/components/designer/Designer";
import { ChatPanel } from "@/components/designer/ChatPanel";
import { NodeDrawer } from "@/components/designer/NodeDrawer";
import { ExportDialog } from "@/components/designer/ExportDialog";
import { MockModeIndicator } from "@/components/MockModeIndicator";
import { DebugPanel } from "@/components/DebugPanel";
import { BackendUnreachable } from "@/components/BackendUnreachable";
import { useGraphStore } from "@/store/useGraphStore";
import { useIsMobile } from "@/hooks/use-mobile";
import { config } from "@/lib/config";
import { backendConnectivity, ConnectivityStatus } from "@/lib/backendConnectivity";

export default function DesignerPage() {
  const { selectedNodeId, isDirty } = useGraphStore();
  const [showExport, setShowExport] = useState(false);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [connectivityStatus, setConnectivityStatus] = useState<ConnectivityStatus | null>(null);
  const [isCheckingConnectivity, setIsCheckingConnectivity] = useState(true);
  const isMobile = useIsMobile();

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

  const handleRebuild = () => {
    console.log("Rebuilding plan...");
  };

  const handleValidate = () => {
    console.log("Validating configuration...");
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top Toolbar */}
      <div className="border-b bg-gradient-card px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              UnifiedCloud Designer
            </h1>
            {isDirty && (
              <div className="flex items-center space-x-1 text-amber-600 text-sm">
                <div className="w-2 h-2 bg-amber-600 rounded-full animate-pulse" />
                <span>Unsaved changes</span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRebuild}
              className="hidden sm:flex items-center space-x-1"
            >
              <Settings className="h-4 w-4" />
              <span>Rebuild Plan</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleValidate}
              className="hidden sm:flex items-center space-x-1"
            >
              <CheckCircle className="h-4 w-4" />
              <span>Validate</span>
            </Button>

            <Button
              size="sm"
              onClick={() => setShowExport(true)}
              className="bg-gradient-primary flex items-center space-x-1"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
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

      {/* Export Dialog */}
      <ExportDialog open={showExport} onOpenChange={setShowExport} />
      
      {/* Mock Mode Indicator */}
      <MockModeIndicator />
      
      {/* Debug Panel - Only show in mock mode */}
      {config.enableMockMode && <DebugPanel />}
    </div>
  );
}