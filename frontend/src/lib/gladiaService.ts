export interface GladiaConfig {
  encoding: 'wav/pcm';
  sample_rate: number;
  bit_depth: number;
  channels: number;
}

export interface GladiaSession {
  id: string;
  url: string;
}

export interface GladiaMessage {
  type: 'transcript' | 'acknowledgment' | 'error' | 'lifecycle';
  session_id: string;
  created_at: string;
  data: any;
}

export interface TranscriptData {
  id: string;
  utterance: {
    text: string;
    start: number;
    end: number;
    language: string;
    channel?: number;
  };
  is_final: boolean;
}

export class GladiaService {
  private apiKey: string;
  private baseUrl = 'https://api.gladia.io/v2';
  private websocket: WebSocket | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioStream: MediaStream | null = null;
  private sessionId: string | null = null;
  private isRecording = false;
  private onTranscript: ((text: string, isFinal: boolean) => void) | null = null;
  private onError: ((error: string) => void) | null = null;
  private onStatusChange: ((status: 'connecting' | 'connected' | 'recording' | 'stopped' | 'error') => void) | null = null;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async initializeSession(): Promise<GladiaSession> {
    const config: GladiaConfig = {
      encoding: 'wav/pcm',
      sample_rate: 16000,
      bit_depth: 16,
      channels: 1,
    };

    const response = await fetch(`${this.baseUrl}/live`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Gladia-Key': this.apiKey,
      },
      body: JSON.stringify(config),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to initialize session: ${response.status} ${errorText}`);
    }

    const session = await response.json();
    this.sessionId = session.id;
    return session;
  }

  async connectWebSocket(session: GladiaSession): Promise<void> {
    return new Promise((resolve, reject) => {
      this.onStatusChange?.('connecting');
      
      this.websocket = new WebSocket(session.url);

      this.websocket.addEventListener('open', () => {
        this.onStatusChange?.('connected');
        resolve();
      });

      this.websocket.addEventListener('error', (error) => {
        this.onStatusChange?.('error');
        reject(new Error(`WebSocket error: ${error}`));
      });

      this.websocket.addEventListener('close', ({ code, reason }) => {
        if (code !== 1000) {
          this.onStatusChange?.('error');
          this.onError?.(`Connection closed unexpectedly: ${code} ${reason}`);
        }
      });

      this.websocket.addEventListener('message', (event) => {
        try {
          const message: GladiaMessage = JSON.parse(event.data.toString());
          this.handleMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      });
    });
  }

  private handleMessage(message: GladiaMessage) {
    console.log('Gladia message received:', message.type, message.data);
    switch (message.type) {
      case 'transcript':
        const transcriptData: TranscriptData = message.data;
        console.log('Transcript data:', transcriptData);
        if (transcriptData.is_final) {
          this.onTranscript?.(transcriptData.utterance.text, true);
        } else {
          this.onTranscript?.(transcriptData.utterance.text, false);
        }
        break;
      case 'error':
        console.error('Gladia error:', message.data);
        this.onError?.(message.data.message || 'Unknown error');
        break;
      case 'acknowledgment':
      case 'lifecycle':
        console.log('Gladia message:', message.type, message.data);
        break;
    }
  }

  async startRecording(): Promise<void> {
    if (this.isRecording) {
      throw new Error('Already recording');
    }

    try {
      // Get microphone access
      this.audioStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      // Initialize session and connect WebSocket
      const session = await this.initializeSession();
      await this.connectWebSocket(session);

      // Set up Web Audio API for proper PCM processing
      await this.setupAudioProcessing();

      this.isRecording = true;
      this.onStatusChange?.('recording');

    } catch (error) {
      this.onError?.(`Failed to start recording: ${error}`);
      throw error;
    }
  }

  private audioContext: AudioContext | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;

  private async setupAudioProcessing(): Promise<void> {
    if (!this.audioStream) {
      throw new Error('No audio stream available');
    }

    // Create audio context
    this.audioContext = new AudioContext({ sampleRate: 16000 });
    
    // Create source from microphone stream
    this.source = this.audioContext.createMediaStreamSource(this.audioStream);
    
    // Create script processor for real-time audio processing
    this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);
    
    this.processor.onaudioprocess = (event) => {
      if (!this.isRecording || !this.websocket || this.websocket.readyState !== WebSocket.OPEN) {
        return;
      }

      const inputBuffer = event.inputBuffer;
      const inputData = inputBuffer.getChannelData(0);
      
      // Convert float32 to int16 PCM
      const pcmData = new Int16Array(inputData.length);
      for (let i = 0; i < inputData.length; i++) {
        pcmData[i] = Math.max(-32768, Math.min(32767, inputData[i] * 32768));
      }
      
      // Send PCM data to Gladia
      this.websocket.send(pcmData.buffer);
      console.log('Sent audio chunk:', pcmData.length, 'samples');
    };
    
    // Connect the audio processing chain
    this.source.connect(this.processor);
    this.processor.connect(this.audioContext.destination);
  }

  stopRecording(): void {
    if (!this.isRecording) {
      return;
    }

    this.isRecording = false;
    this.onStatusChange?.('stopped');

    // Clean up audio processing
    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }

    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    // Stop audio stream
    if (this.audioStream) {
      this.audioStream.getTracks().forEach(track => track.stop());
      this.audioStream = null;
    }

    // Send stop recording message to Gladia
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify({
        type: 'stop_recording',
      }));
    }

    // Close WebSocket
    if (this.websocket) {
      this.websocket.close(1000);
      this.websocket = null;
    }
  }

  // Event handlers
  onTranscriptUpdate(callback: (text: string, isFinal: boolean) => void): void {
    this.onTranscript = callback;
  }

  onErrorUpdate(callback: (error: string) => void): void {
    this.onError = callback;
  }

  onStatusUpdate(callback: (status: 'connecting' | 'connected' | 'recording' | 'stopped' | 'error') => void): void {
    this.onStatusChange = callback;
  }

  getRecordingStatus(): boolean {
    return this.isRecording;
  }

  cleanup(): void {
    this.stopRecording();
    
    // Additional cleanup for audio processing
    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    this.onTranscript = null;
    this.onError = null;
    this.onStatusChange = null;
  }
}
