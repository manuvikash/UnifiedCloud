import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Settings, Download, Play, CheckCircle, Menu } from "lucide-react";
import { Designer } from "@/components/designer/Designer";
import { ChatPanel } from "@/components/designer/ChatPanel";
import { NodeDrawer } from "@/components/designer/NodeDrawer";
import { ExportDialog } from "@/components/designer/ExportDialog";
import { useGraphStore } from "@/store/useGraphStore";
import { useIsMobile } from "@/hooks/use-mobile";

export default function DesignerPage() {
  const { selectedNodeId, isDirty } = useGraphStore();
  const [showExport, setShowExport] = useState(false);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const isMobile = useIsMobile();

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
    </div>
  );
}