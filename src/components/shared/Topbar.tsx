import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { Menu, Search, Bell, Sparkles, LogOut, ChevronDown, CheckCircle2 } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';

export interface TopbarProps {
  onToggleSidebar: () => void;
  onOpenCommandPalette: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onToggleSidebar, onOpenCommandPalette }) => {
  const { user, role, logout } = useAuth();
  const { notifications, unreadCount, markAllAsRead, markAsRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-soft-sm">
      {/* Left: Mobile Toggle & Quick Search */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar (Trigger for Command Palette) */}
        <button
          onClick={onOpenCommandPalette}
          className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50/80 text-xs text-slate-500 hover:bg-slate-100 hover:border-slate-300 transition-colors w-72 md:w-84 cursor-pointer"
        >
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <span className="truncate">Search students, drives, skills, labs...</span>
          <kbd className="ml-auto px-1.5 py-0.5 text-[10px] font-mono bg-white border border-slate-200 rounded text-slate-500 shadow-soft-sm">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Notification Center & User Profile */}
      <div className="flex items-center gap-3">
        {/* Scope Pill Badge */}
        <Badge variant="primary" size="sm" className="hidden md:inline-flex">
          <Sparkles className="w-3 h-3 text-brand-600" />
          <span className="font-semibold text-[11px]">{user?.roleTitle}</span>
        </Badge>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="p-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Notifications</h4>
                  <p className="text-[10px] text-slate-500">{unreadCount} unread alerts</p>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[11px] text-brand-600 hover:text-brand-800 font-semibold cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <p className="p-6 text-center text-xs text-slate-400">No notifications</p>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      onClick={() => {
                        markAsRead(n.id);
                        if (n.actionUrl) {
                          navigate(n.actionUrl);
                          setShowNotifications(false);
                        }
                      }}
                      className={clsx(
                        'p-3 text-xs transition-colors hover:bg-slate-50 cursor-pointer',
                        !n.read && 'bg-brand-50/40'
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-slate-900">{n.title}</p>
                        <span className="text-[10px] text-slate-400 shrink-0">{n.timestamp}</span>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-600 leading-relaxed">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Avatar Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center uppercase ring-2 ring-brand-500/20 shrink-0">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-slate-900 leading-none">{user?.name}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">{user?.roleTitle.split(' ')[0]}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {/* User Menu Dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden z-50 animate-in fade-in duration-150">
              <div className="p-3 bg-slate-50 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                <span className="mt-1 inline-block text-[10px] px-1.5 py-0.5 bg-brand-100 text-brand-800 rounded font-mono font-bold">
                  {user?.role}
                </span>
              </div>
              <div className="p-1">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" /> Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
