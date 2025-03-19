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
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Analytics</h1>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
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

        {/* Recent Insights */}
        <div className="mt-8">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Recent Insights
              </h3>
              <div className="mt-5 flow-root">
                <ul className="divide-y divide-gray-200">
                  <li className="py-4">
                    <div className="flex space-x-3">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          Peak Call Hours
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                          Most calls occur between 10 AM and 2 PM, with highest
                          satisfaction rates in the morning.
                        </p>
                      </div>
                    </div>
                  </li>
                  <li className="py-4">
                    <div className="flex space-x-3">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          Emotion Patterns
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                          Customers tend to be more frustrated during long wait
                          times. Consider increasing staff during peak hours.
                        </p>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 