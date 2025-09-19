import { useState } from 'react';
import { AlertTriangle, RefreshCw, Settings, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { config } from '@/lib/config';
import { backendConnectivity, ConnectivityStatus } from '@/lib/backendConnectivity';

interface BackendUnreachableProps {
  onRetry?: () => void;
  status?: ConnectivityStatus;
}

export function BackendUnreachable({ onRetry, status }: BackendUnreachableProps) {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await backendConnectivity.checkConnectivity(true); // Force refresh
      onRetry?.();
    } finally {
      setIsRetrying(false);
    }
  };

  const handleEnableMockMode = () => {
    // Guide user to enable mock mode
    alert('To enable mock mode, set VITE_ENABLE_MOCK_MODE=true in your .env file and restart the development server.');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
            <WifiOff className="w-8 h-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-bold text-destructive">
            Backend Not Reachable
          </CardTitle>
          <CardDescription className="text-lg">
            Unable to connect to the UnifiedCloud backend service
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Error Details */}
          {status?.error && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Error:</strong> {status.error}
              </AlertDescription>
            </Alert>
          )}

          {/* Connection Details */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Backend URL:</span>
              <Badge variant="outline" className="font-mono text-xs">
                {config.apiBaseUrl}
              </Badge>
            </div>
            
            {status?.latency && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Response Time:</span>
                <Badge variant="outline">
                  {status.latency}ms
                </Badge>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Mock Mode:</span>
              <Badge variant={config.enableMockMode ? "default" : "destructive"}>
                {config.enableMockMode ? "Enabled" : "Disabled"}
              </Badge>
            </div>
          </div>

          {/* Troubleshooting Steps */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Troubleshooting Steps
            </h3>
            
            <div className="grid gap-3">
              <div className="flex items-start gap-3 p-3 border rounded-lg">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                  1
                </div>
                <div>
                  <p className="font-medium">Check Backend Service</p>
                  <p className="text-sm text-muted-foreground">
                    Ensure the UnifiedCloud backend is running on {config.apiBaseUrl}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 border rounded-lg">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                  2
                </div>
                <div>
                  <p className="font-medium">Verify Network Connection</p>
                  <p className="text-sm text-muted-foreground">
                    Check your internet connection and firewall settings
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 border rounded-lg">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                  3
                </div>
                <div>
                  <p className="font-medium">Enable Mock Mode</p>
                  <p className="text-sm text-muted-foreground">
                    Use mock mode for development without a backend
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={handleRetry} 
              disabled={isRetrying}
              className="flex-1"
            >
              {isRetrying ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Checking Connection...
                </>
              ) : (
                <>
                  <Wifi className="w-4 h-4 mr-2" />
                  Retry Connection
                </>
              )}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleEnableMockMode}
              className="flex-1"
            >
              <Settings className="w-4 h-4 mr-2" />
              Enable Mock Mode
            </Button>
          </div>

          {/* Additional Help */}
          <div className="text-center text-sm text-muted-foreground">
            <p>
              Need help? Check the{' '}
              <a href="#" className="text-primary hover:underline">
                documentation
              </a>{' '}
              or{' '}
              <a href="#" className="text-primary hover:underline">
                contact support
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}