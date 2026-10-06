"use server";

import { ADMIN_MESSAGES, type AdminActionResult } from "@/lib/adminActionResult";
import { requireAdmin } from "@/lib/supabase/require-admin";
import {
  saveBanner,
  deleteBanner,
  saveAnnouncement,
  deleteAnnouncement,
  saveYoutubeVideo,
  deleteYoutubeVideo,
} from "@/lib/supabase/admin";
import type {
  AdminBanner,
  AnnouncementBarItem,
  YouTubeVideoItem,
} from "@/lib/adminTypes";

// --- Banners ---

export async function adminSaveBanner(
  banner: Partial<AdminBanner>
): Promise<AdminActionResult<AdminBanner>> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.failure;

  const saved = await saveBanner(banner);
  if (!saved) {
    return { success: false, status: 500, error: ADMIN_MESSAGES.failed };
  }
  return { success: true, data: saved };
}

export async function adminDeleteBanner(id: string): Promise<AdminActionResult<undefined>> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.failure;

  const ok = await deleteBanner(id);
  if (!ok) {
    return { success: false, status: 500, error: ADMIN_MESSAGES.failed };
  }
  return { success: true, data: undefined };
}

// --- Announcements ---

export async function adminSaveAnnouncement(
  announcement: Omit<AnnouncementBarItem, "id">
): Promise<AdminActionResult<AnnouncementBarItem>> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.failure;

  const saved = await saveAnnouncement(announcement);
  if (!saved) {
    return { success: false, status: 500, error: ADMIN_MESSAGES.failed };
  }
  return { success: true, data: saved };
}

export async function adminDeleteAnnouncement(id: string): Promise<AdminActionResult<undefined>> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.failure;

  const ok = await deleteAnnouncement(id);
  if (!ok) {
    return { success: false, status: 500, error: ADMIN_MESSAGES.failed };
  }
  return { success: true, data: undefined };
}

// --- YouTube videos ---

export async function adminSaveYoutubeVideo(
  video: Partial<YouTubeVideoItem>
): Promise<AdminActionResult<YouTubeVideoItem>> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.failure;

  const saved = await saveYoutubeVideo(video);
  if (!saved) {
    return { success: false, status: 500, error: ADMIN_MESSAGES.failed };
  }
  return { success: true, data: saved };
}

export async function adminDeleteYoutubeVideo(id: string): Promise<AdminActionResult<undefined>> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.failure;

  const ok = await deleteYoutubeVideo(id);
  if (!ok) {
    return { success: false, status: 500, error: ADMIN_MESSAGES.failed };
  }
  return { success: true, data: undefined };
}
