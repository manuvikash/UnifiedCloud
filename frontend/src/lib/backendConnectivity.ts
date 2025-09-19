/**
 * Service for checking backend connectivity
 */
import { config } from './config';

export interface ConnectivityStatus {
  isReachable: boolean;
  error?: string;
  latency?: number;
}

class BackendConnectivityService {
  private static instance: BackendConnectivityService;
  private cachedStatus: ConnectivityStatus | null = null;
  private lastCheckTime = 0;
  private readonly CACHE_DURATION = 30000; // 30 seconds

  static getInstance(): BackendConnectivityService {
    if (!BackendConnectivityService.instance) {
      BackendConnectivityService.instance = new BackendConnectivityService();
    }
    return BackendConnectivityService.instance;
  }

  /**
   * Check if the backend is reachable
   * Uses cached result if check was recent
   */
  async checkConnectivity(forceRefresh = false): Promise<ConnectivityStatus> {
    const now = Date.now();
    
    // Return cached result if it's still valid and not forcing refresh
    if (!forceRefresh && 
        this.cachedStatus && 
        (now - this.lastCheckTime) < this.CACHE_DURATION) {
      return this.cachedStatus;
    }

    // If in mock mode, always return reachable
    if (config.enableMockMode) {
      const status: ConnectivityStatus = { isReachable: true };
      this.cachedStatus = status;
      this.lastCheckTime = now;
      return status;
    }

    // Perform actual connectivity check
    const startTime = Date.now();
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(`${config.apiBaseUrl}/health`, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      clearTimeout(timeoutId);
      const latency = Date.now() - startTime;

      if (response.ok) {
        const status: ConnectivityStatus = { 
          isReachable: true, 
          latency 
        };
        this.cachedStatus = status;
        this.lastCheckTime = now;
        return status;
      } else {
        const status: ConnectivityStatus = { 
          isReachable: false, 
          error: `Backend returned ${response.status}: ${response.statusText}`,
          latency 
        };
        this.cachedStatus = status;
        this.lastCheckTime = now;
        return status;
      }
    } catch (error) {
      const latency = Date.now() - startTime;
      let errorMessage = 'Unknown error';
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Request timeout - backend not responding';
        } else {
          errorMessage = error.message;
        }
      }
      
      const status: ConnectivityStatus = { 
        isReachable: false, 
        error: errorMessage,
        latency 
      };
      this.cachedStatus = status;
      this.lastCheckTime = now;
      return status;
    }
  }

  /**
   * Clear cached connectivity status
   */
  clearCache(): void {
    this.cachedStatus = null;
    this.lastCheckTime = 0;
  }

  /**
   * Get cached status without performing a new check
   */
  getCachedStatus(): ConnectivityStatus | null {
    return this.cachedStatus;
  }
}

export const backendConnectivity = BackendConnectivityService.getInstance();