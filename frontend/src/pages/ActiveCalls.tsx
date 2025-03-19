import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useAudioCapture } from '../hooks/useAudioCapture';
import AudioVisualizer from '../components/AudioVisualizer';
import CallExport from '../components/CallExport';
import { firebaseService } from '../services/FirebaseService';
import { User } from 'firebase/auth';
import { AppUser } from '../types/auth';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface EmotionTimelineData {
  timestamp: number;
  emotion: string;
  confidence: number;
}

export default function ActiveCalls() {
  const {
    isRecording,
    error,
    emotionData,
    mediaStream,
    startRecording,
    stopRecording,
  } = useAudioCapture();

  const [timelineData, setTimelineData] = useState<EmotionTimelineData[]>([]);
  const maxTimelinePoints = 30; // Show last 30 seconds of data
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);

  useEffect(() => {
    if (emotionData) {
      setTimelineData(prevData => {
        const newData = [...prevData, {
          timestamp: emotionData.timestamp,
          emotion: emotionData.emotion,
          confidence: emotionData.confidence,
        }];

        // Keep only the last maxTimelinePoints
        return newData.slice(-maxTimelinePoints);
      });
    }
  }, [emotionData]);

  useEffect(() => {
    const checkUser = async () => {
      const user = await firebaseService.getCurrentUser();
      setCurrentUser(user);
    };

    checkUser();
    const unsubscribe = firebaseService.onAuthStateChange((user: AppUser | null) => {
      setCurrentUser(user);
    });

    return () => unsubscribe();
  }, []);

  const chartData = {
    labels: timelineData.map(d => new Date(d.timestamp * 1000).toLocaleTimeString()),
    datasets: [
      {
        label: 'Emotion Confidence',
        data: timelineData.map(d => d.confidence * 100),
        borderColor: 'rgb(59, 130, 246)',
        tension: 0.1,
      },
    ],
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Call Controls Section */}
        <div className="bg-white shadow sm:rounded-lg">
          <h2 className="text-lg font-medium text-gray-900">Call Controls</h2>
          <div className="mt-4">
            {error && (
              <div className="text-red-600 mb-4">
                Error: {error}
              </div>
            )}
            <div className="flex flex-col space-y-4">
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  className="btn-primary"
                >
                  Start Call
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  End Call
                </button>
              )}
              {isRecording && (
                <AudioVisualizer mediaStream={mediaStream} />
              )}
            </div>
          </div>
        </div>

        {/* Current Emotion Section */}
        <div className="bg-white shadow sm:rounded-lg">
          <h2 className="text-lg font-medium text-gray-900">
            Current Emotion
          </h2>
          <div className="mt-4">
            <div className="text-3xl font-bold text-blue-600">
              {emotionData?.emotion || 'No data'}
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Confidence Score: {emotionData ? `${(emotionData.confidence * 100).toFixed(1)}%` : 'N/A'}
            </div>
          </div>
        </div>

        {/* Emotion Timeline Section */}
        <div className="bg-white shadow sm:rounded-lg">
          <h2 className="text-lg font-medium text-gray-900">
            Emotion Timeline
          </h2>
          <div className="mt-4 h-64">
            <Line
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 100,
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Suggested Actions Section */}
        <div className="bg-white shadow sm:rounded-lg">
          <h2 className="text-lg font-medium text-gray-900">
            Suggested Actions
          </h2>
          <div className="mt-4">
            {emotionData?.suggestions ? (
              <div>
                <p className="text-lg text-gray-700 mb-4">
                  {emotionData.suggestions.message}
                </p>
                <ul className="space-y-2">
                  {emotionData.suggestions.actions.map((action, index) => (
                    <li
                      key={index}
                      className="flex items-center text-gray-600"
                    >
                      <span className="mr-2">•</span>
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-gray-500">
                Start a call to receive suggestions
              </p>
            )}
          </div>
        </div>

        {/* Call Export Section */}
        {!isRecording && currentUser && (
          <CallExport userId={currentUser.uid} />
        )}
      </div>
    </div>
  );
} 