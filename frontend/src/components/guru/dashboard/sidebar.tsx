"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  School,
  ClipboardList,
  BarChart3,
  LogOut,
  X,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

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

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/guru/login");
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 flex h-screen w-64 flex-col border-r border-[#F3F4F6] bg-white transition-transform duration-200 lg:static lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand + Mobile Close */}
        <div className="flex items-start justify-between px-6 pt-6 pb-2">
          <div className="flex flex-col gap-1">
            <span className="text-xl font-black text-[#2563EB]">MitBridge</span>
            <span className="text-[10px] font-bold text-[#9CA3AF]">
              Educator Portal
            </span>
          </div>
          <button
            onClick={onClose}
            className="mt-1 rounded-md p-1 text-[#6B7280] hover:bg-gray-100 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav aria-label="Main navigation" className="flex-1 px-4 pt-6">
          <ul className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition-colors ${
                      isActive
                        ? "border border-[#2563EB] bg-[#F7FAFF] font-bold text-[#2563EB]"
                        : "font-medium text-[#6B7280] hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout */}
        <div className="border-t border-[#F3F4F6] px-4 py-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-[#6B7280] transition-colors hover:bg-gray-50"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
