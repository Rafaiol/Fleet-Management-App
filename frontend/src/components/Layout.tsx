import { Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';

import Sidebar from './Sidebar';
import Header from './Header';

const Layout = () => {
  const { sidebarOpen, isMobile, language } = useSelector((state: RootState) => state.ui);
  const location = useLocation();
  const { i18n } = useTranslation();

  useEffect(() => {
    if (i18n.language !== language) {
      i18n.changeLanguage(language);
    }
    // Update document dir for RTL support
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language, i18n]);

  return (
    <div
      className={`min-h-screen bg-[#f8faff] dark:bg-slate-950 transition-colors duration-200 relative overflow-x-hidden ${language === 'ar' ? 'font-arabic' : ''}`}
      dir={language === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Animated aurora background blobs */}
      <div className="aurora-blob aurora-blob-1" />
      <div className="aurora-blob aurora-blob-2" />
      <div className="aurora-blob aurora-blob-3" />

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div
        className={`relative z-10 transition-all duration-300 ${isMobile ? '' : sidebarOpen ? 'lg:ms-64' : 'lg:ms-20'}`}
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
