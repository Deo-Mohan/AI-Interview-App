import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
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
  Flame,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { Badge } from './ui';
import { PulseBeacon } from './motion/MotionTransitions';

interface HeaderProps {
  onOpenMobileDrawer: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileDrawer }) => {
  const location = useLocation();

  const getPageTitle = (pathname: string) => {
    switch (pathname) {
      case '/': return { title: 'Dashboard', subtitle: 'Practice analytics, speaking streak, and curriculum roadmap' };
      case '/modes': return { title: 'Practice Modes', subtitle: 'Select an AI-guided simulation environment' };
      case '/conversation-setup': return { title: 'Session Setup', subtitle: 'Configure role, scenario, and coaching intensity' };
      case '/conversation': return { title: 'Live Voice Studio', subtitle: 'Real-time conversation with Rachel, 3D mentor' };
      case '/session-complete': return { title: 'Session Recap', subtitle: 'Performance analytics, CEFR score, and lesson notes' };
      case '/notes': return { title: 'Lesson Notes & Revisions', subtitle: 'Structured post-session grammar and expression notes' };
      case '/vocabulary': return { title: 'Daily Vocabulary Lab', subtitle: 'Contextual dictionary, pronunciation, and spaced repetition' };
      case '/vocabulary-revision': return { title: 'Vocabulary Flashcards', subtitle: 'Active recall spaced repetition revision' };
      case '/interview-setup': return { title: 'Resume Mock Interview', subtitle: 'Contextual technical and behavioural career rehearsal' };
      case '/progress': return { title: 'Speaking Fluency Analytics', subtitle: 'CEFR progression, habits tracking, and error trends' };
      case '/settings': return { title: 'Settings & AI Providers', subtitle: 'BYOK API keys, AES-256 encryption, and audio preferences' };
      default: return { title: 'Rachel AI Coach', subtitle: 'Natural spoken English practice' };
    }
  };

  const pageInfo = getPageTitle(location.pathname);

  return (
    <header className="sticky top-0 z-20 h-16 bg-white/85 backdrop-blur-md border-b border-slate-200/90 px-4 sm:px-6 lg:px-8 flex items-center justify-between transition-all">
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          onClick={onOpenMobileDrawer}
          className="md:hidden size-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          aria-label="Open navigation menu"
        >
          <Menu className="size-5" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-slate-400 font-bold hidden sm:inline-block">Rachel AI</span>
            <ChevronRight className="size-3 text-slate-300 hidden sm:inline-block" />
            <h1 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
              {pageInfo.title}
            </h1>
          </div>
          <p className="text-[11px] text-slate-500 font-medium hidden md:block">
            {pageInfo.subtitle}
          </p>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        {/* Live Mentor Status Pill */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50/80 border border-emerald-200/80 text-xs font-bold text-emerald-800 shadow-2xs">
          <PulseBeacon variant="emerald" size="sm" />
          <span>Mentor Online & Ready</span>
        </div>

        {/* User Streak Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200 text-xs font-mono font-bold text-amber-700 shadow-2xs">
          <Flame className="size-4 fill-amber-500 text-amber-500 animate-pulse" />
          <span className="hidden sm:inline">Streak:</span> 12d
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="size-8.5 rounded-xl bg-slate-900 text-white font-black flex items-center justify-center text-xs shadow-2xs">
            KP
          </div>
          <div className="hidden lg:flex flex-col text-left">
            <span className="text-xs font-bold text-slate-900 leading-tight">Krish Patel</span>
            <span className="text-[10px] font-mono text-slate-500 leading-tight">CEFR B2+</span>
          </div>
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
  const links = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Practice Modes', path: '/modes', icon: Compass },
    { label: 'Live Conversation', path: '/conversation', icon: Mic, badge: 'Live', isLive: true },
    { label: 'Interview Setup', path: '/interview-setup', icon: Bot, badge: 'Resume' },
    { label: 'My Notes', path: '/notes', icon: FileText },
    { label: 'Daily Vocabulary', path: '/vocabulary', icon: BookOpen },
    { label: 'My Progress', path: '/progress', icon: BarChart2 },
    { label: 'Settings & Providers', path: '/settings', icon: Settings },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs"
            onClick={onClose}
          />

          {/* Drawer Panel */}
          <motion.div 
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-72 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col z-10 border-r border-slate-200"
          >
            <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                  <Sparkles className="size-4" />
                </div>
                <div>
                  <span className="text-sm font-extrabold text-slate-900 block leading-tight">Rachel AI</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">English Coach</span>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="size-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
                aria-label="Close menu"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              {links.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold tracking-tight transition-all ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon className={`size-4.5 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                        <span className="flex-1">{link.label}</span>
                        {link.isLive ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-50 text-rose-700 border border-rose-200">
                            <PulseBeacon variant="rose" size="sm" /> Live
                          </span>
                        ) : link.badge ? (
                          <Badge variant="blue" size="sm">{link.badge}</Badge>
                        ) : null}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50/60">
              <div className="flex items-center gap-3">
                <div className="size-8.5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                  KP
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-900">Krish Patel</span>
                  <span className="text-[10px] font-mono text-emerald-600 font-bold">CEFR B2+ (Fluent)</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
