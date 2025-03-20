import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { firebaseService } from '../services/FirebaseService';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface EmotionData {
  emotionBreakdown: Record<string, number>;
  timeOfDayAnalysis: {
    morning: Record<string, number>;
    afternoon: Record<string, number>;
    evening: Record<string, number>;
  };
  recentCalls: Array<{
    id: string;
    timestamp: string;
    duration: number;
    dominantEmotion: string;
    emotionBreakdown: Record<string, number>;
  }>;
}

export default function EmotionReport() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [emotionData, setEmotionData] = useState<EmotionData | null>(null);

  useEffect(() => {
    const fetchEmotionData = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const analytics = await firebaseService.getAdvancedAnalytics(user.uid);
        
        // Process emotion data
        setEmotionData({
          emotionBreakdown: analytics.emotionBreakdown,
          timeOfDayAnalysis: {
            morning: {},
            afternoon: {},
            evening: {}
          },
          recentCalls: analytics.trendData.slice(-10).map(day => ({
            id: day.date,
            timestamp: day.date,
            duration: day.averageDuration,
            dominantEmotion: day.dominantEmotion,
            emotionBreakdown: day.emotions || {}
          }))
        });
      } catch (error) {
        console.error('Error fetching emotion data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmotionData();
  }, [user]);

  const emotionColors = {
    happy: 'rgb(34, 197, 94)',
    sad: 'rgb(99, 102, 241)',
    angry: 'rgb(239, 68, 68)',
    neutral: 'rgb(156, 163, 175)',
    frustrated: 'rgb(234, 179, 8)'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Emotion Analysis Report</h1>
          <p className="mt-2 text-sm text-gray-600">
            Detailed analysis of customer emotions during calls
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Overall Emotion Distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Overall Emotion Distribution</h2>
            <div className="h-64">
              {emotionData && (
                <Doughnut
                  data={{
                    labels: Object.keys(emotionData.emotionBreakdown),
                    datasets: [
                      {
                        data: Object.values(emotionData.emotionBreakdown),
                        backgroundColor: Object.keys(emotionData.emotionBreakdown).map(
                          emotion => emotionColors[emotion] || 'rgb(156, 163, 175)'
                        ),
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                      },
                    },
                  }}
                />
              )}
            </div>
          </div>

          {/* Emotion Trends */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Emotion Trends</h2>
            <div className="h-64">
              {emotionData && (
                <Bar
                  data={{
                    labels: emotionData.recentCalls.map(call => 
                      new Date(call.timestamp).toLocaleDateString('en-US', { weekday: 'short' })
                    ),
                    datasets: [
                      {
                        label: 'Positive Emotions',
                        data: emotionData.recentCalls.map(call => 
                          (call.emotionBreakdown['happy'] || 0) * 100
                        ),
                        backgroundColor: emotionColors.happy,
                      },
                      {
                        label: 'Neutral Emotions',
                        data: emotionData.recentCalls.map(call => 
                          (call.emotionBreakdown['neutral'] || 0) * 100
                        ),
                        backgroundColor: emotionColors.neutral,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                          display: true,
                          text: 'Percentage (%)'
                        }
                      },
                    },
                    plugins: {
                      legend: {
                        position: 'bottom',
                      },
                    },
                  }}
                />
              )}
            </div>
          </div>

          {/* Recent Calls Analysis */}
          <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Calls Analysis</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dominant Emotion
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Emotion Breakdown
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {emotionData?.recentCalls.map((call) => (
                    <tr key={call.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(call.timestamp).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {Math.round(call.duration / 60)}m {Math.round(call.duration % 60)}s
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          call.dominantEmotion === 'happy' ? 'bg-green-100 text-green-800' :
                          call.dominantEmotion === 'sad' ? 'bg-blue-100 text-blue-800' :
                          call.dominantEmotion === 'angry' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {call.dominantEmotion}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          {Object.entries(call.emotionBreakdown).map(([emotion, value]) => (
                            <div key={emotion} className="flex items-center">
                              <div className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: emotionColors[emotion] }}></div>
                              <span>{emotion}: {Math.round(value * 100)}%</span>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 