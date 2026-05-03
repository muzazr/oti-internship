"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Search, Bell, HelpCircle, Settings, Menu } from "lucide-react";
import Image from "next/image";
import { NotificationPanel } from "./notification-panel";

interface HeaderProps {
  userName?: string;
  userRole?: string;
  avatarUrl?: string;
  searchPlaceholder?: string;
  unreadCount?: number;
  onMenuClick?: () => void;
  onSearch?: (query: string) => void;
}

const SEARCH_PLACEHOLDERS: Record<string, string> = {
  "/guru/dashboard": "Cari siswa atau tugas...",
  "/guru/classes": "Cari kelas...",
  "/guru/submissions": "Cari submission...",
  "/guru/analytics": "Cari data analytics...",
  "/guru/settings": "Cari pengaturan...",
};

export function Header({
  userName = "Guru",
  userRole = "Guru",
  avatarUrl,
  searchPlaceholder,
  unreadCount = 0,
  onMenuClick,
  onSearch,
}: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const notificationRef = useRef<HTMLDivElement>(null);

  // Determine search placeholder based on current page
  const placeholder =
    searchPlaceholder ||
    Object.entries(SEARCH_PLACEHOLDERS).find(([path]) =>
      pathname.startsWith(path)
    )?.[1] ||
    "Cari...";

  // Close notification panel when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    }

    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotifications]);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  // Handle help - open WhatsApp
  const handleHelp = () => {
    window.open("https://wa.me/62895397306279", "_blank");
  };

  // Handle settings navigation
  const handleSettings = () => {
    router.push("/guru/settings");
  };

  // Handle notification toggle
  const handleNotificationToggle = () => {
    setShowNotifications((prev) => !prev);
  };

  return (
    <header className="relative flex h-16 items-center justify-between border-b border-[#F3F4F6] bg-white px-4 lg:px-8">
      {/* Left: Hamburger + Search */}
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <button
          onClick={onMenuClick}
          className="rounded-md p-1.5 text-[#424654] hover:bg-gray-100 lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Search Bar */}
        <form
          onSubmit={handleSearch}
          className="hidden w-full max-w-96 items-center gap-2 rounded-full border border-[#EDEDF3] bg-[#F3F3FE] px-4 py-1.5 sm:flex"
        >
          <Search className="h-5 w-5 flex-shrink-0 text-[#424654]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={placeholder}
            aria-label="Search"
            className="flex-1 bg-transparent text-sm font-medium text-[#191B23] placeholder:text-[#8C8D91] outline-none"
          />
        </form>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4 lg:gap-6">
        {/* Icon Buttons */}
        <div className="flex items-center gap-3 lg:gap-4">
          {/* Notifications */}
          <div ref={notificationRef} className="relative">
            <button
              onClick={handleNotificationToggle}
              className="relative p-1 text-[#424654] transition-colors hover:text-[#191B23]"
              aria-label="Notifications"
            >
              <Bell className="h-6 w-6" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#BA1A1A] text-[9px] font-bold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Panel Dropdown */}
            {showNotifications && (
              <NotificationPanel
                onClose={() => setShowNotifications(false)}
              />
            )}
          </div>

          {/* Help */}
          <button
            onClick={handleHelp}
            className="hidden p-1 text-[#424654] transition-colors hover:text-[#191B23] sm:block"
            aria-label="Help"
            title="Hubungi Tim Teknis via WhatsApp"
          >
            <HelpCircle className="h-6 w-6" />
          </button>

          {/* Settings */}
          <button
            onClick={handleSettings}
            className="hidden p-1 text-[#424654] transition-colors hover:text-[#191B23] sm:block"
            aria-label="Settings"
            title="Pengaturan"
          >
            <Settings className="h-6 w-6" />
          </button>
        </div>

        {/* Divider + User Profile */}
        <div className="flex items-center gap-3 border-l border-[#F3F4F6] pl-4 lg:pl-6">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-bold text-[#191B23]">{userName}</p>
            <p className="text-xs font-medium text-[#565F6B]">{userRole}</p>
          </div>
          <div className="relative h-10 w-10 overflow-hidden rounded-full bg-[#E1E2ED]">
            <Image
              src={avatarUrl || "https://i.pravatar.cc/80?img=12"}
              alt={userName}
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
