import { GraduationCap } from "lucide-react";

/**
 * Responsive navbar for auth pages (login/register).
 * - Visible on mobile/tablet (< lg) where the left branding panel is hidden.
 * - Hidden on desktop (lg+) where the branding panel already shows the logo.
 */
export function AuthNavbar() {
  return (
    <nav className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#C3C6D7]">
      <div className="flex items-center gap-2 px-5 py-3">
        <GraduationCap className="w-7 h-7 text-[#004AC6]" />
        <span className="text-[22px] font-bold text-[#191B23] leading-tight">
          MitBridge
        </span>
      </div>
    </nav>
  );
}
