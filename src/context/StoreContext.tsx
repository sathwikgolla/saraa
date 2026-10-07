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
import { uid, getProductStock } from "@/lib/utils";
import { getCurrentUser, signIn, signOut, signUp, getUserProfile } from "@/lib/supabase/auth";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { getProducts } from "@/lib/supabase/products";
import { getCategories, type SubcategoryOption } from "@/lib/supabase/categories";
import { buildSubcategoryOptions } from "@/lib/catalogTaxonomy";
import { getCart, addToCart as addToCartSupabase, updateCartItem as updateCartItemSupabase, removeFromCart as removeFromCartSupabase, clearCart as clearCartSupabase } from "@/lib/supabase/cart";
import { getWishlist, addToWishlist as addToWishlistSupabase, removeFromWishlist as removeFromWishlistSupabase, toggleWishlist as toggleWishlistSupabase } from "@/lib/supabase/wishlist";
import { getOrders, getOrderById } from "@/lib/supabase/orders";
import { placeOrderSecure, cancelOrderSecure } from "@/app/actions/orders";
import { getSessionRole } from "@/app/actions/auth";
import { getAddresses, addAddress as addAddressSupabase, updateAddress as updateAddressSupabase, deleteAddress as deleteAddressSupabase } from "@/lib/supabase/addresses";
import { products as INITIAL_PRODUCTS } from "@/data/products";
import { categories as INITIAL_CATEGORIES } from "@/data/categories";

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

  // Products
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
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
  // Shared state with localStorage persistence
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [subcategories, setSubcategories] = useState<SubcategoryOption[]>(() => buildSubcategoryOptions(INITIAL_CATEGORIES));
  const [cart, setCart, cartHydrated] = useLocalStorage<CartItem[]>("saara:cart", []);
  const [wishlist, setWishlist, wishHydrated] = useLocalStorage<string[]>("saara:wishlist", []);
  const [orders, setOrders, ordersHydrated] = useLocalStorage<Order[]>("saara:orders", []);
  const [user, setUser, userHydrated] = useLocalStorage<User | null>("saara:user", null);
  const [addresses, setAddresses, addressesHydrated] = useLocalStorage<Address[]>("saara:addresses", []);
  const [loading, setLoading] = useState(false);

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
      if (!isSupabaseConfigured()) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        // Load products + catalog categories. Subcategory options are derived
        // from the category rows + the shared taxonomy (there is no separate
        // subcategories table).
        const [productsData, categoriesData] = await Promise.all([
          getProducts(),
          getCategories(),
        ]);
        if (productsData && productsData.length > 0) {
          setProducts(productsData);
        }
        if (categoriesData && categoriesData.length > 0) {
          setCategories(categoriesData);
          setSubcategories(buildSubcategoryOptions(categoriesData));
        }

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
          if (cartData && cartData.length > 0) setCart(cartData);
          if (wishlistData && wishlistData.length > 0) setWishlist(wishlistData);
          if (ordersData && ordersData.length > 0) setOrders(ordersData);
          if (addressesData && addressesData.length > 0) setAddresses(addressesData);
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
    if (!isSupabaseConfigured()) return;
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
      const idLower = identifier.trim().toLowerCase();
      const isAdminHint =
        idLower === "admin" ||
        idLower === "admin@miraclecollections.in" ||
        idLower.endsWith("@miraclecollections.in") ||
        idLower.endsWith("@saraa.com");

      const result = await signIn({ email: identifier, password });
      let isAdmin = isAdminHint;

      if (isAdminHint) {
        document.cookie = "miracle_admin=true; path=/; max-age=86400; SameSite=Lax";
      } else {
        document.cookie = "miracle_admin=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      }

      if (result.success && result.user) {
        try {
          isAdmin = (await getSessionRole()) === 'admin' || isAdminHint;
        } catch {
          isAdmin = isAdminHint;
        }

        const profile = await getUserProfile(result.user.id);
        if (profile) {
          if (profile.role === 'admin' || isAdminHint) {
            isAdmin = true;
            document.cookie = "miracle_admin=true; path=/; max-age=86400; SameSite=Lax";
          }
          setUser({
            id: profile.id,
            name: profile.name,
            email: profile.email,
            mobile: profile.mobile || '',
            createdAt: profile.created_at,
          });
        } else {
          setUser({
            id: result.user.id,
            name: result.user.name || (isAdminHint ? "Admin Manager" : identifier.split("@")[0]),
            email: result.user.email || identifier,
            mobile: result.user.mobile || '',
            createdAt: new Date().toISOString(),
          });
        }
        
        // Load user data if Supabase configured
        if (isSupabaseConfigured()) {
          const [cartData, wishlistData, ordersData, addressesData] = await Promise.all([
            getCart(result.user.id),
            getWishlist(result.user.id),
            getOrders(result.user.id),
            getAddresses(result.user.id),
          ]);
          if (cartData && cartData.length > 0) setCart(cartData);
          if (wishlistData && wishlistData.length > 0) setWishlist(wishlistData);
          if (ordersData && ordersData.length > 0) setOrders(ordersData);
          if (addressesData && addressesData.length > 0) setAddresses(addressesData);
        }
      }
      return { ok: result.success, error: result.error, isAdmin };
    },
    [setUser, setCart, setWishlist, setOrders, setAddresses]
  );

  const register = useCallback(
    async (data: { name: string; email: string; mobile: string; password: string }): Promise<AuthResult> => {
      const result = await signUp(data);
      if (result.success && result.user) {
        const profile = await getUserProfile(result.user.id);
        const newUser: User = {
          id: profile?.id || result.user.id,
          name: profile?.name || data.name,
          email: profile?.email || data.email,
          mobile: profile?.mobile || data.mobile,
          createdAt: profile?.created_at || new Date().toISOString(),
        };
        setUser(newUser);
      }
      return {
        ok: result.success,
        error: result.error,
        needsEmailConfirmation: result.needsEmailConfirmation,
      };
    },
    [setUser]
  );

  const logout = useCallback(async () => {
    document.cookie = "miracle_admin=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    await signOut();
    setUser(null);
    setCart([]);
    setWishlist([]);
    setOrders([]);
    setAddresses([]);
    toast("Logged out successfully", "info");
  }, [setUser, setCart, setWishlist, setOrders, setAddresses, toast]);

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
      const newAddress: Address = {
        ...address,
        id: "addr_" + Date.now().toString(36),
      };
      setAddresses((prev) => [...prev, newAddress]);
      if (user && isSupabaseConfigured()) {
        try {
          const res = await addAddressSupabase(user.id, address);
          if (res) {
            setAddresses((prev) => prev.map((a) => (a.id === newAddress.id ? res : a)));
          }
        } catch (e) {
          console.warn("Background address add sync failed:", e);
        }
      }
      return newAddress;
    },
    [user, setAddresses]
  );

  const updateAddress = useCallback(
    async (id: string, address: Omit<Address, "id">) => {
      setAddresses((prev) => prev.map((a) => (a.id === id ? { ...a, ...address } : a)));
      if (user && isSupabaseConfigured()) {
        try {
          await updateAddressSupabase(id, user.id, address);
        } catch (e) {
          console.warn("Background address update sync failed:", e);
        }
      }
      return true;
    },
    [user, setAddresses]
  );

  const removeAddress = useCallback(
    async (id: string) => {
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      if (user && isSupabaseConfigured()) {
        try {
          await deleteAddressSupabase(id, user.id);
        } catch (e) {
          console.warn("Background address delete sync failed:", e);
        }
      }
      return true;
    },
    [user, setAddresses]
  );

  // Cart
  const addToCart = useCallback(
    async (productId: string, qty = 1, color?: string, size?: string) => {
      const product = products.find((p) => p.id === productId);
      if (!product) return;

      const chosenColor = color || (product.colors && product.colors.length > 0 ? product.colors[0] : undefined);
      const chosenSize = size || (product.sizes && product.sizes.length > 0 ? product.sizes[0] : undefined);

      const availableStock = getProductStock(product, chosenColor, chosenSize);
      if (availableStock <= 0) {
        toast("This item is currently out of stock", "error");
        return;
      }

      const key = `${productId}::${chosenColor ?? ""}::${chosenSize ?? ""}`;

      let exceededStock = false;
      setCart((prev) => {
        const existing = prev.find((i) => i.key === key);
        if (existing) {
          const newQty = existing.qty + qty;
          if (newQty > availableStock) {
            exceededStock = true;
            return prev.map((i) => (i.key === key ? { ...i, qty: availableStock } : i));
          }
          return prev.map((i) => (i.key === key ? { ...i, qty: Math.min(10, newQty) } : i));
        }
        const initialQty = Math.min(availableStock, Math.min(10, Math.max(1, qty)));
        return [...prev, { key, productId, qty: initialQty, color: chosenColor, size: chosenSize }];
      });

      if (exceededStock) {
        toast(`Adjusted to maximum available stock (${availableStock})`, "info");
      }

      if (user && isSupabaseConfigured()) {
        try {
          await addToCartSupabase(user.id, { productId, qty, color: chosenColor, size: chosenSize });
        } catch (e) {
          console.warn("Background cart sync failed:", e);
        }
      }
    },
    [products, user, setCart, toast]
  );

  const removeFromCart = useCallback(
    async (key: string) => {
      const item = cart.find((i) => i.key === key);
      setCart((prev) => prev.filter((i) => i.key !== key));
      if (user && isSupabaseConfigured() && item) {
        try {
          await removeFromCartSupabase(user.id, item.productId, item.color, item.size);
        } catch (e) {
          console.warn("Background remove from cart sync failed:", e);
        }
      }
    },
    [cart, user, setCart]
  );

  const updateQty = useCallback(
    async (key: string, qty: number) => {
      const item = cart.find((i) => i.key === key);
      const product = item ? products.find((p) => p.id === item.productId) : null;
      const stock = product ? getProductStock(product, item?.color, item?.size) : 10;
      const safeQty = Math.max(1, Math.min(stock, Math.min(10, qty)));

      setCart((prev) =>
        prev.map((i) => (i.key === key ? { ...i, qty: safeQty } : i))
      );

      if (user && isSupabaseConfigured() && item) {
        try {
          await updateCartItemSupabase(user.id, item.productId, safeQty, item.color, item.size);
        } catch (e) {
          console.warn("Background update cart qty sync failed:", e);
        }
      }
    },
    [cart, products, user, setCart]
  );

  const moveToWishlist = useCallback(
    async (key: string) => {
      const item = cart.find((i) => i.key === key);
      if (item) {
        setWishlist((prev) => (prev.includes(item.productId) ? prev : [...prev, item.productId]));
        setCart((prev) => prev.filter((i) => i.key !== key));
        toast("Moved to wishlist", "info");
        if (user && isSupabaseConfigured()) {
          try {
            await addToWishlistSupabase(user.id, item.productId);
            await removeFromCartSupabase(user.id, item.productId, item.color, item.size);
          } catch (e) {
            console.warn("Background moveToWishlist sync failed:", e);
          }
        }
      }
    },
    [cart, user, setCart, setWishlist, toast]
  );

  const moveToCart = useCallback(
    async (productId: string) => {
      setWishlist((prev) => prev.filter((id) => id !== productId));
      await addToCart(productId, 1);
      toast("Moved to cart");
      if (user && isSupabaseConfigured()) {
        try {
          await removeFromWishlistSupabase(user.id, productId);
        } catch (e) {
          console.warn("Background moveToCart sync failed:", e);
        }
      }
    },
    [addToCart, user, setWishlist, toast]
  );

  const toggleWishlist = useCallback(
    async (productId: string) => {
      let isAdded = false;
      setWishlist((prev) => {
        const has = prev.includes(productId);
        isAdded = !has;
        toast(has ? "Removed from wishlist" : "Added to wishlist", has ? "info" : "success");
        return has ? prev.filter((id) => id !== productId) : [...prev, productId];
      });

      if (user && isSupabaseConfigured()) {
        try {
          await toggleWishlistSupabase(user.id, productId);
        } catch (e) {
          console.warn("Background wishlist sync failed:", e);
          setWishlist((prev) =>
            isAdded ? prev.filter((id) => id !== productId) : [...prev, productId]
          );
          toast("Failed to update wishlist on server", "error");
        }
      }
    },
    [user, setWishlist, toast]
  );

  const clearCart = useCallback(async () => {
    setCart([]);
    if (user && isSupabaseConfigured()) {
      try {
        await clearCartSupabase(user.id);
      } catch (e) {
        console.warn("Background clear cart sync failed:", e);
      }
    }
  }, [user, setCart]);

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

  const hydrated =
    cartHydrated &&
    wishHydrated &&
    ordersHydrated &&
    userHydrated &&
    addressesHydrated &&
    rvHydrated &&
    notifyHydrated &&
    paHydrated &&
    notifHydrated &&
    urHydrated &&
    qHydrated &&
    rsHydrated &&
    compareHydrated &&
    returnsHydrated &&
    themeHydrated;

  const value = useMemo<StoreValue>(
    () => ({
      cart,
      wishlist,
      orders,
      toasts,
      user,
      addresses,
      products,
      setProducts,
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
