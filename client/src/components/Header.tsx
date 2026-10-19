import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Menu, 
  X, 
  Sparkles, 
  LayoutDashboard, 
  Compass, 
  Mic, 
  FileText, 
  BookOpen, 
  BarChart2, 
  Settings, 
  Bot,
  Volume2
} from 'lucide-react';
import { Badge } from './ui';

interface HeaderProps {
  onOpenMobileDrawer: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileDrawer }) => {
  const location = useLocation();

  const getPageTitle = (pathname: string) => {
    switch (pathname) {
      case '/': return 'Dashboard';
      case '/modes': return 'Practice Modes';
      case '/conversation-setup': return 'Session Setup';
      case '/conversation': return 'Active Voice Conversation';
      case '/session-complete': return 'Session Summary & Notes';
      case '/notes': return 'My Saved Notes & Lessons';
      case '/vocabulary': return 'Daily Vocabulary & Dictionary';
      case '/vocabulary-revision': return 'Vocabulary Revision';
      case '/interview-setup': return 'Resume-Aware Interview Setup';
      case '/progress': return 'My Progress & Error Trends';
      case '/settings': return 'Settings & Providers';
      default: return 'AI English Coach';
    }
  };

  return (
    <header className="sticky top-0 z-20 h-16 bg-white/95 backdrop-blur-sm border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          onClick={onOpenMobileDrawer}
          className="md:hidden size-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100"
          aria-label="Open navigation menu"
        >
          <Menu className="size-5" />
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            {getPageTitle(location.pathname)}
          </h1>
          <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
            EventLooped-Inspired English Speaking & Fluency Mentor
          </p>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        {/* Voice Engine Status Pill */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
          <span className="size-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Web Audio API Ready</span>
        </div>

        {/* User Badge */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="size-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
            KP
          </div>
          <span className="text-xs font-bold text-slate-800 hidden md:inline-block">Krish</span>
        </div>
      </div>
    </header>
  );
};

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const links = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Practice Modes', path: '/modes', icon: Compass },
    { label: 'Live Conversation', path: '/conversation', icon: Mic, badge: 'Live' },
    { label: 'Interview Setup', path: '/interview-setup', icon: Bot, badge: 'Resume' },
    { label: 'My Notes', path: '/notes', icon: FileText },
    { label: 'Daily Vocabulary', path: '/vocabulary', icon: BookOpen },
    { label: 'My Progress', path: '/progress', icon: BarChart2 },
    { label: 'Settings & Providers', path: '/settings', icon: Settings },
  ];

  return (
    <div className="fixed inset-0 z-50 md:hidden flex">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-72 max-w-[80vw] bg-white h-full shadow-2xl flex flex-col z-10">
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
              <Sparkles className="size-4" />
            </div>
            <span className="text-base font-bold text-slate-900">MentorVoice</span>
          </div>
          <button 
            onClick={onClose}
            className="size-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`
                }
              >
                <Icon className="size-4 shrink-0" />
                <span className="flex-1 truncate">{link.label}</span>
                {link.badge && (
                  <Badge variant={link.badge === 'Live' ? 'rose' : 'blue'} size="sm">
                    {link.badge}
                  </Badge>
                )}
              </NavLink>
            );
          })}
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
              KP
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-slate-800">Krish Patel</span>
              <span className="text-[10px] text-slate-500">Learner Account</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
