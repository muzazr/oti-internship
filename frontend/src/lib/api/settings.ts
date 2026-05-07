import { supabase } from "@/lib/supabase";

// Types
export interface ProfileData {
  id: string;
  full_name: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  avatar_url: string | null;
  phone_number: string | null;
  role: string;
  web_notifications: boolean;
  whatsapp_notifications: boolean;
}

export interface UpdateProfilePayload {
  first_name: string;
  last_name: string;
}

export interface UpdateNotificationPayload {
  web_notifications?: boolean;
  whatsapp_notifications?: boolean;
}

// Helper to get current session
async function getSession() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");
  return session;
}

/**
 * Fetch the current user's profile data for settings page
 */
export async function fetchProfile(): Promise<ProfileData> {
  const session = await getSession();
  const userId = session.user.id;

  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, full_name, first_name, last_name, email, avatar_url, phone_number, role, web_notifications, whatsapp_notifications"
    )
    .eq("id", userId)
    .single();

  if (error) throw new Error(error.message);

  // If email is not stored in profiles, get it from auth
  if (!data.email) {
    data.email = session.user.email || null;
  }

  // If first_name/last_name not set, derive from full_name
  if (!data.first_name && data.full_name) {
    const parts = data.full_name.split(" ");
    data.first_name = parts[0] || "";
    data.last_name = parts.slice(1).join(" ") || "";
  }

  return data as ProfileData;
}

/**
 * Update profile information (first name, last name)
 * Also updates full_name for backward compatibility
 */
export async function updateProfile(
  payload: UpdateProfilePayload
): Promise<ProfileData> {
  const session = await getSession();
  const userId = session.user.id;

  const fullName = `${payload.first_name} ${payload.last_name}`.trim();

  const { data, error } = await supabase
    .from("profiles")
    .update({
      first_name: payload.first_name,
      last_name: payload.last_name,
      full_name: fullName,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select(
      "id, full_name, first_name, last_name, email, avatar_url, phone_number, role, web_notifications, whatsapp_notifications"
    )
    .single();

  if (error) throw new Error(error.message);
  return data as ProfileData;
}

/**
 * Update teacher's WhatsApp phone number
 */
export async function updatePhoneNumber(
  phoneNumber: string | null
): Promise<void> {
  const session = await getSession();
  const userId = session.user.id;

  const { error } = await supabase
    .from("profiles")
    .update({
      phone_number: phoneNumber,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) throw new Error(error.message);
}

/**
 * Update notification preferences
 */
export async function updateNotificationSettings(
  payload: UpdateNotificationPayload
): Promise<void> {
  const session = await getSession();
  const userId = session.user.id;

  const { error } = await supabase
    .from("profiles")
    .update({
      ...payload,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) throw new Error(error.message);
}

/**
 * Upload avatar image to Supabase Storage
 * Returns the public URL of the uploaded avatar
 */
export async function uploadAvatar(file: File): Promise<string> {
  const session = await getSession();
  const userId = session.user.id;

  // Validate file
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error("File size exceeds 5MB limit");
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    throw new Error("File type not supported. Use JPG, PNG, GIF, or WebP.");
  }

  // Generate unique filename
  const ext = file.name.split(".").pop() || "jpg";
  const fileName = `${userId}/avatar-${Date.now()}.${ext}`;

  // Delete old avatar if exists
  const { data: existingFiles } = await supabase.storage
    .from("avatars")
    .list(userId);

  if (existingFiles && existingFiles.length > 0) {
    const filesToDelete = existingFiles.map((f) => `${userId}/${f.name}`);
    await supabase.storage.from("avatars").remove(filesToDelete);
  }

  // Upload new avatar
  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(fileName, file, {
      contentType: file.type,
      upsert: true,
    });

  if (uploadError) throw new Error(uploadError.message);

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(fileName);

  // Update profile with new avatar URL
  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      avatar_url: publicUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (updateError) throw new Error(updateError.message);

  return publicUrl;
}

/**
 * Update password using Supabase Auth
 * Note: Supabase doesn't have a "verify current password" API,
 * so we re-authenticate first to verify the current password
 */
export async function updatePassword(
  currentPassword: string,
  newPassword: string
): Promise<void> {
  const session = await getSession();
  const email = session.user.email;

  if (!email) {
    throw new Error("Email not found in session");
  }

  // Verify current password by re-authenticating
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password: currentPassword,
  });

  if (signInError) {
    throw new Error("Password saat ini salah");
  }

  // Update to new password
  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (updateError) {
    throw new Error(updateError.message);
  }
}
