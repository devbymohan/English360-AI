import React, { useState, useEffect, useRef } from 'react';
import { Flame, Bell, ChevronDown, Menu, CheckCheck, Check, Sparkles, BookOpen, Award, BellOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../common/Avatar';
import { Dropdown } from '../common/Dropdown';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '../../services/notificationService';

export const Header = ({ onOpenMobileMenu }) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    loadNotifications();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await notificationService.getNotifications();
      if (data) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (e) {
      console.warn('[Header] Load notifications notice:', e.message);
    }
  };

  const handleToggleNotifications = () => {
    setIsNotifOpen((prev) => !prev);
    if (!isNotifOpen) {
      loadNotifications();
    }
  };

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.warn('[Header] Mark read error:', err.message);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.warn('[Header] Mark all read error:', err.message);
    }
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case 'assessment':
        return <Award className="w-4 h-4 text-amber-500" />;
      case 'grammar':
        return <BookOpen className="w-4 h-4 text-brand-600" />;
      case 'vocabulary':
        return <Sparkles className="w-4 h-4 text-purple-500" />;
      default:
        return <Bell className="w-4 h-4 text-slate-500" />;
    }
  };

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return 'Just now';
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <header className="h-16 sm:h-20 bg-transparent px-3 sm:px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Mobile Hamburger */}
      <button
        onClick={onOpenMobileMenu}
        className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 transition"
        title="Open navigation menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="hidden lg:block">
        {/* Can host page-specific breadcrumbs or greetings */}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3.5 ml-auto">
        {/* Streak Badge */}
        <div className="flex items-center gap-1.5 sm:gap-2 bg-white px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-2xl border border-slate-100 shadow-sm">
          <div className="w-6 h-6 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
            <Flame className="w-4 h-4 fill-orange-500 text-orange-500" />
          </div>
          <span className="text-xs font-extrabold text-slate-800 tracking-tight">
            {currentUser?.streak ?? 0}{' '}
            <span className="font-semibold text-slate-500 text-[11px] hidden sm:inline">Day Streak</span>
          </span>
        </div>

        {/* Notifications Bell Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={handleToggleNotifications}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-slate-600 hover:text-slate-900 transition relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center shadow-sm animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-96 max-w-sm bg-white rounded-2xl shadow-elevated border border-slate-100 py-3 px-4 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-slate-900">Notifications</h4>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-[11px] font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 transition"
                  >
                    <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-50 mt-1">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center space-y-2">
                    <BellOff className="w-7 h-7 text-slate-300 mx-auto" />
                    <p className="text-xs font-bold text-slate-600">No new notifications</p>
                    <p className="text-[10px] text-slate-400">
                      You'll receive notifications here when you complete exercises and reach milestones.
                    </p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif._id}
                      className={`py-2.5 px-1.5 flex items-start gap-3 rounded-xl transition ${
                        !notif.read ? 'bg-indigo-50/40' : 'hover:bg-slate-50/70'
                      }`}
                    >
                      <div className="w-7 h-7 rounded-xl bg-white border border-slate-100 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                        {getNotifIcon(notif.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h5
                            className={`text-xs truncate ${
                              !notif.read
                                ? 'font-black text-slate-900'
                                : 'font-semibold text-slate-700'
                            }`}
                          >
                            {notif.title}
                          </h5>
                          <span className="text-[9px] text-slate-400 font-semibold shrink-0">
                            {formatTimeAgo(notif.createdAt)}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-snug mt-0.5 line-clamp-2">
                          {notif.message}
                        </p>
                      </div>
                      {!notif.read && (
                        <button
                          onClick={(e) => handleMarkAsRead(notif._id, e)}
                          title="Mark as read"
                          className="text-slate-300 hover:text-brand-600 p-1 shrink-0 transition"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <Dropdown
          trigger={
            <div className="flex items-center gap-2.5 bg-white pl-1.5 pr-3 py-1.5 rounded-2xl border border-slate-100 shadow-sm hover:shadow transition">
              <Avatar
                src={currentUser?.avatar}
                fallback={currentUser?.name?.[0]?.toUpperCase() || 'S'}
                size="sm"
              />
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold text-slate-900 leading-tight">
                  {currentUser?.name || 'Student'}
                </p>
                <p className="text-[10px] font-semibold text-slate-400">
                  {currentUser?.level || currentUser?.englishLevel || 'Not Assessed'}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </div>
          }
        >
          <div className="px-4 py-2 border-b border-slate-100">
            <p className="text-xs font-bold text-slate-800">{currentUser?.name}</p>
            <p className="text-[11px] text-slate-400 truncate">{currentUser?.email}</p>
          </div>
          <button
            onClick={() => navigate('/progress')}
            className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            My Progress
          </button>
          <button
            onClick={() => navigate('/settings')}
            className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            Account Settings
          </button>
          <button
            onClick={logout}
            className="w-full text-left px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition"
          >
            Sign Out
          </button>
        </Dropdown>
      </div>
    </header>
  );
};
