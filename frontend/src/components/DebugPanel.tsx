import { Button } from '@/components/ui/button';
import { useGraphStore } from '@/store/useGraphStore';
import { useChatStore } from '@/store/useChatStore';

export function DebugPanel() {
  const { graph, setGraph } = useGraphStore();
  const { sendMessage } = useChatStore();

  const addTestNodes = () => {
    const testGraph = {
      nodes: [
        {
          id: 'test-1',
          type: 'vpc' as const,
          label: 'Test VPC',
          cloud: 'aws' as const,
          position: { x: 150, y: 150 },
          props: { cidr: '10.0.0.0/16' }
        },
        {
          id: 'test-2',
          type: 'subnet' as const,
          label: 'Test Subnet',
          cloud: 'aws' as const,
          position: { x: 550, y: 150 },
          props: { cidr: '10.0.1.0/24' }
        }
      ],
      edges: [
        {
          id: 'test-edge',
          source: 'test-1',
          target: 'test-2',
          label: 'contains'
        }
      ],
      variables: { test: 'debug data' }
    };

    console.log('🧪 Adding test graph:', testGraph);
    setGraph(testGraph);
  };

  const testChatMessage = async () => {
    console.log('🧪 Testing chat message...');
    await sendMessage('I need a low cost solution');
  };

  const clearGraph = () => {
    console.log('🧪 Clearing graph...');
    setGraph({ nodes: [], edges: [], variables: {} });
  };

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-white border rounded-lg p-2 shadow-lg space-y-2">
      <div className="text-xs font-medium text-gray-600">Debug Panel</div>
      <div className="flex flex-col space-y-1">
        <Button size="sm" onClick={addTestNodes} variant="outline">
          Add Test Nodes ({graph.nodes.length})
        </Button>
        <Button size="sm" onClick={testChatMessage} variant="outline">
          Test Chat Message
        </Button>
        <Button size="sm" onClick={clearGraph} variant="outline">
          Clear Graph
        </Button>
      </div>
    </div>
  );
}