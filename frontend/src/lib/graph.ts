export type Priorities = {
  security: number;
  scalability: number;
  cost: number;
  latency: number;
  developer_experience: number;
  availability: number;
};

export type Intake = {
  productType: 'webapp' | 'api' | 'data-pipeline' | 'realtime' | 'batch';
  techStack: {
    frontend: string;
    backend: string;
    database: string;
    authentication: string;
    other: string;
  };
  priorities: Priorities;
};

export type Graph = {
  nodes: UNode[];
  edges: UEdge[];
  variables: Record<string, string | number | boolean>;
};

export type UNode = {
  id: string;
  type: 'vpc' | 'subnet' | 'ecs_service' | 'eks' | 'lambda' | 'alb' | 'rds' | 'elasticache' | 's3' | 'cloudfront' | 'iam_role' | 'monitoring' | 'secret' | 'queue' | 'topic' | 'gke' | 'cloudrun' | 'sql' | 'vm' | 'custom';
  label: string;
  props: Record<string, any>;
  outputs?: Record<string, string>;
  terraformRefs?: string[];
  position?: { x: number; y: number };
  cloud?: 'aws' | 'gcp' | 'azure';
};

export type UEdge = {
  id: string;
  source: string;
  target: string;
  label?: string;
};

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  patches?: string[];
};

// Sample data generators
export const createSampleGraph = (intake: Intake): Graph => {
  const primaryCloud = 'aws'; // Default to AWS for sample
  const nodes: UNode[] = [];
  const edges: UEdge[] = [];

  // VPC
  nodes.push({
    id: 'vpc-1',
    type: 'vpc',
    label: 'Main VPC',
    props: { cidr: '10.0.0.0/16' },
    position: { x: 100, y: 100 },
    cloud: primaryCloud
  });

  // Subnets
  nodes.push({
    id: 'subnet-1',
    type: 'subnet',
    label: 'Public Subnet',
    props: { cidr: '10.0.1.0/24', availability_zone: 'a' },
    position: { x: 300, y: 100 },
    cloud: primaryCloud
  });

  nodes.push({
    id: 'subnet-2',
    type: 'subnet',
    label: 'Private Subnet',
    props: { cidr: '10.0.2.0/24', availability_zone: 'b' },
    position: { x: 300, y: 200 },
    cloud: primaryCloud
  });

  // Application layer based on tech stack
  if (intake.productType === 'webapp' && (intake.techStack.frontend || intake.techStack.backend)) {
    nodes.push({
      id: 'alb-1',
      type: 'alb',
      label: 'Load Balancer',
      props: { scheme: 'internet-facing' },
      position: { x: 500, y: 100 },
      cloud: primaryCloud
    });

    nodes.push({
      id: 'ecs-1',
      type: 'ecs_service',
      label: `${intake.techStack.backend || 'Web'} Service`,
      props: { desired_count: 2, cpu: '256', memory: '512' },
      position: { x: 700, y: 150 },
      cloud: primaryCloud
    });
  }

  // Database based on tech stack
  if (intake.techStack.database) {
    nodes.push({
      id: 'db-1',
      type: 'rds',
      label: `${intake.techStack.database} Database`,
      props: { 
        engine: 'postgres', 
        instance_class: 'db.t3.micro',
        allocated_storage: 20
      },
      position: { x: 700, y: 300 },
      cloud: primaryCloud
    });
  }

  // Add edges
  edges.push({ id: 'vpc-subnet1', source: 'vpc-1', target: 'subnet-1' });
  edges.push({ id: 'vpc-subnet2', source: 'vpc-1', target: 'subnet-2' });
  
  if (nodes.find(n => n.id === 'alb-1')) {
    edges.push({ id: 'subnet-alb', source: 'subnet-1', target: 'alb-1' });
    if (nodes.find(n => n.id === 'ecs-1')) {
      edges.push({ id: 'alb-ecs', source: 'alb-1', target: 'ecs-1' });
    }
    if (nodes.find(n => n.id === 'cloudrun-1')) {
      edges.push({ id: 'alb-cloudrun', source: 'alb-1', target: 'cloudrun-1' });
    }
  }
  
  if (nodes.find(n => n.id === 'db-1')) {
    const appNode = nodes.find(n => n.type === 'ecs_service' || n.type === 'cloudrun');
    if (appNode) {
      edges.push({ id: `${appNode.id}-db`, source: appNode.id, target: 'db-1' });
    }
  }

  return {
    nodes,
    edges,
    variables: {
      environment: 'production',
      region: 'us-west-2',
      frontend: intake.techStack.frontend || 'React',
      backend: intake.techStack.backend || 'Node.js'
    }
  };
};

export const generateTerraform = (node: UNode): string => {
  switch (node.type) {
    case 'vpc':
      return `resource "aws_vpc" "${node.id}" {
  cidr_block           = "${node.props.cidr || '10.0.0.0/16'}"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "${node.label}"
  }
}`;

    case 'subnet':
      return `resource "aws_subnet" "${node.id}" {
  vpc_id            = aws_vpc.vpc-1.id
  cidr_block        = "${node.props.cidr || '10.0.1.0/24'}"
  availability_zone = "\${var.region}${node.props.availability_zone || 'a'}"

  tags = {
    Name = "${node.label}"
  }
}`;

    case 'rds':
      return `resource "aws_db_instance" "${node.id}" {
  identifier     = "${node.id}"
  engine         = "${node.props.engine || 'postgres'}"
  engine_version = "${node.props.engine === 'postgres' ? '13.7' : '8.0'}"
  instance_class = "${node.props.instance_class || 'db.t3.micro'}"
  
  allocated_storage = ${node.props.allocated_storage || 20}
  storage_encrypted = true
  
  db_name  = "${node.props.db_name || 'main'}"
  username = "${node.props.username || 'admin'}"
  password = "\${var.db_password}"
  
  vpc_security_group_ids = [aws_security_group.db.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name
  
  skip_final_snapshot = true

  tags = {
    Name = "${node.label}"
  }
}`;

    case 'ecs_service':
      return `resource "aws_ecs_service" "${node.id}" {
  name            = "${node.id}"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.${node.id}.arn
  desired_count   = ${node.props.desired_count || 2}

  deployment_configuration {
    maximum_percent         = 200
    minimum_healthy_percent = 100
  }

  network_configuration {
    subnets         = [aws_subnet.subnet-2.id]
    security_groups = [aws_security_group.app.id]
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.app.arn
    container_name   = "${node.id}"
    container_port   = 80
  }

  depends_on = [aws_lb_listener.app]

  tags = {
    Name = "${node.label}"
  }
}`;

    default:
      return `# ${node.type} "${node.id}" configuration
# Label: ${node.label}
# Props: ${JSON.stringify(node.props, null, 2)}`;
  }
};