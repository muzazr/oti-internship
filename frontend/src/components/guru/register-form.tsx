"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  LogIn,
} from "lucide-react";
import { registerSchema, type RegisterFormValues } from "@/lib/schemas/register";
import { supabase } from "@/lib/supabase";

export function RegisterForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      agreeToTerms: false,
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    setErrorMessage(null);

    // Check if Supabase is properly configured
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_URL === "https://your-project.supabase.co"
    ) {
      setErrorMessage(
        "Supabase belum dikonfigurasi. Silakan atur NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY di file .env.local"
      );
      setIsLoading(false);
      return;
    }

    try {
      // 1. Create auth user in Supabase
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            role: "guru",
          },
        },
      });

      if (signUpError) {
        setErrorMessage(signUpError.message);
        return;
      }

      if (!authData.user) {
        setErrorMessage("Gagal membuat akun. Silakan coba lagi.");
        return;
      }

      // 2. Create profile in profiles table
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({
          id: authData.user.id,
          full_name: data.fullName,
          role: "guru",
        });

      if (profileError) {
        setErrorMessage(
          "Akun berhasil dibuat, tetapi profil gagal disimpan. Silakan hubungi admin."
        );
        return;
      }

      // Redirect to login page with success message
      router.push("/guru/login?registered=true");
    } catch {
      setErrorMessage("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full bg-white rounded-[12px] border border-[#C3C6D7] p-6 sm:p-10 shadow-sm">
      {/* Header */}
      <div className="flex flex-col gap-1 mb-6">
        <h2 className="text-[24px] font-bold text-[#191B23]">Create Account</h2>
        <p className="text-[14px] font-medium text-[#434655]">
          Register as a Teacher on MitBridge
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {/* Full Name Field */}
        <div className="flex flex-col gap-1">
          <label className="text-[12px] font-bold text-[#191B23]">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#737686]" />
            <input
              type="text"
              placeholder="John Doe"
              {...register("fullName")}
              className="w-full h-[50px] pl-10 pr-4 bg-[#FAF8FF] border border-[#C3C6D7] rounded-[8px] text-[16px] text-[#191B23] placeholder:text-[#8C8D91] focus:outline-none focus:ring-2 focus:ring-[#004AC6] focus:border-transparent transition-all"
            />
          </div>
          {errors.fullName && (
            <span className="text-[12px] text-[#BA1A1A]">
              {errors.fullName.message}
            </span>
          )}
        </div>

        {/* Email Field */}
        <div className="flex flex-col gap-1">
          <label className="text-[12px] font-bold text-[#191B23]">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#737686]" />
            <input
              type="email"
              placeholder="teacher@gmail.com"
              {...register("email")}
              className="w-full h-[50px] pl-10 pr-4 bg-[#FAF8FF] border border-[#C3C6D7] rounded-[8px] text-[16px] text-[#191B23] placeholder:text-[#8C8D91] focus:outline-none focus:ring-2 focus:ring-[#004AC6] focus:border-transparent transition-all"
            />
          </div>
          {errors.email && (
            <span className="text-[12px] text-[#BA1A1A]">
              {errors.email.message}
            </span>
          )}
        </div>

        {/* Password Field */}
        <div className="flex flex-col gap-1">
          <label className="text-[12px] font-bold text-[#191B23]">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#737686]" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              {...register("password")}
              className="w-full h-[50px] pl-10 pr-12 bg-[#FAF8FF] border border-[#C3C6D7] rounded-[8px] text-[16px] text-[#191B23] placeholder:text-[#8C8D91] focus:outline-none focus:ring-2 focus:ring-[#004AC6] focus:border-transparent transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-[6px] hover:bg-[#F4F6FF] transition-colors"
            >
              {showPassword ? (
                <Eye className="w-5 h-5 text-[#737686]" />
              ) : (
                <EyeOff className="w-5 h-5 text-[#737686]" />
              )}
            </button>
          </div>
          {errors.password && (
            <span className="text-[12px] text-[#BA1A1A]">
              {errors.password.message}
            </span>
          )}
        </div>

        {/* Confirm Password Field */}
        <div className="flex flex-col gap-1">
          <label className="text-[12px] font-bold text-[#191B23]">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#737686]" />
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              {...register("confirmPassword")}
              className="w-full h-[50px] pl-10 pr-12 bg-[#FAF8FF] border border-[#C3C6D7] rounded-[8px] text-[16px] text-[#191B23] placeholder:text-[#8C8D91] focus:outline-none focus:ring-2 focus:ring-[#004AC6] focus:border-transparent transition-all"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-[6px] hover:bg-[#F4F6FF] transition-colors"
            >
              {showConfirmPassword ? (
                <Eye className="w-5 h-5 text-[#737686]" />
              ) : (
                <EyeOff className="w-5 h-5 text-[#737686]" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <span className="text-[12px] text-[#BA1A1A]">
              {errors.confirmPassword.message}
            </span>
          )}
        </div>

        {/* Terms & Conditions */}
        <label className="flex items-start gap-2 cursor-pointer">
          <input
            type="checkbox"
            {...register("agreeToTerms")}
            className="w-5 h-5 mt-0.5 rounded-[4px] border border-[#C3C6D7] bg-[#FAF8FF] accent-[#004AC6] cursor-pointer shrink-0"
          />
          <span className="text-[14px] font-medium text-[#434655]">
            Saya menyetujui{" "}
            <a
              href="/terms"
              target="_blank"
              className="text-[#004AC6] hover:underline"
            >
              Syarat dan Ketentuan
            </a>{" "}
            serta{" "}
            <a
              href="/privacy"
              target="_blank"
              className="text-[#004AC6] hover:underline"
            >
              Kebijakan Privasi
            </a>
          </span>
        </label>
        {errors.agreeToTerms && (
          <span className="text-[12px] text-[#BA1A1A] -mt-2">
            {errors.agreeToTerms.message}
          </span>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="p-3 bg-[#FFDAD6] rounded-[8px] text-[13px] text-[#93000A]">
            {errorMessage}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-[48px] bg-[#004AC6] hover:bg-[#003EA8] disabled:opacity-60 disabled:cursor-not-allowed rounded-[8px] flex items-center justify-center gap-2 text-[16px] font-medium text-white transition-colors cursor-pointer"
        >
          {isLoading ? (
            <span className="animate-pulse">Memproses...</span>
          ) : (
            <>
              Buat Akun
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>

      {/* Divider & Sign In Link */}
      <div className="mt-6 pt-5 border-t border-[#C3C6D7] flex items-center justify-center">
        <p className="text-[14px] font-medium text-[#434655]">
          Sudah punya akun?{" "}
          <a
            href="/guru/login"
            className="text-[#9D4300] hover:underline inline-flex items-center gap-1 transition-all"
          >
            Sign In
            <LogIn className="w-4 h-4" />
          </a>
        </p>
      </div>
    </div>
  );
}
