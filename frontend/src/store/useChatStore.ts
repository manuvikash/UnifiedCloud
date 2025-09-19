import { create } from 'zustand';
import type { ChatMessage } from '@/lib/graph';
import { apiService, type ChatRequest } from '@/lib/apiService';
import { chatResponseToGraph } from '@/lib/chatResponseParser';
import { useIntakeStore } from './useIntakeStore';
import { useGraphStore } from './useGraphStore';

interface ChatState {
  messages: ChatMessage[];
  isTyping: boolean;
  error: string | null;
  addMessage: (content: string, role: 'user' | 'assistant', patches?: string[]) => void;
  sendMessage: (content: string) => Promise<void>;
  applyPatchFromMessage: (messageId: string) => void;
  setTyping: (isTyping: boolean) => void;
  setError: (error: string | null) => void;
  clear: () => void;
  buildContext: () => string;
  buildHistory: () => string[];
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m here to help you design and optimize your cloud infrastructure. What would you like to work on today?',
      timestamp: new Date(),
    },
  ],
  isTyping: false,
  error: null,

  addMessage: (content, role, patches) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          id: Date.now().toString(),
          role,
          content,
          timestamp: new Date(),
          patches,
        },
      ],
    })),

  buildContext: () => {
    const intakeStore = useIntakeStore.getState();
    const { intake } = intakeStore;
    
    const productTypeMap = {
      'webapp': 'Web Application',
      'api': 'API Service',
      'data-pipeline': 'Data Pipeline',
      'realtime': 'Real-time Application',
      'batch': 'Batch Processing'
    };
    
    const priorityLabels = {
      1: 'very low', 2: 'low', 3: 'medium-low', 
      4: 'medium', 5: 'medium-high', 6: 'high', 
      7: 'very high', 8: 'critical', 9: 'maximum', 10: 'absolute maximum'
    };
    
    const priorityString = Object.entries(intake.priorities)
      .map(([key, value]) => `${key}=${priorityLabels[value as keyof typeof priorityLabels] || 'medium'}`)
      .join(', ');
    
    return `App Type: ${productTypeMap[intake.productType]}
Frontend: ${intake.techStack.frontend || 'Not specified'}
Backend: ${intake.techStack.backend || 'Not specified'}
DB: ${intake.techStack.database || 'Not specified'}
Auth: ${intake.techStack.authentication || 'Not specified'}
Priorities: ${priorityString}`;
  },

  buildHistory: () => {
    const messages = get().messages;
    // Skip the initial welcome message and convert to the required format
    return messages.slice(1).map(msg => `${msg.role === 'user' ? 'User' : 'AI'}: ${msg.content}`);
  },

  sendMessage: async (content) => {
    const { addMessage, setTyping, setError, buildContext, buildHistory } = get();
    
    try {
      // Clear any previous errors
      setError(null);
      
      // Add user message
      addMessage(content, 'user');
      
      // Start typing indicator
      setTyping(true);
      
      // Build request
      const request: ChatRequest = {
        context: buildContext(),
        history: buildHistory(),
        message: content,
      };
      
      // Call API
      const response = await apiService.sendChatMessage(request);
      
      // Parse response and update graph
      console.log('🎯 Chat API response received, updating graph...', response);
      const graph = chatResponseToGraph(response);
      console.log('📊 Generated graph:', graph);
      
      const graphStore = useGraphStore.getState();
      console.log('📈 Current graph before update:', graphStore.graph);
      graphStore.setGraph(graph);
      console.log('✅ Graph updated in store');
      
      // Add assistant response
      const assistantMessage = `I've updated your infrastructure based on your request. ${response.notes}`;
      addMessage(assistantMessage, 'assistant');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
      setError(errorMessage);
      
      // Add error message for user visibility
      addMessage(`Sorry, I encountered an error: ${errorMessage}`, 'assistant');
    } finally {
      setTyping(false);
    }
  },

  applyPatchFromMessage: (messageId) => {
    const message = get().messages.find((m) => m.id === messageId);
    if (message?.patches) {
      console.log('Applying patches from message:', messageId, message.patches);
      // In a real app, this would integrate with the graph store
    }
  },

  setTyping: (isTyping) => set({ isTyping }),
  
  setError: (error) => set({ error }),

  clear: () =>
    set({
      messages: [
        {
          id: '1',
          role: 'assistant',
          content: 'Hello! I\'m here to help you design and optimize your cloud infrastructure. What would you like to work on today?',
          timestamp: new Date(),
        },
      ],
      error: null,
    }),
}));