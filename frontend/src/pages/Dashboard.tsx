import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Car,
  Wrench,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

import { AppDispatch, RootState } from '@/store';
import {
  fetchDashboardOverview,
  fetchDashboardTrends,
  fetchVehicleStatus,
  fetchAlerts,
} from '@/store/slices/dashboardSlice';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const Dashboard = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { overview, trends, vehicleStatus, alerts, isLoading } = useSelector(
    (state: RootState) => state.dashboard
  );
  const { language } = useSelector((state: RootState) => state.ui);
  const { t } = useTranslation();

  useEffect(() => {
    dispatch(fetchDashboardOverview());
    dispatch(fetchDashboardTrends(6));
    dispatch(fetchVehicleStatus());
    dispatch(fetchAlerts());
  }, [dispatch]);

  const statCards = [
    {
      title: t('dashboard.stats.totalVehicles'),
      value: overview?.vehicles.total || 0,
      icon: Car,
      color: 'bg-blue-500',
      link: '/vehicles',
    },
    {
      title: t('dashboard.stats.activeVehicles'),
      value: overview?.vehicles.active || 0,
      icon: TrendingUp,
      color: 'bg-green-500',
      link: '/vehicles?status=active',
    },
    {
      title: t('dashboard.stats.inMaintenance'),
      value: overview?.vehicles.maintenance || 0,
      icon: Wrench,
      color: 'bg-yellow-500',
      link: '/vehicles?status=maintenance',
    },
    {
      title: t('dashboard.stats.monthlyCost'),
      value: `${(overview?.monthlyCost || 0).toLocaleString(language === 'ar' ? 'ar-SA' : language === 'fr' ? 'fr-FR' : 'en-US', { style: 'currency', currency: 'USD' })}`,
      icon: DollarSign,
      color: 'bg-purple-500',
      link: '/reports',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('dashboard.title')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {t('dashboard.description')}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <Link
            key={card.title}
            to={card.link}
            className={`card-aurora p-6 page-fade-in stagger-${index + 1}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {card.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {isLoading ? '-' : card.value}
                </p>
              </div>
              <div className={`${card.color} p-3 rounded-lg`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Maintenance Trends */}
        <div className="card-aurora p-6 page-fade-in stagger-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('dashboard.charts.maintenanceTrends')}
          </h3>
          <div className="h-72 animate-chart-grow">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: '#6b7280' }}
                    tickFormatter={(value) => {
                      const [year, month] = value.split('-');
                      return `${month}/${year.slice(2)}`;
                    }}
                  />
                  <YAxis tick={{ fill: '#6b7280' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" name={t('dashboard.charts.total')} />
                  <Bar dataKey="completed" fill="#10b981" name={t('dashboard.charts.completed')} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Vehicle Status */}
        <div className="card-aurora p-6 page-fade-in stagger-5">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('dashboard.charts.statusDistribution')}
          </h3>
          <div className="h-72 animate-chart-grow">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={vehicleStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ status, count }) => `${status}: ${count}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="status"
                  >
                    {vehicleStatus.map((_entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Maintenance */}
        <div className="lg:col-span-2 card-aurora p-6 page-fade-in stagger-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('dashboard.upcomingMaintenance.title')}
            </h3>
            <Link
              to="/maintenance?status=scheduled"
              className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 flex items-center gap-1"
            >
              {t('dashboard.upcomingMaintenance.viewAll')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t('dashboard.upcomingMaintenance.vehicle')}
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t('dashboard.upcomingMaintenance.type')}
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t('dashboard.upcomingMaintenance.date')}
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t('dashboard.upcomingMaintenance.status')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-500">
                      {t('common.loading')}
                    </td>
                  </tr>
                ) : overview?.upcomingMaintenance?.length ? (
                  overview.upcomingMaintenance.slice(0, 5).map((item: any) => (
                    <tr
                      key={item.id}
                      className="border-b border-gray-100 dark:border-gray-700 last:border-0"
                    >
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {item.vehicle?.plateNumber}
                          </p>
                          <p className="text-sm text-gray-500">
                            {item.vehicle?.make} {item.vehicle?.model}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300 capitalize">
                        {item.type?.replace(/_/g, ' ')}
                      </td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                        {new Date(item.scheduledDate).toLocaleDateString(language === 'ar' ? 'ar-SA' : language === 'fr' ? 'fr-FR' : 'en-US')}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${item.status === 'scheduled'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                            }`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-500">
                      {t('dashboard.upcomingMaintenance.noMaintenance')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alerts */}
        <div className="card-aurora p-6 page-fade-in stagger-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('dashboard.alerts.title')}
            </h3>
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
          </div>
          <div className="space-y-3">
            {isLoading ? (
              <div className="py-8 text-center text-gray-500">{t('common.loading')}</div>
            ) : alerts?.length ? (
              alerts.slice(0, 5).map((alert: any, index: number) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg ${alert.severity === 'urgent'
                    ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                    : alert.severity === 'warning'
                      ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
                      : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                    }`}
                >
                  <p
                    className={`text-sm ${alert.severity === 'urgent'
                      ? 'text-red-800 dark:text-red-400'
                      : alert.severity === 'warning'
                        ? 'text-yellow-800 dark:text-yellow-400'
                        : 'text-blue-800 dark:text-blue-400'
                      }`}
                  >
                    {alert.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(alert.date).toLocaleDateString(language === 'ar' ? 'ar-SA' : language === 'fr' ? 'fr-FR' : 'en-US')}
                  </p>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-gray-500">{t('dashboard.alerts.noAlerts')}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
