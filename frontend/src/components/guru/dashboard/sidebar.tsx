"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  School,
  ClipboardList,
  BarChart3,
  LogOut,
} from "lucide-react";

const navItems = [
  {
    label: "Dashboard",
    href: "/guru/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Classes",
    href: "/guru/classes",
    icon: School,
  },
  {
    label: "Submissions",
    href: "/guru/submissions",
    icon: ClipboardList,
  },
  {
    label: "Analytics",
    href: "/guru/analytics",
    icon: BarChart3,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-[#F3F4F6] bg-white">
      {/* Brand */}
      <div className="flex flex-col gap-1 px-4 pt-6 pb-4">
        <span className="text-xl font-black text-[#2563EB]">MitBridge</span>
        <span className="text-[10px] font-bold text-[#9CA3AF]">
          Educator Portal
        </span>
      </div>

      {/* Navigation */}
      <nav aria-label="Main navigation" className="flex-1 px-4">
        <ul className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition-colors ${
                    isActive
                      ? "border-r-4 border-[#2563EB] bg-[#EFF6FF] font-bold text-[#2563EB]"
                      : "font-medium text-[#6B7280] hover:bg-gray-50"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="border-t border-[#F3F4F6] px-4 py-4">
        <button className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-[#6B7280] transition-colors hover:bg-gray-50">
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
