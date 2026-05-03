import { RegisterBrandingPanel } from "@/components/guru/register-branding-panel";
import { RegisterForm } from "@/components/guru/register-form";
import { AuthNavbar } from "@/components/guru/auth-navbar";

export const metadata = {
  title: "Register Guru - MitBridge",
  description: "Create your MitBridge Teacher account",
};

export default function RegisterGuruPage() {
  return (
    <>
      {/* Mobile/Tablet Navbar — hidden on desktop where branding panel shows */}
      <AuthNavbar />

      <main className="flex min-h-screen w-full pt-[52px] lg:pt-0">
        {/* Left Panel - Branding */}
        <RegisterBrandingPanel />

        {/* Right Panel - Register Form */}
        <div className="relative flex-1 flex items-center justify-center bg-[#FAF8FF] overflow-hidden px-4 py-8 lg:px-0 lg:py-0">
          {/* Decorative Circles */}
          <div className="hidden sm:block absolute -top-[130px] -right-[50px] w-[629px] h-[540px] rounded-full bg-[#F4F6FF]" />
          <div className="hidden sm:block absolute -bottom-[200px] -left-[100px] w-[600px] h-[600px] rounded-full bg-[#FFF7F4]" />

          {/* Register Card */}
          <div className="relative z-10 w-full max-w-[440px]">
            <RegisterForm />
          </div>
        </div>
      </main>
    </>
  );
}
