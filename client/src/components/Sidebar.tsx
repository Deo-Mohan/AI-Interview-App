import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  Mic, 
  FileText, 
  BookOpen, 
  BarChart2, 
  Settings, 
  Compass, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Bot,
  Flame,
  Award
} from 'lucide-react';
import { Badge } from './ui';
import { PulseBeacon } from './motion/MotionTransitions';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggleCollapse }) => {
  const navSections = [
    {
      title: 'Practice & Mentorship',
      items: [
        { label: 'Dashboard', path: '/', icon: LayoutDashboard },
        { label: 'Practice Modes', path: '/modes', icon: Compass },
        { label: 'Live Conversation', path: '/conversation', icon: Mic, badge: 'Live', isLive: true },
        { label: 'Interview Setup', path: '/interview-setup', icon: Bot, badge: 'Resume' },
      ],
    },
    {
      title: 'Learning & Revision',
      items: [
        { label: 'My Notes', path: '/notes', icon: FileText },
        { label: 'Daily Vocabulary', path: '/vocabulary', icon: BookOpen },
        { label: 'My Progress', path: '/progress', icon: BarChart2 },
      ],
    },
    {
      title: 'Preferences',
      items: [
        { label: 'Settings & Providers', path: '/settings', icon: Settings },
      ],
    },
  ];

  return (
    <aside 
      className={`fixed inset-y-0 left-0 z-30 flex flex-col bg-white border-r border-slate-200 transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] select-none hidden md:flex ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100">
        {!isCollapsed ? (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="size-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-base shadow-sm shrink-0">
              <Sparkles className="size-4.5" />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-extrabold text-slate-900 tracking-tight truncate">Rachel AI</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">v2.5</span>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">English Coach</span>
            </div>
          </div>
        ) : (
          <div className="mx-auto size-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm">
            <Sparkles className="size-4.5" />
          </div>
        )}

        <button 
          onClick={onToggleCollapse}
          className="size-7 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 flex items-center justify-center transition-colors ml-auto cursor-pointer"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
        </button>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            {!isCollapsed && (
              <div className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                {section.title}
              </div>
            )}
            {section.items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold tracking-tight transition-all duration-150 group cursor-pointer ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 shadow-2xs border border-blue-200/80'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
                    } ${isCollapsed ? 'justify-center px-2' : ''}`
                  }
                  title={isCollapsed ? item.label : undefined}
                >
                  {({ isActive }) => (
                    <>
                      <Icon className={`size-4.5 shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-blue-600' : 'text-slate-500 group-hover:text-slate-900'}`} />
                      
                      {!isCollapsed && (
                        <span className="truncate flex-1">{item.label}</span>
                      )}

                      {!isCollapsed && item.isLive && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
                          <PulseBeacon variant="rose" size="sm" />
                          Live
                        </span>
                      )}

                      {!isCollapsed && !item.isLive && item.badge && (
                        <Badge variant="blue" size="sm">
                          {item.badge}
                        </Badge>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </div>

      {/* User Progress Footer Profile */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50">
        {!isCollapsed ? (
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="size-8 rounded-full bg-blue-600 text-white font-extrabold flex items-center justify-center text-xs shrink-0 shadow-xs">
                KP
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-extrabold text-slate-900 truncate">Krish Patel</span>
                <span className="text-[10px] font-mono text-slate-500 font-semibold truncate flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-emerald-500 inline-block"></span>
                  CEFR B2+ (Fluent)
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-amber-600 text-[11px] font-mono font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 shrink-0" title="12-Day Active Speaking Streak">
              <Flame className="size-3.5 fill-amber-500" /> 12d
            </div>
          </div>
        ) : (
          <div className="size-9 mx-auto rounded-full bg-blue-600 text-white font-extrabold flex items-center justify-center text-xs shadow-xs" title="Krish Patel (CEFR B2+)">
            KP
          </div>
        )}
      </div>
    </aside>
  );
};
