/**
 * Configuration for the UnifiedCloud application
 */

interface AppConfig {
  apiBaseUrl: string;
  enableMockMode: boolean;
}

// Get API base URL from environment or use default
const getApiBaseUrl = (): string => {
  // Check for environment variable
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // Default to current domain in production, localhost in development
  if (import.meta.env.PROD) {
    return window.location.origin;
  }
  
  // Development default - assume backend is on port 8000
  return 'http://localhost:8000';
};

export const config: AppConfig = {
  apiBaseUrl: getApiBaseUrl(),
  enableMockMode: import.meta.env.VITE_ENABLE_MOCK_MODE === 'true',
};

// Export individual values for convenience
export const API_BASE_URL = config.apiBaseUrl;
export const ENABLE_MOCK_MODE = config.enableMockMode;