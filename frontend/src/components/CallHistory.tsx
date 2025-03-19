import { useState, useEffect } from 'react';
import { firebaseService } from '../services/FirebaseService';

interface CallAnalytics {
  totalCalls: number;
  totalDuration: number;
  emotionBreakdown: Record<string, number>;
  averageCallDuration: number;
}

export default function CallHistory() {
  const [analytics, setAnalytics] = useState<CallAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const user = firebaseService.getCurrentUser();
        if (!user) {
          setError('Please sign in to view call history');
          return;
        }

        const data = await firebaseService.getCallAnalytics(user.uid);
        setAnalytics(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-gray-600">No call history available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Total Calls</h3>
          <p className="mt-2 text-3xl font-bold text-blue-600">
            {analytics.totalCalls}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Average Duration</h3>
          <p className="mt-2 text-3xl font-bold text-blue-600">
            {Math.round(analytics.averageCallDuration / 1000)}s
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Total Duration</h3>
          <p className="mt-2 text-3xl font-bold text-blue-600">
            {Math.round(analytics.totalDuration / 60000)}m
          </p>
        </div>
      </div>

      {/* Emotion Breakdown */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Emotion Breakdown
        </h3>
        <div className="space-y-4">
          {Object.entries(analytics.emotionBreakdown).map(([emotion, percentage]) => (
            <div key={emotion} className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span className="text-gray-600 capitalize">{emotion}</span>
                <span className="text-gray-900">{percentage.toFixed(1)}%</span>
              </div>
              <div className="overflow-hidden h-2 rounded bg-gray-100">
                <div
                  className="h-2 rounded bg-blue-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 