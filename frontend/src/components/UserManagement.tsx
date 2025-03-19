import { useState, useEffect } from 'react';
import { firebaseService } from '../services/FirebaseService';

interface User {
  id: string;
  email: string;
  role: string;
}

interface UserManagementProps {
  currentUser: User;
}

export default function UserManagement({ currentUser }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<'admin' | 'supervisor' | 'agent'>('agent');

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const hasPermission = await firebaseService.hasPermission(currentUser.id, 'manage_users');
        if (!hasPermission) {
          setError('You do not have permission to manage users');
          return;
        }

        const allUsers = await Promise.all([
          firebaseService.getUsersByRole('admin'),
          firebaseService.getUsersByRole('supervisor'),
          firebaseService.getUsersByRole('agent')
        ]);

        setUsers(allUsers.flat());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [currentUser.id]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      setError(null);
      
      const rolePermissions: Record<string, string[]> = {
        admin: [
          'manage_users',
          'view_all_calls',
          'manage_system',
          'export_data',
          'view_analytics'
        ],
        supervisor: [
          'view_team_calls',
          'manage_team',
          'view_analytics',
          'export_team_data'
        ],
        agent: [
          'make_calls',
          'view_own_analytics'
        ]
      };

      const permissions = rolePermissions[newRole] || [];

      await firebaseService.setUserRole(userId, {
        role: newRole as 'admin' | 'supervisor' | 'agent',
        permissions
      });

      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
      setSelectedUser(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user role');
    }
  };

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

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            User Management
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Manage user roles and permissions
          </p>
        </div>
      </div>

      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Email
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Current Role
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {user.email}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <span className="capitalize">{user.role}</span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {selectedUser?.id === user.id ? (
                          <div className="flex items-center space-x-3">
                            <select
                              value={newRole}
                              onChange={(e) => setNewRole(e.target.value as 'admin' | 'supervisor' | 'agent')}
                              className="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500"
                            >
                              <option value="agent">Agent</option>
                              <option value="supervisor">Supervisor</option>
                              <option value="admin">Admin</option>
                            </select>
                            <button
                              onClick={() => handleRoleChange(user.id, newRole)}
                              className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-3 py-2 text-sm font-medium leading-4 text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setSelectedUser(null)}
                              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setNewRole(user.role as 'admin' | 'supervisor' | 'agent');
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Change Role
                          </button>
                        )}
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