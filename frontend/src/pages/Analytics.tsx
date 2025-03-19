import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { firebaseService } from '../services/FirebaseService';
import { geminiService } from '../services/GeminiService';
import { Bar, Doughnut } from 'react-chartjs-2';
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

interface AnalyticsData {
  totalCalls: number;
  totalDuration: number;
  emotionBreakdown: Record<string, number>;
  averageCallDuration: number;
  trendData: {
    date: string;
    callCount: number;
    averageDuration: number;
    dominantEmotion: string;
  }[];
  performanceMetrics: {
    positiveEmotionPercentage: number;
    averageCallsPerDay: number;
    peakCallTimes: { hour: number; count: number }[];
  };
}

interface AIInsight {
  title: string;
  description: string;
  recommendation: string;
  confidence: number;
}

const emotionDistributionData = {
  labels: ['Happy', 'Neutral', 'Sad', 'Angry', 'Frustrated'],
  datasets: [
    {
      data: [30, 40, 15, 10, 5],
      backgroundColor: [
        'rgb(34, 197, 94)',
        'rgb(59, 130, 246)',
        'rgb(99, 102, 241)',
        'rgb(239, 68, 68)',
        'rgb(234, 179, 8)',
      ],
    },
  ],
};

const weeklyTrendsData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [
    {
      label: 'Average Sentiment Score',
      data: [75, 82, 78, 85, 80, 88, 85],
      backgroundColor: 'rgba(59, 130, 246, 0.5)',
    },
  ],
};

const stats = [
  { name: 'Total Calls', value: '1,234' },
  { name: 'Average Call Duration', value: '8m 45s' },
  { name: 'Positive Sentiment Rate', value: '78%' },
  { name: 'Customer Satisfaction', value: '4.2/5' },
];

export default function Analytics() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [generatingInsights, setGeneratingInsights] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, [user]);

  const fetchAnalytics = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      const data = await firebaseService.getAdvancedAnalytics(user.uid);
      setAnalytics(data);
      await generateAIInsights(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  const generateAIInsights = async (data: AnalyticsData) => {
    setGeneratingInsights(true);
    try {
      const analyticsData = `
        Total Calls: ${data.totalCalls}
        Average Call Duration: ${Math.round(data.averageCallDuration / 60)} minutes
        Positive Emotion Percentage: ${data.performanceMetrics.positiveEmotionPercentage.toFixed(1)}%
        Average Calls Per Day: ${data.performanceMetrics.averageCallsPerDay.toFixed(1)}

        Emotion Breakdown:
        ${Object.entries(data.emotionBreakdown)
          .map(([emotion, percentage]) => `${emotion}: ${percentage.toFixed(1)}%`)
          .join('\n')}

        Peak Call Times:
        ${data.performanceMetrics.peakCallTimes
          .map(({ hour, count }) => `${hour}:00 - ${count} calls`)
          .join('\n')}

        Trend Data:
        ${data.trendData
          .map(trend => 
            `${trend.date}: ${trend.callCount} calls, ${Math.round(trend.averageDuration / 60)} min avg, ${trend.dominantEmotion} dominant`
          )
          .join('\n')}
      `;

      const insights = await geminiService.generateInsights(analyticsData);
      setInsights(insights);
    } catch (err) {
      console.error('Error generating insights:', err);
      // Fallback to mock insights if the API call fails
      const mockInsights: AIInsight[] = [
        {
          title: "Emotional Pattern Analysis",
          description: `${Math.round(data.performanceMetrics.positiveEmotionPercentage)}% of calls show positive emotions, indicating good customer satisfaction overall.`,
          recommendation: "Focus on maintaining high positive emotion rates during peak hours by ensuring adequate staff coverage.",
          confidence: 0.92
        },
        {
          title: "Call Volume Optimization",
          description: `Peak call times are concentrated around ${data.performanceMetrics.peakCallTimes[0].hour}:00 with ${data.performanceMetrics.peakCallTimes[0].count} calls.`,
          recommendation: "Consider adjusting staff schedules to better match peak call times and reduce wait times.",
          confidence: 0.88
        },
        {
          title: "Performance Efficiency",
          description: `Average call duration is ${Math.round(data.averageCallDuration / 60)} minutes with ${data.performanceMetrics.averageCallsPerDay.toFixed(1)} calls per day.`,
          recommendation: "Implement targeted training for calls longer than average to improve efficiency while maintaining quality.",
          confidence: 0.85
        }
      ];
      setInsights(mockInsights);
    } finally {
      setGeneratingInsights(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-800 rounded-lg">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Analytics</h1>
          <button
            onClick={fetchAnalytics}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            <svg
              className="w-5 h-5 mr-2"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21C16.9706 21 21 16.9706 21 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M12 7V12L15 15"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M21 3L16 8M21 3L21 8M21 3L16 3"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Generate AI Insights
            {generatingInsights && (
              <svg className="animate-spin ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
          </button>
        </div>

        {/* Stats Grid */}
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.name}
              className="bg-white overflow-hidden shadow rounded-lg"
            >
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  {stat.name}
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">
                  {stat.value}
                </dd>
              </div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Emotion Distribution */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900">
              Emotion Distribution
            </h2>
            <div className="mt-4 h-64">
              <Doughnut
                data={emotionDistributionData}
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
            </div>
          </div>

          {/* Weekly Trends */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900">Weekly Trends</h2>
            <div className="mt-4 h-64">
              <Bar
                data={weeklyTrendsData}
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
        </div>

        {/* AI Insights */}
        <div className="mt-8">
          <div className="bg-white shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">AI-Powered Insights</h2>
                {generatingInsights && (
                  <div className="flex items-center text-sm text-gray-500">
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating insights...
                  </div>
                )}
              </div>
              <div className="space-y-4">
                {insights.map((insight, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-medium text-gray-900">{insight.title}</h3>
                      <span className="px-2 py-1 text-sm text-blue-800 bg-blue-100 rounded-full">
                        {(insight.confidence * 100).toFixed(0)}% confidence
                      </span>
                    </div>
                    <p className="text-gray-600 mb-2">{insight.description}</p>
                    <div className="flex items-start">
                      <svg className="h-5 w-5 text-yellow-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <p className="ml-2 text-sm text-gray-500">{insight.recommendation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 