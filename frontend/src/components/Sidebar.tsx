import {
  HomeIcon,
  PhoneIcon,
  ChartBarIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Active Calls', href: '/active-calls', icon: PhoneIcon },
  { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
  { name: 'Team', href: '/team', icon: UserGroupIcon },
];

export default function Sidebar() {
  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64">
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto bg-white border-r border-gray-200">
          <div className="flex flex-col flex-grow">
            <nav className="flex-1 px-2 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                >
                  <item.icon
                    className="mr-3 h-6 w-6 text-gray-400 group-hover:text-gray-500"
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
} 