import Image from "next/image";
import { GraduationCap, ShieldCheck } from "lucide-react";

export function LoginBrandingPanel() {
  return (
    <div className="relative hidden lg:flex w-[720px] min-h-screen  overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/images/login-bg.jpg"
          alt="Classroom background"
          fill
          className="object-cover  z-10"
          priority
        />
       
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 flex flex-col justify-between p-12 w-full">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <GraduationCap className="w-8 h-8 text-white" />
          <span className="text-[30px] font-bold text-white leading-tight">
            MitBridge
          </span>
        </div>

        {/* Main Text */}
        <div className="flex flex-col gap-6">
          <h1 className="text-[36px] font-bold text-white leading-[1.26]">
            Welcome back to your classroom
          </h1>
          <p className="text-[18px] font-normal text-[#DBE1FF] leading-[1.26]">
            Sign in to manage your classes, review student analytics, and create
            an engaging learning environment.
          </p>
        </div>

        {/* Secure Badge */}
        <div className="flex items-center gap-4">
          <ShieldCheck className="w-5 h-5 text-[#DBE1FF]" />
          <span className="text-[12px] font-medium text-[#DBE1FF]">
            Secure Teacher Portal
          </span>
        </div>
      </div>
    </div>
  );
}
