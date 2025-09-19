import { useState, useRef, useCallback } from 'react';
import { GladiaService } from '@/lib/gladiaService';

export interface SpeechToTextState {
  isRecording: boolean;
  isConnecting: boolean;
  currentTranscript: string;
  error: string | null;
  status: 'idle' | 'connecting' | 'connected' | 'recording' | 'stopped' | 'error';
}

export function useSpeechToText(apiKey: string) {
  const [state, setState] = useState<SpeechToTextState>({
    isRecording: false,
    isConnecting: false,
    currentTranscript: '',
    error: null,
    status: 'idle',
  });

  const gladiaServiceRef = useRef<GladiaService | null>(null);
  const accumulatedTranscriptRef = useRef<string>('');

  const initializeService = useCallback(() => {
    if (!gladiaServiceRef.current) {
      gladiaServiceRef.current = new GladiaService(apiKey);
      
      gladiaServiceRef.current.onTranscriptUpdate((text: string, isFinal: boolean) => {
        console.log('Transcript update:', { text, isFinal });
        if (isFinal) {
          // Add final transcript to accumulated text
          if (text.trim()) {
            accumulatedTranscriptRef.current = accumulatedTranscriptRef.current 
              ? `${accumulatedTranscriptRef.current} ${text.trim()}`
              : text.trim();
          }
          // Show accumulated text in currentTranscript
          setState(prev => ({
            ...prev,
            currentTranscript: accumulatedTranscriptRef.current,
            error: null,
          }));
        } else {
          // Show accumulated + current partial transcript
          const fullText = accumulatedTranscriptRef.current
            ? `${accumulatedTranscriptRef.current} ${text}`
            : text;
          setState(prev => ({
            ...prev,
            currentTranscript: fullText,
            error: null,
          }));
        }
      });

      gladiaServiceRef.current.onErrorUpdate((error: string) => {
        setState(prev => ({
          ...prev,
          error,
          isRecording: false,
          isConnecting: false,
          status: 'error',
        }));
      });

      gladiaServiceRef.current.onStatusUpdate((status) => {
        setState(prev => ({
          ...prev,
          status,
          isConnecting: status === 'connecting',
          isRecording: status === 'recording',
          error: status === 'error' ? prev.error : null,
        }));
      });
    }
  }, [apiKey]);

  const startRecording = useCallback(async () => {
    try {
      setState(prev => ({
        ...prev,
        error: null,
        currentTranscript: '',
      }));

      accumulatedTranscriptRef.current = '';
      initializeService();
      
      if (gladiaServiceRef.current) {
        await gladiaServiceRef.current.startRecording();
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to start recording',
        status: 'error',
        isRecording: false,
        isConnecting: false,
      }));
    }
  }, [initializeService]);

  const stopRecording = useCallback(() => {
    if (gladiaServiceRef.current) {
      gladiaServiceRef.current.stopRecording();
    }
    
    setState(prev => ({
      ...prev,
      isRecording: false,
      isConnecting: false,
      status: 'stopped',
    }));
  }, []);

  const getFinalTranscript = useCallback(() => {
    const final = accumulatedTranscriptRef.current;
    accumulatedTranscriptRef.current = '';
    return final;
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null,
    }));
  }, []);

  const cleanup = useCallback(() => {
    if (gladiaServiceRef.current) {
      gladiaServiceRef.current.cleanup();
      gladiaServiceRef.current = null;
    }
    
    setState({
      isRecording: false,
      isConnecting: false,
      currentTranscript: '',
      error: null,
      status: 'idle',
    });
  }, []);

  return {
    ...state,
    startRecording,
    stopRecording,
    getFinalTranscript,
    clearError,
    cleanup,
  };
}
