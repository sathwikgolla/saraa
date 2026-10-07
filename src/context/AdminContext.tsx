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
  AdminSubcategory,
} from "@/lib/adminTypes";
import { useStore } from "@/context/StoreContext";
// Admin data access goes through server actions only. The service-role client
// is server-only and must never be imported into this Client Component.
import {
  adminGetOrders,
  adminGetPayments,
  adminGetCustomers,
  adminGetCoupons,
  adminGetBanners,
  adminGetAnnouncements,
  adminGetYoutubeVideos,
  adminGetSettings,
  adminGetStaff,
  adminGetAuditLogs,
  adminGetStockLedger,
  adminGetFilters,
} from "@/app/actions/admin/reads";
import {
  adminCreateCoupon,
  adminUpdateCoupon,
  adminDeleteCoupon,
} from "@/app/actions/admin/coupons";
import { adminAddStaff, adminDeleteStaff } from "@/app/actions/admin/staff";
import { adminUpdateSettings } from "@/app/actions/admin/settings";
import {
  adminSaveBanner,
  adminDeleteBanner,
  adminSaveAnnouncement,
  adminDeleteAnnouncement,
  adminSaveYoutubeVideo,
  adminDeleteYoutubeVideo,
} from "@/app/actions/admin/content";
import { adminSaveFilter, adminDeleteFilter } from "@/app/actions/admin/filters";
import { adminCreateAuditLog } from "@/app/actions/admin/audit";
import {
  adminSaveCategory,
  adminDeleteCategory,
  adminSaveSubcategory,
  adminDeleteSubcategory,
} from "@/app/actions/admin/categories";
import {
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
  adminToggleProductStatus,
} from "@/app/actions/admin/products";
import {
  adminAdjustStock,
  adminBulkUpdateStock,
} from "@/app/actions/admin/inventory";
import {
  adminUpdateOrderStatus,
  adminVerifyPayment,
  adminRejectPayment,
} from "@/app/actions/admin/orders";
import { getCategories as getCategoriesSupabase } from "@/lib/supabase/categories";
import { buildSubcategoryOptions } from "@/lib/catalogTaxonomy";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import {
  SEED_STAFF,
  SEED_CATEGORIES,
  SEED_FILTERS,
  SEED_PAYMENTS,
  SEED_ORDERS,
  SEED_STOCK_LEDGER,
  SEED_COUPONS,
  SEED_CUSTOMERS,
  SEED_FESTIVE_THEMES,
  SEED_BANNERS,
  SEED_ANNOUNCEMENTS,
  SEED_YOUTUBE_VIDEOS,
  SEED_SETTINGS,
  SEED_AUDIT_LOGS,
} from "@/data/adminSeed";

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
  loading: boolean;

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
  verifyPayment: (orderId: string, paymentId: string) => Promise<void>;
  rejectPayment: (orderId: string, paymentId: string, reason: string) => Promise<void>;
  updateOrderStatus: (
    orderId: string,
    newStatus: AdminOrderStatus,
    courierName?: string,
    trackingNumber?: string,
    note?: string
  ) => Promise<void>;
  addInternalOrderNote: (orderId: string, note: string) => void;

  // Products
  saveProduct: (product: Partial<AdminProduct>) => Promise<AdminProduct>;
  deleteProduct: (productId: string) => void;
  toggleProductStatus: (productId: string) => void;

  // Inventory & Stock
  adjustStock: (
    productId: string,
    variantSku: string,
    change: number,
    type: StockChangeType,
    reason: string
  ) => Promise<void>;
  bulkUpdateStock: (rows: { sku: string; stock: number }[]) => Promise<{ updated: number; errors: string[] }>;

  // Categories & Filters
  subcategories: AdminSubcategory[];
  saveCategory: (category: Partial<AdminCategory>) => Promise<AdminCategory>;
  deleteCategory: (id: string) => Promise<void>;
  saveSubcategory: (sub: Partial<AdminSubcategory>) => Promise<AdminSubcategory>;
  deleteSubcategory: (categoryId: string, name: string) => Promise<void>;
  saveFilter: (filter: Partial<CategoryFilter>) => Promise<CategoryFilter>;
  deleteFilter: (id: string) => Promise<void>;

  // Customers
  toggleCustomerBlock: (id: string, reason?: string) => void;

  // Coupons
  saveCoupon: (coupon: Partial<AdminCoupon>) => Promise<AdminCoupon>;
  deleteCoupon: (id: string) => Promise<void>;

  // Content & Festive theme
  switchFestiveTheme: (themeId: FestiveTheme["id"]) => void;
  saveBanner: (banner: Partial<AdminBanner>) => Promise<AdminBanner>;
  deleteBanner: (id: string) => Promise<void>;
  saveAnnouncement: (text: string) => Promise<void>;
  toggleAnnouncement: (id: string) => void;
  deleteAnnouncement: (id: string) => Promise<void>;
  saveYouTubeVideo: (video: Partial<YouTubeVideoItem>) => Promise<YouTubeVideoItem>;
  deleteYouTubeVideo: (id: string) => Promise<void>;

  // Settings
  saveSettings: (patch: Partial<AdminSettings>) => Promise<void>;

  // Staff
  addStaff: (member: Omit<StaffMember, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  deleteStaff: (id: string) => Promise<void>;

  // Utilities
  exportToCsv: (data: Record<string, unknown>[], filename: string) => void;
  resetToSampleData: () => void;
}

const AdminContext = createContext<AdminContextValue | null>(null);

export function AdminProvider({ children }: { children: ReactNode }) {
  const { products: storeProducts, setProducts: setStoreProducts } = useStore();

  const products = storeProducts as unknown as AdminProduct[];
  
  // Supabase-backed state initialized with SEED data as fallback
  const [categories, setCategories] = useState<AdminCategory[]>(SEED_CATEGORIES);

  // Subcategory nodes are DERIVED from the categories table + shared taxonomy.
  // There is no `subcategories` table and no query against one.
  const subcategories = useMemo<AdminSubcategory[]>(
    () =>
      buildSubcategoryOptions(categories).map((option) => ({
        id: option.id,
        categoryId: option.categoryId,
        gender: option.gender as AdminSubcategory["gender"],
        name: option.name,
        slug: option.slug,
        sortOrder: option.sortOrder,
        active: true,
      })),
    [categories]
  );
  const [filters, setFilters] = useState<CategoryFilter[]>(SEED_FILTERS);
  const [orders, setOrders] = useState<AdminOrder[]>(SEED_ORDERS);
  const [payments, setPayments] = useState<AdminPayment[]>(SEED_PAYMENTS);
  const [stockLedger, setStockLedger] = useState<StockLedgerEntry[]>(SEED_STOCK_LEDGER);
  const [customers, setCustomers] = useState<AdminCustomer[]>(SEED_CUSTOMERS);
  const [coupons, setCoupons] = useState<AdminCoupon[]>(SEED_COUPONS);
  const [banners, setBanners] = useState<AdminBanner[]>(SEED_BANNERS);
  const [announcements, setAnnouncements] = useState<AnnouncementBarItem[]>(SEED_ANNOUNCEMENTS);
  const [youtubeVideos, setYoutubeVideos] = useState<YouTubeVideoItem[]>(SEED_YOUTUBE_VIDEOS);
  const [settings, setSettings] = useState<AdminSettings | null>(SEED_SETTINGS);
  const [staff, setStaff] = useState<StaffMember[]>(SEED_STAFF);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(SEED_AUDIT_LOGS);
  const [festiveThemes, setFestiveThemes] = useState<FestiveTheme[]>(SEED_FESTIVE_THEMES);
  const [loading, setLoading] = useState(false);

  const [currentStaff, setCurrentStaff] = useState<StaffMember | null>(SEED_STAFF[0] || null);
  const [toasts, setToasts] = useState<AdminToast[]>([]);

  // Load initial data from Supabase
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    async function loadData() {
      setLoading(true);
      try {
        const [
          ordersRes,
          paymentsRes,
          customersRes,
          couponsRes,
          bannersRes,
          announcementsRes,
          youtubeVideosRes,
          settingsRes,
          staffRes,
          auditLogsRes,
          stockLedgerRes,
          filtersRes,
          categoriesData,
        ] = await Promise.all([
          adminGetOrders(),
          adminGetPayments(),
          adminGetCustomers(),
          adminGetCoupons(),
          adminGetBanners(),
          adminGetAnnouncements(),
          adminGetYoutubeVideos(),
          adminGetSettings(),
          adminGetStaff(),
          adminGetAuditLogs(),
          adminGetStockLedger(),
          adminGetFilters(),
          getCategoriesSupabase(),
        ]);

        setOrders(ordersRes.success ? ordersRes.data : SEED_ORDERS);
        setPayments(paymentsRes.success ? paymentsRes.data : SEED_PAYMENTS);
        setCustomers(customersRes.success ? customersRes.data : SEED_CUSTOMERS);
        setCoupons(couponsRes.success ? couponsRes.data : SEED_COUPONS);
        setBanners(bannersRes.success ? bannersRes.data : SEED_BANNERS);
        setAnnouncements(announcementsRes.success ? announcementsRes.data : SEED_ANNOUNCEMENTS);
        setYoutubeVideos(youtubeVideosRes.success ? youtubeVideosRes.data : SEED_YOUTUBE_VIDEOS);
        setSettings(settingsRes.success ? settingsRes.data : SEED_SETTINGS);
        setStaff(staffRes.success ? staffRes.data : SEED_STAFF);
        setAuditLogs(auditLogsRes.success ? auditLogsRes.data : SEED_AUDIT_LOGS);
        setStockLedger(stockLedgerRes.success ? stockLedgerRes.data : SEED_STOCK_LEDGER);
        setFilters(filtersRes.success ? filtersRes.data : SEED_FILTERS);
        if (categoriesData && categoriesData.length > 0) {
          setCategories(categoriesData as AdminCategory[]);
        }
        
        if (staffRes.success && staffRes.data.length > 0) {
          setCurrentStaff(staffRes.data[0]);
        }
      } catch (error) {
        console.error('Error loading admin data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

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
      if (!currentStaff) return;
      // Persisted server-side (service-role, admin-verified). Fire-and-forget so
      // an audit write never blocks the action it describes.
      void adminCreateAuditLog({
        staffName: currentStaff.name,
        role: currentStaff.role,
        module,
        action,
        description,
        ipAddress: "unknown",
      }).catch(() => {});
      const entry: AuditLogEntry = {
        id: "aud_" + Math.random().toString(36).slice(2, 9),
        timestamp: new Date().toISOString(),
        staffName: currentStaff.name,
        role: currentStaff.role,
        module,
        action,
        description,
        ipAddress: "unknown",
      };
      setAuditLogs((prev) => [entry, ...prev].slice(0, 200));
    },
    [currentStaff]
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
    () => orders.reduce((sum, o) => sum + o.total, 0),
    [orders]
  );

  const todaySales = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return orders
      .filter((o) => o.placedAt.startsWith(today))
      .reduce((sum, o) => sum + o.total, 0);
  }, [orders]);

  // Orders & Payments
  const verifyPayment = useCallback(
    async (orderId: string, paymentId: string) => {
      if (!currentStaff) return;
      const result = await adminVerifyPayment(paymentId, currentStaff.name);
      if (result.success) {
        setOrders((prev) => prev.map((o) => 
          o.id === orderId ? { ...o, paymentStatus: "Verified" as const } : o
        ));
        setPayments((prev) => prev.map((p) => 
          p.id === paymentId ? { ...p, status: "verified" as const } : p
        ));
        logAudit("Payments", "Verify", `Verified payment ${paymentId} for order ${orderId}`);
        adminToast("Payment verified", "success");
      } else {
        adminToast(result.error || "Failed to verify payment", "error");
      }
    },
    [currentStaff, logAudit, adminToast]
  );

  const rejectPayment = useCallback(
    async (orderId: string, paymentId: string, reason: string) => {
      if (!currentStaff) return;
      const result = await adminRejectPayment(paymentId, reason, currentStaff.name);
      if (result.success) {
        setOrders((prev) => prev.map((o) => 
          o.id === orderId ? { ...o, paymentStatus: "Failed" as const } : o
        ));
        setPayments((prev) => prev.map((p) => 
          p.id === paymentId ? { ...p, status: "rejected" as const, rejectionReason: reason } : p
        ));
        logAudit("Payments", "Reject", `Rejected payment ${paymentId} for order ${orderId}: ${reason}`);
        adminToast("Payment rejected", "error");
      } else {
        adminToast(result.error || "Failed to reject payment", "error");
      }
    },
    [currentStaff, logAudit, adminToast]
  );

  const updateOrderStatus = useCallback(
    async (
      orderId: string,
      newStatus: AdminOrderStatus,
      courierName?: string,
      trackingNumber?: string,
      note?: string
    ) => {
      if (!currentStaff) return;
      const result = await adminUpdateOrderStatus(orderId, newStatus, currentStaff.name, note);
      if (result.success) {
        setOrders((prev) => prev.map((o) => {
          if (o.id === orderId) {
            const updated = { ...o, orderStatus: newStatus };
            if (courierName) updated.courierName = courierName;
            if (trackingNumber) updated.trackingNumber = trackingNumber;
            if (note) updated.internalNotes = [...(o.internalNotes || []), note];
            return updated;
          }
          return o;
        }));
        logAudit("Orders", "Update", `Updated order ${orderId} to ${newStatus}`);
        adminToast(`Order status updated to ${newStatus}`);
      } else {
        adminToast(result.error || "Failed to update order status", "error");
      }
    },
    [currentStaff, logAudit, adminToast]
  );

  const addInternalOrderNote = useCallback((orderId: string, note: string) => {
    setOrders((prev) => prev.map((o) => {
      if (o.id === orderId) {
        return {
          ...o,
          internalNotes: [...(o.internalNotes || []), note],
        };
      }
      return o;
    }));
    logAudit("Orders", "Update", `Added note to order ${orderId}`);
    adminToast("Note added to order");
  }, [logAudit, adminToast]);

  // Products
  const saveProduct = useCallback(async (product: Partial<AdminProduct>): Promise<AdminProduct> => {
    if (product.id && products.some((p) => p.id === product.id)) {
      const result = await adminUpdateProduct(product.id, product as any);
      if (result.success) {
        setStoreProducts((prev) =>
          prev.map((p) => (p.id === product.id ? ({ ...p, ...product } as any) : p))
        );
        logAudit("Products", "Update", `Updated product '${product.name || product.id}'`);
        adminToast("Product updated", "success");
        return product as AdminProduct;
      } else {
        adminToast(result.error || "Failed to update product", "error");
        return product as AdminProduct;
      }
    } else {
      const result = await adminCreateProduct(product as any);
      if (result.success) {
        const createdProduct = (result.data || product) as any;
        setStoreProducts((prev) => [createdProduct, ...prev]);
        logAudit("Products", "Create", `Created product '${product.name || product.id}'`);
        adminToast("Product created", "success");
        return createdProduct as AdminProduct;
      } else {
        adminToast(result.error || "Failed to create product", "error");
        return product as AdminProduct;
      }
    }
  }, [products, setStoreProducts, logAudit, adminToast]);

  const deleteProduct = useCallback(async (productId: string) => {
    const result = await adminDeleteProduct(productId);
    if (result.success) {
      setStoreProducts((prev) => prev.filter((p) => p.id !== productId));
      logAudit("Products", "Delete", `Deleted product ${productId}`);
      adminToast("Product deleted", "info");
    } else {
      adminToast(result.error || "Failed to delete product", "error");
    }
  }, [setStoreProducts, logAudit, adminToast]);

  const toggleProductStatus = useCallback(async (productId: string) => {
    const result = await adminToggleProductStatus(productId);
    if (result.success) {
      const match = products.find((p) => p.id === productId);
      const nextStatus = match?.status === "live" ? "draft" : "live";
      setStoreProducts((prev) =>
        prev.map((p) => (p.id === productId ? ({ ...p, status: nextStatus } as any) : p))
      );
      logAudit("Products", "Update", `Changed '${match?.name || productId}' status to ${nextStatus}`);
      adminToast(`Product is now ${nextStatus.toUpperCase()}`, "info");
    } else {
      adminToast(result.error || "Failed to toggle product status", "error");
    }
  }, [products, setStoreProducts, logAudit, adminToast]);

  // Inventory & Stock
  const adjustStock = useCallback(
    async (
      productId: string,
      variantSku: string,
      change: number,
      type: StockChangeType,
      reason: string
    ) => {
      const prod = products.find((p) => p.id === productId);
      const prodName = prod?.name;
      const varIndex = prod?.variants?.findIndex((v) => v.sku === variantSku) ?? -1;
      const variant = prod?.variants?.[varIndex];
      const varLabel = variant ? `${variant.size} / ${variant.color}` : variantSku;
      const prevCount = variant?.stock ?? 0;
      const newCount = Math.max(0, prevCount + change);

      const result = await adminAdjustStock(productId, variantSku, change);
      if (result.success) {
        setStoreProducts((prev) =>
          prev.map((p) => {
            if (p.id !== productId) return p;
            const updatedVariants = p.variants?.map((v) =>
              v.sku === variantSku ? { ...v, stock: newCount } : v
            );
            const totalStock = updatedVariants?.reduce((acc, v) => acc + (v.stock || 0), 0) ?? newCount;
            return {
              ...p,
              variants: updatedVariants,
              stock: totalStock,
              inStock: totalStock > 0,
            };
          })
        );
        const ledgerEntry: StockLedgerEntry = {
          id: `SL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date().toISOString(),
          productId,
          productName: prodName || "Product",
          variantSku,
          variantLabel: varLabel,
          type,
          change,
          previousStock: prevCount,
          newStock: newCount,
          reason,
          staffName: currentStaff?.name || "System",
          referenceId: productId,
        };
        setStockLedger((prev) => [ledgerEntry, ...prev]);
        logAudit("Inventory", "Adjust Stock", `Stock ${type.toLowerCase()}: ${prodName} (${varLabel}) by ${change} - ${reason}`);
        adminToast(`Stock updated: ${varLabel} ${change > 0 ? "+" : ""}${change}`, "success");
      } else {
        adminToast(result.error || "Failed to adjust stock", "error");
      }
    },
    [products, currentStaff, logAudit, adminToast]
  );

  const bulkUpdateStock = useCallback(
    async (rows: { sku: string; stock: number }[]) => {
      const result = await adminBulkUpdateStock(rows);
      if (!result.success) {
        adminToast(result.error, "error");
        return { updated: 0, errors: [result.error] };
      }
      logAudit("Inventory", "Adjust Stock", `Bulk updated stock for ${result.data.updated} SKU(s)`);
      adminToast(`Updated stock for ${result.data.updated} SKU(s)`, "success");
      return { updated: result.data.updated, errors: result.data.errors };
    },
    [logAudit, adminToast]
  );

  // Categories & Filters
  const saveCategory = useCallback(
    async (patch: Partial<AdminCategory>): Promise<AdminCategory> => {
      const result = await adminSaveCategory(patch);
      if (result.success && result.data) {
        const saved = result.data;
        setCategories((prev) => {
          const exists = prev.some((c) => c.id === saved.id);
          return exists ? prev.map((c) => (c.id === saved.id ? saved : c)) : [saved, ...prev];
        });
        logAudit(
          "Categories",
          patch.id ? "Update" : "Create",
          `${patch.id ? "Updated" : "Created"} category '${saved.name}'`
        );
        adminToast(patch.id ? "Category updated" : "Category created", "success");
        return saved;
      }
      if (!result.success) adminToast(result.error, "error");
      return categories[0] ?? ({} as AdminCategory);
    },
    [categories, logAudit, adminToast]
  );

  const deleteCategory = useCallback(
    async (id: string) => {
      const result = await adminDeleteCategory(id);
      if (!result.success) {
        adminToast(result.error, "error");
        return;
      }
      setCategories((prev) => prev.filter((c) => c.id !== id));
      logAudit("Categories", "Delete", `Deleted category ${id}`);
      adminToast("Category deleted", "info");
    },
    [logAudit, adminToast]
  );

  const saveSubcategory = useCallback(
    async (patch: Partial<AdminSubcategory>): Promise<AdminSubcategory> => {
      const result = await adminSaveSubcategory(patch);
      if (result.success && result.data) {
        const saved = result.data;
        setCategories((prev) =>
          prev.map((c) =>
            c.id === saved.categoryId &&
            !(c.subcategories ?? []).some((n) => n.toLowerCase() === saved.name.toLowerCase())
              ? { ...c, subcategories: [...(c.subcategories ?? []), saved.name] }
              : c
          )
        );
        logAudit("Categories", "Update", `Saved subcategory '${saved.name}'`);
        adminToast("Subcategory saved", "success");
        return saved;
      }
      if (!result.success) adminToast(result.error, "error");
      return {} as AdminSubcategory;
    },
    [logAudit, adminToast]
  );

  const deleteSubcategory = useCallback(
    async (categoryId: string, name: string) => {
      const result = await adminDeleteSubcategory({ categoryId, name });
      if (!result.success) {
        adminToast(result.error, "error");
        return;
      }
      setCategories((prev) =>
        prev.map((c) =>
          c.id === categoryId
            ? {
                ...c,
                subcategories: (c.subcategories ?? []).filter(
                  (n) => n.toLowerCase() !== name.toLowerCase()
                ),
              }
            : c
        )
      );
      logAudit("Categories", "Delete", `Deleted subcategory ${name}`);
      adminToast("Subcategory deleted", "info");
    },
    [logAudit, adminToast]
  );

  const saveFilter = useCallback(
    async (patch: Partial<CategoryFilter>): Promise<CategoryFilter> => {
      const result = await adminSaveFilter(patch);
      if (result.success && result.data) {
        const saved = result.data;
        setFilters((prev) => {
          const exists = prev.some((f) => f.id === saved.id);
          if (exists) {
            return prev.map((f) => (f.id === saved.id ? saved : f));
          }
          return [saved, ...prev];
        });
        logAudit("Categories", "Update", `Saved filter '${patch.name || patch.id}'`);
        adminToast("Filter saved", "success");
        return saved;
      }
      if (!result.success) adminToast(result.error, "error");
      return filters[0] as CategoryFilter;
    },
    [filters, logAudit, adminToast]
  );

  const deleteFilter = useCallback(
    async (id: string) => {
      const result = await adminDeleteFilter(id);
      if (!result.success) {
        adminToast(result.error, "error");
        return;
      }
      setFilters((prev) => prev.filter((f) => f.id !== id));
      logAudit("Categories", "Delete", `Deleted filter ${id}`);
      adminToast("Filter deleted", "info");
    },
    [logAudit, adminToast]
  );

  // Customers
  const toggleCustomerBlock = useCallback((id: string, reason?: string) => {
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const blocked = !(c as any).blocked;
          logAudit("Orders", "Update", `${blocked ? "Blocked" : "Unblocked"} customer ${c.name}${reason ? `: ${reason}` : ""}`);
          adminToast(`Customer ${blocked ? "blocked" : "unblocked"}`, blocked ? "error" : "success");
          return { ...c, blocked, blockedAt: blocked ? new Date().toISOString() : undefined, blockReason: blocked ? reason : undefined };
        }
        return c;
      })
    );
  }, [logAudit, adminToast]);

  // Coupons
  const saveCoupon = useCallback(
    async (patch: Partial<AdminCoupon>): Promise<AdminCoupon> => {
      let result: AdminCoupon | null = null;
      if (patch.id && coupons.some((c) => c.id === patch.id)) {
        const res = await adminUpdateCoupon(patch.id, patch);
        if (!res.success) {
          adminToast(res.error, "error");
        } else {
          const existing = coupons.find((c) => c.id === patch.id);
          if (existing) {
            result = { ...existing, ...patch } as AdminCoupon;
            setCoupons((prev) => prev.map((c) => (c.id === patch.id ? result! : c)));
            logAudit("Coupons", "Update", `Updated coupon '${patch.code || patch.id}'`);
            adminToast("Coupon updated", "success");
          }
        }
      } else {
        const res = await adminCreateCoupon(
          patch as Omit<AdminCoupon, "id" | "usedCount" | "createdAt" | "updatedAt">
        );
        if (!res.success) {
          adminToast(res.error, "error");
        } else if (res.data) {
          result = res.data;
          setCoupons((prev) => [...prev, res.data!]);
          logAudit("Coupons", "Create", `Created coupon '${res.data.code}'`);
          adminToast("Coupon created", "success");
        }
      }
      if (!result && coupons.length > 0) {
        result = coupons[0];
      }
      return result || ({} as AdminCoupon);
    },
    [coupons, logAudit, adminToast]
  );

  const deleteCoupon = useCallback(
    async (id: string) => {
      const result = await adminDeleteCoupon(id);
      if (!result.success) {
        adminToast(result.error, "error");
        return;
      }
      setCoupons((prev) => prev.filter((c) => c.id !== id));
      logAudit("Coupons", "Delete", `Deleted coupon ${id}`);
      adminToast("Coupon deleted", "info");
    },
    [logAudit, adminToast]
  );

  // Content & Festive theme
  const switchFestiveTheme = useCallback(async (themeId: FestiveTheme["id"]) => {
    setFestiveThemes((prev) =>
      prev.map((t) => ({ ...t, active: t.id === themeId }))
    );
    setSettings((prev) => (prev ? { ...prev, activeFestiveTheme: themeId } : prev));
    try {
      await adminUpdateSettings({ activeFestiveTheme: themeId });
    } catch (e) {
      console.warn("Could not persist festive theme to server:", e);
    }
    logAudit("Content", "Theme Change", `Switched to festive theme ${themeId}`);
    adminToast("Festive theme activated");
  }, [logAudit, adminToast]);

  const saveBanner = useCallback(
    async (patch: Partial<AdminBanner>): Promise<AdminBanner> => {
      const result = await adminSaveBanner(patch);
      if (result.success && result.data) {
        const saved = result.data;
        setBanners((prev) => {
          const exists = prev.some((b) => b.id === saved.id);
          if (exists) {
            return prev.map((b) => (b.id === saved.id ? saved : b));
          }
          return [saved, ...prev];
        });
        logAudit("Content", "Update", `Saved banner ${patch.id || "new"}`);
        adminToast("Banner saved", "success");
        return saved;
      }
      if (!result.success) adminToast(result.error, "error");
      return banners[0] as AdminBanner;
    },
    [banners, logAudit, adminToast]
  );

  const deleteBanner = useCallback(
    async (id: string) => {
      const result = await adminDeleteBanner(id);
      if (!result.success) {
        adminToast(result.error, "error");
        return;
      }
      setBanners((prev) => prev.filter((b) => b.id !== id));
      logAudit("Content", "Delete", `Deleted banner ${id}`);
      adminToast("Banner deleted", "info");
    },
    [logAudit, adminToast]
  );

  const saveAnnouncement = useCallback(
    async (text: string) => {
      const result = await adminSaveAnnouncement({ text, active: true });
      if (result.success && result.data) {
        const saved = result.data;
        setAnnouncements((prev) => [saved, ...prev]);
        logAudit("Content", "Create", `Created announcement: ${text}`);
        adminToast("Announcement created", "success");
      } else if (!result.success) {
        adminToast(result.error, "error");
      }
    },
    [logAudit, adminToast]
  );

  const toggleAnnouncement = useCallback((id: string) => {
    setAnnouncements((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          const active = !a.active;
          logAudit("Content", "Update", `${active ? "Activated" : "Deactivated"} announcement ${id}`);
          adminToast(`Announcement ${active ? "activated" : "deactivated"}`, "info");
          return { ...a, active };
        }
        return a;
      })
    );
  }, [logAudit, adminToast]);

  const deleteAnnouncement = useCallback(
    async (id: string) => {
      const result = await adminDeleteAnnouncement(id);
      if (!result.success) {
        adminToast(result.error, "error");
        return;
      }
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
      logAudit("Content", "Delete", `Deleted announcement ${id}`);
      adminToast("Announcement deleted", "info");
    },
    [logAudit, adminToast]
  );

  const saveYouTubeVideo = useCallback(
    async (patch: Partial<YouTubeVideoItem>): Promise<YouTubeVideoItem> => {
      const result = await adminSaveYoutubeVideo(patch);
      if (result.success && result.data) {
        const saved = result.data;
        setYoutubeVideos((prev) => {
          const exists = prev.some((v) => v.id === saved.id);
          if (exists) {
            return prev.map((v) => (v.id === saved.id ? saved : v));
          }
          return [saved, ...prev];
        });
        logAudit("Content", "Update", `Saved YouTube video ${patch.id || "new"}`);
        adminToast("Video saved", "success");
        return saved;
      }
      if (!result.success) adminToast(result.error, "error");
      return youtubeVideos[0] as YouTubeVideoItem;
    },
    [youtubeVideos, logAudit, adminToast]
  );

  const deleteYouTubeVideo = useCallback(
    async (id: string) => {
      const result = await adminDeleteYoutubeVideo(id);
      if (!result.success) {
        adminToast(result.error, "error");
        return;
      }
      setYoutubeVideos((prev) => prev.filter((v) => v.id !== id));
      logAudit("Content", "Delete", `Deleted YouTube video ${id}`);
      adminToast("Video deleted", "info");
    },
    [logAudit, adminToast]
  );

  // Settings
  const saveSettings = useCallback(
    async (patch: Partial<AdminSettings>) => {
      if (settings) {
        const result = await adminUpdateSettings({ ...settings, ...patch });
        if (!result.success) {
          adminToast(result.error, "error");
          return;
        }
        setSettings((prev) => (prev ? { ...prev, ...patch } : null));
        logAudit("Settings", "Update", `Updated settings`);
        adminToast("Settings saved", "success");
      }
    },
    [settings, logAudit, adminToast]
  );

  // Staff
  const addStaff = useCallback(
    async (member: Omit<StaffMember, "id" | "createdAt" | "updatedAt">) => {
      const result = await adminAddStaff(member);
      if (result.success && result.data) {
        const saved = result.data;
        setStaff((prev) => [...prev, saved]);
        logAudit("Staff", "Create", `Added staff member ${member.name}`);
        adminToast("Staff member added", "success");
      } else if (!result.success) {
        adminToast(result.error, "error");
      }
    },
    [logAudit, adminToast]
  );

  const deleteStaff = useCallback(
    async (id: string) => {
      const result = await adminDeleteStaff(id);
      if (!result.success) {
        adminToast(result.error, "error");
        return;
      }
      setStaff((prev) => prev.filter((s) => s.id !== id));
      if (currentStaff?.id === id) {
        setCurrentStaff(staff[0] || null);
      }
      logAudit("Staff", "Delete", `Deleted staff member ${id}`);
      adminToast("Staff member deleted", "info");
    },
    [currentStaff, staff, logAudit, adminToast]
  );

  // Utilities
  const exportToCsv = useCallback((data: Record<string, unknown>[], filename: string) => {
    if (data.length === 0) {
      adminToast("No data to export", "error");
      return;
    }
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(","),
      ...data.map((row) => headers.map((h) => JSON.stringify(row[h] ?? "")).join(",")),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    logAudit("Reports", "Export", `Exported ${filename}.csv`);
    adminToast("Export successful");
  }, [logAudit, adminToast]);

  const resetToSampleData = useCallback(() => {
    if (confirm("This will reset all admin data to defaults. Are you sure?")) {
      window.location.reload();
    }
  }, []);

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
      festiveThemes,
      settings: settings || {} as AdminSettings,
      staff,
      currentStaff: currentStaff || {} as StaffMember,
      auditLogs,
      toasts,
      loading,
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
      subcategories,
      saveSubcategory,
      deleteSubcategory,
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
      festiveThemes,
      settings,
      staff,
      currentStaff,
      auditLogs,
      toasts,
      loading,
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
      subcategories,
      saveSubcategory,
      deleteSubcategory,
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

export function useAdmin(): AdminContextValue {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within an AdminProvider");
  return ctx;
}
