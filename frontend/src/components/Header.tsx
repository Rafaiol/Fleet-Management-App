import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
  Menu,
  Bell,
  Sun,
  Moon,
  User,
  LogOut,
  ChevronDown,
  Search,
} from 'lucide-react';

import { RootState, AppDispatch } from '@/store';
import { toggleSidebar, markNotificationRead } from '@/store/slices/uiSlice';
import { logout } from '@/store/slices/authSlice';
import { useTheme } from '@/hooks';
import { formatDistanceToNow } from 'date-fns';

const Header = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { sidebarOpen, isMobile, notifications } = useSelector((state: RootState) => state.ui);
  const { isDark, toggleTheme } = useTheme();

  const unreadCount = notifications.filter(n => !n.read).length;
  const recentNotifications = notifications.slice(0, 5);

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    dispatch(logout());
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/vehicles?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="fixed top-0 right-0 left-0 z-20 h-16 bg-white/90 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 shadow-sm transition-all duration-300">
      <div
        className={`h-full flex items-center justify-between px-4 lg:px-8 transition-all duration-300 ${isMobile ? '' : sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
          }`}
      >
        {/* Left Side */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="p-2 text-slate-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search */}
          <div className="hidden md:flex items-center">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search vehicles..."
                className="pl-10 pr-4 py-2 w-64 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 focus:bg-white transition-all duration-200 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
              />
            </form>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-1.5">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-slate-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors relative"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 py-2 z-50 animate-fade-in">
                <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="text-xs bg-rose-50 text-rose-600 py-0.5 px-2.5 rounded-full font-medium border border-rose-100">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto scrollbar-thin">
                  {recentNotifications.length > 0 ? (
                    recentNotifications.map(notification => (
                      <div
                        key={notification.id}
                        onClick={() => {
                          if (!notification.read) {
                            dispatch(markNotificationRead(notification.id));
                          }
                        }}
                        className={`px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors ${!notification.read ? 'bg-primary-50/60 dark:bg-primary-900/10 border-l-2 border-primary-400 pl-3' : ''
                          }`}
                      >
                        <p className={`text-sm ${!notification.read ? 'text-slate-900 dark:text-white font-medium' : 'text-slate-700 dark:text-gray-200'}`}>
                          {notification.title}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5 line-clamp-1">
                          {notification.message}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center text-sm text-slate-400">
                      No notifications to show.
                    </div>
                  )}
                </div>
                <div className="px-4 py-2.5 border-t border-slate-100 dark:border-slate-800 text-center">
                  <Link
                    to="/notifications"
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium dark:text-primary-400"
                    onClick={() => setShowNotifications(false)}
                  >
                    View all notifications →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 px-2 py-1.5 text-slate-700 dark:text-gray-200 hover:bg-slate-50 dark:hover:bg-gray-700 rounded-xl transition-colors"
            >
              {/* Aurora gradient avatar */}
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-primary-500 to-violet-600 shadow-sm shadow-primary-200 ring-2 ring-primary-100">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="hidden md:block text-sm font-medium text-slate-700">
                {user?.fullName || 'User'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* User Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 py-2 z-50 animate-fade-in">
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{user?.fullName}</p>
                  <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">{user?.email}</p>
                  <span className="inline-block mt-1.5 px-2.5 py-0.5 text-xs font-medium bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 rounded-full capitalize border border-primary-100">
                    {user?.role}
                  </span>
                </div>
                <Link
                  to="/settings"
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 dark:text-gray-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  onClick={() => setShowUserMenu(false)}
                >
                  <User className="w-4 h-4 text-slate-400" />
                  Profile & Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
