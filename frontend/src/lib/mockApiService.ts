// Mock API service for testing without backend
import type { ChatRequest, ChatResponse, TerraformRequest } from './apiService';

/**
 * Sample mock responses for different types of requests
 */
const mockResponses: Record<string, ChatResponse> = {
  // Default/generic response
  default: {
    components: [
      "aws:vpc | region=us-west-2; cost=0/mo; scale=high",
      "aws:subnet | region=us-west-2; cost=0/mo; scale=high", 
      "aws:alb | region=us-west-2; cost=25/mo; scale=med",
      "aws:ecs_service x2 | region=us-west-2; cost=120/mo; scale=high",
      "aws:rds | region=us-west-2; cost=80/mo; scale=med"
    ],
    connections: ["0->1", "1->2", "2->3", "3->4"],
    notes: "Basic scalable web application with load balancer and database"
  },

  // Low cost focused response
  "low cost": {
    components: [
      "aws:s3 | region=us-west-2; cost=2/mo; scale=low",
      "cloudfront:cdn | region=global; cost=15/mo; scale=high",
      "aws:lambda | region=us-west-2; cost=5/mo; scale=med",
      "supabase:postgres | region=us-west-2; cost=25/mo; scale=med"
    ],
    connections: ["1->0", "1->2", "2->3"],
    notes: "Cost-optimized serverless architecture with CDN and managed database"
  },

  // High scalability response
  "scalable": {
    components: [
      "cloudflare:cdn | region=global; cost=20/mo; scale=high",
      "aws:alb | region=us-west-2; cost=25/mo; scale=med",
      "aws:ecs_service x3 | region=us-west-2; cost=180/mo; scale=high",
      "aws:elasticache | region=us-west-2; cost=45/mo; scale=high",
      "aws:rds x2 | region=us-west-2; cost=160/mo; scale=high",
      "aws:s3 | region=us-west-2; cost=5/mo; scale=low"
    ],
    connections: ["0->1", "1->2", "2->3", "2->4", "2->5"],
    notes: "Highly scalable architecture with CDN, load balancer, multiple app instances, caching, and replicated database"
  },

  // Monitoring/security focused
  "monitoring": {
    components: [
      "aws:vpc | region=us-west-2; cost=0/mo; scale=high",
      "aws:alb | region=us-west-2; cost=25/mo; scale=med",
      "aws:ecs_service | region=us-west-2; cost=60/mo; scale=med",
      "aws:rds | region=us-west-2; cost=80/mo; scale=med",
      "aws:monitoring | region=us-west-2; cost=30/mo; scale=med",
      "aws:secret | region=us-west-2; cost=1/mo; scale=low"
    ],
    connections: ["0->1", "1->2", "2->3", "4->2", "4->3", "5->2"],
    notes: "Security-focused setup with monitoring, secrets management, and proper VPC isolation"
  },

  // Microservices architecture
  "microservices": {
    components: [
      "aws:eks | region=us-west-2; cost=150/mo; scale=high",
      "aws:alb | region=us-west-2; cost=25/mo; scale=med",
      "aws:rds | region=us-west-2; cost=80/mo; scale=med",
      "aws:elasticache | region=us-west-2; cost=45/mo; scale=high",
      "aws:s3 | region=us-west-2; cost=10/mo; scale=med",
      "aws:monitoring | region=us-west-2; cost=50/mo; scale=med"
    ],
    connections: ["1->0", "0->2", "0->3", "0->4", "5->0"],
    notes: "Kubernetes-based microservices architecture with managed services"
  }
};

/**
 * Determine which mock response to use based on the request
 */
function selectMockResponse(request: ChatRequest): ChatResponse {
  const message = request.message.toLowerCase();
  const context = request.context.toLowerCase();
  
  // Check for keywords in the message or context
  if (message.includes('cost') || message.includes('cheap') || message.includes('budget')) {
    return mockResponses["low cost"];
  }
  
  if (message.includes('scale') || message.includes('scalable') || message.includes('performance')) {
    return mockResponses.scalable;
  }
  
  if (message.includes('monitor') || message.includes('security') || message.includes('observability')) {
    return mockResponses.monitoring;
  }
  
  if (message.includes('microservice') || message.includes('kubernetes') || message.includes('k8s')) {
    return mockResponses.microservices;
  }
  
  // Check product type from context
  if (context.includes('api service') || context.includes('microservice')) {
    return mockResponses.microservices;
  }
  
  return mockResponses.default;
}

/**
 * Get the scenario name for logging purposes
 */
function getScenarioName(request: ChatRequest): string {
  const message = request.message.toLowerCase();
  const context = request.context.toLowerCase();
  
  if (message.includes('cost') || message.includes('cheap') || message.includes('budget')) {
    return 'Low Cost Architecture';
  }
  
  if (message.includes('scale') || message.includes('scalable') || message.includes('performance')) {
    return 'High Scalability Setup';
  }
  
  if (message.includes('monitor') || message.includes('security') || message.includes('observability')) {
    return 'Security & Monitoring Focused';
  }
  
  if (message.includes('microservice') || message.includes('kubernetes') || message.includes('k8s')) {
    return 'Microservices Architecture';
  }
  
  if (context.includes('api service') || context.includes('microservice')) {
    return 'Microservices Architecture';
  }
  
  return 'Default Web Application';
}

/**
 * Calculate estimated monthly cost from components
 */
function calculateEstimatedCost(components: string[]): number {
  let totalCost = 0;
  
  components.forEach(component => {
    // Extract cost from component string: "cost=25/mo"
    const costMatch = component.match(/cost=([0-9]+)\/mo/);
    if (costMatch) {
      totalCost += parseInt(costMatch[1], 10);
    }
  });
  
  return totalCost;
}

/**
 * Get provider statistics from components
 */
function getProviderStats(components: string[]): Record<string, number> {
  const stats: Record<string, number> = {};
  
  components.forEach(component => {
    // Extract provider from component string: "aws:service" or "cloudflare:cdn"
    const providerMatch = component.match(/^([^:]+):/);
    if (providerMatch) {
      const provider = providerMatch[1];
      stats[provider] = (stats[provider] || 0) + 1;
    }
  });
  
  return stats;
}

/**
 * Generate detailed mock terraform content
 */
function generateMockTerraformContent(request: TerraformRequest): string {
  const terraformContent = `
# Generated Terraform Configuration
# Components: ${request.components.length}
# Connections: ${request.connections.length}
# Notes: ${request.notes}

terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.region
}

variable "region" {
  description = "AWS region"
  type        = string
  default     = "us-west-2"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

# Resources generated from components:
${request.components.map((comp, index) => `
# Component ${index}: ${comp}
resource "aws_instance" "component_${index}" {
  # This would be generated based on the component type
  # ${comp}
}`).join('\n')}

# Outputs
output "deployment_info" {
  description = "Deployment information"
  value = {
    components = ${request.components.length}
    connections = ${request.connections.length}
    notes = "${request.notes}"
  }
}
`.trim();

  const zipContent = `
=== TERRAFORM EXPORT ===
Generated by UnifiedCloud (Mock Mode)
Date: ${new Date().toISOString()}

=== main.tf ===
${terraformContent}

=== variables.tf ===
variable "region" {
  description = "AWS region"
  type        = string
  default     = "us-west-2"
}

=== outputs.tf ===
output "infrastructure_summary" {
  value = "Generated ${request.components.length} components with ${request.connections.length} connections"
}

=== README.md ===
# Infrastructure Export

This terraform configuration was generated by UnifiedCloud.

## Components
${request.components.map((comp, i) => `${i + 1}. ${comp}`).join('\n')}

## Connections
${request.connections.map(conn => `- ${conn}`).join('\n')}

## Notes
${request.notes}

## Usage
\`\`\`bash
terraform init
terraform plan
terraform apply
\`\`\`
`;

  return zipContent;
}

/**
 * Mock implementation of the chat API
 */
export async function mockSendChatMessage(request: ChatRequest): Promise<ChatResponse> {
  // Log the incoming request
  console.group('🎭 Mock Chat API Call');
  console.log('📥 Request:', {
    context: request.context,
    history: request.history,
    message: request.message
  });
  
  // Simulate network delay
  const delay = 800 + Math.random() * 1200;
  console.log(`⏱️ Simulating ${Math.round(delay)}ms network delay...`);
  await new Promise(resolve => setTimeout(resolve, delay));
  
  // Randomly simulate errors for testing
  if (Math.random() < 0.05) { // 5% chance of error
    const errorMessage = 'Mock API error: Service temporarily unavailable';
    console.error('❌ Mock API Error:', errorMessage);
    console.groupEnd();
    throw new Error(errorMessage);
  }
  
  const response = selectMockResponse(request);
  
  // Log the response details
  console.log('📤 Response Generated:', {
    scenario: getScenarioName(request),
    componentCount: response.components.length,
    connectionCount: response.connections.length,
    notes: response.notes
  });
  
  console.log('🏗️ Components Generated:');
  response.components.forEach((comp, index) => {
    console.log(`  ${index}: ${comp}`);
  });
  
  console.log('🔗 Connections Generated:', response.connections);
  console.log('📝 Notes:', response.notes);
  
  // Calculate estimated cost
  const estimatedCost = calculateEstimatedCost(response.components);
  const providerStats = getProviderStats(response.components);
  console.log(`💰 Estimated Monthly Cost: $${estimatedCost}/month`);
  console.log('🏢 Provider Breakdown:', providerStats);
  
  console.groupEnd();
  
  return response;
}

/**
 * Mock implementation of the terraform API
 */
export async function mockGenerateTerraform(request: TerraformRequest): Promise<Blob> {
  // Log the incoming request
  console.group('🎭 Mock Terraform API Call');
  console.log('📥 Terraform Request:', {
    componentCount: request.components.length,
    connectionCount: request.connections.length,
    notes: request.notes
  });
  
  console.log('🏗️ Components to Export:', request.components);
  console.log('🔗 Connections to Export:', request.connections);
  
  // Calculate stats
  const estimatedCost = calculateEstimatedCost(request.components);
  const providerStats = getProviderStats(request.components);
  
  console.log('📊 Export Statistics:', {
    totalComponents: request.components.length,
    totalConnections: request.connections.length,
    estimatedMonthlyCost: `$${estimatedCost}/month`,
    providerBreakdown: providerStats
  });
  
  // Simulate network delay
  const delay = 1500 + Math.random() * 2000;
  console.log(`⏱️ Simulating terraform generation... ${Math.round(delay)}ms`);
  await new Promise(resolve => setTimeout(resolve, delay));
  
  // Randomly simulate errors for testing
  if (Math.random() < 0.03) { // 3% chance of error
    const errorMessage = 'Mock terraform generation failed: Invalid configuration';
    console.error('❌ Mock Terraform Error:', errorMessage);
    console.groupEnd();
    throw new Error(errorMessage);
  }
  
  // Generate mock terraform content
  const terraformContent = generateMockTerraformContent(request);
  
  console.log('✅ Terraform generation completed successfully');
  console.log('📁 Generated file size:', `${Math.round(terraformContent.length / 1024)}KB`);
  console.groupEnd();

  // Create a simple zip-like blob (in reality, this would be a proper zip)
  return new Blob([terraformContent], { type: 'application/zip' });
}

/**
 * Get available mock scenarios for testing
 */
export function getMockScenarios() {
  return Object.keys(mockResponses).map(key => ({
    key,
    description: mockResponses[key].notes,
    componentCount: mockResponses[key].components.length
  }));
}