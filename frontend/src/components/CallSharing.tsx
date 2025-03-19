import { useState, useEffect } from 'react';
import { firebaseService } from '../services/FirebaseService';

interface CallSharingProps {
  callId: string;
  onShare?: () => void;
}

interface User {
  id: string;
  email: string;
  role: string;
}

export default function CallSharing({ callId, onShare }: CallSharingProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const currentUser = firebaseService.getCurrentUser();
        if (!currentUser) return;

        // Only supervisors and admins can share calls
        const userRole = await firebaseService.getUserRole(currentUser.uid);
        if (!userRole || !['admin', 'supervisor'].includes(userRole.role)) {
          setError('You do not have permission to share calls');
          return;
        }

        // Load users with agent role
        const agentUsers = await firebaseService.getUsersByRole('agent');
        setUsers(agentUsers);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load users');
      }
    };

    loadUsers();
  }, []);

  const handleShare = async () => {
    if (!selectedUserId) {
      setError('Please select a user to share with');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await firebaseService.shareCall(callId, selectedUserId);
      onShare?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to share call');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Share Call Recording
      </h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Search Users
          </label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Search by email..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Select User
          </label>
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            disabled={loading}
          >
            <option value="">Select a user...</option>
            {filteredUsers.map(user => (
              <option key={user.id} value={user.id}>
                {user.email} ({user.role})
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleShare}
          disabled={loading || !selectedUserId}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? (
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          ) : (
            'Share Call'
          )}
        </button>

        <p className="mt-2 text-sm text-gray-500">
          Share this call recording with another user for review and feedback.
        </p>
      </div>
    </div>
  );
} 