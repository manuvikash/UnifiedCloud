import { ENABLE_MOCK_MODE } from '@/lib/config';
import { Badge } from '@/components/ui/badge';
import { getMockScenarios } from '@/lib/mockApiService';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export function MockModeIndicator() {
  const [showDetails, setShowDetails] = useState(false);
  
  if (!ENABLE_MOCK_MODE) {
    return null;
  }

  const scenarios = getMockScenarios();

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 shadow-lg max-w-xs">
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="bg-amber-100 text-amber-800">
            🎭 Mock Mode
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
            className="h-auto p-1"
          >
            {showDetails ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </Button>
        </div>
        
        {showDetails && (
          <div className="mt-2 text-xs text-amber-700 space-y-1">
            <p className="font-medium">Using mock responses for testing</p>
            <p>Try these keywords in chat:</p>
            <ul className="list-disc list-inside space-y-1">
              <li><code className="bg-amber-100 px-1 rounded">cost</code> - Low cost architecture</li>
              <li><code className="bg-amber-100 px-1 rounded">scalable</code> - High scalability setup</li>
              <li><code className="bg-amber-100 px-1 rounded">monitoring</code> - Security focused</li>
              <li><code className="bg-amber-100 px-1 rounded">microservices</code> - Kubernetes setup</li>
            </ul>
            <p className="text-amber-600 mt-2">
              Set <code>VITE_ENABLE_MOCK_MODE=false</code> to use real API
            </p>
          </div>
        )}
      </div>
    </div>
  );
}