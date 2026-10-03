"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import type {
  AdminBanner,
  AdminCategory,
  AdminCoupon,
  AdminCustomer,
  AdminOrder,
  AdminOrderStatus,
  AdminPayment,
  AdminProduct,
  AdminSettings,
  AnnouncementBarItem,
  AuditLogEntry,
  CategoryFilter,
  FestiveTheme,
  StaffMember,
  StockChangeType,
  StockLedgerEntry,
  YouTubeVideoItem,
} from "@/lib/adminTypes";
import {
  SEED_ANNOUNCEMENTS,
  SEED_AUDIT_LOGS,
  SEED_BANNERS,
  SEED_CATEGORIES,
  SEED_COUPONS,
  SEED_CUSTOMERS,
  SEED_FESTIVE_THEMES,
  SEED_FILTERS,
  SEED_ORDERS,
  SEED_PAYMENTS,
  SEED_PRODUCTS,
  SEED_SETTINGS,
  SEED_STAFF,
  SEED_STOCK_LEDGER,
  SEED_YOUTUBE_VIDEOS,
} from "@/data/adminSeed";
import { useStore } from "@/context/StoreContext";

export interface AdminToast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

interface AdminContextValue {
  // State
  products: AdminProduct[];
  categories: AdminCategory[];
  filters: CategoryFilter[];
  orders: AdminOrder[];
  payments: AdminPayment[];
  stockLedger: StockLedgerEntry[];
  customers: AdminCustomer[];
  coupons: AdminCoupon[];
  banners: AdminBanner[];
  announcements: AnnouncementBarItem[];
  youtubeVideos: YouTubeVideoItem[];
  festiveThemes: FestiveTheme[];
  settings: AdminSettings;
  staff: StaffMember[];
  currentStaff: StaffMember;
  auditLogs: AuditLogEntry[];
  toasts: AdminToast[];

  // Quick metrics
  pendingPaymentCount: number;
  lowStockCount: number;
  totalRevenue: number;
  todaySales: number;

  // Actions
  adminToast: (message: string, type?: AdminToast["type"]) => void;
  setCurrentStaff: (staff: StaffMember) => void;
  logAudit: (
    module: AuditLogEntry["module"],
    action: AuditLogEntry["action"],
    description: string
  ) => void;

  // Orders & Payments
  verifyPayment: (orderId: string, paymentId: string) => void;
  rejectPayment: (orderId: string, paymentId: string, reason: string) => void;
  updateOrderStatus: (
    orderId: string,
    newStatus: AdminOrderStatus,
    courierName?: string,
    trackingNumber?: string,
    note?: string
  ) => void;
  addInternalOrderNote: (orderId: string, note: string) => void;

  // Products
  saveProduct: (product: Partial<AdminProduct>) => AdminProduct;
  deleteProduct: (productId: string) => void;
  toggleProductStatus: (productId: string) => void;

  // Inventory & Stock
  adjustStock: (
    productId: string,
    variantSku: string,
    change: number,
    type: StockChangeType,
    reason: string
  ) => void;
  bulkUpdateStock: (rows: { sku: string; stock: number }[]) => { updated: number; errors: string[] };

  // Categories & Filters
  saveCategory: (category: Partial<AdminCategory>) => AdminCategory;
  deleteCategory: (id: string) => void;
  saveFilter: (filter: Partial<CategoryFilter>) => CategoryFilter;
  deleteFilter: (id: string) => void;

  // Customers
  toggleCustomerBlock: (id: string, reason?: string) => void;

  // Coupons
  saveCoupon: (coupon: Partial<AdminCoupon>) => AdminCoupon;
  deleteCoupon: (id: string) => void;

  // Content & Festive theme
  switchFestiveTheme: (themeId: FestiveTheme["id"]) => void;
  saveBanner: (banner: Partial<AdminBanner>) => AdminBanner;
  deleteBanner: (id: string) => void;
  saveAnnouncement: (text: string) => void;
  toggleAnnouncement: (id: string) => void;
  deleteAnnouncement: (id: string) => void;
  saveYouTubeVideo: (video: Partial<YouTubeVideoItem>) => YouTubeVideoItem;
  deleteYouTubeVideo: (id: string) => void;

  // Settings
  saveSettings: (patch: Partial<AdminSettings>) => void;

  // Staff
  addStaff: (member: Omit<StaffMember, "id" | "lastActive">) => void;
  deleteStaff: (id: string) => void;

  // Utilities
  exportToCsv: (data: Record<string, unknown>[], filename: string) => void;
  resetToSampleData: () => void;
}

const AdminContext = createContext<AdminContextValue | null>(null);

function useStoredAdmin<T>(key: string, fallback: T) {
  const [state, setState] = useState<T>(fallback);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setState(JSON.parse(raw) as T);
    } catch {
      // storage unavailable
    }
    setHydrated(true);
  }, [key]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // storage quota or unavailable
    }
  }, [key, state, hydrated]);

  return [state, setState] as const;
}

export function AdminProvider({ children }: { children: ReactNode }) {
  const {
    products: storeProducts,
    saveProduct: storeSaveProduct,
    deleteProduct: storeDeleteProduct,
    toggleProductStatus: storeToggleProductStatus,
    adjustStock: storeAdjustStock,
    bulkUpdateStock: storeBulkUpdateStock,
    resetProducts: storeResetProducts,
  } = useStore();

  const products = storeProducts as unknown as AdminProduct[];
  const [categories, setCategories] = useStoredAdmin<AdminCategory[]>("miracle:admin:categories", SEED_CATEGORIES);
  const [filters, setFilters] = useStoredAdmin<CategoryFilter[]>("miracle:admin:filters", SEED_FILTERS);
  const [orders, setOrders] = useStoredAdmin<AdminOrder[]>("miracle:admin:orders", SEED_ORDERS);
  const [payments, setPayments] = useStoredAdmin<AdminPayment[]>("miracle:admin:payments", SEED_PAYMENTS);
  const [stockLedger, setStockLedger] = useStoredAdmin<StockLedgerEntry[]>("miracle:admin:stock_ledger", SEED_STOCK_LEDGER);
  const [customers, setCustomers] = useStoredAdmin<AdminCustomer[]>("miracle:admin:customers", SEED_CUSTOMERS);
  const [coupons, setCoupons] = useStoredAdmin<AdminCoupon[]>("miracle:admin:coupons", SEED_COUPONS);
  const [banners, setBanners] = useStoredAdmin<AdminBanner[]>("miracle:admin:banners", SEED_BANNERS);
  const [announcements, setAnnouncements] = useStoredAdmin<AnnouncementBarItem[]>("miracle:admin:announcements", SEED_ANNOUNCEMENTS);
  const [youtubeVideos, setYoutubeVideos] = useStoredAdmin<YouTubeVideoItem[]>("miracle:admin:youtube", SEED_YOUTUBE_VIDEOS);
  const [settings, setSettings] = useStoredAdmin<AdminSettings>("miracle:admin:settings", SEED_SETTINGS);
  const [staff, setStaff] = useStoredAdmin<StaffMember[]>("miracle:admin:staff", SEED_STAFF);
  const [auditLogs, setAuditLogs] = useStoredAdmin<AuditLogEntry[]>("miracle:admin:audit_logs", SEED_AUDIT_LOGS);

  const [currentStaff, setCurrentStaff] = useState<StaffMember>(staff[0] ?? SEED_STAFF[0]);
  const [toasts, setToasts] = useState<AdminToast[]>([]);

  const adminToast = useCallback((message: string, type: AdminToast["type"] = "success") => {
    const id = "t_" + Math.random().toString(36).slice(2, 9);
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 3200);
  }, []);

  const logAudit = useCallback(
    (
      module: AuditLogEntry["module"],
      action: AuditLogEntry["action"],
      description: string
    ) => {
      const entry: AuditLogEntry = {
        id: "aud_" + Math.random().toString(36).slice(2, 9),
        timestamp: new Date().toISOString(),
        staffName: currentStaff.name,
        role: currentStaff.role,
        module,
        action,
        description,
        ipAddress: "192.168.1.104",
      };
      setAuditLogs((prev) => [entry, ...prev].slice(0, 200));
    },
    [currentStaff, setAuditLogs]
  );

  // Calculations
  const pendingPaymentCount = useMemo(
    () => payments.filter((p) => p.status === "pending_verification").length,
    [payments]
  );

  const lowStockCount = useMemo(() => {
    let count = 0;
    products.forEach((p) => {
      p.variants.forEach((v) => {
        if (v.stock <= 5) count++;
      });
    });
    return count;
  }, [products]);

  const totalRevenue = useMemo(
    () =>
      orders
        .filter((o) => o.paymentStatus === "Verified" || o.orderStatus === "Delivered")
        .reduce((sum, o) => sum + o.total, 0),
    [orders]
  );

  const todaySales = useMemo(() => {
    return orders
      .filter((o) => o.paymentStatus === "Verified")
      .slice(0, 3)
      .reduce((sum, o) => sum + o.total, 0);
  }, [orders]);

  // ---------------- Payment verification & Order lifecycle ----------------
  const verifyPayment = useCallback(
    (orderId: string, paymentId: string) => {
      const timestamp = new Date().toISOString();
      setPayments((prev) =>
        prev.map((p) =>
          p.id === paymentId
            ? {
                ...p,
                status: "verified",
                verifiedAt: timestamp,
                verifiedBy: currentStaff.name,
              }
            : p
        )
      );

      setOrders((prev) =>
        prev.map((o) => {
          if (o.id === orderId) {
            return {
              ...o,
              orderStatus: "Payment Verified",
              paymentStatus: "Verified",
              timeline: [
                ...o.timeline,
                {
                  status: "Payment Verified",
                  timestamp,
                  note: `Payment verified by ${currentStaff.name} against merchant bank statement. Stock converted from reservation to sale.`,
                  staff: currentStaff.name,
                },
              ],
            };
          }
          return o;
        })
      );

      logAudit(
        "Payments",
        "Verify",
        `Verified payment ${paymentId} for Order ${orderId}. Order marked 'Payment Verified'.`
      );
      adminToast(`Payment for Order #${orderId} verified successfully!`, "success");
    },
    [currentStaff, logAudit, adminToast, setPayments, setOrders]
  );

  const rejectPayment = useCallback(
    (orderId: string, paymentId: string, reason: string) => {
      const timestamp = new Date().toISOString();
      setPayments((prev) =>
        prev.map((p) =>
          p.id === paymentId
            ? {
                ...p,
                status: "rejected",
                rejectionReason: reason,
                verifiedAt: timestamp,
                verifiedBy: currentStaff.name,
              }
            : p
        )
      );

      setOrders((prev) =>
        prev.map((o) => {
          if (o.id === orderId) {
            return {
              ...o,
              orderStatus: "Payment Rejected",
              paymentStatus: "Failed",
              timeline: [
                ...o.timeline,
                {
                  status: "Payment Rejected",
                  timestamp,
                  note: `Payment rejected by ${currentStaff.name}. Reason: ${reason}. Soft reservation released back to inventory.`,
                  staff: currentStaff.name,
                },
              ],
            };
          }
          return o;
        })
      );

      logAudit(
        "Payments",
        "Reject",
        `Rejected payment ${paymentId} for Order ${orderId}. Reason: ${reason}`
      );
      adminToast(`Payment for Order #${orderId} rejected. Customer notified.`, "info");
    },
    [currentStaff, logAudit, adminToast, setPayments, setOrders]
  );

  const updateOrderStatus = useCallback(
    (
      orderId: string,
      newStatus: AdminOrderStatus,
      courierName?: string,
      trackingNumber?: string,
      note?: string
    ) => {
      const timestamp = new Date().toISOString();
      setOrders((prev) =>
        prev.map((o) => {
          if (o.id === orderId) {
            const updated: AdminOrder = {
              ...o,
              orderStatus: newStatus,
              courierName: courierName || o.courierName,
              trackingNumber: trackingNumber || o.trackingNumber,
              trackingUrl:
                trackingNumber && courierName
                  ? `https://track.miraclecollections.in/?awb=${trackingNumber}`
                  : o.trackingUrl,
              timeline: [
                ...o.timeline,
                {
                  status: newStatus,
                  timestamp,
                  note:
                    note ||
                    `Status advanced to ${newStatus}${
                      trackingNumber ? ` via ${courierName} (AWB: ${trackingNumber})` : ""
                    }`,
                  staff: currentStaff.name,
                },
              ],
            };
            return updated;
          }
          return o;
        })
      );

      logAudit("Orders", "Update", `Order ${orderId} moved to '${newStatus}'`);
      adminToast(`Order #${orderId} status updated to ${newStatus}`, "success");
    },
    [currentStaff, logAudit, adminToast, setOrders]
  );

  const addInternalOrderNote = useCallback(
    (orderId: string, note: string) => {
      setOrders((prev) =>
        prev.map((o) => {
          if (o.id === orderId) {
            return {
              ...o,
              internalNotes: [...(o.internalNotes || []), `${currentStaff.name}: ${note}`],
            };
          }
          return o;
        })
      );
      logAudit("Orders", "Update", `Added internal note to Order ${orderId}`);
      adminToast("Note added to order", "info");
    },
    [currentStaff, logAudit, adminToast, setOrders]
  );

  // ---------------- Products (Synchronized with Store) ----------------
  const saveProduct = useCallback(
    (patch: Partial<AdminProduct>): AdminProduct => {
      const saved = storeSaveProduct(patch as any);
      logAudit(
        "Products",
        patch.id ? "Update" : "Create",
        `${patch.id ? "Updated" : "Created"} product '${saved.name}'`
      );
      adminToast(
        patch.id ? "Product updated successfully" : `Product "${saved.name}" created`,
        "success"
      );
      return saved as unknown as AdminProduct;
    },
    [storeSaveProduct, logAudit, adminToast]
  );

  const deleteProduct = useCallback(
    (productId: string) => {
      const match = products.find((p) => p.id === productId);
      storeDeleteProduct(productId);
      logAudit("Products", "Delete", `Deleted product '${match?.name || productId}'`);
      adminToast("Product deleted", "info");
    },
    [products, storeDeleteProduct, logAudit, adminToast]
  );

  const toggleProductStatus = useCallback(
    (productId: string) => {
      const match = products.find((p) => p.id === productId);
      storeToggleProductStatus(productId);
      const nextStatus = match?.status === "live" ? "draft" : "live";
      logAudit("Products", "Update", `Changed '${match?.name || productId}' status to ${nextStatus}`);
      adminToast(`Product is now ${nextStatus.toUpperCase()}`, "info");
    },
    [products, storeToggleProductStatus, logAudit, adminToast]
  );

  // ---------------- Inventory & Stock ----------------
  const adjustStock = useCallback(
    (
      productId: string,
      variantSku: string,
      change: number,
      type: StockChangeType,
      reason: string
    ) => {
      const timestamp = new Date().toISOString();
      let prodName = "";
      let varLabel = "";
      let prevCount = 0;
      let newCount = 0;

      const p = products.find((x) => x.id === productId);
      if (p) {
        prodName = p.name;
        const v = p.variants.find((x) => x.sku === variantSku);
        if (v) {
          prevCount = v.stock;
          newCount = Math.max(0, v.stock + change);
          varLabel = `${v.color} / ${v.size}`;
        }
      }

      storeAdjustStock(productId, variantSku, change, type, reason);

      const ledgerEntry: StockLedgerEntry = {
        id: "led_" + Math.random().toString(36).slice(2, 9),
        timestamp,
        productId,
        productName: prodName || "Product",
        variantSku,
        variantLabel: varLabel || variantSku,
        type,
        change,
        previousStock: prevCount,
        newStock: newCount,
        reason,
        staffName: currentStaff.name,
      };

      setStockLedger((prev) => [ledgerEntry, ...prev]);
      logAudit(
        "Inventory",
        "Adjust Stock",
        `Adjusted ${variantSku} by ${change > 0 ? "+" : ""}${change} units (${reason})`
      );
      adminToast(`Stock updated for ${variantSku} (${prevCount} → ${newCount})`, "success");
    },
    [products, currentStaff, logAudit, adminToast, storeAdjustStock, setStockLedger]
  );

  const bulkUpdateStock = useCallback(
    (rows: { sku: string; stock: number }[]) => {
      const res = storeBulkUpdateStock(rows);
      logAudit("Inventory", "Adjust Stock", `Bulk updated ${res.updated} SKUs via CSV import`);
      adminToast(`Bulk updated ${res.updated} inventory variants successfully!`, "success");
      return res;
    },
    [storeBulkUpdateStock, logAudit, adminToast]
  );

  // ---------------- Categories & Filters ----------------
  const saveCategory = useCallback(
    (patch: Partial<AdminCategory>): AdminCategory => {
      let saved: AdminCategory;
      if (patch.id && categories.some((c) => c.id === patch.id)) {
        setCategories((prev) =>
          prev.map((c) => {
            if (c.id === patch.id) {
              saved = { ...c, ...patch } as AdminCategory;
              return saved;
            }
            return c;
          })
        );
        logAudit("Categories", "Update", `Updated category '${patch.name || patch.id}'`);
        adminToast("Category updated", "success");
      } else {
        const id = patch.slug || (patch.name ? patch.name.toLowerCase().replace(/[^a-z0-9]/g, "-") : "cat_" + Date.now());
        saved = {
          id,
          name: patch.name || "New Category",
          slug: patch.slug || id,
          image: patch.image || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80",
          description: patch.description || "",
          subcategories: patch.subcategories || [],
          productCount: 0,
          active: true,
        };
        setCategories((prev) => [...prev, saved]);
        logAudit("Categories", "Create", `Created category '${saved.name}'`);
        adminToast(`Category "${saved.name}" added`, "success");
      }
      return saved!;
    },
    [categories, logAudit, adminToast, setCategories]
  );

  const deleteCategory = useCallback(
    (id: string) => {
      setCategories((prev) => prev.filter((c) => c.id !== id));
      logAudit("Categories", "Delete", `Deleted category ${id}`);
      adminToast("Category removed", "info");
    },
    [logAudit, adminToast, setCategories]
  );

  const saveFilter = useCallback(
    (patch: Partial<CategoryFilter>): CategoryFilter => {
      let saved: CategoryFilter;
      if (patch.id && filters.some((f) => f.id === patch.id)) {
        setFilters((prev) =>
          prev.map((f) => {
            if (f.id === patch.id) {
              saved = { ...f, ...patch } as CategoryFilter;
              return saved;
            }
            return f;
          })
        );
        logAudit("Categories", "Update", `Updated filter '${patch.name}'`);
        adminToast("Filter updated", "success");
      } else {
        const id = "flt_" + Math.random().toString(36).slice(2, 7);
        saved = {
          id,
          name: patch.name || "New Filter",
          key: patch.key || (patch.name ? patch.name.toLowerCase().replace(/[^a-z0-9]/g, "_") : "attr"),
          targetCategories: patch.targetCategories || ["men", "women", "kids", "footwear"],
          type: patch.type || "multiselect",
          options: patch.options || [],
          active: true,
        };
        setFilters((prev) => [...prev, saved]);
        logAudit("Categories", "Create", `Created filter '${saved.name}' with ${saved.options.length} options`);
        adminToast(`Filter "${saved.name}" created`, "success");
      }
      return saved!;
    },
    [filters, logAudit, adminToast, setFilters]
  );

  const deleteFilter = useCallback(
    (id: string) => {
      setFilters((prev) => prev.filter((f) => f.id !== id));
      logAudit("Categories", "Delete", `Deleted filter ${id}`);
      adminToast("Filter deleted", "info");
    },
    [logAudit, adminToast, setFilters]
  );

  // ---------------- Customers ----------------
  const toggleCustomerBlock = useCallback(
    (id: string, reason?: string) => {
      setCustomers((prev) =>
        prev.map((c) => {
          if (c.id === id) {
            const nextStatus = c.status === "active" ? "blocked" : "active";
            logAudit(
              "Orders",
              "Update",
              `${nextStatus === "blocked" ? "Blocked" : "Unblocked"} customer ${c.name}`
            );
            adminToast(`Customer ${c.name} is now ${nextStatus.toUpperCase()}`, "info");
            return {
              ...c,
              status: nextStatus,
              blockReason: nextStatus === "blocked" ? reason || "Flagged by Admin" : undefined,
            };
          }
          return c;
        })
      );
    },
    [logAudit, adminToast, setCustomers]
  );

  // ---------------- Coupons ----------------
  const saveCoupon = useCallback(
    (patch: Partial<AdminCoupon>): AdminCoupon => {
      let saved: AdminCoupon;
      if (patch.id && coupons.some((c) => c.id === patch.id)) {
        setCoupons((prev) =>
          prev.map((c) => {
            if (c.id === patch.id) {
              saved = { ...c, ...patch } as AdminCoupon;
              return saved;
            }
            return c;
          })
        );
        logAudit("Coupons", "Update", `Updated coupon '${patch.code}'`);
        adminToast("Coupon updated", "success");
      } else {
        const id = "c_" + Math.random().toString(36).slice(2, 7);
        saved = {
          id,
          code: (patch.code || "SAVE10").toUpperCase().trim(),
          description: patch.description || "",
          discountType: patch.discountType || "percentage",
          discountValue: patch.discountValue || 10,
          minOrder: patch.minOrder || 999,
          maxDiscountCap: patch.maxDiscountCap,
          startDate: patch.startDate || new Date().toISOString().split("T")[0],
          expiryDate: patch.expiryDate || "2026-12-31",
          usageLimit: patch.usageLimit || 500,
          usedCount: 0,
          active: true,
        };
        setCoupons((prev) => [saved, ...prev]);
        logAudit("Coupons", "Create", `Created coupon code '${saved.code}'`);
        adminToast(`Coupon "${saved.code}" added`, "success");
      }
      return saved!;
    },
    [coupons, logAudit, adminToast, setCoupons]
  );

  const deleteCoupon = useCallback(
    (id: string) => {
      setCoupons((prev) => prev.filter((c) => c.id !== id));
      logAudit("Coupons", "Delete", `Deleted coupon ${id}`);
      adminToast("Coupon deleted", "info");
    },
    [logAudit, adminToast, setCoupons]
  );

  // ---------------- Content & Festive Themes ----------------
  const switchFestiveTheme = useCallback(
    (themeId: FestiveTheme["id"]) => {
      const match = SEED_FESTIVE_THEMES.find((t) => t.id === themeId);
      setSettings((prev) => ({ ...prev, activeFestiveTheme: themeId }));
      logAudit("Content", "Theme Change", `Switched storefront festive theme to '${match?.name || themeId}'`);
      adminToast(`Theme switched to: ${match?.name || themeId}!`, "success");
    },
    [logAudit, adminToast, setSettings]
  );

  const saveBanner = useCallback(
    (patch: Partial<AdminBanner>): AdminBanner => {
      let saved: AdminBanner;
      if (patch.id && banners.some((b) => b.id === patch.id)) {
        setBanners((prev) =>
          prev.map((b) => {
            if (b.id === patch.id) {
              saved = { ...b, ...patch } as AdminBanner;
              return saved;
            }
            return b;
          })
        );
        logAudit("Content", "Update", `Updated banner '${patch.title}'`);
        adminToast("Banner saved", "success");
      } else {
        const id = "ban_" + Math.random().toString(36).slice(2, 7);
        saved = {
          id,
          title: patch.title || "New Banner",
          subtitle: patch.subtitle || "",
          badge: patch.badge || "Special Offer",
          image: patch.image || "https://images.unsplash.com/photo-1566206091558-7f218b696731?auto=format&fit=crop&w=1600&q=80",
          link: patch.link || "/products",
          buttonText: patch.buttonText || "Shop Now",
          active: true,
          order: banners.length + 1,
        };
        setBanners((prev) => [...prev, saved]);
        logAudit("Content", "Create", `Created hero banner '${saved.title}'`);
        adminToast("Banner created", "success");
      }
      return saved!;
    },
    [banners, logAudit, adminToast, setBanners]
  );

  const deleteBanner = useCallback(
    (id: string) => {
      setBanners((prev) => prev.filter((b) => b.id !== id));
      logAudit("Content", "Delete", `Deleted banner ${id}`);
      adminToast("Banner removed", "info");
    },
    [logAudit, adminToast, setBanners]
  );

  const saveAnnouncement = useCallback(
    (text: string) => {
      const id = "ann_" + Math.random().toString(36).slice(2, 7);
      setAnnouncements((prev) => [...prev, { id, text, active: true }]);
      logAudit("Content", "Create", `Added announcement: "${text.slice(0, 30)}..."`);
      adminToast("Announcement added", "success");
    },
    [logAudit, adminToast, setAnnouncements]
  );

  const toggleAnnouncement = useCallback(
    (id: string) => {
      setAnnouncements((prev) =>
        prev.map((a) => (a.id === id ? { ...a, active: !a.active } : a))
      );
    },
    [setAnnouncements]
  );

  const deleteAnnouncement = useCallback(
    (id: string) => {
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
      adminToast("Announcement deleted", "info");
    },
    [adminToast, setAnnouncements]
  );

  const saveYouTubeVideo = useCallback(
    (patch: Partial<YouTubeVideoItem>): YouTubeVideoItem => {
      let saved: YouTubeVideoItem;
      if (patch.id && youtubeVideos.some((v) => v.id === patch.id)) {
        setYoutubeVideos((prev) =>
          prev.map((v) => {
            if (v.id === patch.id) {
              saved = { ...v, ...patch } as YouTubeVideoItem;
              return saved;
            }
            return v;
          })
        );
        logAudit("Content", "Update", `Updated video '${patch.title}'`);
        adminToast("Video updated", "success");
      } else {
        const id = "yt_" + Math.random().toString(36).slice(2, 7);
        saved = {
          id,
          title: patch.title || "Miracle Collections Showcase",
          videoId: patch.videoId || "dQw4w9WgXcQ",
          thumbnail: patch.thumbnail || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=480&q=80",
          duration: patch.duration || "3:30",
          views: "1.2K",
          active: true,
        };
        setYoutubeVideos((prev) => [...prev, saved]);
        logAudit("Content", "Create", `Added YouTube video strip: '${saved.title}'`);
        adminToast("Video item added", "success");
      }
      return saved!;
    },
    [youtubeVideos, logAudit, adminToast, setYoutubeVideos]
  );

  const deleteYouTubeVideo = useCallback(
    (id: string) => {
      setYoutubeVideos((prev) => prev.filter((v) => v.id !== id));
      adminToast("Video removed", "info");
    },
    [adminToast, setYoutubeVideos]
  );

  // ---------------- Settings ----------------
  const saveSettings = useCallback(
    (patch: Partial<AdminSettings>) => {
      setSettings((prev) => ({ ...prev, ...patch }));
      logAudit("Settings", "Update", "Updated store settings (UPI, Shipping, GST, Timeouts)");
      adminToast("Store settings saved successfully", "success");
    },
    [logAudit, adminToast, setSettings]
  );

  // ---------------- Staff ----------------
  const addStaff = useCallback(
    (member: Omit<StaffMember, "id" | "lastActive">) => {
      const id = "st_" + Math.random().toString(36).slice(2, 7);
      const newStaff: StaffMember = {
        ...member,
        id,
        lastActive: "Just added",
      };
      setStaff((prev) => [...prev, newStaff]);
      logAudit("Staff", "Create", `Added staff member '${newStaff.name}' (${newStaff.role})`);
      adminToast(`Staff member ${newStaff.name} added`, "success");
    },
    [logAudit, adminToast, setStaff]
  );

  const deleteStaff = useCallback(
    (id: string) => {
      setStaff((prev) => prev.filter((s) => s.id !== id));
      logAudit("Staff", "Delete", `Removed staff member ${id}`);
      adminToast("Staff member removed", "info");
    },
    [logAudit, adminToast, setStaff]
  );

  // ---------------- Export & Reset ----------------
  const exportToCsv = useCallback((data: Record<string, unknown>[], filename: string) => {
    if (!data || data.length === 0) {
      alert("No data available to export");
      return;
    }
    const headers = Object.keys(data[0]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [
        headers.join(","),
        ...data.map((row) =>
          headers
            .map((field) => {
              const val = row[field];
              if (val === null || val === undefined) return '""';
              if (typeof val === "object") return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
              return `"${String(val).replace(/"/g, '""')}"`;
            })
            .join(",")
        ),
      ].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const resetToSampleData = useCallback(() => {
    storeResetProducts();
    setCategories(SEED_CATEGORIES);
    setFilters(SEED_FILTERS);
    setOrders(SEED_ORDERS);
    setPayments(SEED_PAYMENTS);
    setStockLedger(SEED_STOCK_LEDGER);
    setCustomers(SEED_CUSTOMERS);
    setCoupons(SEED_COUPONS);
    setBanners(SEED_BANNERS);
    setAnnouncements(SEED_ANNOUNCEMENTS);
    setYoutubeVideos(SEED_YOUTUBE_VIDEOS);
    setSettings(SEED_SETTINGS);
    setStaff(SEED_STAFF);
    setAuditLogs(SEED_AUDIT_LOGS);
    adminToast("All admin modules reset to standard PRD seed data", "info");
  }, [
    adminToast,
    storeResetProducts,
    setCategories,
    setFilters,
    setOrders,
    setPayments,
    setStockLedger,
    setCustomers,
    setCoupons,
    setBanners,
    setAnnouncements,
    setYoutubeVideos,
    setSettings,
    setStaff,
    setAuditLogs,
  ]);

  const value = useMemo<AdminContextValue>(
    () => ({
      products,
      categories,
      filters,
      orders,
      payments,
      stockLedger,
      customers,
      coupons,
      banners,
      announcements,
      youtubeVideos,
      festiveThemes: SEED_FESTIVE_THEMES,
      settings,
      staff,
      currentStaff,
      auditLogs,
      toasts,

      pendingPaymentCount,
      lowStockCount,
      totalRevenue,
      todaySales,

      adminToast,
      setCurrentStaff,
      logAudit,

      verifyPayment,
      rejectPayment,
      updateOrderStatus,
      addInternalOrderNote,

      saveProduct,
      deleteProduct,
      toggleProductStatus,

      adjustStock,
      bulkUpdateStock,

      saveCategory,
      deleteCategory,
      saveFilter,
      deleteFilter,

      toggleCustomerBlock,

      saveCoupon,
      deleteCoupon,

      switchFestiveTheme,
      saveBanner,
      deleteBanner,
      saveAnnouncement,
      toggleAnnouncement,
      deleteAnnouncement,
      saveYouTubeVideo,
      deleteYouTubeVideo,

      saveSettings,

      addStaff,
      deleteStaff,

      exportToCsv,
      resetToSampleData,
    }),
    [
      products,
      categories,
      filters,
      orders,
      payments,
      stockLedger,
      customers,
      coupons,
      banners,
      announcements,
      youtubeVideos,
      settings,
      staff,
      currentStaff,
      auditLogs,
      toasts,
      pendingPaymentCount,
      lowStockCount,
      totalRevenue,
      todaySales,
      adminToast,
      logAudit,
      verifyPayment,
      rejectPayment,
      updateOrderStatus,
      addInternalOrderNote,
      saveProduct,
      deleteProduct,
      toggleProductStatus,
      adjustStock,
      bulkUpdateStock,
      saveCategory,
      deleteCategory,
      saveFilter,
      deleteFilter,
      toggleCustomerBlock,
      saveCoupon,
      deleteCoupon,
      switchFestiveTheme,
      saveBanner,
      deleteBanner,
      saveAnnouncement,
      toggleAnnouncement,
      deleteAnnouncement,
      saveYouTubeVideo,
      deleteYouTubeVideo,
      saveSettings,
      addStaff,
      deleteStaff,
      exportToCsv,
      resetToSampleData,
    ]
  );

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within an AdminProvider");
  return ctx;
}
