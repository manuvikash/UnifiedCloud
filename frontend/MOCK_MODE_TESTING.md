# 🎭 Mock Mode Testing Guide

This guide shows you how to test the UnifiedCloud API integration without needing a backend server.

## 🚀 Quick Start

1. **Enable Mock Mode** in your `.env` file:
   ```bash
   VITE_ENABLE_MOCK_MODE=true
   ```

2. **Start the development server**:
   ```bash
   cd frontend
   npm run dev
   ```

3. **Look for the Mock Mode indicator** in the top-right corner of the designer page

## 🧪 Testing Scenarios

The mock service responds intelligently to different keywords in your chat messages:

### 💰 **Cost-Optimized Architecture**
**Try saying:** `"I need a low cost solution"` or `"Make it cheaper"`

**Expected Response:**
- S3 static hosting
- CloudFront CDN  
- Lambda functions
- Supabase managed database
- Total: ~$47/month

### 📈 **High Scalability Setup**
**Try saying:** `"Make it more scalable"` or `"I need high performance"`

**Expected Response:**
- CloudFlare CDN
- Application Load Balancer
- 3x ECS service instances
- ElastiCache for caching
- 2x RDS databases (read replicas)
- S3 for assets
- Total: ~$410/month

### 🔐 **Security & Monitoring Focused**
**Try saying:** `"Add monitoring"` or `"I need better security"`

**Expected Response:**
- VPC for network isolation
- Load balancer
- ECS service
- RDS database
- CloudWatch monitoring
- AWS Secrets Manager
- Total: ~$196/month

### ☸️ **Microservices Architecture**
**Try saying:** `"Use microservices"` or `"Set up Kubernetes"`

**Expected Response:**
- EKS cluster
- Application Load Balancer
- RDS database
- ElastiCache
- S3 storage
- Enhanced monitoring
- Total: ~$360/month

### 🎲 **Default Response**
**Try saying:** Any other message

**Expected Response:**
- VPC + Subnet
- Application Load Balancer
- 2x ECS services
- RDS database
- Total: ~$225/month

## 🎯 **Testing the Complete Flow**

### 1. **Chat Integration Test**
1. Go to the intake page and fill out your app details
2. Navigate to the designer page
3. Type a test message in the chat panel
4. Watch the graph update automatically with new components
5. Verify the visual layout and connections

### 2. **Export Functionality Test**  
1. After generating some infrastructure via chat
2. Click the "Export" button in the top toolbar
3. Click "Download .zip" in the export dialog
4. Verify you receive a mock terraform file
5. Check the content includes your components and connections

### 3. **Error Handling Test**
1. The mock service randomly fails ~5% of the time for chat
2. The mock service randomly fails ~3% of the time for export
3. Test that error messages display properly in the UI
4. Verify fallback download works when export API fails

### 4. **Speech-to-Text Integration**
1. Click the microphone button
2. Say one of the test phrases above
3. Verify it converts to text and triggers the chat API
4. Watch the graph update based on your spoken request

## 🔍 **Visual Verification**

When testing, you should see:

- **Mock Mode Indicator**: Yellow badge in top-right corner
- **Console Logging**: Comprehensive logs in browser console (F12 → Console tab)
- **Graph Updates**: Components appear/disappear based on responses
- **Proper Connections**: Lines between related components
- **Cost Information**: Hover over nodes to see cost/scale details
- **Loading States**: Spinners during API calls
- **Error Handling**: Red error messages when failures occur

### 📋 **Console Logging Details**

The mock service provides detailed console logging for debugging:

**Chat API Logs:**
```
🎭 Mock Chat API Call
  📥 Request: { context, history, message }
  ⏱️ Simulating 1200ms network delay...
  📤 Response Generated: { scenario, componentCount, notes }
  🏗️ Components Generated: [detailed component list]
  🔗 Connections Generated: ["0->1", "1->2"]
  💰 Estimated Monthly Cost: $225/month
  🏢 Provider Breakdown: { aws: 4, cloudflare: 1 }
```

**Graph Conversion Logs:**
```
🔄 Converting Chat Response to Graph
  📥 Raw API Response: { components, connections, notes }
  Component 0: { id, provider, service, props }
  🔗 Generated Edges: [edge objects]
  📊 Final Graph Structure: { nodeCount, edgeCount }
```

**Export API Logs:**
```
🎭 Mock Terraform API Call
  📥 Terraform Request: { componentCount, notes }
  📊 Export Statistics: { totalComponents, estimatedCost, providerBreakdown }
  ⏱️ Simulating terraform generation... 2100ms
  ✅ Terraform generation completed successfully
```

## 📊 **Expected Component Types**

The mock responses will generate these node types:
- **VPC/Subnet**: Network components
- **ALB**: Application Load Balancer
- **ECS Service**: Container services
- **RDS**: Managed databases
- **ElastiCache**: Caching layer
- **S3**: Object storage
- **CloudFront/CloudFlare**: CDN services
- **Lambda**: Serverless functions
- **EKS**: Kubernetes clusters
- **Monitoring**: CloudWatch/observability
- **Secrets**: AWS Secrets Manager

## 🛠 **Troubleshooting**

### Mock Mode Not Working?
1. Check `.env` file has `VITE_ENABLE_MOCK_MODE=true`
2. Restart the dev server after changing environment variables
3. Look for the yellow mock mode indicator
4. **Check browser console (F12)** for detailed mock mode logs
5. Look for `🎭 Mock Chat API Call` log groups

### Components Not Appearing?
1. Verify no real API errors in console
2. Check that intake form data is filled out
3. Try the exact keywords from scenarios above
4. **Check console logs** for response parsing details
5. Check browser network tab - should see no actual API calls

### Export Not Working?
1. Add some components to the graph first via chat
2. Mock export has 3% random failure rate - try again
3. Check that download triggers (may be blocked by popup blocker)
4. **Check console logs** for terraform generation details
5. Verify fallback download works when export fails

## 🔄 **Switching to Real API**

When your backend is ready:

1. Set `VITE_ENABLE_MOCK_MODE=false` in `.env`
2. Set `VITE_API_BASE_URL=http://localhost:8000` (or your backend URL)
3. Restart the dev server
4. Mock mode indicator should disappear
5. API calls will go to your real backend

## 📝 **Mock Data Customization**

To add your own mock scenarios:

1. Edit `src/lib/mockApiService.ts`
2. Add new entries to the `mockResponses` object
3. Update the `selectMockResponse` function with new keywords
4. Add your custom component strings and connections

The mock service is fully functional and provides realistic testing of the entire integration flow!