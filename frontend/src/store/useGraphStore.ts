import { create } from 'zustand';
import type { Graph, UNode, UEdge } from '@/lib/graph';

interface GraphState {
  graph: Graph;
  selectedNodeId: string | null;
  isDirty: boolean;
  setGraph: (graph: Graph) => void;
  selectNode: (nodeId: string | null) => void;
  updateNode: (nodeId: string, updates: Partial<UNode>) => void;
  addNode: (node: UNode) => void;
  removeNode: (nodeId: string) => void;
  addEdge: (edge: UEdge) => void;
  removeEdge: (edgeId: string) => void;
  applyPatch: (patch: any) => void;
  markClean: () => void;
  reset: () => void;
}

const defaultGraph: Graph = {
  nodes: [],
  edges: [],
  variables: {},
};

export const useGraphStore = create<GraphState>((set, get) => ({
  graph: defaultGraph,
  selectedNodeId: null,
  isDirty: false,

  setGraph: (graph) => set({ graph, isDirty: false }),

  selectNode: (nodeId) => set({ selectedNodeId: nodeId }),

  updateNode: (nodeId, updates) =>
    set((state) => ({
      graph: {
        ...state.graph,
        nodes: state.graph.nodes.map((node) =>
          node.id === nodeId ? { ...node, ...updates } : node
        ),
      },
      isDirty: true,
    })),

  addNode: (node) =>
    set((state) => ({
      graph: {
        ...state.graph,
        nodes: [...state.graph.nodes, node],
      },
      isDirty: true,
    })),

  removeNode: (nodeId) =>
    set((state) => ({
      graph: {
        ...state.graph,
        nodes: state.graph.nodes.filter((node) => node.id !== nodeId),
        edges: state.graph.edges.filter(
          (edge) => edge.source !== nodeId && edge.target !== nodeId
        ),
      },
      selectedNodeId: state.selectedNodeId === nodeId ? null : state.selectedNodeId,
      isDirty: true,
    })),

  addEdge: (edge) =>
    set((state) => ({
      graph: {
        ...state.graph,
        edges: [...state.graph.edges, edge],
      },
      isDirty: true,
    })),

  removeEdge: (edgeId) =>
    set((state) => ({
      graph: {
        ...state.graph,
        edges: state.graph.edges.filter((edge) => edge.id !== edgeId),
      },
      isDirty: true,
    })),

  applyPatch: (patch) => {
    // Simplified patch application - in a real app this would be more sophisticated
    console.log('Applying patch:', patch);
    set((state) => ({ isDirty: true }));
  },

  markClean: () => set({ isDirty: false }),

  reset: () => set({ graph: defaultGraph, selectedNodeId: null, isDirty: false }),
}));