import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { fetchLogs, undoAction, deleteAllLogs } from '@/store/slices/logSlice';
import { logApi } from '@/services/api';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import {
  History,
  PlusCircle,
  FileEdit,
  Trash2,
  Download,
  RotateCcw,
  Search,
  Filter,
  Loader2,
} from 'lucide-react';
import ConfirmModal from '@/components/ConfirmModal';
import { useTranslation } from 'react-i18next';

const ActivityLogs = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { logs, isLoading, isUndoing, isDeletingAll, pagination } = useSelector((state: RootState) => state.logs);
  const { t } = useTranslation();

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [resourceFilter, setResourceFilter] = useState('');

  const [isUndoModalOpen, setIsUndoModalOpen] = useState(false);
  const [selectedLogForUndo, setSelectedLogForUndo] = useState<any>(null);

  const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    dispatch(fetchLogs({
      page: 1,
      limit: 20,
      search: debouncedSearch,
      action: actionFilter,
      resourceType: resourceFilter,
    }));
  }, [dispatch, debouncedSearch, actionFilter, resourceFilter]);

  const handlePageChange = (newPage: number) => {
    dispatch(fetchLogs({
      page: newPage,
      limit: 20,
      search: debouncedSearch,
      action: actionFilter,
      resourceType: resourceFilter,
    }));
  };

  const getActionConfig = (action: string) => {
    switch (action) {
      case 'CREATE':
        return {
          icon: <PlusCircle className="w-5 h-5" />,
          colorClass: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
          dotClass: 'bg-emerald-500',
        };
      case 'UPDATE':
        return {
          icon: <FileEdit className="w-5 h-5" />,
          colorClass: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
          dotClass: 'bg-blue-500',
        };
      case 'DELETE':
        return {
          icon: <Trash2 className="w-5 h-5" />,
          colorClass: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800',
          dotClass: 'bg-rose-500',
        };
      case 'EXPORT':
        return {
          icon: <Download className="w-5 h-5" />,
          colorClass: 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-800',
          dotClass: 'bg-violet-500',
        };
      default:
        return {
          icon: <History className="w-5 h-5" />,
          colorClass: 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800',
          dotClass: 'bg-gray-500',
        };
    }
  };

  const handleUndoClick = (log: any) => {
    setSelectedLogForUndo(log);
    setIsUndoModalOpen(true);
  };

  const confirmUndo = async () => {
    if (selectedLogForUndo) {
      await dispatch(undoAction(selectedLogForUndo._id));
      setIsUndoModalOpen(false);
      setSelectedLogForUndo(null);
    }
  };

  const confirmDeleteAll = async () => {
    await dispatch(deleteAllLogs());
    setIsDeleteAllModalOpen(false);
  };

  const handleExport = async () => {
    if (logs.length === 0) {
      toast.info(t('activityLogs.noLogsToExport'));
      return;
    }

    try {
      setIsExporting(true);
      const response = await logApi.exportLogs({
        search: debouncedSearch,
        action: actionFilter,
        resourceType: resourceFilter,
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'activity-logs.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success(t('activityLogs.exportSuccess'));
    } catch (error) {
      console.error('Export error:', error);
      toast.error(t('activityLogs.exportError'));
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <History className="w-6 h-6 text-primary-600" />
            {t('activityLogs.title')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {t('activityLogs.description')}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleExport}
            disabled={isExporting || logs.length === 0}
            className={`btn btn-secondary flex items-center gap-2 ${isExporting ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {t('activityLogs.exportPdf')}
          </button>

          <button
            onClick={() => setIsDeleteAllModalOpen(true)}
            disabled={isDeletingAll || logs.length === 0}
            className={`btn bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-2 ${isDeletingAll || logs.length === 0 ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isDeletingAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            {t('activityLogs.clearAllLogs')}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card-aurora p-4 page-fade-in stagger-1">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('activityLogs.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 dark:text-white placeholder-gray-400 outline-none transition-all"
            />
          </div>

          <div className="flex gap-4">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="pl-9 pr-8 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none appearance-none dark:text-white"
              >
                <option value="">{t('activityLogs.filters.allActions')}</option>
                <option value="CREATE">{t('activityLogs.filters.create')}</option>
                <option value="UPDATE">{t('activityLogs.filters.update')}</option>
                <option value="DELETE">{t('activityLogs.filters.delete')}</option>
                <option value="EXPORT">{t('activityLogs.filters.export')}</option>
              </select>
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={resourceFilter}
                onChange={(e) => setResourceFilter(e.target.value)}
                className="pl-9 pr-8 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none appearance-none dark:text-white"
              >
                <option value="">{t('activityLogs.filters.allResources')}</option>
                <option value="Vehicle">{t('activityLogs.filters.vehicle')}</option>
                <option value="Maintenance">{t('activityLogs.filters.maintenance')}</option>
                <option value="AlertRule">{t('activityLogs.filters.alertRule')}</option>
                <option value="User">{t('activityLogs.filters.user')}</option>
                <option value="Report">{t('activityLogs.filters.report')}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline / List */}
      <div className="card-aurora p-6 page-fade-in stagger-2 relative min-h-[400px]">
        {isLoading && (
          <div className="absolute inset-0 z-10 bg-white/50 dark:bg-gray-900/50 flex items-center justify-center backdrop-blur-sm rounded-2xl">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        )}

        {logs.length === 0 && !isLoading ? (
          <div className="opacity-60 flex flex-col justify-center items-center h-full py-12">
            <History className="w-16 h-16 text-gray-400 dark:text-gray-600 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg">{t('activityLogs.noLogs')}</p>
          </div>
        ) : (
          <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-3 md:ml-6 space-y-8">
            {logs.map((log) => {
              const config = getActionConfig(log.action);
              // isReverted: the ORIGINAL action (DELETE/UPDATE) that an admin already undid
              const isReverted = (log.action === 'UPDATE' || log.action === 'DELETE')
                && log.undone === true
                && !log.description?.startsWith('UNDID');

              // canUndo: original action not yet undone, and not an UNDID audit entry itself
              const canUndo = (log.action === 'UPDATE' || log.action === 'DELETE')
                && !log.undone
                && !log.description?.startsWith('UNDID');

              return (
                <div key={log._id} className="relative pl-6 md:pl-8">
                  {/* Timeline dot */}
                  <div className={`absolute -left-[9px] top-6 w-4 h-4 rounded-full border-4 border-white dark:border-slate-950 shadow ${config.dotClass}`} />

                  {/* Log Card */}
                  <div className={`p-4 rounded-xl border transition-all hover:shadow-md ${config.colorClass}`}>
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                      <div className="flex gap-4">
                        <div className="mt-1 shrink-0">
                          {config.icon}
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="font-semibold">{log.user?.firstName} {log.user?.lastName}</span>
                            <span className="text-sm opacity-80 border border-current px-2 py-0.5 rounded-full uppercase tracking-wider">
                              {log.action}
                            </span>
                            <span className="text-sm opacity-80 ml-2">{t('activityLogs.on')} <strong>{log.resourceType}</strong></span>
                            {log.resourceId && log.resourceType !== 'Report' && (
                              <span className="text-xs font-mono opacity-60">ID: {log.resourceId}</span>
                            )}
                          </div>
                          <p className="text-sm md:text-base opacity-90">{log.description}</p>
                        </div>
                      </div>

                      <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto mt-2 sm:mt-0 gap-3">
                        <span className="text-sm opacity-80 whitespace-nowrap">
                          {format(new Date(log.createdAt), 'MMM d, yyyy h:mm a')}
                        </span>

                        {/* Show Reverted badge if the action was undone */}
                        {isReverted && (
                          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                            <RotateCcw className="w-3.5 h-3.5" />
                            {t('activityLogs.reverted')}
                          </span>
                        )}

                        {/* Show Undo button only if action can still be undone */}
                        {canUndo && (
                          <button
                            onClick={() => handleUndoClick(log)}
                            disabled={isUndoing}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border border-current hover:bg-black/5 dark:hover:bg-white/10 ${isUndoing ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <RotateCcw className="w-4 h-4" />
                            {t('activityLogs.undo')}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Controls */}
        {pagination.pages > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            <button
              disabled={pagination.page === 1}
              onClick={() => handlePageChange(pagination.page - 1)}
              className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-50"
            >
              {t('common.previous')}
            </button>
            <span className="px-4 py-2 flex items-center dark:text-white">
              {t('common.pageOf', { current: pagination.page, total: pagination.pages })}
            </span>
            <button
              disabled={pagination.page === pagination.pages}
              onClick={() => handlePageChange(pagination.page + 1)}
              className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-50"
            >
              {t('common.next')}
            </button>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={isUndoModalOpen}
        onClose={() => setIsUndoModalOpen(false)}
        onConfirm={confirmUndo}
        title={t('activityLogs.confirmUndo.title')}
        message={`${t('activityLogs.confirmUndo.message')}\n\n"${selectedLogForUndo?.description}"`}
        confirmText={isUndoing ? t('activityLogs.confirmUndo.undoing') : t('activityLogs.confirmUndo.confirm')}
        cancelText={t('activityLogs.confirmUndo.cancel')}
      />

      <ConfirmModal
        isOpen={isDeleteAllModalOpen}
        onClose={() => setIsDeleteAllModalOpen(false)}
        onConfirm={confirmDeleteAll}
        title={t('activityLogs.confirmClear.title')}
        message={t('activityLogs.confirmClear.message')}
        confirmText={isDeletingAll ? t('activityLogs.confirmClear.clearing') : t('activityLogs.confirmClear.confirm')}
        cancelText={t('activityLogs.confirmClear.cancel')}
      />
    </div>
  );
};

export default ActivityLogs;
