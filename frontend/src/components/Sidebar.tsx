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
  { path: '/', icon: LayoutDashboard, label: 'Dashboard', color: 'text-primary-600' },
  { path: '/vehicles', icon: Car, label: 'Vehicles', color: 'text-violet-600' },
  { path: '/maintenance', icon: Wrench, label: 'Maintenance', color: 'text-teal-600' },
  { path: '/reports', icon: FileText, label: 'Reports', color: 'text-rose-500' },
];

const Sidebar = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { sidebarOpen, isMobile } = useSelector((state: RootState) => state.ui);
  const { isAdmin, canAddAlerts, canEditAlerts, canDeleteAlerts } = useAuth();
  const hasAnyAlertPrivilege = isAdmin || canAddAlerts || canEditAlerts || canDeleteAlerts;

  const isCollapsed = !isMobile && !sidebarOpen;

  const showAdminMenu = isAdmin || hasAnyAlertPrivilege;
  const adminMenuItems = [
    ...(isAdmin ? [{ path: '/users', icon: Users, label: 'Users', color: 'text-amber-500' }] : []),
    ...(hasAnyAlertPrivilege ? [{ path: '/alert-rules', icon: ShieldAlert, label: 'Alert Rules', color: 'text-rose-500' }] : []),
  ];

  const handleClose = () => {
    if (isMobile) {
      dispatch(setSidebarOpen(false));
    }
  };

  return (
    <>
      <aside
        className={`fixed top-0 left-0 z-30 h-full bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 shadow-lg transition-all duration-300 flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          } ${isMobile ? 'w-64' : isCollapsed ? 'w-20' : 'w-64'}`}
      >
        {/* Logo */}
        <div className="flex items-center h-16 border-b border-slate-100 dark:border-slate-800 relative overflow-hidden px-4">
          <div className="flex items-center w-full">
            {/* Aurora gradient icon */}
            <div className="w-9 h-9 shrink-0 rounded-lg flex items-center justify-center bg-gradient-to-br from-primary-500 to-violet-600 shadow-md shadow-primary-200 dark:shadow-none">
              <Car className="w-5 h-5 text-white" />
            </div>
            <span
              className={`ml-3 text-lg font-bold whitespace-nowrap transition-all duration-300 aurora-gradient-text ${isCollapsed ? 'opacity-0 w-0 ml-0' : 'opacity-100'
                }`}
            >
              Fleet MS
            </span>
          </div>
          {isMobile && (
            <button
              onClick={handleClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 ml-auto shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-thin">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              onClick={handleClose}
              className={({ isActive }) =>
                `flex items-center h-11 text-sm font-medium rounded-xl transition-all duration-200 whitespace-nowrap overflow-hidden ${isActive
                  ? 'bg-primary-50 text-primary-700 border-l-[3px] border-primary-500 pl-[calc(0.75rem-3px)] dark:bg-primary-900/20 dark:text-primary-400'
                  : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200 pl-3'
                } ${isCollapsed ? 'justify-center px-0' : 'pr-3 gap-3'}`
              }
              title={isCollapsed ? item.label : undefined}
            >
              <div className={`${isCollapsed ? 'w-full flex justify-center' : 'shrink-0'}`}>
                <item.icon className={`w-5 h-5 shrink-0 ${item.color}`} />
              </div>
              <span
                className={`transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
                  }`}
              >
                {item.label}
              </span>
            </NavLink>
          ))}

          {/* Admin Menu */}
          {showAdminMenu && (
            <>
              <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800">
                {!isCollapsed && (
                  <p className="px-3 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
                    Admin
                  </p>
                )}
                {adminMenuItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={handleClose}
                    className={({ isActive }) =>
                      `flex items-center h-11 text-sm font-medium rounded-xl transition-all duration-200 whitespace-nowrap overflow-hidden ${isActive
                        ? 'bg-primary-50 text-primary-700 border-l-[3px] border-primary-500 pl-[calc(0.75rem-3px)] dark:bg-primary-900/20 dark:text-primary-400'
                        : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200 pl-3'
                      } ${isCollapsed ? 'justify-center px-0' : 'pr-3 gap-3'}`
                    }
                    title={isCollapsed ? item.label : undefined}
                  >
                    <div className={`${isCollapsed ? 'w-full flex justify-center' : 'shrink-0'}`}>
                      <item.icon className={`w-5 h-5 shrink-0 ${item.color}`} />
                    </div>
                    <span
                      className={`transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
                        }`}
                    >
                      {item.label}
                    </span>
                  </NavLink>
                ))}
              </div>
            </>
          )}
        </nav>

        {/* Settings at bottom */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800">
          <NavLink
            to="/settings"
            onClick={handleClose}
            className={({ isActive }) =>
              `flex items-center h-11 text-sm font-medium rounded-xl transition-all duration-200 whitespace-nowrap overflow-hidden ${isActive
                ? 'bg-primary-50 text-primary-700 border-l-[3px] border-primary-500 pl-[calc(0.75rem-3px)] dark:bg-primary-900/20 dark:text-primary-400'
                : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200 pl-3'
              } ${isCollapsed ? 'justify-center px-0' : 'pr-3 gap-3'}`
            }
            title={isCollapsed ? 'Settings' : undefined}
          >
            <div className={`${isCollapsed ? 'w-full flex justify-center' : 'shrink-0'}`}>
              <Settings className="w-5 h-5 shrink-0 text-slate-500" />
            </div>
            <span
              className={`transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
                }`}
            >
              Settings
            </span>
          </NavLink>
        </div>

        {/* Collapse Toggle Button (Desktop) */}
        {!isMobile && (
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="group absolute -right-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 transform active:scale-95 z-50 focus:outline-none shadow-sm hover:shadow-md"
          >
            {/* Glassmorphic Background */}
            <div className="absolute inset-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-full"></div>

            {/* Aurora Gradient Border (Idle & Hover) */}
            <div className="absolute inset-0 rounded-full p-[1px] bg-gradient-to-r from-transparent via-transparent to-transparent group-hover:from-cyan-400 group-hover:via-indigo-500 group-hover:to-violet-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)", WebkitMaskComposite: "xor", maskComposite: "exclude" }}></div>

            {/* Default Subtle Border */}
            <div className="absolute inset-0 rounded-full border border-slate-200/50 dark:border-slate-700/50 group-hover:border-transparent transition-colors duration-300"></div>

            {/* Icon */}
            {sidebarOpen ? (
              <ChevronLeft className="relative z-10 w-4 h-4 text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
            ) : (
              <ChevronRight className="relative z-10 w-4 h-4 text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
            )}

            {/* Subtle Aurora Glow on Hover */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400/0 via-indigo-500/0 to-violet-500/0 group-hover:from-cyan-400/10 group-hover:via-indigo-500/10 group-hover:to-violet-500/10 blur-[4px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
          </button>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
