"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import type {
  Address,
  AppNotification,
  AuthResult,
  CartItem,
  MockUser,
  Order,
  Product,
  ProductVariant,
  QAItem,
  ReturnRecord,
  Review,
  Theme,
  Toast,
  User,
} from "@/lib/types";
import type { StockChangeType } from "@/lib/adminTypes";
import { products as INITIAL_PRODUCTS } from "@/data/products";
import { mockHash, uid } from "@/lib/utils";

interface StoreValue {
  // Core
  cart: CartItem[];
  wishlist: string[];
  orders: Order[];
  toasts: Toast[];
  user: User | null;
  addresses: Address[];
  hydrated: boolean;

  // Products & Unified Inventory
  products: Product[];
  saveProduct: (product: Partial<Product>) => Product;
  deleteProduct: (productId: string) => void;
  toggleProductStatus: (productId: string) => void;
  adjustStock: (
    productId: string,
    variantSku: string,
    change: number,
    type: StockChangeType,
    reason: string
  ) => void;
  bulkUpdateStock: (rows: { sku: string; stock: number }[]) => { updated: number; errors: string[] };
  resetProducts: () => void;
  getProductById: (id: string) => Product | undefined;
  getProductBySlug: (slug: string) => Product | undefined;

  // Extended
  recentlyViewed: string[];
  notifyList: string[];
  priceAlerts: string[];
  notifications: AppNotification[];
  userReviews: Record<string, Review[]>;
  questions: Record<string, QAItem[]>;
  recentSearches: string[];
  compare: string[];
  returns: Record<string, ReturnRecord>;
  theme: Theme;

  // Auth
  login: (identifier: string, password: string) => AuthResult;
  register: (data: { name: string; email: string; mobile: string; password: string }) => AuthResult;
  logout: () => void;
  updateProfile: (patch: { name?: string; email?: string; mobile?: string }) => void;

  // Addresses
  addAddress: (address: Omit<Address, "id">) => Address;
  updateAddress: (id: string, address: Omit<Address, "id">) => void;
  removeAddress: (id: string) => void;

  // Cart
  addToCart: (productId: string, qty?: number, color?: string, size?: string) => void;
  removeFromCart: (key: string) => void;
  updateQty: (key: string, qty: number) => void;
  moveToWishlist: (key: string) => void;
  moveToCart: (productId: string) => void;
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  placeOrder: (order: Omit<Order, "id" | "placedAt">) => Order;
  cancelOrder: (orderId: string) => void;
  clearCart: () => void;

  // Recently viewed
  addRecentlyViewed: (productId: string) => void;
  removeRecentlyViewed: (productId: string) => void;

  // Notify me
  isNotified: (productId: string) => boolean;
  toggleNotify: (productId: string) => void;

  // Price drop alert
  isPriceAlerted: (productId: string) => boolean;
  togglePriceAlert: (productId: string) => void;

  // Notifications
  markAllNotificationsRead: () => void;

  // Reviews
  addReview: (productId: string, review: Omit<Review, "id">) => void;

  // Q&A
  addQuestion: (productId: string, text: string) => void;

  // Search
  addRecentSearch: (q: string) => void;
  clearRecentSearches: () => void;

  // Compare
  toggleCompare: (productId: string) => void;
  isCompared: (productId: string) => boolean;
  clearCompare: () => void;

  // Returns
  requestReturn: (orderId: string, reason: string) => void;

  // Theme
  toggleTheme: () => void;

  toast: (message: string, type?: Toast["type"]) => void;
}

const StoreContext = createContext<StoreValue | null>(null);

function useStoredState<T>(key: string, fallback: T) {
  const [state, setState] = useState<T>(fallback);
  const [hydrated, setHydrated] = useState(false);
  const fallbackRef = useRef(fallback);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setState(JSON.parse(raw) as T);
    } catch {
      /* ignore corrupted storage */
    }
    setHydrated(true);
  }, [key]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {
      /* storage may be unavailable */
    }
  }, [key, state, hydrated]);

  useEffect(() => {
    fallbackRef.current = fallback;
  }, [fallback]);

  return [state, setState, hydrated] as const;
}

function stripHash(user: MockUser): User {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    mobile: user.mobile,
    createdAt: user.createdAt,
  };
}

const SEED_NOTIFICATIONS: AppNotification[] = [
  { id: "n1", type: "offer", title: "Weekend Sale is live!", message: "Up to 50% off on fashion, clothing and footwear. Shop now.", time: "2h ago", read: false },
  { id: "n2", type: "stock", title: "Back in stock", message: "White Leather Minimalist Sneakers are back in stock.", time: "1d ago", read: false },
  { id: "n3", type: "price", title: "Price dropped", message: "The price of Men's Oxford Cotton Shirt dropped by ₹200.", time: "2d ago", read: true },
  { id: "n4", type: "delivery", title: "Delivery update", message: "Your recent order is out for delivery and arriving today.", time: "3d ago", read: true },
];

export function StoreProvider({ children }: { children: ReactNode }) {
  // Shared authoritative products state
  const [products, setProducts, productsHydrated] = useStoredState<Product[]>(
    "miracle:products",
    INITIAL_PRODUCTS
  );

  const [cart, setCart, cartHydrated] = useStoredState<CartItem[]>("saara:cart", []);
  const [wishlist, setWishlist, wishHydrated] = useStoredState<string[]>("saara:wishlist", []);
  const [orders, setOrders, ordersHydrated] = useStoredState<Order[]>("saara:orders", []);
  const [user, setUser, userHydrated] = useStoredState<User | null>("saara:user", null);
  const [users, setUsers, usersHydrated] = useStoredState<MockUser[]>("saara:users", []);
  const [addresses, setAddresses, addressesHydrated] = useStoredState<Address[]>("saara:addresses", []);
  const [recentlyViewed, setRecentlyViewed, rvHydrated] = useStoredState<string[]>("saara:recentlyViewed", []);
  const [notifyList, setNotifyList, notifyHydrated] = useStoredState<string[]>("saara:notifyList", []);
  const [priceAlerts, setPriceAlerts, paHydrated] = useStoredState<string[]>("saara:priceAlerts", []);
  const [notifications, setNotifications, notifHydrated] = useStoredState<AppNotification[]>("saara:notifications", SEED_NOTIFICATIONS);
  const [userReviews, setUserReviews, urHydrated] = useStoredState<Record<string, Review[]>>("saara:userReviews", {});
  const [questions, setQuestions, qHydrated] = useStoredState<Record<string, QAItem[]>>("saara:questions", {});
  const [recentSearches, setRecentSearches, rsHydrated] = useStoredState<string[]>("saara:recentSearches", []);
  const [compare, setCompare, compareHydrated] = useStoredState<string[]>("saara:compare", []);
  const [returns, setReturns, returnsHydrated] = useStoredState<Record<string, ReturnRecord>>("saara:returns", {});
  const [theme, setTheme, themeHydrated] = useStoredState<Theme>("saara:theme", "light");
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Sanitize stored products to ensure ONLY clothing and footwear exist and seed latest demo catalog if outdated
  useEffect(() => {
    try {
      const existing = localStorage.getItem("miracle:products");
      if (existing) {
        const parsed = JSON.parse(existing);
        if (Array.isArray(parsed)) {
          const hasInvalidCategories = parsed.some(
            (p: any) => p.categoryId !== "clothing" && p.categoryId !== "footwear"
          );
          if (hasInvalidCategories || parsed.length < 40) {
            // Retain any custom products added by Admin that belong to clothing or footwear
            const validCustom = parsed.filter(
              (p: any) =>
                (p.categoryId === "clothing" || p.categoryId === "footwear") &&
                !INITIAL_PRODUCTS.some((ip) => ip.id === p.id)
            );
            const merged = [...INITIAL_PRODUCTS, ...validCustom];
            localStorage.setItem("miracle:products", JSON.stringify(merged));
            setProducts(merged);
          }
        }
      }
      // Remove deprecated admin key to prevent stale split state
      localStorage.removeItem("miracle:admin:products");
    } catch {}
  }, [setProducts]);

  // Sync across browser tabs/windows automatically
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "miracle:products" && e.newValue) {
        try {
          setProducts(JSON.parse(e.newValue));
        } catch {}
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [setProducts]);

  const toast = useCallback((message: string, type: Toast["type"] = "success") => {
    const id = uid();
    setToasts((t) => [...t, { id, message, type }]);
    window.setTimeout(() => {
      setToasts((t) => t.filter((toast) => toast.id !== id));
    }, 2800);
  }, []);

  // Theme side effect
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.style.colorScheme = theme;
  }, [theme]);

  // ------------------ Product Management (Unified Source) ------------------
  const saveProduct = useCallback(
    (patch: Partial<Product>): Product => {
      const now = new Date().toISOString();
      let savedProduct: Product;
      setProducts((prev) => {
        if (patch.id && prev.some((p) => p.id === patch.id)) {
          return prev.map((p) => {
            if (p.id === patch.id) {
              savedProduct = {
                ...p,
                ...patch,
                updatedAt: now,
                stock: patch.variants
                  ? patch.variants.reduce((acc, v) => acc + v.stock, 0)
                  : patch.stock !== undefined
                  ? patch.stock
                  : p.stock,
              } as Product;
              return savedProduct;
            }
            return p;
          });
        } else {
          const newId = patch.id || "mc_prd_" + Math.random().toString(36).slice(2, 8);
          const name = patch.name || "Untitled Product";
          const catId = patch.categoryId === "footwear" ? "footwear" : "clothing";
          const variants =
            patch.variants && patch.variants.length > 0
              ? patch.variants
              : [
                  {
                    id: "var_" + Math.random().toString(36).slice(2, 7),
                    sku: `MC-${name.slice(0, 4).toUpperCase().replace(/[^A-Z]/g, "P")}-${catId === "footwear" ? "42" : "M"}`,
                    size: catId === "footwear" ? "42" : "M",
                    color: (patch.colors && patch.colors[0]) || "Default",
                    stock: 20,
                    reservedStock: 0,
                  },
                ];
          savedProduct = {
            id: newId,
            slug:
              patch.slug ||
              name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)+/g, "") ||
              `product-${newId}`,
            name,
            brand: patch.brand || "Miracle Collections",
            categoryId: catId,
            subCategory: patch.subCategory || (catId === "footwear" ? "Sneakers" : "Shirts"),
            price: Number(patch.price) || 999,
            mrp: Number(patch.mrp) || 1999,
            costPrice: Number(patch.costPrice) || 450,
            rating: patch.rating || 5.0,
            reviews: patch.reviews || 0,
            images:
              patch.images && patch.images.length > 0
                ? patch.images
                : [
                    catId === "footwear"
                      ? "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80"
                      : "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80",
                  ],
            colors: patch.colors && patch.colors.length > 0 ? patch.colors : ["Default"],
            sizes:
              patch.sizes && patch.sizes.length > 0
                ? patch.sizes
                : catId === "footwear"
                ? ["39", "40", "41", "42", "43", "44"]
                : ["S", "M", "L", "XL", "XXL"],
            badges: patch.badges && patch.badges.length > 0 ? patch.badges : ["New"],
            description: patch.description || "",
            specifications:
              patch.specifications && patch.specifications.length > 0
                ? patch.specifications
                : [{ label: "Origin", value: "India" }],
            reviewsList: patch.reviewsList || [],
            variants,
            stock: variants.reduce((acc, v) => acc + v.stock, 0),
            status: patch.status || "live",
            createdAt: now,
            updatedAt: now,
          };
          return [savedProduct, ...prev];
        }
      });
      return savedProduct!;
    },
    [setProducts]
  );

  const deleteProduct = useCallback(
    (productId: string) => {
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    },
    [setProducts]
  );

  const toggleProductStatus = useCallback(
    (productId: string) => {
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id === productId) {
            return { ...p, status: p.status === "live" ? "draft" : "live" };
          }
          return p;
        })
      );
    },
    [setProducts]
  );

  const adjustStock = useCallback(
    (
      productId: string,
      variantSku: string,
      change: number,
      _type: StockChangeType,
      _reason: string
    ) => {
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id === productId) {
            const updatedVariants = (p.variants || []).map((v) => {
              if (v.sku === variantSku) {
                return { ...v, stock: Math.max(0, v.stock + change) };
              }
              return v;
            });
            const totalStock = updatedVariants.reduce((s, v) => s + v.stock, 0);
            return { ...p, variants: updatedVariants, stock: totalStock };
          }
          return p;
        })
      );
    },
    [setProducts]
  );

  const bulkUpdateStock = useCallback(
    (rows: { sku: string; stock: number }[]) => {
      let updatedCount = 0;
      const errors: string[] = [];
      setProducts((prev) =>
        prev.map((p) => {
          let modified = false;
          const updatedVariants = (p.variants || []).map((v) => {
            const match = rows.find(
              (r) => r.sku.trim().toUpperCase() === v.sku.trim().toUpperCase()
            );
            if (match && !isNaN(match.stock) && match.stock >= 0) {
              if (match.stock !== v.stock) {
                updatedCount++;
                modified = true;
                return { ...v, stock: match.stock };
              }
            }
            return v;
          });
          if (modified) {
            return {
              ...p,
              variants: updatedVariants,
              stock: updatedVariants.reduce((s, x) => s + x.stock, 0),
            };
          }
          return p;
        })
      );
      return { updated: updatedCount, errors };
    },
    [setProducts]
  );

  const resetProducts = useCallback(() => {
    setProducts(INITIAL_PRODUCTS);
    try {
      localStorage.setItem("miracle:products", JSON.stringify(INITIAL_PRODUCTS));
    } catch {}
  }, [setProducts]);

  const getProductById = useCallback(
    (id: string) => {
      return products.find((p) => p.id === id);
    },
    [products]
  );

  const getProductBySlug = useCallback(
    (slug: string) => {
      return products.find((p) => p.slug === slug || p.id === slug);
    },
    [products]
  );

  // ------------------ Auth ------------------
  const login = useCallback(
    (identifier: string, password: string): AuthResult => {
      const id = identifier.trim();
      const match = users.find(
        (u) => u.email.toLowerCase() === id.toLowerCase() || u.mobile === id
      );
      if (!match) return { ok: false, error: "No account found with this email or mobile number." };
      if (match.passwordHash !== mockHash(password)) return { ok: false, error: "Incorrect password. Please try again." };
      setUser(stripHash(match));
      return { ok: true };
    },
    [users, setUser]
  );

  const register = useCallback(
    (data: { name: string; email: string; mobile: string; password: string }): AuthResult => {
      const email = data.email.trim().toLowerCase();
      const mobile = data.mobile.trim();
      if (users.some((u) => u.email.toLowerCase() === email)) return { ok: false, error: "An account with this email already exists." };
      if (users.some((u) => u.mobile === mobile)) return { ok: false, error: "An account with this mobile number already exists." };
      const mockUser: MockUser = {
        id: uid(),
        name: data.name.trim(),
        email,
        mobile,
        passwordHash: mockHash(data.password),
        createdAt: new Date().toISOString(),
      };
      setUsers((prev) => [...prev, mockUser]);
      setUser(stripHash(mockUser));
      return { ok: true };
    },
    [users, setUsers, setUser]
  );

  const logout = useCallback(() => {
    setUser(null);
    toast("Logged out successfully", "info");
  }, [setUser, toast]);

  const updateProfile = useCallback(
    (patch: { name?: string; email?: string; mobile?: string }) => {
      setUser((u) => (u ? { ...u, ...patch } : u));
    },
    [setUser]
  );

  // ------------------ Addresses ------------------
  const addAddress = useCallback(
    (address: Omit<Address, "id">) => {
      const full: Address = { ...address, id: uid() };
      setAddresses((prev) => [...prev, full]);
      return full;
    },
    [setAddresses]
  );
  const updateAddress = useCallback(
    (id: string, address: Omit<Address, "id">) => setAddresses((prev) => prev.map((a) => (a.id === id ? { ...a, ...address } : a))),
    [setAddresses]
  );
  const removeAddress = useCallback((id: string) => setAddresses((prev) => prev.filter((a) => a.id !== id)), [setAddresses]);

  // ------------------ Cart ------------------
  const addToCart = useCallback(
    (productId: string, qty = 1, color?: string, size?: string) => {
      const key = `${productId}::${color ?? ""}::${size ?? ""}`;
      setCart((prev) => {
        const existing = prev.find((i) => i.key === key);
        if (existing) return prev.map((i) => (i.key === key ? { ...i, qty: Math.min(10, i.qty + qty) } : i));
        return [...prev, { key, productId, qty, color, size }];
      });
    },
    [setCart]
  );
  const removeFromCart = useCallback((key: string) => setCart((prev) => prev.filter((i) => i.key !== key)), [setCart]);
  const updateQty = useCallback(
    (key: string, qty: number) => setCart((prev) => prev.map((i) => (i.key === key ? { ...i, qty: Math.max(1, Math.min(10, qty)) } : i))),
    [setCart]
  );
  const moveToWishlist = useCallback(
    (key: string) => {
      const item = cart.find((i) => i.key === key);
      if (item) {
        setWishlist((prev) => (prev.includes(item.productId) ? prev : [...prev, item.productId]));
        setCart((prev) => prev.filter((i) => i.key !== key));
        toast("Moved to wishlist", "info");
      }
    },
    [cart, setCart, setWishlist, toast]
  );
  const moveToCart = useCallback(
    (productId: string) => {
      setWishlist((prev) => prev.filter((id) => id !== productId));
      setCart((prev) =>
        prev.some((i) => i.productId === productId)
          ? prev
          : [...prev, { key: `${productId}::`, productId, qty: 1 }]
      );
      toast("Moved to cart");
    },
    [setWishlist, setCart, toast]
  );
  const toggleWishlist = useCallback(
    (productId: string) => {
      setWishlist((prev) => {
        const has = prev.includes(productId);
        toast(has ? "Removed from wishlist" : "Added to wishlist", has ? "info" : "success");
        return has ? prev.filter((id) => id !== productId) : [...prev, productId];
      });
    },
    [setWishlist, toast]
  );
  const isWishlisted = useCallback((productId: string) => wishlist.includes(productId), [wishlist]);

  // ------------------ Recently viewed ------------------
  const addRecentlyViewed = useCallback(
    (productId: string) => {
      setRecentlyViewed((prev) => [productId, ...prev.filter((id) => id !== productId)].slice(0, 10));
    },
    [setRecentlyViewed]
  );
  const removeRecentlyViewed = useCallback((productId: string) => setRecentlyViewed((prev) => prev.filter((id) => id !== productId)), [setRecentlyViewed]);

  // ------------------ Notify me ------------------
  const isNotified = useCallback((productId: string) => notifyList.includes(productId), [notifyList]);
  const toggleNotify = useCallback(
    (productId: string) => {
      setNotifyList((prev) => {
        const has = prev.includes(productId);
        toast(has ? "Removed from notification list" : "You're on the notification list", has ? "info" : "success");
        return has ? prev.filter((id) => id !== productId) : [...prev, productId];
      });
    },
    [setNotifyList, toast]
  );

  // ------------------ Price drop alert ------------------
  const isPriceAlerted = useCallback((productId: string) => priceAlerts.includes(productId), [priceAlerts]);
  const togglePriceAlert = useCallback(
    (productId: string) => {
      setPriceAlerts((prev) => {
        const has = prev.includes(productId);
        toast(has ? "Price alert removed" : "You'll be notified when the price drops", has ? "info" : "success");
        return has ? prev.filter((id) => id !== productId) : [...prev, productId];
      });
    },
    [setPriceAlerts, toast]
  );

  // ------------------ Notifications ------------------
  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast("All notifications marked as read", "info");
  }, [setNotifications, toast]);

  // ------------------ Reviews ------------------
  const addReview = useCallback(
    (productId: string, review: Omit<Review, "id">) => {
      setUserReviews((prev) => ({
        ...prev,
        [productId]: [...(prev[productId] ?? []), { ...review, id: uid() }],
      }));
      toast("Review submitted — thank you!");
    },
    [setUserReviews, toast]
  );

  // ------------------ Q&A ------------------
  const addQuestion = useCallback(
    (productId: string, text: string) => {
      setQuestions((prev) => ({
        ...prev,
        [productId]: [
          { id: uid(), author: user?.name ?? "Guest", question: text, date: "Just now" },
          ...(prev[productId] ?? []),
        ],
      }));
      toast("Your question has been posted");
    },
    [setQuestions, user, toast]
  );

  // ------------------ Search ------------------
  const addRecentSearch = useCallback(
    (q: string) => {
      const term = q.trim();
      if (!term) return;
      setRecentSearches((prev) => [term, ...prev.filter((s) => s.toLowerCase() !== term.toLowerCase())].slice(0, 6));
    },
    [setRecentSearches]
  );
  const clearRecentSearches = useCallback(() => setRecentSearches([]), [setRecentSearches]);

  // ------------------ Compare ------------------
  const toggleCompare = useCallback(
    (productId: string) => {
      setCompare((prev) => {
        const has = prev.includes(productId);
        if (has) {
          toast("Removed from compare", "info");
          return prev.filter((id) => id !== productId);
        }
        if (prev.length >= 4) {
          toast("You can compare up to 4 products", "error");
          return prev;
        }
        toast("Added to compare");
        return [...prev, productId];
      });
    },
    [setCompare, toast]
  );
  const isCompared = useCallback((productId: string) => compare.includes(productId), [compare]);
  const clearCompare = useCallback(() => setCompare([]), [setCompare]);

  // ------------------ Orders ------------------
  const placeOrder = useCallback(
    (order: Omit<Order, "id" | "placedAt">) => {
      const full: Order = {
        ...order,
        id: "OD" + Math.floor(100000 + Math.random() * 900000),
        placedAt: new Date().toISOString(),
      };
      setOrders((prev) => [full, ...prev]);
      setCart([]);
      setNotifications((prev) => [
        { id: uid(), type: "order", title: "Order confirmed", message: `Your order ${full.id} has been confirmed.`, time: "Just now", read: false },
        ...prev,
      ]);
      return full;
    },
    [setOrders, setCart, setNotifications]
  );

  const cancelOrder = useCallback(
    (orderId: string) => {
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: "Cancelled" as const } : o)));
      toast("Order cancelled", "info");
    },
    [setOrders, toast]
  );

  const requestReturn = useCallback(
    (orderId: string, reason: string) => {
      setReturns((prev) => ({
        ...prev,
        [orderId]: { orderId, reason, status: "Return Requested", requestedAt: new Date().toISOString() },
      }));
      toast("Return request submitted");
    },
    [setReturns, toast]
  );

  const clearCart = useCallback(() => setCart([]), [setCart]);

  const toggleTheme = useCallback(() => setTheme((t) => (t === "light" ? "dark" : "light")), [setTheme]);

  const value = useMemo<StoreValue>(
    () => ({
      cart,
      wishlist,
      orders,
      toasts,
      user,
      addresses,
      products,
      saveProduct,
      deleteProduct,
      toggleProductStatus,
      adjustStock,
      bulkUpdateStock,
      resetProducts,
      getProductById,
      getProductBySlug,
      recentlyViewed,
      notifyList,
      priceAlerts,
      notifications,
      userReviews,
      questions,
      recentSearches,
      compare,
      returns,
      theme,
      hydrated:
        productsHydrated && cartHydrated && wishHydrated && ordersHydrated && userHydrated && usersHydrated &&
        addressesHydrated && rvHydrated && notifyHydrated && paHydrated && notifHydrated &&
        urHydrated && qHydrated && rsHydrated && compareHydrated && returnsHydrated && themeHydrated,
      login,
      register,
      logout,
      updateProfile,
      addAddress,
      updateAddress,
      removeAddress,
      addToCart,
      removeFromCart,
      updateQty,
      moveToWishlist,
      moveToCart,
      toggleWishlist,
      isWishlisted,
      placeOrder,
      cancelOrder,
      clearCart,
      addRecentlyViewed,
      removeRecentlyViewed,
      isNotified,
      toggleNotify,
      isPriceAlerted,
      togglePriceAlert,
      markAllNotificationsRead,
      addReview,
      addQuestion,
      addRecentSearch,
      clearRecentSearches,
      toggleCompare,
      isCompared,
      clearCompare,
      requestReturn,
      toggleTheme,
      toast,
    }),
    [
      cart, wishlist, orders, toasts, user, addresses, products,
      saveProduct, deleteProduct, toggleProductStatus, adjustStock, bulkUpdateStock, resetProducts, getProductById, getProductBySlug,
      recentlyViewed, notifyList, priceAlerts, notifications, userReviews, questions,
      recentSearches, compare, returns, theme,
      productsHydrated, cartHydrated, wishHydrated, ordersHydrated, userHydrated, usersHydrated,
      addressesHydrated, rvHydrated, notifyHydrated, paHydrated, notifHydrated,
      urHydrated, qHydrated, rsHydrated, compareHydrated, returnsHydrated, themeHydrated,
      login, register, logout, updateProfile,
      addAddress, updateAddress, removeAddress,
      addToCart, removeFromCart, updateQty, moveToWishlist, moveToCart,
      toggleWishlist, isWishlisted, placeOrder, cancelOrder, clearCart,
      addRecentlyViewed, removeRecentlyViewed, isNotified, toggleNotify,
      isPriceAlerted, togglePriceAlert, markAllNotificationsRead,
      addReview, addQuestion, addRecentSearch, clearRecentSearches,
      toggleCompare, isCompared, clearCompare, requestReturn, toggleTheme, toast,
    ]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within a StoreProvider");
  return ctx;
}