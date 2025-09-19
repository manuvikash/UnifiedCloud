import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface CloudNodeData {
  label: string;
  nodeType: string;
  cloud?: 'aws' | 'gcp' | 'azure';
  props: Record<string, any>;
}

const cloudIcons = {
  aws: '🔶',
  gcp: '🔵', 
  azure: '🔷',
};

const cloudColors = {
  aws: 'bg-aws/10 text-aws border-aws/20',
  gcp: 'bg-gcp/10 text-gcp border-gcp/20',
  azure: 'bg-azure/10 text-azure border-azure/20',
};

export const CloudNode = memo((props: NodeProps) => {
  const { data, selected } = props;
  const nodeData = data as unknown as CloudNodeData;
  const { label, nodeType, cloud, props: nodeProps } = nodeData;

  return (
    <Card 
      className={cn(
        "min-w-[160px] transition-all duration-200 cursor-pointer",
        "border-2 hover:shadow-md",
        selected ? "border-primary shadow-lg ring-2 ring-primary/20" : "border-border"
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-primary border-2 border-background"
      />
      
      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium truncate">{label}</div>
          {cloud && (
            <div className="text-lg">
              {cloudIcons[cloud]}
            </div>
          )}
        </div>
        
        <Badge 
          variant="secondary" 
          className={cn(
            "text-xs",
            cloud && cloudColors[cloud]
          )}
        >
          {nodeType.replace('_', ' ')}
        </Badge>

        {Object.keys(nodeProps).length > 0 && (
          <div className="text-xs text-muted-foreground">
            {Object.entries(nodeProps).slice(0, 2).map(([key, value]) => (
              <div key={key} className="truncate">
                {key}: {String(value)}
              </div>
            ))}
            {Object.keys(nodeProps).length > 2 && (
              <div>+{Object.keys(nodeProps).length - 2} more</div>
            )}
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-primary border-2 border-background"
      />
    </Card>
  );
});

CloudNode.displayName = 'CloudNode';