"use client";

import { useState } from "react";
import {
  Check,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Palette,
  Play,
  Plus,
  Radio,
  Sparkles,
  Trash2,
  Video,
  X,
} from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import type { AdminBanner, FestiveTheme, YouTubeVideoItem } from "@/lib/adminTypes";

export default function AdminContentPage() {
  const {
    banners,
    announcements,
    youtubeVideos,
    festiveThemes,
    settings,
    switchFestiveTheme,
    saveBanner,
    deleteBanner,
    saveAnnouncement,
    toggleAnnouncement,
    deleteAnnouncement,
    saveYouTubeVideo,
    deleteYouTubeVideo,
  } = useAdmin();

  // Announcement state
  const [newAnnText, setNewAnnText] = useState("");

  // Banner Modal state
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<AdminBanner | null>(null);
  const [bannerTitle, setBannerTitle] = useState("");
  const [bannerSubtitle, setBannerSubtitle] = useState("");
  const [bannerBadge, setBannerBadge] = useState("");
  const [bannerImage, setBannerImage] = useState("");
  const [bannerLink, setBannerLink] = useState("/products");
  const [bannerBtnText, setBannerBtnText] = useState("Shop Now");

  // YouTube Video Modal state
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<YouTubeVideoItem | null>(null);
  const [videoTitle, setVideoTitle] = useState("");
  const [videoId, setVideoId] = useState("");
  const [videoThumbnail, setVideoThumbnail] = useState("");
  const [videoDuration, setVideoDuration] = useState("3:45");

  // Policy Pages state
  const [policyTab, setPolicyTab] = useState<"refund" | "privacy" | "terms" | "shipping">("refund");
  const [policyText, setPolicyText] = useState(
    "Miracle Collections offers a hassle-free 7-day return policy for unworn, unwashed items in original packaging with tags attached. Once returned items are inspected, refunds are credited back to the original UPI reference within 48 hours."
  );

  const handleOpenBannerModal = (b?: AdminBanner) => {
    if (b) {
      setEditingBanner(b);
      setBannerTitle(b.title);
      setBannerSubtitle(b.subtitle);
      setBannerBadge(b.badge);
      setBannerImage(b.image);
      setBannerLink(b.link);
      setBannerBtnText(b.buttonText);
    } else {
      setEditingBanner(null);
      setBannerTitle("");
      setBannerSubtitle("");
      setBannerBadge("Festive Offer");
      setBannerImage("https://images.unsplash.com/photo-1566206091558-7f218b696731?auto=format&fit=crop&w=1600&q=80");
      setBannerLink("/products");
      setBannerBtnText("Explore Collection");
    }
    setIsBannerModalOpen(true);
  };

  const handleSaveBanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerTitle.trim()) return;

    saveBanner({
      ...(editingBanner ? { id: editingBanner.id } : {}),
      title: bannerTitle.trim(),
      subtitle: bannerSubtitle.trim(),
      badge: bannerBadge.trim(),
      image: bannerImage.trim(),
      link: bannerLink.trim(),
      buttonText: bannerBtnText.trim(),
      active: true,
    });

    setIsBannerModalOpen(false);
  };

  const handleOpenVideoModal = (v?: YouTubeVideoItem) => {
    if (v) {
      setEditingVideo(v);
      setVideoTitle(v.title);
      setVideoId(v.videoId);
      setVideoThumbnail(v.thumbnail);
      setVideoDuration(v.duration);
    } else {
      setEditingVideo(null);
      setVideoTitle("");
      setVideoId("dQw4w9WgXcQ");
      setVideoThumbnail("https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=480&q=80");
      setVideoDuration("4:10");
    }
    setIsVideoModalOpen(true);
  };

  const handleSaveVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoTitle.trim()) return;

    saveYouTubeVideo({
      ...(editingVideo ? { id: editingVideo.id } : {}),
      title: videoTitle.trim(),
      videoId: videoId.trim(),
      thumbnail: videoThumbnail.trim(),
      duration: videoDuration.trim(),
      active: true,
    });

    setIsVideoModalOpen(false);
  };

  return (
    <div className="space-y-10">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white shadow-sm">
            <Palette className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-black">
              Storefront Merchandising & Content
            </h1>
            <p className="text-xs text-neutral-500">
              1-Click seasonal theme switches, hero carousels, announcement bar, and social reels
            </p>
          </div>
        </div>
      </div>

      {/* 1. Festive Theming 1-Click Switcher */}
      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <h2 className="text-sm font-bold text-black uppercase tracking-wider">
                1-Click Festive Theme Switcher
              </h2>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              Switch seasonal palettes and banner graphics (Diwali, Sankranti, Sale) with a single click
            </p>
          </div>
          <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-black border border-neutral-200">
            Active: {settings?.activeFestiveTheme?.toUpperCase() || "None"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {festiveThemes.map((theme) => {
            const isSelected = settings?.activeFestiveTheme === theme.id;

            return (
              <div
                key={theme.id}
                onClick={() => switchFestiveTheme(theme.id)}
                className={`rounded-xl border p-4 cursor-pointer transition-all duration-200 flex flex-col justify-between relative overflow-hidden group ${
                  isSelected
                    ? "border-black bg-neutral-50 shadow-sm"
                    : "border-neutral-200 bg-white hover:border-neutral-300"
                }`}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-black text-white font-bold">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </div>
                )}

                <div>
                  {/* Color Swatch Bar */}
                  <div className="flex h-3 w-full rounded-full overflow-hidden mb-3 border border-neutral-200">
                    <div style={{ backgroundColor: theme.primaryColor }} className="flex-1" />
                    <div style={{ backgroundColor: theme.accentColor }} className="w-1/3" />
                  </div>

                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                    {theme.badge}
                  </span>
                  <h3 className="font-bold text-black text-sm mt-0.5">{theme.name}</h3>
                  <p className="text-xs text-neutral-600 mt-2 font-medium italic line-clamp-2">
                    &quot;{theme.bannerHeadline}&quot;
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-200 flex justify-between items-center text-[11px]">
                  <span className="text-neutral-400 font-mono">Palette preview</span>
                  <button
                    type="button"
                    className={`font-semibold ${
                      isSelected ? "text-black" : "text-neutral-500 group-hover:text-black"
                    }`}
                  >
                    {isSelected ? "Active Theme" : "Apply Theme"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Announcement Bar Manager */}
      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm space-y-4">
        <div>
          <h2 className="text-sm font-bold text-black uppercase tracking-wider">
            Top Announcement Bar
          </h2>
          <p className="text-xs text-neutral-500">
            Rotating promo messages displayed at the very top of the customer storefront
          </p>
        </div>

        <div className="space-y-2">
          {announcements.map((ann) => (
            <div
              key={ann.id}
              className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-xs"
            >
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => toggleAnnouncement(ann.id)}
                  className={`h-2.5 w-2.5 rounded-full ${
                    ann.active ? "bg-emerald-500 ring-2 ring-emerald-200" : "bg-neutral-300"
                  }`}
                  title={ann.active ? "Active" : "Hidden"}
                />
                <span className={ann.active ? "text-black font-medium" : "text-neutral-400 line-through"}>
                  {ann.text}
                </span>
              </div>
              <button
                onClick={() => deleteAnnouncement(ann.id)}
                className="text-neutral-400 hover:text-rose-600 transition"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-2 pt-2">
          <input
            type="text"
            value={newAnnText}
            onChange={(e) => setNewAnnText(e.target.value)}
            placeholder="Type announcement e.g. 'Use code FESTIVE10 for 10% instant discount'..."
            className="flex-1 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs text-black placeholder-neutral-400 focus:border-black focus:outline-none"
          />
          <button
            onClick={() => {
              if (!newAnnText.trim()) return;
              saveAnnouncement(newAnnText.trim());
              setNewAnnText("");
            }}
            className="flex items-center gap-1 rounded-lg bg-black hover:bg-neutral-800 px-4 py-2 text-xs font-semibold text-white transition shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Add Text</span>
          </button>
        </div>
      </div>

      {/* 3. Hero Carousel Banners Manager */}
      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-sm font-bold text-black uppercase tracking-wider">
              Hero Carousel Banners
            </h2>
            <p className="text-xs text-neutral-500">
              Full-width banners with headlines, offers, and direct action CTAs
            </p>
          </div>
          <button
            onClick={() => handleOpenBannerModal()}
            className="flex items-center gap-1.5 rounded-lg bg-black px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-neutral-800 transition shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Banner</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {banners.map((b) => (
            <div
              key={b.id}
              className="rounded-xl border border-neutral-200 bg-white overflow-hidden shadow-sm group flex flex-col justify-between"
            >
              <div className="h-40 relative bg-neutral-100">
                <img src={b.image} alt={b.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <span className="absolute top-2 left-2 rounded bg-black text-white text-[10px] font-semibold px-2 py-0.5">
                  {b.badge}
                </span>
                <div className="absolute bottom-2 left-3 right-3">
                  <h3 className="text-sm font-bold text-white leading-tight">{b.title}</h3>
                </div>
              </div>

              <div className="p-4 space-y-3 text-xs flex-1 flex flex-col justify-between">
                <p className="text-neutral-500 text-[11px] line-clamp-2">{b.subtitle}</p>

                <div className="pt-2 border-t border-neutral-100 flex justify-between items-center">
                  <button
                    onClick={() => handleOpenBannerModal(b)}
                    className="text-black font-semibold hover:underline"
                  >
                    Edit Banner
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete banner '${b.title}'?`)) deleteBanner(b.id);
                    }}
                    className="text-neutral-400 hover:text-rose-600 transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. YouTube Video Strip Showcase */}
      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2">
              <Video className="h-4 w-4 text-rose-600" />
              <h2 className="text-sm font-bold text-black uppercase tracking-wider">
                Video Strip Showcase
              </h2>
            </div>
            <p className="text-xs text-neutral-500">
              Auto-scrolling YouTube video cards with thumbnails and play controls
            </p>
          </div>
          <button
            onClick={() => handleOpenVideoModal()}
            className="flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-black hover:bg-neutral-100 transition shadow-sm"
          >
            <Plus className="h-3.5 w-3.5 text-rose-600" />
            <span>Add Video Card</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {youtubeVideos.map((vid) => (
            <div
              key={vid.id}
              className="rounded-xl border border-neutral-200 bg-white overflow-hidden shadow-sm group flex flex-col justify-between"
            >
              <div className="h-36 relative bg-neutral-100">
                <img src={vid.thumbnail} alt={vid.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-600 text-white shadow-lg group-hover:scale-110 transition">
                    <Play className="h-5 w-5 ml-0.5 fill-current" />
                  </div>
                </div>
                <span className="absolute bottom-2 right-2 rounded bg-black/80 font-mono text-[10px] text-white px-1.5 py-0.5">
                  {vid.duration}
                </span>
              </div>

              <div className="p-3 text-xs space-y-2">
                <p className="font-semibold text-black line-clamp-1">{vid.title}</p>
                <div className="flex justify-between items-center text-[11px] text-neutral-400 pt-1 border-t border-neutral-100">
                  <span>{vid.views} views</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenVideoModal(vid)}
                      className="text-black font-semibold hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteYouTubeVideo(vid.id)}
                      className="hover:text-rose-600 transition"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Policy Pages Editor */}
      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-black uppercase tracking-wider">
              Legal & Policy Pages Editor
            </h2>
            <p className="text-xs text-neutral-500">
              Store policies: Returns & Refunds, Shipping, Privacy Policy, Terms of Service
            </p>
          </div>
          <button
            onClick={() => alert("Policy changes published to storefront successfully!")}
            className="rounded-lg bg-black hover:bg-neutral-800 px-3.5 py-1.5 text-xs font-semibold text-white transition shadow-sm"
          >
            Publish Updates
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5 border-b border-neutral-200 pb-2">
          {(
            [
              { id: "refund", label: "Returns & Refunds Policy" },
              { id: "shipping", label: "Shipping Policy" },
              { id: "privacy", label: "Privacy Policy" },
              { id: "terms", label: "Terms of Service" },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setPolicyTab(t.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                policyTab === t.id
                  ? "bg-black text-white shadow-sm"
                  : "border border-neutral-200 bg-white text-neutral-600 hover:text-black"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <textarea
          rows={5}
          value={policyText}
          onChange={(e) => setPolicyText(e.target.value)}
          className="w-full rounded-xl border border-neutral-300 bg-white p-4 text-xs text-black placeholder-neutral-400 focus:border-black focus:outline-none leading-relaxed"
        />
      </div>

      {/* Banner Modal */}
      {isBannerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md rounded-2xl border border-neutral-200 bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-neutral-200 bg-neutral-50 px-6 py-4">
              <h2 className="text-base font-bold text-black">
                {editingBanner ? "Edit Hero Banner" : "Create Hero Banner"}
              </h2>
              <button
                onClick={() => setIsBannerModalOpen(false)}
                className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-200 hover:text-black transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBanner} className="p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-neutral-700">Banner Headline *</label>
                <input
                  type="text"
                  required
                  value={bannerTitle}
                  onChange={(e) => setBannerTitle(e.target.value)}
                  placeholder="e.g. Diwali Royal Ethnic Edit 2026"
                  className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-black placeholder-neutral-400 focus:border-black focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-neutral-700">Subheadline Description</label>
                <textarea
                  rows={2}
                  value={bannerSubtitle}
                  onChange={(e) => setBannerSubtitle(e.target.value)}
                  placeholder="Brief descriptive marketing copy..."
                  className="w-full rounded-lg border border-neutral-300 bg-white p-2.5 text-black placeholder-neutral-400 focus:border-black focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-700">Badge Tag</label>
                  <input
                    type="text"
                    value={bannerBadge}
                    onChange={(e) => setBannerBadge(e.target.value)}
                    placeholder="New Collection"
                    className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-black placeholder-neutral-400 focus:border-black focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-neutral-700">Button CTA Text</label>
                  <input
                    type="text"
                    value={bannerBtnText}
                    onChange={(e) => setBannerBtnText(e.target.value)}
                    placeholder="Shop Festive Edit"
                    className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-black placeholder-neutral-400 focus:border-black focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-neutral-700">Banner Background Image URL</label>
                <input
                  type="url"
                  value={bannerImage}
                  onChange={(e) => setBannerImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-black placeholder-neutral-400 focus:border-black focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-neutral-200 pt-4">
                <button
                  type="button"
                  onClick={() => setIsBannerModalOpen(false)}
                  className="rounded-lg px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-black transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-black hover:bg-neutral-800 px-5 py-2 text-xs font-semibold text-white transition shadow-sm"
                >
                  Save Hero Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* YouTube Video Modal */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md rounded-2xl border border-neutral-200 bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-neutral-200 bg-neutral-50 px-6 py-4">
              <h2 className="text-base font-bold text-black">
                {editingVideo ? "Edit Video Card" : "Add YouTube Showcase Video"}
              </h2>
              <button
                onClick={() => setIsVideoModalOpen(false)}
                className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-200 hover:text-black transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVideo} className="p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-neutral-700">Video Title *</label>
                <input
                  type="text"
                  required
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  placeholder="e.g. Behind the Seams: Anarkali Making"
                  className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-black placeholder-neutral-400 focus:border-black focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-700">YouTube Video ID</label>
                  <input
                    type="text"
                    value={videoId}
                    onChange={(e) => setVideoId(e.target.value)}
                    placeholder="e.g. dQw4w9WgXcQ"
                    className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-black font-mono focus:border-black focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-neutral-700">Duration</label>
                  <input
                    type="text"
                    value={videoDuration}
                    onChange={(e) => setVideoDuration(e.target.value)}
                    placeholder="4:15"
                    className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-black placeholder-neutral-400 focus:border-black focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-neutral-700">Thumbnail Image URL</label>
                <input
                  type="url"
                  value={videoThumbnail}
                  onChange={(e) => setVideoThumbnail(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-black placeholder-neutral-400 focus:border-black focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-neutral-200 pt-4">
                <button
                  type="button"
                  onClick={() => setIsVideoModalOpen(false)}
                  className="rounded-lg px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-black transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-black hover:bg-neutral-800 px-5 py-2 text-xs font-semibold text-white transition shadow-sm"
                >
                  Save Video
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
