"use client";

import { Search, Bell, HelpCircle, Settings, Menu } from "lucide-react";
import Image from "next/image";

interface HeaderProps {
  userName?: string;
  userRole?: string;
  searchPlaceholder?: string;
  onMenuClick?: () => void;
}

export function Header({
  userName = "Pak Yosef",
  userRole = "Guru Matematika",
  searchPlaceholder = "Cari siswa atau tugas...",
  onMenuClick,
}: HeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-[#F3F4F6] bg-white px-4 lg:px-8">
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
        <div className="hidden w-96 items-center gap-2 rounded-full border border-[#EDEDF3] bg-[#F3F3FE] px-4 py-1.5 sm:flex">
          <Search className="h-5 w-5 flex-shrink-0 text-[#424654]" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            aria-label="Search"
            className="flex-1 bg-transparent text-sm font-medium text-[#191B23] placeholder:text-[#8C8D91] outline-none"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4 lg:gap-6">
        {/* Icon Buttons */}
        <div className="flex items-center gap-3 lg:gap-4">
          <button
            className="relative p-1 text-[#424654] transition-colors hover:text-[#191B23]"
            aria-label="Notifications"
          >
            <Bell className="h-6 w-6" />
            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full border-2 border-white bg-[#BA1A1A]" />
          </button>

          <button
            className="hidden p-1 text-[#424654] transition-colors hover:text-[#191B23] sm:block"
            aria-label="Help"
          >
            <HelpCircle className="h-6 w-6" />
          </button>

          <button
            className="hidden p-1 text-[#424654] transition-colors hover:text-[#191B23] sm:block"
            aria-label="Settings"
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
              src="https://i.pravatar.cc/80?img=12"
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
