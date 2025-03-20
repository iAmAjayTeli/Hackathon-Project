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
import { 
  PhoneIcon, 
  PhoneXMarkIcon, 
  ExclamationTriangleIcon, 
  FaceSmileIcon, 
  FaceFrownIcon, 
  HandRaisedIcon, 
  QuestionMarkCircleIcon,
  ChartBarIcon,
  LightBulbIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

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

const getEmotionIcon = (emotion: string | undefined) => {
  switch (emotion?.toLowerCase()) {
    case 'happy':
      return <FaceSmileIcon className="w-12 h-12 text-green-500" />;
    case 'sad':
      return <FaceFrownIcon className="w-12 h-12 text-blue-500" />;
    case 'angry':
      return <HandRaisedIcon className="w-12 h-12 text-red-500" />;
    default:
      return <QuestionMarkCircleIcon className="w-12 h-12 text-gray-400" />;
  }
};

const getEmotionColor = (emotion: string | undefined) => {
  switch (emotion?.toLowerCase()) {
    case 'happy':
      return 'bg-green-100 text-green-800 ring-green-600';
    case 'sad':
      return 'bg-blue-100 text-blue-800 ring-blue-600';
    case 'angry':
      return 'bg-red-100 text-red-800 ring-red-600';
    default:
      return 'bg-gray-100 text-gray-800 ring-gray-600';
  }
};

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
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Call Controls Section */}
        <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <PhoneIcon className="w-6 h-6 mr-2 text-blue-600" />
              Call Controls
            </h2>
            <div className="space-y-4">
              {error && (
                <div className="flex items-center p-4 bg-red-50 rounded-xl text-red-700">
                  <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
                  <span>{error}</span>
                </div>
              )}
              <div className="flex flex-col items-center space-y-6">
                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    className="group relative inline-flex items-center justify-center px-8 py-3 text-lg font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-full overflow-hidden shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105"
                  >
                    <PhoneIcon className="w-6 h-6 mr-2" />
                    Start Call
                    <div className="absolute inset-0 bg-white/20 group-hover:bg-transparent transition-colors duration-200" />
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    className="group relative inline-flex items-center justify-center px-8 py-3 text-lg font-medium text-white bg-gradient-to-r from-red-600 to-red-700 rounded-full overflow-hidden shadow-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 transform hover:scale-105"
                  >
                    <PhoneXMarkIcon className="w-6 h-6 mr-2" />
                    End Call
                    <div className="absolute inset-0 bg-white/20 group-hover:bg-transparent transition-colors duration-200" />
                  </button>
                )}
                {isRecording && (
                  <div className="w-full max-w-2xl mx-auto bg-gray-50 rounded-2xl p-4">
                    <AudioVisualizer mediaStream={mediaStream} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Current Emotion Section */}
        <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Current Emotion
            </h2>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {getEmotionIcon(emotionData?.emotion)}
                <div>
                  <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getEmotionColor(emotionData?.emotion)} ring-1 ring-inset`}>
                    {emotionData?.emotion || 'No data'}
                  </div>
                  <div className="mt-2">
                    <div className="text-sm text-gray-500">Confidence Score</div>
                    <div className="flex items-center">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${emotionData ? emotionData.confidence * 100 : 0}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {emotionData ? `${(emotionData.confidence * 100).toFixed(1)}%` : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Emotion Timeline Section */}
        <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <ChartBarIcon className="w-6 h-6 mr-2 text-blue-600" />
              Emotion Timeline
            </h2>
            <div className="h-72 relative">
              <div className="absolute inset-0">
                <Line
                  data={chartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 100,
                        grid: {
                          color: 'rgba(0, 0, 0, 0.05)',
                        },
                      },
                      x: {
                        grid: {
                          display: false,
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Suggested Actions Section */}
        <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <LightBulbIcon className="w-6 h-6 mr-2 text-blue-600" />
              Suggested Actions
            </h2>
            <div className="rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
              {emotionData?.suggestions ? (
                <div className="space-y-4">
                  <p className="text-lg text-gray-800 font-medium">
                    {emotionData.suggestions.message}
                  </p>
                  <ul className="space-y-3">
                    {emotionData.suggestions.actions.map((action, index) => (
                      <li
                        key={index}
                        className="flex items-start text-gray-700 bg-white/80 rounded-lg p-3 shadow-sm"
                      >
                        <span className="mr-3 text-blue-600 font-bold">•</span>
                        <span className="flex-1">{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-gray-500">
                  <LightBulbIcon className="w-12 h-12 mb-3 text-gray-400" />
                  <p className="text-center">
                    Start a call to receive personalized suggestions
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Call Export Section */}
        {!isRecording && currentUser && (
          <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <ArrowDownTrayIcon className="w-6 h-6 mr-2 text-blue-600" />
                Export Call Data
              </h2>
              <div className="rounded-xl bg-gradient-to-br from-purple-50 to-blue-50 p-6">
                <CallExport userId={currentUser.uid} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 