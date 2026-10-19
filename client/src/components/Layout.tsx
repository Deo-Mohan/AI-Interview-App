import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header, MobileDrawer } from './Header';

export const Layout: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-engineering-grid flex flex-col font-sans">
      {/* Desktop Sidebar */}
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        onToggleCollapse={() => setIsSidebarCollapsed(prev => !prev)} 
      />

      {/* Mobile Drawer */}
      <MobileDrawer 
        isOpen={isMobileDrawerOpen} 
        onClose={() => setIsMobileDrawerOpen(false)} 
      />

      {/* Main Content Area */}
      <div 
        className={`flex-1 flex flex-col transition-all duration-200 ease-in-out ${
          isSidebarCollapsed ? 'md:pl-16' : 'md:pl-64'
        }`}
      >
        <Header onOpenMobileDrawer={() => setIsMobileDrawerOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
