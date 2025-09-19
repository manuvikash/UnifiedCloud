import { create } from 'zustand';
import type { ChatMessage } from '@/lib/graph';

interface ChatState {
  messages: ChatMessage[];
  isTyping: boolean;
  addMessage: (content: string, role: 'user' | 'assistant', patches?: string[]) => void;
  sendMessage: (content: string) => Promise<void>;
  applyPatchFromMessage: (messageId: string) => void;
  setTyping: (isTyping: boolean) => void;
  clear: () => void;
}

// Sample assistant responses
const sampleResponses = [
  "I can help you optimize your infrastructure. Based on your setup, I recommend adding auto-scaling to your ECS service for better cost efficiency.",
  "Your database configuration looks good. For better security, consider enabling encryption at rest and using AWS Secrets Manager for credentials.",
  "I notice you're using a single subnet. For high availability, I suggest adding a second subnet in a different AZ.",
  "Your load balancer is properly configured. You might want to add CloudWatch alarms for monitoring response times.",
];

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

  sendMessage: async (content) => {
    const { addMessage, setTyping } = get();
    
    // Add user message
    addMessage(content, 'user');
    
    // Simulate AI thinking
    setTyping(true);
    
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    // Add assistant response
    const response = sampleResponses[Math.floor(Math.random() * sampleResponses.length)];
    const patches = Math.random() > 0.7 ? ['sample-patch-1'] : undefined;
    
    addMessage(response, 'assistant', patches);
    setTyping(false);
  },

  applyPatchFromMessage: (messageId) => {
    const message = get().messages.find((m) => m.id === messageId);
    if (message?.patches) {
      console.log('Applying patches from message:', messageId, message.patches);
      // In a real app, this would integrate with the graph store
    }
  },

  setTyping: (isTyping) => set({ isTyping }),

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
    }),
}));