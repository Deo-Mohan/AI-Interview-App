import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header, MobileDrawer } from './Header';
import { ErrorBoundary } from './ErrorBoundary';

export const Layout: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-engineering-grid flex flex-col font-sans">
      {/* Desktop Sidebar Protected by ErrorBoundary */}
      <ErrorBoundary name="Navigation Sidebar" compact>
        <Sidebar 
          isCollapsed={isSidebarCollapsed} 
          onToggleCollapse={() => setIsSidebarCollapsed(prev => !prev)} 
        />
      </ErrorBoundary>

      {/* Mobile Drawer Protected by ErrorBoundary */}
      <ErrorBoundary name="Mobile Drawer" compact>
        <MobileDrawer 
          isOpen={isMobileDrawerOpen} 
          onClose={() => setIsMobileDrawerOpen(false)} 
        />
      </ErrorBoundary>

      {/* Main Content Area */}
      <div 
        className={`flex-1 flex flex-col transition-all duration-200 ease-in-out ${
          isSidebarCollapsed ? 'md:pl-16' : 'md:pl-64'
        }`}
      >
        <ErrorBoundary name="Application Header" compact>
          <Header onOpenMobileDrawer={() => setIsMobileDrawerOpen(true)} />
        </ErrorBoundary>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {/* Active Page Protected by ErrorBoundary: A failure in one page will not crash the sidebar, header, or app */}
          <ErrorBoundary name="Page Content" resetKeys={[location.pathname]}>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
};
