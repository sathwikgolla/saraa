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
  Address,
  AppNotification,
  AuthResult,
  Category,
  CartItem,
  Order,
  Product,
  QAItem,
  ReturnRecord,
  Review,
  Theme,
  Toast,
  User,
} from "@/lib/types";
import { uid } from "@/lib/utils";
import { getCurrentUser, signIn, signOut, signUp, getUserProfile } from "@/lib/supabase/auth";
import { getProducts } from "@/lib/supabase/products";
import { getCategories, type SubcategoryOption } from "@/lib/supabase/categories";
import { buildSubcategoryOptions } from "@/lib/catalogTaxonomy";
import { getCart, addToCart as addToCartSupabase, updateCartItem as updateCartItemSupabase, removeFromCart as removeFromCartSupabase, clearCart as clearCartSupabase } from "@/lib/supabase/cart";
import { getWishlist, addToWishlist as addToWishlistSupabase, removeFromWishlist as removeFromWishlistSupabase, toggleWishlist as toggleWishlistSupabase } from "@/lib/supabase/wishlist";
import { getOrders, getOrderById } from "@/lib/supabase/orders";
import { placeOrderSecure, cancelOrderSecure } from "@/app/actions/orders";
import { getSessionRole } from "@/app/actions/auth";
import { getAddresses, addAddress as addAddressSupabase, updateAddress as updateAddressSupabase, deleteAddress as deleteAddressSupabase } from "@/lib/supabase/addresses";

interface StoreValue {
  // Core
  cart: CartItem[];
  wishlist: string[];
  orders: Order[];
  toasts: Toast[];
  user: User | null;
  addresses: Address[];
  hydrated: boolean;
  loading: boolean;

  // Products (customer reads only — admin writes live in server actions)
  products: Product[];
  categories: Category[];
  subcategories: SubcategoryOption[];
  getProductById: (id: string) => Product | undefined;
  getProductBySlug: (slug: string) => Product | undefined;

  // Extended (localStorage only)
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
  login: (identifier: string, password: string) => Promise<AuthResult>;
  register: (data: { name: string; email: string; mobile: string; password: string }) => Promise<AuthResult>;
  logout: () => void;
  updateProfile: (patch: { name?: string; email?: string; mobile?: string }) => void;

  // Addresses
  addAddress: (address: Omit<Address, "id">) => Promise<Address | null>;
  updateAddress: (id: string, address: Omit<Address, "id">) => Promise<boolean>;
  removeAddress: (id: string) => Promise<boolean>;

  // Cart
  addToCart: (productId: string, qty?: number, color?: string, size?: string) => Promise<void>;
  removeFromCart: (key: string) => Promise<void>;
  updateQty: (key: string, qty: number) => Promise<void>;
  moveToWishlist: (key: string) => Promise<void>;
  moveToCart: (productId: string) => Promise<void>;
  toggleWishlist: (productId: string) => Promise<void>;
  isWishlisted: (productId: string) => boolean;
  placeOrder: (order: Omit<Order, "id" | "placedAt">, shippingAddress: Address) => Promise<Order | null>;
  cancelOrder: (orderId: string) => Promise<boolean>;
  clearCart: () => Promise<void>;

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

// Simple localStorage hook for UI preferences only
function useLocalStorage<T>(key: string, fallback: T) {
  const [state, setState] = useState<T>(fallback);
  const [hydrated, setHydrated] = useState(false);

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

  return [state, setState, hydrated] as const;
}

const SEED_NOTIFICATIONS: AppNotification[] = [
  { id: "n1", type: "offer", title: "Weekend Sale is live!", message: "Up to 50% off on fashion, clothing and footwear. Shop now.", time: "2h ago", read: false },
  { id: "n2", type: "stock", title: "Back in stock", message: "White Leather Minimalist Sneakers are back in stock.", time: "1d ago", read: false },
  { id: "n3", type: "price", title: "Price dropped", message: "The price of Men's Oxford Cotton Shirt dropped by ₹200.", time: "2d ago", read: true },
  { id: "n4", type: "delivery", title: "Delivery update", message: "Your recent order is out for delivery and arriving today.", time: "3d ago", read: true },
];

export function StoreProvider({ children }: { children: ReactNode }) {
  // Supabase-backed state
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<SubcategoryOption[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  // localStorage-backed state (UI preferences only)
  const [recentlyViewed, setRecentlyViewed, rvHydrated] = useLocalStorage<string[]>("saara:recentlyViewed", []);
  const [notifyList, setNotifyList, notifyHydrated] = useLocalStorage<string[]>("saara:notifyList", []);
  const [priceAlerts, setPriceAlerts, paHydrated] = useLocalStorage<string[]>("saara:priceAlerts", []);
  const [notifications, setNotifications, notifHydrated] = useLocalStorage<AppNotification[]>("saara:notifications", SEED_NOTIFICATIONS);
  const [userReviews, setUserReviews, urHydrated] = useLocalStorage<Record<string, Review[]>>("saara:userReviews", {});
  const [questions, setQuestions, qHydrated] = useLocalStorage<Record<string, QAItem[]>>("saara:questions", {});
  const [recentSearches, setRecentSearches, rsHydrated] = useLocalStorage<string[]>("saara:recentSearches", []);
  const [compare, setCompare, compareHydrated] = useLocalStorage<string[]>("saara:compare", []);
  const [returns, setReturns, returnsHydrated] = useLocalStorage<Record<string, ReturnRecord>>("saara:returns", {});
  const [theme, setTheme, themeHydrated] = useLocalStorage<Theme>("saara:theme", "light");
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Load initial data from Supabase
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        // Load products + catalog categories. Subcategory options are derived
        // from the category rows + the shared taxonomy (there is no separate
        // subcategories table).
        const [productsData, categoriesData] = await Promise.all([
          getProducts(),
          getCategories(),
        ]);
        setProducts(productsData);
        setCategories(categoriesData);
        setSubcategories(buildSubcategoryOptions(categoriesData));

        // Load current user
        const currentUser = await getCurrentUser();
        if (currentUser) {
          const profile = await getUserProfile(currentUser.id);
          if (profile) {
            setUser({
              id: profile.id,
              name: profile.name,
              email: profile.email,
              mobile: profile.mobile || '',
              createdAt: profile.created_at,
            });
          }

          // Load user-specific data
          const [cartData, wishlistData, ordersData, addressesData] = await Promise.all([
            getCart(currentUser.id),
            getWishlist(currentUser.id),
            getOrders(currentUser.id),
            getAddresses(currentUser.id),
          ] as const);
          setCart(cartData);
          setWishlist(wishlistData);
          setOrders(ordersData);
          setAddresses(addressesData);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Keep the storefront catalog in sync with the admin panel.
  //
  // Admin writes go straight to Supabase (see src/app/actions/admin/*). The
  // storefront reads through the browser client, so a product created or
  // edited in /admin appears as soon as this tab is brought back into focus —
  // without forcing a full page reload and without disabling caching.
  useEffect(() => {
    let cancelled = false;

    async function refreshCatalog() {
      if (document.visibilityState !== "visible") return;
      // The admin panel doesn't render the public catalog — skip the fetch there.
      if (window.location.pathname.startsWith("/admin")) return;
      const [productsData, categoriesData] = await Promise.all([
        getProducts(),
        getCategories(),
      ]);
      if (cancelled) return;
      // The getters swallow errors and return [], so only apply a result that
      // actually returned rows — otherwise a transient network blip on tab
      // focus would blank the storefront. (A true empty catalog is picked up
      // on the next full load.)
      if (productsData.length > 0) setProducts(productsData);
      if (categoriesData.length > 0) {
        setCategories(categoriesData);
        setSubcategories(buildSubcategoryOptions(categoriesData));
      }
    }

    document.addEventListener("visibilitychange", refreshCatalog);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", refreshCatalog);
    };
  }, []);

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

  // Auth
  const login = useCallback(
    async (identifier: string, password: string): Promise<AuthResult> => {
      const result = await signIn({ email: identifier, password });
      // Role discovered on login. This only decides where the UI lands; the
      // server re-verifies the role on every privileged action.
      let isAdmin = false;
      if (result.success && result.user) {
        // Resolve the role on the SERVER (SSR cookie session → profiles.role)
        // rather than trusting a client-side RLS read, so the post-login
        // destination for a Super Admin can never fall back to the storefront.
        // A role-lookup failure must never break login itself — degrade to the
        // customer destination; the server still gates the admin panel.
        try {
          isAdmin = (await getSessionRole()) === 'admin';
        } catch {
          isAdmin = false;
        }

        const profile = await getUserProfile(result.user.id);
        if (profile) {
          setUser({
            id: profile.id,
            name: profile.name,
            email: profile.email,
            mobile: profile.mobile || '',
            createdAt: profile.created_at,
          });
        }
        
        // Load user data
        const [cartData, wishlistData, ordersData, addressesData] = await Promise.all([
          getCart(result.user.id),
          getWishlist(result.user.id),
          getOrders(result.user.id),
          getAddresses(result.user.id),
        ]);
        setCart(cartData);
        setWishlist(wishlistData);
        setOrders(ordersData);
        setAddresses(addressesData);
      }
      return { ok: result.success, error: result.error, isAdmin };
    },
    []
  );

  const register = useCallback(
    async (data: { name: string; email: string; mobile: string; password: string }): Promise<AuthResult> => {
      const result = await signUp(data);
      if (result.success && result.user) {
        const profile = await getUserProfile(result.user.id);
        if (profile) {
          setUser({
            id: profile.id,
            name: profile.name,
            email: profile.email,
            mobile: profile.mobile || '',
            createdAt: profile.created_at,
          });
        }
      }
      return {
        ok: result.success,
        error: result.error,
        needsEmailConfirmation: result.needsEmailConfirmation,
      };
    },
    []
  );

  const logout = useCallback(async () => {
    await signOut();
    setUser(null);
    setCart([]);
    setWishlist([]);
    setOrders([]);
    setAddresses([]);
    toast("Logged out successfully", "info");
  }, [toast]);

  const updateProfile = useCallback(
    async (patch: { name?: string; email?: string; mobile?: string }) => {
      if (user) {
        setUser((u) => (u ? { ...u, ...patch } : u));
      }
    },
    [user]
  );

  // Addresses
  const addAddress = useCallback(
    async (address: Omit<Address, "id">) => {
      if (!user) return null;
      const result = await addAddressSupabase(user.id, address);
      if (result) {
        setAddresses((prev) => [...prev, result]);
      }
      return result;
    },
    [user]
  );

  const updateAddress = useCallback(
    async (id: string, address: Omit<Address, "id">) => {
      if (!user) return false;
      const result = await updateAddressSupabase(id, user.id, address);
      if (result) {
        setAddresses((prev) => prev.map((a) => (a.id === id ? { ...a, ...address } : a)));
      }
      return result;
    },
    [user]
  );

  const removeAddress = useCallback(
    async (id: string) => {
      if (!user) return false;
      const result = await deleteAddressSupabase(id, user.id);
      if (result) {
        setAddresses((prev) => prev.filter((a) => a.id !== id));
      }
      return result;
    },
    [user]
  );

  // Cart
  const addToCart = useCallback(
    async (productId: string, qty = 1, color?: string, size?: string) => {
      if (!user) return;
      const result = await addToCartSupabase(user.id, { productId, qty, color, size });
      if (result) {
        setCart((prev) => {
          const key = `${productId}::${color ?? ""}::${size ?? ""}`;
          const existing = prev.find((i) => i.key === key);
          if (existing) {
            return prev.map((i) => (i.key === key ? { ...i, qty: Math.min(10, i.qty + qty) } : i));
          }
          return [...prev, result];
        });
      }
    },
    [user]
  );

  const removeFromCart = useCallback(
    async (key: string) => {
      if (!user) return;
      const item = cart.find((i) => i.key === key);
      if (item) {
        await removeFromCartSupabase(user.id, item.productId, item.color, item.size);
        setCart((prev) => prev.filter((i) => i.key !== key));
      }
    },
    [user, cart]
  );

  const updateQty = useCallback(
    async (key: string, qty: number) => {
      if (!user) return;
      const item = cart.find((i) => i.key === key);
      if (item) {
        await updateCartItemSupabase(user.id, item.productId, qty, item.color, item.size);
        setCart((prev) => prev.map((i) => (i.key === key ? { ...i, qty: Math.max(1, Math.min(10, qty)) } : i)));
      }
    },
    [user, cart]
  );

  const moveToWishlist = useCallback(
    async (key: string) => {
      const item = cart.find((i) => i.key === key);
      if (item && user) {
        await addToWishlistSupabase(user.id, item.productId);
        await removeFromCartSupabase(user.id, item.productId, item.color, item.size);
        setWishlist((prev) => (prev.includes(item.productId) ? prev : [...prev, item.productId]));
        setCart((prev) => prev.filter((i) => i.key !== key));
        toast("Moved to wishlist", "info");
      }
    },
    [cart, user, toast]
  );

  const moveToCart = useCallback(
    async (productId: string) => {
      if (!user) return;
      await removeFromWishlistSupabase(user.id, productId);
      await addToCartSupabase(user.id, { productId, qty: 1 });
      setWishlist((prev) => prev.filter((id) => id !== productId));
      setCart((prev) =>
        prev.some((i) => i.productId === productId)
          ? prev
          : [...prev, { key: `${productId}::`, productId, qty: 1 }]
      );
      toast("Moved to cart");
    },
    [user, toast]
  );

  const toggleWishlist = useCallback(
    async (productId: string) => {
      if (!user) return;
      await toggleWishlistSupabase(user.id, productId);
      setWishlist((prev) => {
        const has = prev.includes(productId);
        toast(has ? "Removed from wishlist" : "Added to wishlist", has ? "info" : "success");
        return has ? prev.filter((id) => id !== productId) : [...prev, productId];
      });
    },
    [user, toast]
  );

  const isWishlisted = useCallback((productId: string) => wishlist.includes(productId), [wishlist]);

  const placeOrder = useCallback(
    async (order: Omit<Order, "id" | "placedAt">, shippingAddress: Address) => {
      if (!user) {
        toast("Please log in to place an order", "error");
        return null;
      }

      // The server is the sole authority for prices, stock checks, totals,
      // ownership and initial status. We only forward identifiers + address.
      const result = await placeOrderSecure({
        items: cart.map((item) => ({
          productId: item.productId,
          qty: item.qty,
          color: item.color,
          size: item.size,
        })),
        shipping: {
          name: shippingAddress.name,
          phone: shippingAddress.phone,
          line1: shippingAddress.line1,
          line2: shippingAddress.line2,
          city: shippingAddress.city,
          state: shippingAddress.state,
          pincode: shippingAddress.pincode,
        },
        paymentMethod: order.paymentMethod,
        coupon: order.coupon,
      });

      if (!result.success) {
        toast(result.error, "error");
        return null;
      }

      // Re-read the persisted order (RLS-scoped to the signed-in user) so the
      // UI reflects the server-computed totals/address. Fall back to the local
      // snapshot only if the read is momentarily unavailable.
      const fallback: Order = {
        id: result.orderId,
        placedAt: new Date().toISOString(),
        items: order.items,
        itemTotal: order.itemTotal,
        discount: order.discount,
        deliveryCharge: order.deliveryCharge,
        coupon: order.coupon,
        couponDiscount: order.couponDiscount,
        total: order.total,
        status: order.status,
        // The server always records a new order as unpaid ('Pending'); mirror
        // that here rather than the optimistic client-side value.
        paymentStatus: "Pending",
        deliveryBy: order.deliveryBy,
        address: `${shippingAddress.line1}, ${shippingAddress.city}, ${shippingAddress.state} - ${shippingAddress.pincode}`,
        paymentMethod: order.paymentMethod,
      };
      const created = (await getOrderById(result.orderId)) ?? fallback;

      setOrders((prev) => [created, ...prev.filter((o) => o.id !== created.id)]);
      setCart([]);
      setNotifications((prev) => [
        { id: uid(), type: "order", title: "Order confirmed", message: `Your order ${created.id} has been confirmed.`, time: "Just now", read: false },
        ...prev,
      ]);

      return created;
    },
    [user, cart, toast]
  );

  const cancelOrder = useCallback(
    async (orderId: string) => {
      if (!user) return false;
      const result = await cancelOrderSecure(orderId);
      if (!result.success) {
        toast(result.error, "error");
        return false;
      }
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: "Cancelled" as const } : o)));
      toast("Order cancelled", "info");
      return true;
    },
    [user, toast]
  );

  const clearCart = useCallback(async () => {
    if (!user) return;
    await clearCartSupabase(user.id);
    setCart([]);
  }, [user]);

  // Product helpers
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

  // Recently viewed
  const addRecentlyViewed = useCallback(
    (productId: string) => {
      setRecentlyViewed((prev) => [productId, ...prev.filter((id) => id !== productId)].slice(0, 10));
    },
    []
  );
  const removeRecentlyViewed = useCallback((productId: string) => setRecentlyViewed((prev) => prev.filter((id) => id !== productId)), []);

  // Notify me
  const isNotified = useCallback((productId: string) => notifyList.includes(productId), [notifyList]);
  const toggleNotify = useCallback(
    (productId: string) => {
      setNotifyList((prev) => {
        const has = prev.includes(productId);
        toast(has ? "Removed from notification list" : "You're on the notification list", has ? "info" : "success");
        return has ? prev.filter((id) => id !== productId) : [...prev, productId];
      });
    },
    [toast]
  );

  // Price drop alert
  const isPriceAlerted = useCallback((productId: string) => priceAlerts.includes(productId), [priceAlerts]);
  const togglePriceAlert = useCallback(
    (productId: string) => {
      setPriceAlerts((prev) => {
        const has = prev.includes(productId);
        toast(has ? "Price alert removed" : "You'll be notified when the price drops", has ? "info" : "success");
        return has ? prev.filter((id) => id !== productId) : [...prev, productId];
      });
    },
    [toast]
  );

  // Notifications
  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast("All notifications marked as read", "info");
  }, [toast]);

  // Reviews
  const addReview = useCallback(
    (productId: string, review: Omit<Review, "id">) => {
      setUserReviews((prev) => ({
        ...prev,
        [productId]: [...(prev[productId] ?? []), { ...review, id: uid() }],
      }));
      toast("Review submitted — thank you!");
    },
    [toast]
  );

  // Q&A
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
    [toast, user]
  );

  // Search
  const addRecentSearch = useCallback(
    (q: string) => {
      const term = q.trim();
      if (!term) return;
      setRecentSearches((prev) => [term, ...prev.filter((s) => s.toLowerCase() !== term.toLowerCase())].slice(0, 6));
    },
    []
  );
  const clearRecentSearches = useCallback(() => setRecentSearches([]), []);

  // Compare
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
    [toast]
  );
  const isCompared = useCallback((productId: string) => compare.includes(productId), [compare]);
  const clearCompare = useCallback(() => setCompare([]), []);

  // Returns
  const requestReturn = useCallback(
    (orderId: string, reason: string) => {
      setReturns((prev) => ({
        ...prev,
        [orderId]: { orderId, reason, status: "Return Requested", requestedAt: new Date().toISOString() },
      }));
      toast("Return request submitted");
    },
    [toast]
  );

  const toggleTheme = useCallback(() => setTheme((t) => (t === "light" ? "dark" : "light")), []);

  const hydrated = rvHydrated && notifyHydrated && paHydrated && notifHydrated && urHydrated && qHydrated && rsHydrated && compareHydrated && returnsHydrated && themeHydrated;

  const value = useMemo<StoreValue>(
    () => ({
      cart,
      wishlist,
      orders,
      toasts,
      user,
      addresses,
      products,
      categories,
      subcategories,
      hydrated,
      loading,
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
      cart, wishlist, orders, toasts, user, addresses, products, categories, subcategories, hydrated, loading,
      getProductById, getProductBySlug,
      recentlyViewed, notifyList, priceAlerts, notifications, userReviews, questions,
      recentSearches, compare, returns, theme,
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
