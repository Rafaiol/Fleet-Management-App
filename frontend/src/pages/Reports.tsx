import { useState } from 'react';
import {
  FileText,
  Download,
  Car,
  Wrench,
  BarChart3,
  Calendar,
  Loader2,
} from 'lucide-react';
import { reportApi } from '@/services/api';
import { toast } from 'react-toastify';

const Reports = () => {
  const [loading, setLoading] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });

  const handleDownloadFleetSummary = async () => {
    setLoading('fleet');
    try {
      const response = await reportApi.generateFleetSummary({
        startDate: dateRange.startDate || undefined,
        endDate: dateRange.endDate || undefined,
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Fleet-Summary-Report-${new Date().toISOString().split('T')[0]}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success('Fleet summary report downloaded!');
    } catch (error) {
      toast.error('Failed to download report');
    } finally {
      setLoading(null);
    }
  };

  const reports = [
    {
      id: 'fleet',
      title: 'Fleet Summary Report',
      description: 'Comprehensive overview of your entire fleet including vehicles, maintenance, and costs.',
      icon: BarChart3,
      color: 'bg-blue-500',
      action: handleDownloadFleetSummary,
    },
    {
      id: 'vehicles',
      title: 'Vehicle Reports',
      description: 'Individual vehicle reports with maintenance history and details.',
      icon: Car,
      color: 'bg-green-500',
      action: () => toast.info('Select a vehicle to generate its report'),
    },
    {
      id: 'maintenance',
      title: 'Maintenance Reports',
      description: 'Detailed maintenance records with parts and labor costs.',
      icon: Wrench,
      color: 'bg-yellow-500',
      action: () => toast.info('Select a maintenance record to generate its report'),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Reports
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Generate and download fleet management reports
        </p>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-gray-500" />
          <h3 className="font-medium text-gray-900 dark:text-white">Date Range</h3>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) =>
                setDateRange({ ...dateRange, startDate: e.target.value })
              }
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) =>
                setDateRange({ ...dateRange, endDate: e.target.value })
              }
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report) => (
          <div
            key={report.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
          >
            <div className={`${report.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
              <report.icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {report.title}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
              {report.description}
            </p>
            <button
              onClick={report.action}
              disabled={loading === report.id}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
            >
              {loading === report.id ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Download PDF
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
            <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="font-medium text-blue-900 dark:text-blue-400 mb-1">
              About Reports
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              All reports are generated as PDF files and include comprehensive data
              about your fleet. Vehicle-specific and maintenance-specific reports can
              be generated from their respective detail pages.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
