import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import {
  markNotificationRead,
  markAllNotificationsRead,
  clearNotifications,
  removeNotification,
} from '@/store/slices/uiSlice';
import { formatDistanceToNow } from 'date-fns';
import {
  Bell,
  Check,
  Trash2,
  AlertTriangle,
  Info,
  CheckCircle2,
  XCircle,
  Car,
  Wrench
} from 'lucide-react';

const getIconForType = (type: string) => {
  switch (type) {
    case 'info':
      return <Info className="w-5 h-5 text-blue-500" />;
    case 'success':
      return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    case 'warning':
      return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    case 'error':
      return <XCircle className="w-5 h-5 text-red-500" />;
    default:
      return <Bell className="w-5 h-5 text-gray-500" />;
  }
};

const getBackgroundForType = (type: string, read: boolean) => {
  if (read) return 'hover:bg-gray-50 dark:hover:bg-gray-800/50';

  switch (type) {
    case 'info': return 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500';
    case 'success': return 'bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500';
    case 'warning': return 'bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500';
    case 'error': return 'bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500';
    default: return 'bg-gray-50 dark:bg-gray-800/50 border-l-4 border-gray-500';
  }
};

const Notifications = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { notifications } = useSelector((state: RootState) => state.ui);

  // Scroll to top when opening the page
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleMarkAllRead = () => {
    dispatch(markAllNotificationsRead());
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all notifications?')) {
      dispatch(clearNotifications());
    }
  };

  const handleActionClick = (notification: any) => {
    dispatch(markNotificationRead(notification.id));
    if (notification.alertType === 'registration_expiring' || notification.alertType === 'insurance_expiring' || notification.alertType === 'registration_expired' || notification.alertType === 'insurance_expired') {
      navigate(`/vehicles/${notification.vehicleId}`);
    } else {
      navigate('/maintenance/new', { state: { vehicleId: notification.vehicleId, alertType: notification.alertType } });
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Bell className="w-6 h-6 text-primary-600" />
            Notifications
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            You have {unreadCount} unread notification{unreadCount !== 1 && 's'}
          </p>
        </div>

        <div className="flex gap-3 w-full sm:w-auto">
          <button
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            <Check className="w-4 h-4" />
            Mark all read
          </button>
          <button
            onClick={handleClearAll}
            disabled={notifications.length === 0}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            <Trash2 className="w-4 h-4" />
            Clear all
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="card-aurora overflow-hidden page-fade-in stagger-1">
        {notifications.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">No notifications</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              You're all caught up! Check back later for new updates.
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            {notifications.map((notification, index) => (
              <div
                key={notification.id}
                className={`p-4 sm:p-6 transition-colors page-fade-in stagger-${(index % 5) + 1} ${getBackgroundForType(notification.type, notification.read)} ${!notification.read ? 'border-l-4' : 'border-l-4 border-transparent'} ${index !== notifications.length - 1 ? 'border-b border-gray-200 dark:border-gray-700' : ''}`}
              >
                <div className="flex items-start gap-4">
                  <div className="shrink-0 mt-1">
                    {getIconForType(notification.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-4 mb-1">
                      <h4 className={`text-base font-medium truncate ${notification.read
                        ? 'text-gray-700 dark:text-gray-300'
                        : 'text-gray-900 dark:text-white'
                        }`}>
                        {notification.title}
                      </h4>
                      <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </span>
                    </div>

                    <p className={`text-sm ${notification.read
                      ? 'text-gray-500 dark:text-gray-400'
                      : 'text-gray-700 dark:text-gray-300'
                      }`}>
                      {notification.message}
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      {notification.vehicleId && (
                        <button
                          onClick={() => handleActionClick(notification)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 transition-colors"
                        >
                          {(notification.alertType === 'registration_expiring' || notification.alertType === 'insurance_expiring' || notification.alertType === 'registration_expired' || notification.alertType === 'insurance_expired') ? (
                            <>
                              <Car className="w-3.5 h-3.5" /> Go to Vehicle
                            </>
                          ) : (
                            <>
                              <Wrench className="w-3.5 h-3.5" /> Go to Maintenance
                            </>
                          )}
                        </button>
                      )}

                      {!notification.read && (
                        <button
                          onClick={() => dispatch(markNotificationRead(notification.id))}
                          className="px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                        >
                          Mark as read
                        </button>
                      )}
                      <button
                        onClick={() => dispatch(removeNotification(notification.id))}
                        className="px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors ml-auto sm:ml-0"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
