import { Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

import Sidebar from './Sidebar';
import Header from './Header';

const Layout = () => {
  const { sidebarOpen, isMobile } = useSelector((state: RootState) => state.ui);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#f8faff] dark:bg-slate-950 transition-colors duration-200 relative overflow-x-hidden">
      {/* Animated aurora background blobs */}
      <div className="aurora-blob aurora-blob-1" />
      <div className="aurora-blob aurora-blob-2" />
      <div className="aurora-blob aurora-blob-3" />

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div
        className={`relative z-10 transition-all duration-300 ${isMobile ? '' : sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
          }`}
      >
        {/* Header */}
        <Header />

        {/* Page Content — key triggers re-mount for fade-in animation on navigation */}
        <main className="p-4 lg:p-8 pt-20 lg:pt-24">
          <div className="max-w-7xl mx-auto">
            <div key={location.pathname} className="page-fade-in">
              <Outlet />
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-20 lg:hidden"
          onClick={() => { }}
        />
      )}
    </div>
  );
};

export default Layout;
