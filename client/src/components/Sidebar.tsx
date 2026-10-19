import React from 'react';
import { NavLink } from 'react-router-dom';
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
  Bot
} from 'lucide-react';
import { Badge } from './ui';

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
        { label: 'Live Conversation', path: '/conversation', icon: Mic, badge: 'Live' },
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
      className={`fixed inset-y-0 left-0 z-30 flex flex-col bg-white border-r border-slate-200 transition-all duration-200 ease-in-out select-none hidden md:flex ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100">
        {!isCollapsed && (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="size-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-base shadow-sm shrink-0">
              <Sparkles className="size-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-slate-900 tracking-tight truncate">MentorVoice</span>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider truncate">English Coach</span>
            </div>
          </div>
        )}

        {isCollapsed && (
          <div className="mx-auto size-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
            <Sparkles className="size-4" />
          </div>
        )}

        <button 
          onClick={onToggleCollapse}
          className="size-7 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors ml-auto"
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
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
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
                    `flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold transition-all group ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-200/60'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    } ${isCollapsed ? 'justify-center px-2' : ''}`
                  }
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon className="size-4 shrink-0" />
                  {!isCollapsed && (
                    <span className="truncate flex-1">{item.label}</span>
                  )}
                  {!isCollapsed && item.badge && (
                    <Badge variant={item.badge === 'Live' ? 'rose' : 'blue'} size="sm">
                      {item.badge}
                    </Badge>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </div>

      {/* User Footer Profile */}
      <div className="p-3 border-t border-slate-100">
        {!isCollapsed ? (
          <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="size-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs shrink-0">
              KP
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-bold text-slate-800 truncate">Krish Patel</span>
              <span className="text-[10px] text-slate-500 font-medium truncate">Intermediate (B2)</span>
            </div>
          </div>
        ) : (
          <div className="size-8 mx-auto rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
            KP
          </div>
        )}
      </div>
    </aside>
  );
};
