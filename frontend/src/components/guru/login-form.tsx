"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ExternalLink,
  CheckCircle,
} from "lucide-react";
import { loginSchema, type LoginFormValues } from "@/lib/schemas/login";
import { supabase } from "@/lib/supabase";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isRegistered = searchParams.get("registered") === "true";

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      // 1. Sign in with Supabase Auth
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        if (error.message === "Invalid login credentials") {
          setErrorMessage("Email atau password salah.");
        } else if (error.message === "Email not confirmed") {
          setErrorMessage(
            "Email belum diverifikasi. Silakan cek inbox email Anda dan klik link verifikasi."
          );
        } else {
          setErrorMessage(error.message);
        }
        return;
      }

      const accessToken = authData.session?.access_token;

      if (!accessToken) {
        setErrorMessage("Gagal mendapatkan token. Silakan coba lagi.");
        return;
      }

      // 2. Ensure profile exists (fire-and-forget, don't block login)
      // This creates the profile if it doesn't exist yet
      try {
        await fetch(`${API_URL}/auth/register`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            full_name:
              authData.user?.user_metadata?.full_name ||
              data.email.split("@")[0],
          }),
        });
      } catch {
        // Profile creation failed silently — user can still access dashboard
        // The backend will handle this on subsequent requests
        console.warn("Profile sync failed, continuing to dashboard");
      }

      // 3. Always redirect to dashboard after successful auth
      router.push("/guru/dashboard");
    } catch {
      setErrorMessage("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full bg-white rounded-[12px] border border-[#C3C6D7] p-6 sm:p-10 shadow-sm">
      {/* Registration Success Banner */}
      {isRegistered && (
        <div className="mb-4 p-3 bg-[#d6ffd7] rounded-[8px] flex items-start gap-2">
          <CheckCircle className="w-5 h-5 text-[#15803d] shrink-0 mt-0.5" />
          <p className="text-[13px] text-[#15803d]">
            Registrasi berhasil! Silakan cek email Anda dan verifikasi akun
            sebelum login.
          </p>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-1 mb-6">
        <h2 className="text-[24px] font-bold text-[#191B23]">Welcome Back</h2>
        <p className="text-[14px] font-medium text-[#434655]">
          Sign in to your Teacher Dashboard
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
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

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              {...register("rememberMe")}
              className="w-5 h-5 rounded-[4px] border border-[#C3C6D7] bg-[#FAF8FF] accent-[#004AC6] cursor-pointer"
            />
            <span className="text-[14px] font-medium text-[#434655]">
              Remember Me
            </span>
          </label>
          <a
            href="/guru/forgot-password"
            className="text-[14px] font-medium text-[#004AC6] hover:underline transition-all"
          >
            Forgot Password?
          </a>
        </div>

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
              Masuk ke Dashboard
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>

      {/* Divider & Sign Up Link */}
      <div className="mt-6 pt-5 border-t border-[#C3C6D7] flex items-center justify-center">
        <p className="text-[14px] font-medium text-[#434655]">
          Belum punya akun?{" "}
          <a
            href="/guru/register"
            className="text-[#9D4300] hover:underline inline-flex items-center gap-1 transition-all"
          >
            Sign Up
            <ExternalLink className="w-4 h-4" />
          </a>
        </p>
      </div>
    </div>
  );
}
