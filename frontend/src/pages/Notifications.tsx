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
import { enUS, fr, arSA } from 'date-fns/locale';
import { useState } from 'react';
import ConfirmModal from '@/components/ConfirmModal';
import {
  Bell,
  Check,
  Trash2,
  XCircle,
  Car,
  Wrench,
  Info,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

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
  const { language } = useSelector((state: RootState) => state.ui);
  const { t } = useTranslation();

  const getDateLocale = () => {
    switch (language) {
      case 'fr': return fr;
      case 'ar': return arSA;
      default: return enUS;
    }
  };

  // Scroll to top when opening the page
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [isClearModalOpen, setIsClearModalOpen] = useState(false);

  const handleMarkAllRead = () => {
    dispatch(markAllNotificationsRead());
  };

  const handleClearAll = () => {
    setIsClearModalOpen(true);
  };

  const confirmClearAll = () => {
    dispatch(clearNotifications());
    setIsClearModalOpen(false);
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
            {t('notifications.title')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {t('notifications.unreadCount', { count: unreadCount })}
          </p>
        </div>

        <div className="flex gap-3 w-full sm:w-auto">
          <button
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            <Check className="w-4 h-4" />
            {t('notifications.markAllRead')}
          </button>
          <button
            onClick={handleClearAll}
            disabled={notifications.length === 0}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            <Trash2 className="w-4 h-4" />
            {t('notifications.clearAll')}
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
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t('notifications.noNotifications')}</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {t('notifications.allCaughtUp')}
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
                        {formatDistanceToNow(new Date(notification.createdAt), {
                          addSuffix: true,
                          locale: getDateLocale()
                        })}
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
                              <Car className="w-3.5 h-3.5" /> {t('notifications.goToVehicle')}
                            </>
                          ) : (
                            <>
                              <Wrench className="w-3.5 h-3.5" /> {t('notifications.goToMaintenance')}
                            </>
                          )}
                        </button>
                      )}

                      {!notification.read && (
                        <button
                          onClick={() => dispatch(markNotificationRead(notification.id))}
                          className="px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                        >
                          {t('notifications.markAsRead')}
                        </button>
                      )}
                      <button
                        onClick={() => dispatch(removeNotification(notification.id))}
                        className="px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors ml-auto sm:ml-0"
                      >
                        {t('notifications.remove')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        onConfirm={confirmClearAll}
        title={t('notifications.clearModal.title')}
        message={t('notifications.clearModal.message')}
        confirmText={t('notifications.clearModal.confirm')}
        cancelText={t('common.cancel')}
        isDestructive={true}
      />
    </div>
  );
};

export default Notifications;
