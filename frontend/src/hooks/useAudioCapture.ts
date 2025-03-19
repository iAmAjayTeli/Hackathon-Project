import { useState, useEffect, useCallback } from 'react';
import { AudioService } from '../services/AudioService';

interface EmotionData {
  emotion: string;
  confidence: number;
  timestamp: number;
  suggestions: {
    message: string;
    actions: string[];
  };
}

export function useAudioCapture() {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emotionData, setEmotionData] = useState<EmotionData | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [audioService] = useState(() => new AudioService());

  const handleEmotionUpdate = useCallback((data: EmotionData) => {
    setEmotionData(data);
  }, []);

  const startRecording = useCallback(async () => {
    try {
      await audioService.startRecording(handleEmotionUpdate);
      setIsRecording(true);
      setMediaStream(audioService.getMediaStream());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start recording');
      setIsRecording(false);
      setMediaStream(null);
    }
  }, [audioService, handleEmotionUpdate]);

  const stopRecording = useCallback(async () => {
    try {
      await audioService.stopRecording();
      setIsRecording(false);
      setMediaStream(null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stop recording');
    }
  }, [audioService]);

  useEffect(() => {
    // Cleanup when component unmounts
    return () => {
      audioService.cleanup();
    };
  }, [audioService]);

  return {
    isRecording,
    error,
    emotionData,
    mediaStream,
    startRecording,
    stopRecording,
  };
} 