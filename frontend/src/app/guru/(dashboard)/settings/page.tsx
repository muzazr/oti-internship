"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Camera } from "lucide-react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import {
  fetchProfile,
  updateProfile,
  updatePassword,
  updateNotificationSettings,
  uploadAvatar,
} from "@/lib/api/settings";
import { SuccessModal } from "@/components/guru/settings/success-modal";

export default function SettingsPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile state
  const [isLoading, setIsLoading] = useState(true);

  // Form state - Profile
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Form state - Password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Notification state
  const [webNotifications, setWebNotifications] = useState(true);
  const [whatsappNotifications, setWhatsappNotifications] = useState(false);

  // Modal state
  const [showProfileSuccess, setShowProfileSuccess] = useState(false);
  const [showPasswordSuccess, setShowPasswordSuccess] = useState(false);

  // Avatar upload state
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Load profile data
  useEffect(() => {
    async function loadProfile() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/guru/login");
        return;
      }

      try {
        const data = await fetchProfile();
        setFirstName(data.first_name || "");
        setLastName(data.last_name || "");
        setEmail(data.email || session.user.email || "");
        setAvatarUrl(data.avatar_url);
        setWebNotifications(data.web_notifications);
        setWhatsappNotifications(data.whatsapp_notifications);
      } catch (error) {
        console.warn("Failed to load profile:", error);
        // Fallback: use auth data
        setEmail(session.user.email || "");
        const fullName =
          session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "";
        const parts = fullName.split(" ");
        setFirstName(parts[0] || "");
        setLastName(parts.slice(1).join(" ") || "");
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, [router]);

  // Handle profile save
  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    setProfileError(null);

    try {
      if (!firstName.trim()) {
        setProfileError("First Name wajib diisi");
        return;
      }

      await updateProfile({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
      });

      setShowProfileSuccess(true);
    } catch (error) {
      setProfileError(
        error instanceof Error ? error.message : "Gagal menyimpan profil"
      );
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Handle password update
  const handleUpdatePassword = async () => {
    setIsSavingPassword(true);
    setPasswordError(null);

    try {
      if (!currentPassword) {
        setPasswordError("Password saat ini wajib diisi");
        return;
      }
      if (!newPassword) {
        setPasswordError("Password baru wajib diisi");
        return;
      }
      if (newPassword.length < 6) {
        setPasswordError("Password baru minimal 6 karakter");
        return;
      }
      if (newPassword !== confirmPassword) {
        setPasswordError("Konfirmasi password tidak cocok");
        return;
      }

      await updatePassword(currentPassword, newPassword);

      // Clear form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordSuccess(true);
    } catch (error) {
      setPasswordError(
        error instanceof Error ? error.message : "Gagal mengubah password"
      );
    } finally {
      setIsSavingPassword(false);
    }
  };

  // Handle notification toggle
  const handleWebNotificationToggle = async () => {
    const newValue = !webNotifications;
    setWebNotifications(newValue);
    try {
      await updateNotificationSettings({ web_notifications: newValue });
    } catch (error) {
      // Revert on failure
      setWebNotifications(!newValue);
      console.warn("Failed to update notification settings:", error);
    }
  };

  const handleWhatsappNotificationToggle = async () => {
    const newValue = !whatsappNotifications;
    setWhatsappNotifications(newValue);
    try {
      await updateNotificationSettings({ whatsapp_notifications: newValue });
    } catch (error) {
      // Revert on failure
      setWhatsappNotifications(!newValue);
      console.warn("Failed to update notification settings:", error);
    }
  };

  // Handle avatar upload
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    try {
      const url = await uploadAvatar(file);
      setAvatarUrl(url);
    } catch (error) {
      setProfileError(
        error instanceof Error ? error.message : "Gagal upload avatar"
      );
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-pulse text-base text-[#434655]">
          Memuat pengaturan...
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-[30px] font-bold text-[#191B23]">Settings</h1>
        <p className="text-base text-[#434655]">
          Manage your account preferences and personal information.
        </p>
      </div>

      {/* Content Grid */}
      <div className="flex flex-col gap-6 xl:flex-row xl:gap-6">
        {/* Left Column: Profile + Security */}
        <div className="flex flex-1 flex-col gap-6">
          {/* Profile Information Section */}
          <section className="rounded-xl border border-[#E5E7EB] bg-white p-6">
            {/* Section Header */}
            <div className="flex flex-col gap-1 mb-4">
              <h2 className="text-xl font-bold text-[#191B23]">
                Profile Information
              </h2>
              <p className="text-sm font-medium text-[#6B7280]">
                Update your personal details and public profile.
              </p>
            </div>

            {/* Divider */}
            <div className="border-t border-[#F3F4F6] mb-6" />

            {/* Avatar Section */}
            <div className="flex items-center gap-4 mb-6">
              <div className="relative h-20 w-20 overflow-hidden rounded-full bg-[#E1E2ED]">
                <Image
                  src={avatarUrl || "https://i.pravatar.cc/160?img=12"}
                  alt="Avatar"
                  fill
                  className="object-cover"
                />
                {isUploadingAvatar && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <button
                  onClick={handleAvatarClick}
                  disabled={isUploadingAvatar}
                  className="flex items-center gap-2 rounded-lg border border-[#E5E7EB] px-4 py-2 text-sm font-medium text-[#2563EB] hover:bg-[#F7FAFF] transition-colors disabled:opacity-50"
                >
                  <Camera className="h-4 w-4" />
                  Change Avatar
                </button>
                <p className="text-sm font-medium text-[#9CA3AF]">
                  JPG, GIF or PNG. Max size of 2MB.
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#191B23]">
                  First Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                  className="h-[48px] w-full rounded-lg border border-[#E5E7EB] bg-white px-4 text-base text-[#191B23] placeholder:text-[#9CA3AF] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 transition-all"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#191B23]">
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last name"
                  className="h-[48px] w-full rounded-lg border border-[#E5E7EB] bg-white px-4 text-base text-[#191B23] placeholder:text-[#9CA3AF] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 transition-all"
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="flex flex-col gap-1.5 mb-6">
              <label className="text-xs font-bold text-[#191B23]">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                disabled
                className="h-[48px] w-full rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-4 text-base text-[#6B7280] outline-none cursor-not-allowed"
              />
            </div>

            {/* Error */}
            {profileError && (
              <div className="mb-4 rounded-lg bg-[#FFDAD6] px-4 py-2.5 text-sm text-[#93000A]">
                {profileError}
              </div>
            )}

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                onClick={handleSaveProfile}
                disabled={isSavingProfile}
                className="h-[44px] rounded-lg bg-[#2563EB] px-6 text-base font-medium text-white hover:bg-[#1D4ED8] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {isSavingProfile ? "Menyimpan..." : "Save Changes"}
              </button>
            </div>
          </section>

          {/* Security Section */}
          <section className="rounded-xl border border-[#E5E7EB] bg-white p-6">
            {/* Section Header */}
            <div className="flex flex-col gap-1 mb-4">
              <h2 className="text-xl font-bold text-[#191B23]">Security</h2>
              <p className="text-sm font-medium text-[#6B7280]">
                Ensure your account is using a long, random password to stay
                secure.
              </p>
            </div>

            {/* Divider */}
            <div className="border-t border-[#F3F4F6] mb-6" />

            {/* Current Password */}
            <div className="flex flex-col gap-1.5 mb-4 max-w-md">
              <label className="text-xs font-bold text-[#191B23]">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-[48px] w-full rounded-lg border border-[#E5E7EB] bg-white px-4 pr-12 text-base text-[#191B23] placeholder:text-[#9CA3AF] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#9CA3AF] hover:text-[#6B7280]"
                >
                  {showCurrentPassword ? (
                    <Eye className="h-5 w-5" />
                  ) : (
                    <EyeOff className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="flex flex-col gap-1.5 mb-4 max-w-md">
              <label className="text-xs font-bold text-[#191B23]">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder=""
                  className="h-[48px] w-full rounded-lg border border-[#E5E7EB] bg-white px-4 pr-12 text-base text-[#191B23] placeholder:text-[#9CA3AF] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#9CA3AF] hover:text-[#6B7280]"
                >
                  {showNewPassword ? (
                    <Eye className="h-5 w-5" />
                  ) : (
                    <EyeOff className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="flex flex-col gap-1.5 mb-6 max-w-md">
              <label className="text-xs font-bold text-[#191B23]">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder=""
                  className="h-[48px] w-full rounded-lg border border-[#E5E7EB] bg-white px-4 pr-12 text-base text-[#191B23] placeholder:text-[#9CA3AF] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#9CA3AF] hover:text-[#6B7280]"
                >
                  {showConfirmPassword ? (
                    <Eye className="h-5 w-5" />
                  ) : (
                    <EyeOff className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {passwordError && (
              <div className="mb-4 rounded-lg bg-[#FFDAD6] px-4 py-2.5 text-sm text-[#93000A]">
                {passwordError}
              </div>
            )}

            {/* Update Password Button */}
            <div className="flex justify-start">
              <button
                onClick={handleUpdatePassword}
                disabled={isSavingPassword}
                className="h-[44px] rounded-lg border border-[#E5E7EB] bg-white px-6 text-base font-medium text-[#191B23] hover:bg-[#F9FAFB] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {isSavingPassword ? "Memproses..." : "Update Password"}
              </button>
            </div>
          </section>
        </div>

        {/* Right Column: Notifications */}
        <div className="w-full xl:w-[320px]">
          <section className="rounded-xl border border-[#E5E7EB] bg-white p-6">
            {/* Section Header */}
            <div className="flex flex-col gap-1 mb-4">
              <h2 className="text-xl font-bold text-[#191B23]">
                Notifications
              </h2>
            </div>

            {/* Web App Notifications */}
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex flex-col gap-0.5">
                <p className="text-base font-medium text-[#191B23]">
                  Web App Notifications
                </p>
                <p className="text-sm font-medium text-[#6B7280]">
                  Notifications within the browser dashboard
                </p>
              </div>
              {/* Toggle Switch */}
              <button
                onClick={handleWebNotificationToggle}
                className={`relative flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${
                  webNotifications ? "bg-[#2563EB]" : "bg-[#D1D5DB]"
                }`}
                role="switch"
                aria-checked={webNotifications}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
                    webNotifications ? "translate-x-[22px]" : "translate-x-[2px]"
                  }`}
                />
              </button>
            </div>

            {/* Divider */}
            <div className="border-t border-[#F3F4F6] my-4" />

            {/* WhatsApp Notifications */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {/* WhatsApp Icon */}
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#25D366]">
                    <svg
                      className="h-5 w-5 text-white"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <p className="text-xs font-medium text-[#191B23]">
                      WhatsApp Notifications
                    </p>
                    <p className="text-[10px] text-[#9CA3AF]">
                      Instant Updates
                    </p>
                  </div>
                </div>
                {/* Toggle Switch */}
                <button
                  onClick={handleWhatsappNotificationToggle}
                  className={`relative flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${
                    whatsappNotifications ? "bg-[#2563EB]" : "bg-[#D1D5DB]"
                  }`}
                  role="switch"
                  aria-checked={whatsappNotifications}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
                      whatsappNotifications
                        ? "translate-x-[22px]"
                        : "translate-x-[2px]"
                    }`}
                  />
                </button>
              </div>

              <p className="text-[10px] text-[#6B7280] leading-relaxed">
                Enable WhatsApp notifications to receive real-time class schedule
                changes and urgent grading reminders directly to your mobile
                device.
              </p>
            </div>
          </section>
        </div>
      </div>

      {/* Success Modals */}
      <SuccessModal
        isOpen={showProfileSuccess}
        title="Profile Information Berhasil Disimpan"
        onClose={() => setShowProfileSuccess(false)}
      />
      <SuccessModal
        isOpen={showPasswordSuccess}
        title="Password Berhasil di Update"
        onClose={() => setShowPasswordSuccess(false)}
      />
    </div>
  );
}
