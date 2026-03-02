import { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Car,
  Wrench,
  BarChart3,
  Calendar,
  Loader2,
  X,
  Search,
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { fetchVehicles } from '@/store/slices/vehicleSlice';
import { fetchMaintenance } from '@/store/slices/maintenanceSlice';
import { reportApi } from '@/services/api';
import { toast } from 'react-toastify';

const Reports = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { vehicles } = useSelector((state: RootState) => state.vehicles);
  const { records: maintenanceRecords } = useSelector((state: RootState) => state.maintenance);

  useEffect(() => {
    dispatch(fetchVehicles({ limit: 100 }));
    dispatch(fetchMaintenance({ limit: 100 }));
  }, [dispatch]);

  const [loading, setLoading] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState<'vehicle' | 'maintenance' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
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
      toast.error('Failed to download fleet report');
    } finally {
      setLoading(null);
    }
  };

  const handleDownloadVehicleReport = async (vehicleId: string) => {
    setLoading(`vehicle-${vehicleId}`);
    try {
      const response = await reportApi.generateVehicleReport(vehicleId);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Vehicle-Report-${Date.now()}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success('Vehicle report downloaded!');
      setModalOpen(null);
    } catch (error) {
      toast.error('Failed to download vehicle report');
    } finally {
      setLoading(null);
    }
  };

  const handleDownloadMaintenanceReport = async (maintenanceId: string) => {
    setLoading(`maintenance-${maintenanceId}`);
    try {
      const response = await reportApi.generateMaintenanceReport(maintenanceId);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Maintenance-Report-${Date.now()}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success('Maintenance report downloaded!');
      setModalOpen(null);
    } catch (error) {
      toast.error('Failed to download maintenance report');
    } finally {
      setLoading(null);
    }
  };

  const handleDownloadVehiclesActivityReport = async () => {
    setLoading('vehicles-activity');
    try {
      const response = await reportApi.generateVehiclesActivityReport({
        startDate: dateRange.startDate || undefined,
        endDate: dateRange.endDate || undefined,
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Vehicles-Activity-${Date.now()}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success('Vehicles activity report downloaded!');
      setModalOpen(null);
    } catch (error) {
      toast.error('Failed to download vehicles activity report');
    } finally {
      setLoading(null);
    }
  };

  const handleDownloadMaintenanceActivityReport = async () => {
    setLoading('maintenance-activity');
    try {
      const response = await reportApi.generateMaintenanceActivityReport({
        startDate: dateRange.startDate || undefined,
        endDate: dateRange.endDate || undefined,
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Maintenance-Activity-${Date.now()}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success('Maintenance activity report downloaded!');
      setModalOpen(null);
    } catch (error) {
      toast.error('Failed to download maintenance activity report');
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
      action: () => {
        setSearchQuery('');
        setModalOpen('vehicle');
      },
    },
    {
      id: 'maintenance',
      title: 'Maintenance Reports',
      description: 'Detailed maintenance records with parts and labor costs.',
      icon: Wrench,
      color: 'bg-yellow-500',
      action: () => {
        setSearchQuery('');
        setModalOpen('maintenance');
      },
    },
  ];

  const filteredVehicles = vehicles.filter(v =>
    v.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.model.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMaintenance = maintenanceRecords.filter(m => {
    const v = typeof m.vehicle === 'object' ? m.vehicle : vehicles.find(veh => veh.id === m.vehicle);
    const vehicleText = v ? `${v.plateNumber} ${v.make} ${v.model}`.toLowerCase() : '';
    return (
      vehicleText.includes(searchQuery.toLowerCase()) ||
      m.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.description && m.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

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
      <div className="card-aurora p-4 page-fade-in stagger-1">
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 page-fade-in stagger-2">
        {reports.map((report) => (
          <div
            key={report.id}
            className="card-aurora p-6 transition-all duration-300 hover:-translate-y-1"
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
      <div className="card-aurora p-6 border-blue-200 dark:border-blue-800/50 bg-blue-50/50 dark:bg-blue-900/10 page-fade-in stagger-3">
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
      {/* Selection Modals */}
      {modalOpen === 'vehicle' && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card-aurora w-full max-w-lg max-h-[90vh] flex flex-col page-fade-in">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700/50">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Car className="w-5 h-5" /> Select Vehicle
              </h2>
              <button
                onClick={() => setModalOpen(null)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 border-b border-gray-200 dark:border-gray-700 space-y-4">
              <button
                onClick={handleDownloadVehiclesActivityReport}
                disabled={loading === 'vehicles-activity'}
                className="w-full relative overflow-hidden group flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
              >
                <div className="absolute inset-0 w-full h-full bg-white/20 group-hover:bg-transparent transition-colors duration-300 rounded-xl pointer-events-none"></div>
                {loading === 'vehicles-activity' ? (
                  <><Loader2 className="w-5 h-5 animate-spin relative z-10" /> <span className="relative z-10 text-lg">Generating PDF...</span></>
                ) : (
                  <><Download className="w-5 h-5 relative z-10" /> <span className="relative z-10 text-lg">Export All Vehicle Activity (Date Range)</span></>
                )}
              </button>
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Or search specific vehicles by plate, make, or model..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="overflow-y-auto p-4 flex-1">
              {filteredVehicles.length === 0 ? (
                <p className="text-center text-gray-500 my-8">No vehicles found matching "{searchQuery}"</p>
              ) : (
                <div className="space-y-2">
                  {filteredVehicles.map((vehicle) => (
                    <div
                      key={vehicle.id}
                      className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-500 dark:hover:border-primary-500 transition-colors"
                    >
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white uppercase">{vehicle.plateNumber}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{vehicle.make} {vehicle.model} ({vehicle.year})</div>
                      </div>
                      <button
                        onClick={() => handleDownloadVehicleReport(vehicle.id)}
                        disabled={loading === `vehicle-${vehicle.id}`}
                        className="px-3 py-1.5 bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 hover:bg-primary-200 dark:hover:bg-primary-900/50 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                      >
                        {loading === `vehicle-${vehicle.id}` ? 'Generating...' : 'Report'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {modalOpen === 'maintenance' && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card-aurora w-full max-w-lg max-h-[90vh] flex flex-col page-fade-in">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700/50">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Wrench className="w-5 h-5" /> Select Maintenance Record
              </h2>
              <button
                onClick={() => setModalOpen(null)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 border-b border-gray-200 dark:border-gray-700 space-y-4">
              <button
                onClick={handleDownloadMaintenanceActivityReport}
                disabled={loading === 'maintenance-activity'}
                className="w-full relative overflow-hidden group flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
              >
                <div className="absolute inset-0 w-full h-full bg-white/20 group-hover:bg-transparent transition-colors duration-300 rounded-xl pointer-events-none"></div>
                {loading === 'maintenance-activity' ? (
                  <><Loader2 className="w-5 h-5 animate-spin relative z-10" /> <span className="relative z-10 text-lg">Generating PDF...</span></>
                ) : (
                  <><Download className="w-5 h-5 relative z-10" /> <span className="relative z-10 text-lg">Export All Maintenance Activity (Date Range)</span></>
                )}
              </button>
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Or search specific maintenance by vehicle, type, or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="overflow-y-auto p-4 flex-1">
              {filteredMaintenance.length === 0 ? (
                <p className="text-center text-gray-500 my-8">No records found matching "{searchQuery}"</p>
              ) : (
                <div className="space-y-2">
                  {filteredMaintenance.map((record) => {
                    const v = typeof record.vehicle === 'object' ? record.vehicle : vehicles.find(veh => veh.id === record.vehicle);
                    return (
                      <div
                        key={record.id}
                        className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-500 dark:hover:border-primary-500 transition-colors"
                      >
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white capitalize flex items-center gap-2">
                            {record.type.replace(/_/g, ' ')}
                            <span className={`text-xs px-2 py-0.5 rounded-full ${record.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                              record.status === 'scheduled' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                                'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                              }`}>
                              {record.status}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {v ? `${v.plateNumber} ` : 'Unknown Vehicle '}
                            • {new Date(record.scheduledDate).toLocaleDateString()}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDownloadMaintenanceReport(record.id)}
                          disabled={loading === `maintenance-${record.id}`}
                          className="px-3 py-1.5 ml-3 bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 hover:bg-primary-200 dark:hover:bg-primary-900/50 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 shrink-0"
                        >
                          {loading === `maintenance-${record.id}` ? 'Generating...' : 'Report'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
