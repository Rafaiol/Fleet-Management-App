import { NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  LayoutDashboard,
  Car,
  Wrench,
  Users,
  FileText,
  Settings,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import { RootState, AppDispatch } from '@/store';
import { toggleSidebar, setSidebarOpen } from '@/store/slices/uiSlice';

const menuItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/vehicles', icon: Car, label: 'Vehicles' },
  { path: '/maintenance', icon: Wrench, label: 'Maintenance' },
  { path: '/reports', icon: FileText, label: 'Reports' },
];

const adminMenuItems = [
  { path: '/users', icon: Users, label: 'Users' },
];

const Sidebar = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { sidebarOpen, isMobile } = useSelector((state: RootState) => state.ui);
  const { user } = useSelector((state: RootState) => state.auth);

  const isAdmin = user?.role === 'admin';
  const isCollapsed = !isMobile && !sidebarOpen;

  const handleClose = () => {
    if (isMobile) {
      dispatch(setSidebarOpen(false));
    }
  };

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-30 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          } ${isMobile ? 'w-64' : isCollapsed ? 'w-20' : 'w-64'}`}
      >
        {/* Logo */}
        <div className={`flex items-center h-16 border-b border-gray-200 dark:border-gray-700 ${isCollapsed ? 'justify-center px-0' : 'justify-between px-6'}`}>
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 shrink-0 bg-primary-600 rounded-lg flex items-center justify-center">
              <Car className="w-5 h-5 text-white" />
            </div>
            {!isCollapsed && (
              <span className="text-lg font-bold text-gray-900 dark:text-white truncate">
                Fleet MS
              </span>
            )}
          </div>
          {isMobile && (
            <button
              onClick={handleClose}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={handleClose}
              className={({ isActive }) =>
                `flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-4'} py-3 text-sm font-medium rounded-lg transition-colors ${isActive
                  ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-100'
                }`
              }
              title={isCollapsed ? item.label : undefined}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          ))}

          {/* Admin Menu */}
          {isAdmin && (
            <>
              <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                {!isCollapsed && (
                  <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 truncate">
                    Admin
                  </p>
                )}
                {adminMenuItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={handleClose}
                    className={({ isActive }) =>
                      `flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-4'} py-3 text-sm font-medium rounded-lg transition-colors ${isActive
                        ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-100'
                      }`
                    }
                    title={isCollapsed ? item.label : undefined}
                  >
                    <item.icon className="w-5 h-5 shrink-0" />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </NavLink>
                ))}
              </div>
            </>
          )}

          {/* Settings */}
          <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
            <NavLink
              to="/settings"
              onClick={handleClose}
              className={({ isActive }) =>
                `flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-4'} py-3 text-sm font-medium rounded-lg transition-colors ${isActive
                  ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-100'
                }`
              }
              title={isCollapsed ? 'Settings' : undefined}
            >
              <Settings className="w-5 h-5 shrink-0" />
              {!isCollapsed && <span className="truncate">Settings</span>}
            </NavLink>
          </div>
        </nav>

        {/* Toggle Button (Desktop) */}
        {!isMobile && (
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="absolute -right-3 top-20 w-6 h-6 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
          >
            {sidebarOpen ? (
              <ChevronLeft className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            )}
          </button>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
