import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { firebaseService } from '../services/FirebaseService';
import { Line } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';
import {
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  ChartPieIcon,
  CogIcon,
  PhoneIcon,
  SparklesIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

interface QuickAction {
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  href: string;
}

interface DashboardStats {
  totalCalls: number;
  averageCallDuration: number;
  positiveEmotionPercentage: number;
}

interface RecentActivity {
  id: string;
  type: 'call' | 'insight' | 'report';
  title: string;
  description: string;
  timestamp: string;
  emotion?: string;
}

interface PerformanceData {
  labels: string[];
  positiveEmotions: number[];
  callDurations: number[];
}

interface QuickTip {
  id: string;
  title: string;
  description: string;
  category: 'performance' | 'emotion' | 'general';
}

interface Task {
  id: string;
  title: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'completed';
}

const quickActions: QuickAction[] = [
  {
    name: 'Start Call',
    description: 'Begin a new customer service call',
    icon: PhoneIcon,
    href: '/active-calls'
  },
  {
    name: 'AI Assistant',
    description: 'Chat with our AI for insights and help',
    icon: SparklesIcon,
    href: '/chatbot'
  },
  {
    name: 'Emotion Report',
    description: 'View detailed emotion analysis',
    icon: ChatBubbleLeftRightIcon,
    href: '/emotion-report'
  },
  {
    name: 'Analytics',
    description: 'Check performance metrics',
    icon: ChartPieIcon,
    href: '/analytics'
  },
  {
    name: 'Settings',
    description: 'Configure your preferences',
    icon: CogIcon,
    href: '/settings'
  }
];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState('');
  const [stats, setStats] = useState<DashboardStats>({
    totalCalls: 0,
    averageCallDuration: 0,
    positiveEmotionPercentage: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [performanceData, setPerformanceData] = useState<PerformanceData>({
    labels: [],
    positiveEmotions: [],
    callDurations: []
  });
  const [quickTips, setQuickTips] = useState<QuickTip[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const hour = new Date().getHours();
    let timeGreeting = '';
    if (hour < 12) timeGreeting = 'Good morning';
    else if (hour < 18) timeGreeting = 'Good afternoon';
    else timeGreeting = 'Good evening';
    
    setGreeting(`${timeGreeting}, ${user?.displayName || 'there'}!`);
  }, [user]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const analytics = await firebaseService.getAdvancedAnalytics(user.uid);
        
        // Set stats
        setStats({
          totalCalls: analytics.totalCalls,
          averageCallDuration: analytics.averageCallDuration,
          positiveEmotionPercentage: analytics.performanceMetrics.positiveEmotionPercentage
        });

        // Process trend data for performance chart
        const last7Days = analytics.trendData.slice(-7);
        setPerformanceData({
          labels: last7Days.map(day => new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })),
          positiveEmotions: last7Days.map(day => {
            const emotions = day.emotions || {};
            const positive = emotions['happy'] || 0;
            return positive;
          }),
          callDurations: last7Days.map(day => day.averageDuration / 60) // Convert to minutes
        });

        // Get recent activities
        const recentCalls = analytics.recentCalls?.slice(0, 5).map(call => ({
          id: call.id,
          type: 'call' as const,
          title: 'Call Completed',
          description: `${formatDuration(call.duration)} call with ${call.dominantEmotion} emotion`,
          timestamp: new Date(call.startTime).toLocaleString(),
          emotion: call.dominantEmotion
        })) || [];

        setRecentActivities(recentCalls);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  useEffect(() => {
    // Simulated quick tips - in a real app, these would come from an AI service or backend
    setQuickTips([
      {
        id: '1',
        title: 'Improve Call Quality',
        description: 'Try acknowledging customer emotions early in the call to build rapport.',
        category: 'emotion'
      },
      {
        id: '2',
        title: 'Peak Performance Time',
        description: 'Your best performance is during morning hours. Schedule important calls then.',
        category: 'performance'
      },
      {
        id: '3',
        title: 'Handling Negative Emotions',
        description: 'When detecting frustration, try using empathy statements and active listening.',
        category: 'emotion'
      }
    ]);

    // Simulated tasks - in a real app, these would come from a task management system
    setTasks([
      {
        id: '1',
        title: 'Review Weekly Performance',
        dueDate: new Date(Date.now() + 86400000).toISOString(),
        priority: 'high',
        status: 'pending'
      },
      {
        id: '2',
        title: 'Complete Emotion Recognition Training',
        dueDate: new Date(Date.now() + 172800000).toISOString(),
        priority: 'medium',
        status: 'in-progress'
      },
      {
        id: '3',
        title: 'Update Call Scripts',
        dueDate: new Date(Date.now() + 259200000).toISOString(),
        priority: 'low',
        status: 'pending'
      }
    ]);
  }, []);

  const formatDuration = (duration: number): string => {
    const minutes = Math.floor(duration / 60);
    const seconds = Math.round(duration % 60);
    return `${minutes}m ${seconds}s`;
  };

  const getStatCards = () => [
    {
      name: 'Total Calls',
      value: stats.totalCalls.toString(),
      description: 'Total number of calls handled'
    },
    {
      name: 'Average Call Duration',
      value: formatDuration(stats.averageCallDuration),
      description: 'Average duration of your calls'
    },
    {
      name: 'Positive Emotion Rate',
      value: `${Math.round(stats.positiveEmotionPercentage)}%`,
      description: 'Percentage of positive emotions detected'
    }
  ];

  const getEmotionColor = (emotion: string) => {
    const colors = {
      happy: 'bg-green-100 text-green-800',
      sad: 'bg-blue-100 text-blue-800',
      angry: 'bg-red-100 text-red-800',
      neutral: 'bg-gray-100 text-gray-800',
      default: 'bg-purple-100 text-purple-800'
    };
    return colors[emotion.toLowerCase()] || colors.default;
  };

  const getPriorityColor = (priority: Task['priority']) => {
    const colors = {
      high: 'text-red-600 bg-red-100',
      medium: 'text-yellow-600 bg-yellow-100',
      low: 'text-green-600 bg-green-100'
    };
    return colors[priority];
  };

  const getCategoryIcon = (category: QuickTip['category']) => {
    switch (category) {
      case 'performance':
        return <ChartBarIcon className="h-6 w-6 text-blue-500" />;
      case 'emotion':
        return <ChatBubbleLeftRightIcon className="h-6 w-6 text-purple-500" />;
      default:
        return <SparklesIcon className="h-6 w-6 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Greeting Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">{greeting}</h1>
            <p className="mt-2 text-sm text-gray-600">
              Welcome to your EmpathicCall dashboard. Here's what's happening today.
            </p>
          </div>

          {/* Stats Section */}
          <div className="mt-4">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              {loading ? (
                Array(3).fill(0).map((_, index) => (
                  <div key={index} className="bg-white overflow-hidden shadow rounded-lg animate-pulse">
                    <div className="px-4 py-5 sm:p-6">
                      <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                      <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </div>
                ))
              ) : (
                getStatCards().map((item) => (
                  <div
                    key={item.name}
                    className="bg-white overflow-hidden shadow rounded-lg transition-all duration-300 hover:shadow-lg"
                  >
                    <div className="px-4 py-5 sm:p-6">
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {item.name}
                      </dt>
                      <dd className="mt-1 text-3xl font-semibold text-gray-900">
                        {item.value}
                      </dd>
                      <p className="mt-2 text-sm text-gray-600">{item.description}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {quickActions.map((action) => (
                <button
                  key={action.name}
                  onClick={() => navigate(action.href)}
                  className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg shadow hover:shadow-lg transition-all duration-200 text-left"
                >
                  <div>
                    <span className="rounded-lg inline-flex p-3 bg-blue-50 text-blue-700 ring-4 ring-white">
                      <action.icon className="h-6 w-6" aria-hidden="true" />
                    </span>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {action.name}
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      {action.description}
                    </p>
                  </div>
                  <span
                    className="absolute top-6 right-6 text-gray-300 group-hover:text-gray-400"
                    aria-hidden="true"
                  >
                    <svg
                      className="h-6 w-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M20 4h1a1 1 0 00-1-1v1zm-1 12a1 1 0 102 0h-2zM8 3a1 1 0 000 2V3zM3.293 19.293a1 1 0 101.414 1.414l-1.414-1.414zM19 4v12h2V4h-2zm1-1H8v2h12V3zm-.707.293l-16 16 1.414 1.414 16-16-1.414-1.414z" />
                    </svg>
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Performance Trends & Recent Activity Section */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Performance Trends Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Performance Trends</h2>
              <div className="h-64">
                {!loading && (
                  <Line
                    data={{
                      labels: performanceData.labels,
                      datasets: [
                        {
                          label: 'Positive Emotions (%)',
                          data: performanceData.positiveEmotions,
                          borderColor: 'rgb(34, 197, 94)',
                          backgroundColor: 'rgba(34, 197, 94, 0.1)',
                          yAxisID: 'y',
                        },
                        {
                          label: 'Avg Call Duration (min)',
                          data: performanceData.callDurations,
                          borderColor: 'rgb(59, 130, 246)',
                          backgroundColor: 'rgba(59, 130, 246, 0.1)',
                          yAxisID: 'y1',
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      interaction: {
                        mode: 'index',
                        intersect: false,
                      },
                      scales: {
                        y: {
                          type: 'linear',
                          display: true,
                          position: 'left',
                          title: {
                            display: true,
                            text: 'Positive Emotions (%)'
                          }
                        },
                        y1: {
                          type: 'linear',
                          display: true,
                          position: 'right',
                          title: {
                            display: true,
                            text: 'Avg Duration (min)'
                          },
                          grid: {
                            drawOnChartArea: false,
                          },
                        },
                      },
                    }}
                  />
                )}
              </div>
            </div>

            {/* Recent Activity Timeline */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
              <div className="flow-root">
                <ul role="list" className="-mb-8">
                  {recentActivities.map((activity, activityIdx) => (
                    <li key={activity.id}>
                      <div className="relative pb-8">
                        {activityIdx !== recentActivities.length - 1 ? (
                          <span
                            className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                            aria-hidden="true"
                          />
                        ) : null}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center ring-8 ring-white">
                              <ClockIcon className="h-5 w-5 text-blue-500" aria-hidden="true" />
                            </span>
                          </div>
                          <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                            <div>
                              <p className="text-sm text-gray-500">
                                {activity.title}{' '}
                                <span className="font-medium text-gray-900">{activity.description}</span>
                              </p>
                              {activity.emotion && (
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${getEmotionColor(activity.emotion)}`}>
                                  {activity.emotion}
                                </span>
                              )}
                            </div>
                            <div className="whitespace-nowrap text-right text-sm text-gray-500">
                              {new Date(activity.timestamp).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Quick Tips & Tasks Section */}
          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Quick Tips/Insights */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Tips & Insights</h2>
              <div className="space-y-4">
                {quickTips.map((tip) => (
                  <div
                    key={tip.id}
                    className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg transition-all duration-200 hover:shadow-md"
                  >
                    <div className="flex-shrink-0">
                      {getCategoryIcon(tip.category)}
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{tip.title}</h3>
                      <p className="mt-1 text-sm text-gray-500">{tip.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Tasks */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Upcoming Tasks</h2>
              <div className="space-y-4">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg transition-all duration-200 hover:shadow-md"
                  >
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        checked={task.status === 'completed'}
                        onChange={() => {
                          // In a real app, this would update the task status
                          console.log('Task status changed:', task.id);
                        }}
                      />
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{task.title}</h3>
                        <p className="mt-1 text-xs text-gray-500">
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(
                        task.priority
                      )}`}
                    >
                      {task.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 