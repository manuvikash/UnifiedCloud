import { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Save, X } from 'lucide-react';
import { useGraphStore } from '@/store/useGraphStore';
import { generateTerraform } from '@/lib/graph';
import Editor from '@monaco-editor/react';

interface NodeDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NodeDrawer({ open, onOpenChange }: NodeDrawerProps) {
  const { graph, selectedNodeId, updateNode } = useGraphStore();
  const [localProps, setLocalProps] = useState<Record<string, any>>({});

  const selectedNode = graph.nodes.find(node => node.id === selectedNodeId);

  useEffect(() => {
    if (selectedNode) {
      setLocalProps({ ...selectedNode.props });
    }
  }, [selectedNode]);

  const handleSave = () => {
    if (selectedNode) {
      updateNode(selectedNode.id, { props: localProps });
      onOpenChange(false);
    }
  };

  const handlePropChange = (key: string, value: string) => {
    setLocalProps(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const addNewProp = () => {
    const key = `new_property_${Object.keys(localProps).length + 1}`;
    setLocalProps(prev => ({
      ...prev,
      [key]: '',
    }));
  };

  const removeProp = (key: string) => {
    setLocalProps(prev => {
      const { [key]: removed, ...rest } = prev;
      return rest;
    });
  };

  if (!selectedNode) return null;

  const terraformCode = generateTerraform({
    ...selectedNode,
    props: localProps,
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[600px] sm:max-w-[600px]">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="flex items-center space-x-2">
                <span>{selectedNode.label}</span>
                {selectedNode.cloud && (
                  <Badge variant="secondary" className="text-xs">
                    {selectedNode.cloud.toUpperCase()}
                  </Badge>
                )}
              </SheetTitle>
              <SheetDescription>
                Configure properties for this {selectedNode.type.replace('_', ' ')} resource
              </SheetDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        <div className="mt-6">
          <Tabs defaultValue="properties" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="properties">Properties</TabsTrigger>
              <TabsTrigger value="terraform">Terraform</TabsTrigger>
            </TabsList>

            <TabsContent value="properties" className="space-y-4">
              <Card className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Resource Properties</h4>
                    <Button variant="outline" size="sm" onClick={addNewProp}>
                      Add Property
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {Object.entries(localProps).map(([key, value]) => (
                      <div key={key} className="flex items-center space-x-2">
                        <div className="flex-1">
                          <Label className="text-xs text-muted-foreground">
                            {key}
                          </Label>
                          <Input
                            value={String(value)}
                            onChange={(e) => handlePropChange(key, e.target.value)}
                            placeholder="Enter value..."
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeProp(key)}
                          className="text-destructive hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}

                    {Object.keys(localProps).length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>No properties configured</p>
                        <Button variant="outline" size="sm" onClick={addNewProp} className="mt-2">
                          Add First Property
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} className="bg-gradient-primary">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="terraform" className="space-y-4">
              <Card className="p-4">
                <h4 className="font-medium mb-4">Generated Terraform</h4>
                <div className="border rounded-md overflow-hidden">
                  <Editor
                    height="400px"
                    defaultLanguage="hcl"
                    value={terraformCode}
                    options={{
                      readOnly: true,
                      minimap: { enabled: false },
                      fontSize: 12,
                      lineNumbers: 'on',
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
      </SheetContent>
    </Sheet>
  );
}