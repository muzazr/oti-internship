"use client";

import { useEffect, useState } from "react";
import { X, Bell, Clock, FileText } from "lucide-react";
import {
  fetchNotifications,
  markAllAsRead,
  formatRelativeTime,
  type Notification,
} from "@/lib/api/notifications";

interface NotificationPanelProps {
  onClose: () => void;
}

export function NotificationPanel({ onClose }: NotificationPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications() {
    try {
      const data = await fetchNotifications(20);
      setNotifications(data);
    } catch (error) {
      console.warn("Failed to load notifications:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleMarkAllRead() {
    try {
      await markAllAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true }))
      );
    } catch (error) {
      console.warn("Failed to mark all as read:", error);
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "submission":
        return (
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E8EEFF]">
            <FileText className="h-5 w-5 text-[#2563EB]" />
          </div>
        );
      case "assignment":
        return (
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E8EEFF]">
            <FileText className="h-5 w-5 text-[#2563EB]" />
          </div>
        );
      case "class":
        return (
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E8EEFF]">
            <FileText className="h-5 w-5 text-[#2563EB]" />
          </div>
        );
      default:
        return (
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E8EEFF]">
            <FileText className="h-5 w-5 text-[#2563EB]" />
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-x-3 top-16 z-50 rounded-xl bg-white shadow-lg border border-[#F3F4F6] sm:absolute sm:inset-auto sm:right-0 sm:top-12 sm:w-[360px]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#F3F4F6]">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-[#424654]" />
          <h3 className="text-lg font-medium text-[#191B23]">Notifications</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-[#6B7280] hover:text-[#191B23] transition-colors"
          aria-label="Close notifications"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Notification List */}
      <div className="max-h-[360px] overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-[#8C8D91] animate-pulse">
              Memuat notifikasi...
            </p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 px-5">
            <Bell className="h-10 w-10 text-[#D1D5DB] mb-2" />
            <p className="text-sm text-[#8C8D91]">Belum ada notifikasi</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`flex items-start gap-3 px-5 py-4 border-b border-[#F9FAFB] transition-colors hover:bg-[#F9FAFB] ${
                !notification.is_read ? "bg-[#F7FAFF]" : ""
              }`}
            >
              {getNotificationIcon(notification.type)}
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm leading-tight ${
                    !notification.is_read
                      ? "font-medium text-[#191B23]"
                      : "text-[#424654]"
                  }`}
                >
                  {notification.title}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <Clock className="h-3.5 w-3.5 text-[#9CA3AF]" />
                  <span className="text-xs text-[#9CA3AF]">
                    {formatRelativeTime(notification.created_at)}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="flex items-center justify-center px-5 py-3 border-t border-[#F3F4F6]">
          <button
            onClick={handleMarkAllRead}
            className="text-xs font-bold text-[#2563EB] hover:text-[#1D4ED8] transition-colors"
          >
            Mark all as read
          </button>
        </div>
      )}
    </div>
  );
}
