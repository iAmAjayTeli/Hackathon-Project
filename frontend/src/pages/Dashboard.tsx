import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { geminiService } from '../services/GeminiService';
import ChatInterface from '../components/ChatInterface';
import {
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  ChartPieIcon,
  CogIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline';

interface QuickAction {
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  href: string;
}

const quickActions: QuickAction[] = [
  {
    name: 'Start Call',
    description: 'Begin a new customer service call',
    icon: PhoneIcon,
    href: '/active-calls'
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

const stats = [
  { name: 'Active Calls', value: '12' },
  { name: 'Agents Online', value: '24' },
  { name: 'Avg. Sentiment Score', value: '8.5' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    let timeGreeting = '';
    if (hour < 12) timeGreeting = 'Good morning';
    else if (hour < 18) timeGreeting = 'Good afternoon';
    else timeGreeting = 'Good evening';
    
    setGreeting(`${timeGreeting}, ${user?.displayName || 'there'}!`);
  }, [user]);

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
              {stats.map((item) => (
                <div
                  key={item.name}
                  className="bg-white overflow-hidden shadow rounded-lg"
                >
                  <div className="px-4 py-5 sm:p-6">
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {item.name}
                    </dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">
                      {item.value}
                    </dd>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {quickActions.map((action) => (
                <a
                  key={action.name}
                  href={action.href}
                  className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg shadow hover:shadow-lg transition-all duration-200"
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
                </a>
              ))}
            </div>
          </div>

          {/* Chat Interface */}
          <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">AI Assistant</h2>
            <ChatInterface />
          </div>
        </div>
      </main>
    </div>
  );
} 