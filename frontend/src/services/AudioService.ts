import { firebaseService } from './FirebaseService';

export class AudioService {
  private mediaStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private ws: WebSocket | null = null;
  private isRecording = false;
  private onEmotionUpdate: ((data: any) => void) | null = null;
  private recordedChunks: Blob[] = [];
  private startTime: number = 0;
  private emotionHistory: any[] = [];
  private clientId: string;

  constructor() {
    this.clientId = `client_${Math.random().toString(36).substr(2, 9)}`;
    this.initializeWebSocket();
  }

  private initializeWebSocket() {
    const wsUrl = import.meta.env.VITE_WS_URL;
    if (!wsUrl) {
      console.error('WebSocket URL not found in environment variables');
      return;
    }

    console.log('Initializing WebSocket connection to:', wsUrl);
    this.ws = new WebSocket(`${wsUrl}/${this.clientId}`);
    
    this.ws.onopen = () => {
      console.log('WebSocket connection established');
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Received emotion data:', data);
        if (this.onEmotionUpdate) {
          this.onEmotionUpdate(data);
          this.emotionHistory.push({
            ...data,
            timestamp: Date.now()
          });
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.ws.onclose = () => {
      console.log('WebSocket connection closed');
      setTimeout(() => this.initializeWebSocket(), 3000);
    };
  }

  public async startRecording(onEmotionUpdate: (data: any) => void): Promise<void> {
    try {
      console.log('Starting recording...');
      this.onEmotionUpdate = onEmotionUpdate;
      this.recordedChunks = [];
      this.emotionHistory = [];
      this.startTime = Date.now();
      
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      console.log('Media stream obtained');

      this.audioContext = new AudioContext();
      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      
      this.mediaRecorder = new MediaRecorder(this.mediaStream, {
        mimeType: 'audio/webm',
      });

      this.mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          if (this.ws?.readyState === WebSocket.OPEN) {
            console.log('Sending audio data to WebSocket');
            this.ws.send(event.data);
          } else {
            console.warn('WebSocket is not open, cannot send audio data');
          }
          this.recordedChunks.push(event.data);
        }
      };

      this.mediaRecorder.start(1000);
      this.isRecording = true;
      console.log('Recording started successfully');

    } catch (error: any) {
      console.error('Error starting recording:', error);
      throw error;
    }
  }

  public async stopRecording(): Promise<void> {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;

      // Save the recording if user is authenticated
      try {
        const user = firebaseService.getCurrentUser();
        if (user) {
          const endTime = Date.now();
          const audioBlob = new Blob(this.recordedChunks, { type: 'audio/webm' });
          
          await firebaseService.saveCallRecording(user.uid, {
            audioBlob,
            emotions: this.emotionHistory,
            metadata: {
              startTime: this.startTime,
              endTime,
              duration: endTime - this.startTime
            }
          });
        }
      } catch (error) {
        console.error('Error saving recording:', error);
      }
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }

    if (this.audioContext) {
      await this.audioContext.close();
      this.audioContext = null;
    }

    this.onEmotionUpdate = null;
    this.recordedChunks = [];
    this.emotionHistory = [];
  }

  public isActive(): boolean {
    return this.isRecording;
  }

  public getMediaStream(): MediaStream | null {
    return this.mediaStream;
  }

  public cleanup(): void {
    this.stopRecording();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
} 