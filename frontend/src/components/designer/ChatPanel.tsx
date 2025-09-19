import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Send, RotateCcw, CheckCircle, Mic, MicOff, Loader2 } from 'lucide-react';
import { useChatStore } from '@/store/useChatStore';
import { useSpeechToText } from '@/hooks/useSpeechToText';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function ChatPanel() {
  const { messages, isTyping, sendMessage, applyPatchFromMessage } = useChatStore();
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Speech-to-text functionality
  const {
    isRecording,
    isConnecting,
    currentTranscript,
    error,
    status,
    startRecording,
    stopRecording,
    getFinalTranscript,
    clearError,
  } = useSpeechToText(import.meta.env.VITE_GLADIA_API_KEY || '');

  const handleSend = async () => {
    if (!input.trim()) return;
    
    // Stop recording if it's active
    if (isRecording) {
      stopRecording();
    }
    
    await sendMessage(input);
    setInput('');
    
    // Reset textarea height after sending
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = '40px';
      }
    }, 0);
  };

  const handleMicToggle = async () => {
    if (isRecording) {
      stopRecording();
      // Get the final transcript and set it as input
      const finalTranscript = getFinalTranscript();
      if (finalTranscript.trim()) {
        setInput(finalTranscript.trim());
      }
    } else {
      // Clear any previous transcript state and input when starting
      setInput('');
      await startRecording();
    }
  };

  // Handle real-time transcript updates
  useEffect(() => {
    console.log('Transcript effect:', { isRecording, currentTranscript });
    if (isRecording && currentTranscript) {
      setInput(currentTranscript.trim());
    }
  }, [currentTranscript, isRecording]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-resize textarea based on content
  const resizeTextarea = () => {
    if (textareaRef.current) {
      // Reset height to auto to get the natural height
      textareaRef.current.style.height = 'auto';
      // Calculate the new height based on scroll height
      const scrollHeight = textareaRef.current.scrollHeight;
      const newHeight = Math.min(Math.max(scrollHeight, 40), 200);
      textareaRef.current.style.height = newHeight + 'px';
    }
  };

  useEffect(() => {
    resizeTextarea();
  }, [input]);

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="p-4 border-b">
        <h3 className="font-semibold">Infrastructure Assistant</h3>
        <p className="text-sm text-muted-foreground">
          Get help optimizing your cloud deployment
        </p>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="space-y-2">
              <Card
                className={`p-3 max-w-[90%] ${
                  message.role === 'user'
                    ? 'ml-auto bg-primary text-primary-foreground'
                    : 'mr-auto bg-muted'
                }`}
              >
                <div className="text-sm">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code: ({ children, className }) => (
                        <code className={`${className} bg-background/50 px-1 py-0.5 rounded text-xs`}>
                          {children}
                        </code>
                      ),
                      pre: ({ children }) => (
                        <pre className="bg-background/50 p-2 rounded text-xs overflow-x-auto mt-2">
                          {children}
                        </pre>
                      ),
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              </Card>

              {/* Patch Actions */}
              {message.role === 'assistant' && message.patches && (
                <div className="flex items-center space-x-2 ml-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => applyPatchFromMessage(message.id)}
                    className="flex items-center space-x-1 text-xs"
                  >
                    <CheckCircle className="h-3 w-3" />
                    <span>Apply Patch</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="flex items-center space-x-1 text-xs"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Undo</span>
                  </Button>
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <Card className="p-3 max-w-[90%] mr-auto bg-muted">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.1s]" />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.2s]" />
                </div>
                <span className="text-sm text-muted-foreground">AI is thinking...</span>
              </div>
            </Card>
          )}
        </div>
      </ScrollArea>

      <Separator />

      {/* Input */}
      <div className="p-4">
        {/* Error message */}
        {error && (
          <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
            {error}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearError}
              className="ml-2 h-auto p-0 text-red-600 hover:text-red-800"
            >
              ×
            </Button>
          </div>
        )}

        {/* Current transcript preview */}
        {currentTranscript && (
          <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-600">
            <span className="font-medium">Listening:</span> {currentTranscript}
          </div>
        )}

        <div className="flex space-x-2">
          <Textarea
            ref={textareaRef}
            placeholder={isRecording ? "Speak now..." : "Ask about your infrastructure..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isTyping || isConnecting}
            className={`min-h-[40px] resize-none overflow-hidden ${isRecording ? "border-red-300 bg-red-50" : ""}`}
            readOnly={isRecording}
            rows={1}
            style={{ height: '40px' }}
          />
          
          {/* Microphone button */}
          <Button
            onClick={handleMicToggle}
            disabled={isTyping || isConnecting}
            size="icon"
            variant={isRecording ? "destructive" : "outline"}
            className={isRecording ? "animate-pulse" : ""}
          >
            {isConnecting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isRecording ? (
              <MicOff className="h-4 w-4" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </Button>

          <Button 
            onClick={handleSend} 
            disabled={!input.trim() || isTyping || isConnecting}
            size="icon"
            className="bg-gradient-primary"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex justify-between items-center mt-2">
          <p className="text-xs text-muted-foreground">
            Press Enter to send, Shift+Enter for new line • Input expands automatically
          </p>
          {isRecording && (
            <div className="flex items-center space-x-1 text-xs text-red-600">
              <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
              <span>Recording...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}