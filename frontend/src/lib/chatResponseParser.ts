import type { Graph, UNode, UEdge } from './graph';
import type { ChatResponse } from './apiService';

/**
 * Parses a component string from the API response
 * Format: "cloudflare:cdn | region=global; cost=20/mo; scale=high"
 */
export interface ParsedComponent {
  id: string;
  provider: string;
  service: string;
  multiplier?: number;
  region?: string;
  cost?: string;
  scale?: string;
  desc?: string;
  props: Record<string, any>;
}

/**
 * Parse a single component string into structured data
 */
export function parseComponent(componentStr: string, index: number): ParsedComponent {
  // Split by pipe to separate service from properties
  const [servicePort, propsStr] = componentStr.split('|').map(s => s.trim());
  
  // Parse service part with optional number prefix and additional descriptors
  // Examples: "0 aws:alb multi-az", "aws:ecs_service x2", "1 aws:rds:postgres multi-az"
  const serviceMatch = servicePort.match(/^(?:\d+\s+)?([^:]+):(.+?)(?:\s*x(\d+))?(?:\s+.*)?$/);
  if (!serviceMatch) {
    throw new Error(`Invalid component format: ${componentStr}`);
  }
  
  const [, provider, fullService, multiplierStr] = serviceMatch;
  
  // Handle nested services like "rds:postgres" by taking the last part as the primary service
  const serviceParts = fullService.split(':');
  const service = serviceParts[serviceParts.length - 1];
  
  const multiplier = multiplierStr ? parseInt(multiplierStr, 10) : undefined;
  
  // Parse properties: "region=global; cost=20/mo; scale=high; desc=CDN for static assets"
  const props: Record<string, any> = {};
  let region: string | undefined;
  let cost: string | undefined;
  let scale: string | undefined;
  let desc: string | undefined;
  
  if (propsStr) {
    const propPairs = propsStr.split(';').map(s => s.trim());
    for (const propPair of propPairs) {
      const [key, value] = propPair.split('=').map(s => s.trim());
      if (key && value) {
        props[key] = value;
        
        // Extract special properties
        if (key === 'region') region = value;
        if (key === 'cost') cost = value;
        if (key === 'scale') scale = value;
        if (key === 'desc') desc = value;
      }
    }
  }
  
  return {
    id: `component-${index}`,
    provider,
    service,
    multiplier,
    region,
    cost,
    scale,
    desc,
    props,
  };
}

/**
 * Convert service name to node type for React Flow
 */
export function serviceToNodeType(service: string): UNode['type'] {
  const serviceMap: Record<string, UNode['type']> = {
    'cdn': 'cloudfront',
    'alb': 'alb',
    'ecs_service': 'ecs_service',
    'postgres': 'rds',
    'rds': 'rds',
    'redis': 'elasticache',
    'elasticache': 'elasticache',
    'static': 's3',
    's3': 's3',
    'lambda': 'lambda',
    'vpc': 'vpc',
    'subnet': 'subnet',
    'eks': 'eks',
    'iam_role': 'iam_role',
    'monitoring': 'monitoring',
    'secret': 'secret',
    'queue': 'queue',
    'topic': 'topic',
    'gke': 'gke',
    'cloudrun': 'cloudrun',
    'sql': 'sql',
    'vm': 'vm',
  };
  
  return serviceMap[service] || 'custom';
}

/**
 * Convert provider to cloud platform
 */
export function providerToCloud(provider: string): 'aws' | 'gcp' | 'azure' | undefined {
  const providerMap: Record<string, 'aws' | 'gcp' | 'azure'> = {
    'aws': 'aws',
    'gcp': 'gcp',
    'google': 'gcp',
    'azure': 'azure',
    'microsoft': 'azure',
    // Third-party services - default to AWS for visualization
    'cloudflare': 'aws',
    'supabase': 'aws',
    'vercel': 'aws',
    'netlify': 'aws',
    'digitalocean': 'aws',
  };
  
  return providerMap[provider.toLowerCase()];
}

/**
 * Generate a human-readable label for the component
 */
export function generateLabel(parsed: ParsedComponent): string {
  const { provider, service, multiplier } = parsed;
  
  let label = `${provider.toUpperCase()} ${service.replace('_', ' ').toUpperCase()}`;
  
  if (multiplier && multiplier > 1) {
    label += ` (${multiplier}x)`;
  }
  
  return label;
}

/**
 * Calculate positioning for nodes in a grid layout
 */
export function calculatePosition(index: number, totalNodes: number): { x: number; y: number } {
  const cols = Math.ceil(Math.sqrt(totalNodes));
  const spacing = 400; // Increased from 200 to 400 for better spacing
  const offsetX = 150;  // Increased initial offset
  const offsetY = 150;  // Increased initial offset
  
  const col = index % cols;
  const row = Math.floor(index / cols);
  
  return {
    x: offsetX + col * spacing,
    y: offsetY + row * spacing,
  };
}

/**
 * Parse connections from API format to edges
 * Format: ["0->1", "1->2", "2->3", "4->0"]
 */
export function parseConnections(connections: string[], componentIds: string[]): UEdge[] {
  const edges: UEdge[] = [];
  
  for (const connection of connections) {
    const [sourceIdx, targetIdx] = connection.split('->').map(s => parseInt(s.trim(), 10));
    
    if (sourceIdx < 0 || sourceIdx >= componentIds.length || 
        targetIdx < 0 || targetIdx >= componentIds.length) {
      console.warn(`Invalid connection: ${connection} (component count: ${componentIds.length})`);
      continue;
    }
    
    const sourceId = componentIds[sourceIdx];
    const targetId = componentIds[targetIdx];
    
    edges.push({
      id: `${sourceId}-${targetId}`,
      source: sourceId,
      target: targetId,
      label: 'connects to',
    });
  }
  
  return edges;
}

/**
 * Convert chat API response to graph data structure
 */
export function chatResponseToGraph(response: ChatResponse): Graph {
  console.group('🔄 Converting Chat Response to Graph');
  console.log('📥 Raw API Response:', response);
  
  try {
    // Parse all components
    const parsedComponents = response.components.map((comp, index) => {
      const parsed = parseComponent(comp, index);
      console.log(`  Component ${index}:`, parsed);
      return parsed;
    });
    
    console.log('✅ Parsed Components:', parsedComponents);
    
    // Convert to graph nodes
    const nodes: UNode[] = parsedComponents.map((parsed, index) => {
      const node = {
        id: parsed.id,
        type: serviceToNodeType(parsed.service),
        label: generateLabel(parsed),
        cloud: providerToCloud(parsed.provider),
        position: calculatePosition(index, parsedComponents.length),
        props: {
          ...parsed.props,
          provider: parsed.provider,
          service: parsed.service,
          multiplier: parsed.multiplier,
          cost: parsed.cost,
          scale: parsed.scale,
          desc: parsed.desc,
        },
      };
      console.log(`  Node ${index}:`, node);
      return node;
    });
    
    // Parse connections to edges
    const componentIds = parsedComponents.map(p => p.id);
    const edges = parseConnections(response.connections, componentIds);
    
    console.log('🔗 Generated Edges:', edges);
    
    const graph = {
      nodes,
      edges,
      variables: {
        generated_at: new Date().toISOString(),
        notes: response.notes,
      },
    };
    
    console.log('📊 Final Graph Structure:', {
      nodeCount: graph.nodes.length,
      edgeCount: graph.edges.length,
      variables: graph.variables
    });
    
    console.groupEnd();
    return graph;
  } catch (error) {
    console.error('❌ Failed to parse chat response:', error);
    console.groupEnd();
    throw new Error(`Failed to parse chat response: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Convert graph back to chat API format for terraform export
 */
export function graphToChatFormat(graph: Graph): { components: string[], connections: string[], notes: string } {
  console.group('🔄 Converting Graph to Chat Format for Export');
  console.log('📥 Input Graph:', {
    nodeCount: graph.nodes.length,
    edgeCount: graph.edges.length,
    variables: graph.variables
  });
  
  // Convert nodes back to component strings
  const components = graph.nodes.map((node, index) => {
    const provider = node.props.provider || 'aws';
    const service = node.props.service || node.type;
    const multiplier = node.props.multiplier;
    
    let componentStr = `${provider}:${service}`;
    if (multiplier && multiplier > 1) {
      componentStr += ` x${multiplier}`;
    }
    
    // Add properties
    const props: string[] = [];
    if (node.props.region) props.push(`region=${node.props.region}`);
    if (node.props.cost) props.push(`cost=${node.props.cost}`);
    if (node.props.scale) props.push(`scale=${node.props.scale}`);
    
    if (props.length > 0) {
      componentStr += ` | ${props.join('; ')}`;
    }
    
    console.log(`  Component ${index}: ${componentStr}`);
    return componentStr;
  });
  
  // Convert edges back to connection format
  const nodeIdToIndex = new Map<string, number>();
  graph.nodes.forEach((node, index) => {
    nodeIdToIndex.set(node.id, index);
  });
  
  const connections = graph.edges.map((edge, index) => {
    const sourceIdx = nodeIdToIndex.get(edge.source);
    const targetIdx = nodeIdToIndex.get(edge.target);
    
    if (sourceIdx === undefined || targetIdx === undefined) {
      throw new Error(`Invalid edge: ${edge.source} -> ${edge.target}`);
    }
    
    const connectionStr = `${sourceIdx}->${targetIdx}`;
    console.log(`  Connection ${index}: ${connectionStr} (${edge.source} -> ${edge.target})`);
    return connectionStr;
  });
  
  const notes = typeof graph.variables.notes === 'string' ? graph.variables.notes : 'Generated from UnifiedCloud designer';
  
  const result = { components, connections, notes };
  
  console.log('📤 Export Format Generated:', {
    componentCount: result.components.length,
    connectionCount: result.connections.length,
    notes: result.notes
  });
  
  console.groupEnd();
  return result;
}