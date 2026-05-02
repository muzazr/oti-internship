import { LoginBrandingPanel } from "@/components/guru/login-branding-panel";
import { LoginForm } from "@/components/guru/login-form";

export const metadata = {
  title: "Login Guru - MitBridge",
  description: "Sign in to your MitBridge Teacher Dashboard",
};

export default function LoginGuruPage() {
  return (
    <main className="flex min-h-screen w-full">
      {/* Left Panel - Branding */}
      <LoginBrandingPanel />

      {/* Right Panel - Login Form */}
      <div className="relative flex-1 flex items-center justify-center bg-[#FAF8FF] overflow-hidden px-4 py-8 lg:px-0 lg:py-0">
        {/* Decorative Circles */}
        <div className="hidden sm:block absolute -top-[130px] -right-[50px] w-[629px] h-[540px] rounded-full bg-[#F4F6FF]" />
        <div className="hidden sm:block absolute -bottom-[200px] -left-[100px] w-[600px] h-[600px] rounded-full bg-[#FFF7F4]" />

        {/* Login Card */}
        <div className="relative z-10 w-full max-w-[440px]">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
