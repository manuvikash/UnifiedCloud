# UnifiedCloud Frontend API Integration

This document explains the integration between the frontend and backend APIs for chat and terraform export functionality.

## API Endpoints

### POST /chat
Handles infrastructure chat requests and returns component recommendations.

**Request Format:**
```json
{
  "context": "App Type: Web\nFrontend: React\nBackend: FastAPI\nDB: Postgres\nAuth: Stytch\nPriorities: cost=high, scale=med, latency=med",
  "history": [
    "User: need low cost", 
    "AI: start with S3+CloudFront+Lambda+RDS single-AZ"
  ],
  "message": "make it more scalable and add a load balancer"
}
```

**Success Response (200):**
```json
{
  "components": [
    "cloudflare:cdn | region=global; cost=20/mo; scale=high",
    "aws:alb | region=us-west-2; cost=25/mo; scale=med", 
    "aws:ecs_service x2 | region=us-west-2; cost=160/mo; scale=high",
    "supabase:postgres | region=us-west-2; cost=29/mo; scale=med",
    "s3:static | region=us-west-2; cost=2/mo; scale=low"
  ],
  "connections": ["0->1","1->2","2->3","4->0"],
  "notes": "added ALB, kept CDN in front; Supabase for DB; S3 for assets"
}
```

**Error Response (400):**
```json
{ "error": "could not parse context/history/message" }
```

### POST /terraform
Generates terraform configuration files as a downloadable zip.

**Request Format:**
```json
{
  "components": [
    "cloudflare:cdn | region=global; cost=20/mo; scale=high",
    "aws:alb | region=us-west-2; cost=25/mo; scale=med"
  ],
  "connections": ["0->1"],
  "notes": "Generated from UnifiedCloud designer"
}
```

**Success Response (200):**
- Content-Type: `application/zip`
- Content-Disposition: `attachment; filename="terraform-export.zip"`
- Body: ZIP file containing terraform configuration

## Configuration

Set these environment variables in your `.env` file:

```bash
# Backend API URL (required)
VITE_API_BASE_URL=http://localhost:8000

# Gladia Speech-to-Text API key (optional)
VITE_GLADIA_API_KEY=your_api_key_here

# Development mode (optional)
VITE_ENABLE_MOCK_MODE=false
```

## How It Works

### Chat Flow
1. User types message in chat panel
2. Frontend builds context from intake form data
3. Frontend sends POST /chat request with context, history, and message
4. Backend processes request and returns component list
5. Frontend parses response and updates graph visualization
6. User sees updated infrastructure diagram

### Export Flow  
1. User clicks "Download .zip" in export dialog
2. Frontend converts current graph to component format
3. Frontend sends POST /terraform request
4. Backend generates terraform files and returns zip
5. Frontend triggers download of zip file

### Error Handling
- Network errors are caught and displayed to user
- 400 Bad Request errors show specific error message
- Fallback download of raw code if API fails
- Speech-to-text errors are handled separately

## Implementation Files

- `src/lib/apiService.ts` - API service layer
- `src/lib/chatResponseParser.ts` - Response format conversion
- `src/lib/config.ts` - Configuration management
- `src/store/useChatStore.ts` - Chat state management
- `src/components/designer/ChatPanel.tsx` - Chat UI
- `src/components/designer/ExportDialog.tsx` - Export UI

## Testing

### Mock Mode Testing
To test without a backend, set `VITE_ENABLE_MOCK_MODE=true` in your `.env` file:

```bash
# Enable mock mode for testing
VITE_ENABLE_MOCK_MODE=true
VITE_API_BASE_URL=http://localhost:8000  # Still needed but won't be used
VITE_GLADIA_API_KEY=your_api_key_here
```

**Mock Mode Features:**
- 🎭 Visual indicator in top-right corner
- 📊 5 different response scenarios based on keywords
- 🔄 Realistic network delays (800-2000ms)
- ❌ Random error simulation (5% chat, 3% export failure rates)
- 📁 Mock terraform zip file generation
- 🎯 Smart keyword detection in chat messages

**Test Keywords:**
- `"low cost"` → Serverless architecture (~$47/mo)
- `"scalable"` → High-performance setup (~$410/mo) 
- `"monitoring"` → Security-focused (~$196/mo)
- `"microservices"` → Kubernetes setup (~$360/mo)
- Any other → Basic web app (~$225/mo)

See `MOCK_MODE_TESTING.md` for detailed testing scenarios.

### Production Testing
Set `VITE_ENABLE_MOCK_MODE=false` to use your real backend API.