import { useState } from 'react';
import { PhoneIcon, UserIcon } from '@heroicons/react/24/outline';

const agents = [
  {
    id: 1,
    name: 'Alice Johnson',
    role: 'Senior Agent',
    status: 'In Call',
    performance: {
      callsHandled: 45,
      avgSentiment: 85,
      satisfaction: 4.8,
    },
    avatar: '👩🏻‍💼',
  },
  {
    id: 2,
    name: 'Bob Smith',
    role: 'Customer Service',
    status: 'Available',
    performance: {
      callsHandled: 38,
      avgSentiment: 82,
      satisfaction: 4.6,
    },
    avatar: '👨🏽‍💼',
  },
  {
    id: 3,
    name: 'Carol Martinez',
    role: 'Team Lead',
    status: 'Break',
    performance: {
      callsHandled: 32,
      avgSentiment: 88,
      satisfaction: 4.9,
    },
    avatar: '👩🏾‍💼',
  },
];

export default function Team() {
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Team</h1>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="mt-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {agents.map((agent) => (
              <div
                key={agent.id}
                className="bg-white shadow rounded-lg overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 text-4xl">{agent.avatar}</div>
                    <div className="ml-4">
                      <h2 className="text-lg font-medium text-gray-900">
                        {agent.name}
                      </h2>
                      <p className="text-sm text-gray-500">{agent.role}</p>
                    </div>
                    <div className="ml-auto">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          agent.status === 'In Call'
                            ? 'bg-yellow-100 text-yellow-800'
                            : agent.status === 'Available'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {agent.status}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-3 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Calls Handled
                      </dt>
                      <dd className="mt-1 text-lg font-semibold text-gray-900">
                        {agent.performance.callsHandled}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Avg. Sentiment
                      </dt>
                      <dd className="mt-1 text-lg font-semibold text-gray-900">
                        {agent.performance.avgSentiment}%
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Satisfaction
                      </dt>
                      <dd className="mt-1 text-lg font-semibold text-gray-900">
                        {agent.performance.satisfaction}/5
                      </dd>
                    </div>
                  </div>

                  <div className="mt-6">
                    <button className="w-full btn-primary">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team Performance Summary */}
        <div className="mt-8">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900">
              Team Performance Summary
            </h2>
            <div className="mt-6">
              <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div className="relative bg-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden">
                  <dt>
                    <div className="absolute bg-blue-500 rounded-md p-3">
                      <PhoneIcon className="h-6 w-6 text-white" aria-hidden="true" />
                    </div>
                    <p className="ml-16 text-sm font-medium text-gray-500 truncate">
                      Total Calls Today
                    </p>
                  </dt>
                  <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
                    <p className="text-2xl font-semibold text-gray-900">115</p>
                  </dd>
                </div>
                <div className="relative bg-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden">
                  <dt>
                    <div className="absolute bg-blue-500 rounded-md p-3">
                      <UserIcon className="h-6 w-6 text-white" aria-hidden="true" />
                    </div>
                    <p className="ml-16 text-sm font-medium text-gray-500 truncate">
                      Active Agents
                    </p>
                  </dt>
                  <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
                    <p className="text-2xl font-semibold text-gray-900">8/10</p>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 