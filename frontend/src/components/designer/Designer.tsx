import { useCallback, useMemo, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  NodeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useGraphStore } from '@/store/useGraphStore';
import { CloudNode } from './CloudNode';

const nodeTypes: NodeTypes = {
  cloud: CloudNode,
};

export function Designer() {
  const { graph, selectNode, addEdge: addGraphEdge, removeNode } = useGraphStore();
  
  console.log('🎨 Designer render - current graph:', {
    nodeCount: graph.nodes.length,
    edgeCount: graph.edges.length,
    nodes: graph.nodes
  });

  // Convert graph nodes to React Flow nodes
  const initialNodes: Node[] = useMemo(() => 
    graph.nodes.map(node => ({
      id: node.id,
      type: 'cloud',
      position: node.position || { x: Math.random() * 800 + 100, y: Math.random() * 600 + 100 },
      data: {
        label: node.label,
        nodeType: node.type,
        cloud: node.cloud,
        props: node.props,
      },
    })), [graph.nodes]
  );

  // Convert graph edges to React Flow edges
  const initialEdges: Edge[] = useMemo(() =>
    graph.edges.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.label,
      type: 'smoothstep',
    })), [graph.edges]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update ReactFlow state when store changes
  useEffect(() => {
    console.log('🔄 Graph store updated, syncing with ReactFlow', {
      nodeCount: graph.nodes.length,
      edgeCount: graph.edges.length
    });
    setNodes(initialNodes);
  }, [initialNodes, setNodes, graph.nodes.length]);

  useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges, graph.edges.length]);

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge = {
        id: `${params.source}-${params.target}`,
        source: params.source!,
        target: params.target!,
      };
      setEdges((eds) => addEdge(params, eds));
      addGraphEdge(newEdge);
    },
    [setEdges, addGraphEdge]
  );

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      selectNode(node.id);
    },
    [selectNode]
  );

  const onNodesDelete = useCallback(
    (nodesToDelete: Node[]) => {
      nodesToDelete.forEach(node => {
        removeNode(node.id);
      });
    },
    [removeNode]
  );

  return (
    <div className="w-full h-full bg-muted/20">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onNodesDelete={onNodesDelete}
        nodeTypes={nodeTypes}
        fitView
        className="bg-background"
        deleteKeyCode={['Backspace', 'Delete']}
        multiSelectionKeyCode={['Meta', 'Ctrl']}
      >
        <Background color="#e5e7eb" size={1} />
        <Controls className="bg-card border shadow-md" />
        <MiniMap 
          className="bg-card border shadow-md"
          nodeColor="#3b82f6"
          maskColor="rgba(0, 0, 0, 0.1)"
        />
      </ReactFlow>
    </div>
  );
}