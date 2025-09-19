// API service for handling chat and terraform endpoints
import { API_BASE_URL, ENABLE_MOCK_MODE } from './config';
import { mockSendChatMessage, mockGenerateTerraform } from './mockApiService';

export interface ChatRequest {
  context: string;
  history: string[];
  message: string;
}

export interface ChatResponse {
  components: string[];
  connections: string[];
  notes: string;
}

export interface TerraformRequest {
  components: string[];
  connections: string[];
  notes: string;
}

export interface ApiError {
  error: string;
}

class UnifiedCloudApiService {
  private baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  /**
   * Send a chat message and get infrastructure recommendations
   */
  async sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
    // Use mock service if enabled
    if (ENABLE_MOCK_MODE) {
      console.log('🎭 Using mock mode for chat API');
      return mockSendChatMessage(request);
    }

    try {
      const response = await fetch(`${this.baseUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        if (response.status === 400) {
          const errorData: ApiError = await response.json();
          throw new Error(`Bad Request: ${errorData.error}`);
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: ChatResponse = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to send chat message');
    }
  }

  /**
   * Generate and download terraform configuration
   */
  async generateTerraform(request: TerraformRequest): Promise<Blob> {
    // Use mock service if enabled
    if (ENABLE_MOCK_MODE) {
      console.log('🎭 Using mock mode for terraform API');
      return mockGenerateTerraform(request);
    }

    try {
      const response = await fetch(`${this.baseUrl}/terraform`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        if (response.status === 400) {
          const errorData: ApiError = await response.json();
          throw new Error(`Bad Request: ${errorData.error}`);
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Verify response is a zip file
      const contentType = response.headers.get('content-type');
      if (contentType !== 'application/zip') {
        throw new Error('Expected zip file but received different content type');
      }

      const blob = await response.blob();
      return blob;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to generate terraform configuration');
    }
  }
}

// Create singleton instance
export const apiService = new UnifiedCloudApiService(API_BASE_URL);

// Export the class for testing purposes
export { UnifiedCloudApiService };