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
  ShieldAlert,
} from 'lucide-react';

import { RootState, AppDispatch } from '@/store';
import { toggleSidebar, setSidebarOpen } from '@/store/slices/uiSlice';
import { useAuth } from '@/hooks/useAuth';

const menuItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/vehicles', icon: Car, label: 'Vehicles' },
  { path: '/maintenance', icon: Wrench, label: 'Maintenance' },
  { path: '/reports', icon: FileText, label: 'Reports' },
];

const Sidebar = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { sidebarOpen, isMobile } = useSelector((state: RootState) => state.ui);
  const { isAdmin, canAddAlerts, canEditAlerts, canDeleteAlerts } = useAuth();
  const hasAnyAlertPrivilege = isAdmin || canAddAlerts || canEditAlerts || canDeleteAlerts;

  const isCollapsed = !isMobile && !sidebarOpen;

  const showAdminMenu = isAdmin || hasAnyAlertPrivilege;
  const adminMenuItems = [
    ...(isAdmin ? [{ path: '/users', icon: Users, label: 'Users' }] : []),
    ...(hasAnyAlertPrivilege ? [{ path: '/alert-rules', icon: ShieldAlert, label: 'Alert Rules' }] : []),
  ];

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
          } ${isMobile ? 'w-64' : isCollapsed ? 'w-24' : 'w-64'}`}
      >
        {/* Logo */}
        <div className="flex items-center h-16 border-b border-gray-200 dark:border-gray-700 relative overflow-hidden">
          <div className="flex items-center absolute left-0 w-full px-4">
            <div className="w-10 h-10 shrink-0 bg-primary-600 rounded-lg flex items-center justify-center">
              <Car className="w-6 h-6 text-white" />
            </div>
            <span
              className={`ml-3 text-lg font-bold text-gray-900 dark:text-white whitespace-nowrap transition-all duration-300 ${isCollapsed ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'
                }`}
            >
              Fleet MS
            </span>
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
                `flex items-center h-12 text-sm font-medium rounded-xl transition-all duration-300 whitespace-nowrap overflow-hidden ${isActive
                  ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-100'
                } ${isCollapsed ? 'mx-3 px-2 w-[calc(100%-1.5rem)]' : 'mx-4 px-3 gap-3'}`
              }
              title={isCollapsed ? item.label : undefined}
            >
              <div className={isCollapsed ? 'w-10 flex justify-center' : ''}>
                <item.icon className="w-6 h-6 shrink-0" />
              </div>
              <span
                className={`transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'
                  }`}
              >
                {item.label}
              </span>
            </NavLink>
          ))}

          {/* Admin Menu */}
          {showAdminMenu && (
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
                      `flex items-center h-12 text-sm font-medium rounded-xl transition-all duration-300 whitespace-nowrap overflow-hidden ${isActive
                        ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-100'
                      } ${isCollapsed ? 'mx-3 px-2 w-[calc(100%-1.5rem)]' : 'mx-4 px-3 gap-3'}`
                    }
                    title={isCollapsed ? item.label : undefined}
                  >
                    <div className={isCollapsed ? 'w-10 flex justify-center' : ''}>
                      <item.icon className="w-6 h-6 shrink-0" />
                    </div>
                    <span
                      className={`transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'
                        }`}
                    >
                      {item.label}
                    </span>
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
                `flex items-center h-12 text-sm font-medium rounded-xl transition-all duration-300 whitespace-nowrap overflow-hidden ${isActive
                  ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-100'
                } ${isCollapsed ? 'mx-3 px-2 w-[calc(100%-1.5rem)]' : 'mx-4 px-3 gap-3'}`
              }
              title={isCollapsed ? 'Settings' : undefined}
            >
              <div className={isCollapsed ? 'w-10 flex justify-center' : ''}>
                <Settings className="w-6 h-6 shrink-0" />
              </div>
              <span
                className={`transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'
                  }`}
              >
                Settings
              </span>
            </NavLink>
          </div>
        </nav>

        {/* Toggle Button (Desktop) */}
        {!isMobile && (
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors z-50 focus:outline-none focus:ring-1 focus:ring-primary-300"
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
