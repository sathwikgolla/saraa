# Complete Supabase Migration Implementation Plan

## Phase 1: Setup & Configuration

### 1.1 Install Dependencies
- [ ] Install `@supabase/supabase-js`
- [ ] Install `@supabase/auth-helpers-nextjs` for Next.js integration

### 1.2 Environment Configuration
- [ ] Create `.env.local` file
- [ ] Add `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Add `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Update `.gitignore` to ensure `.env.local` is not committed

### 1.3 Supabase Client Setup
- [ ] Create `src/lib/supabase/client.ts` - Browser client
- [ ] Create `src/lib/supabase/server.ts` - Server client
- [ ] Create `src/lib/supabase/admin.ts` - Admin client (if needed for service operations)

---

## Phase 2: Database Setup

### 2.1 Create Tables (via Supabase SQL Editor or migrations)
- [ ] Create `profiles` table
- [ ] Create `categories` table
- [ ] Create `category_filters` table
- [ ] Create `products` table
- [ ] Create `product_variants` table
- [ ] Create `addresses` table
- [ ] Create `cart_items` table
- [ ] Create `wishlist_items` table
- [ ] Create `orders` table
- [ ] Create `order_items` table
- [ ] Create `order_shipping_addresses` table
- [ ] Create `order_timeline` table
- [ ] Create `payments` table
- [ ] Create `coupons` table
- [ ] Create `banners` table
- [ ] Create `announcements` table
- [ ] Create `youtube_videos` table
- [ ] Create `settings` table
- [ ] Create `staff` table
- [ ] Create `audit_logs` table
- [ ] Create `stock_ledger` table
- [ ] Create `user_reviews` table
- [ ] Create `user_questions` table
- [ ] Create `notifications` table
- [ ] Create `returns` table

### 2.2 Create Indexes
- [ ] Add all indexes as specified in schema

### 2.3 Create Triggers
- [ ] Create `handle_new_user()` trigger for profile auto-creation
- [ ] Create `update_updated_at()` trigger function
- [ ] Apply updated_at triggers to all relevant tables

### 2.4 Enable RLS
- [ ] Enable Row Level Security on all tables
- [ ] Create RLS policies for each table (as specified in schema)

### 2.5 Storage Setup
- [ ] Create `product-images` bucket
- [ ] Create `payment-screenshots` bucket
- [ ] Configure storage policies

---

## Phase 3: Authentication Migration

### 3.1 Create Auth Utilities
- [ ] Create `src/lib/supabase/auth.ts` - Auth helper functions
  - `signUp()` - User registration
  - `signIn()` - User login
  - `signOut()` - User logout
  - `getCurrentUser()` - Get current session
  - `getSession()` - Get session
  - `onAuthStateChange()` - Listen to auth changes

### 3.2 Update Auth Components
- [ ] Update `src/components/auth/LoginForm.tsx` to use Supabase auth
- [ ] Update `src/components/auth/RegisterForm.tsx` to use Supabase auth
- [ ] Update `src/components/auth/RequireAuth.tsx` to use Supabase session

### 3.3 Update Auth Pages
- [ ] Update `src/app/login/page.tsx`
- [ ] Update `src/app/register/page.tsx`

### 3.4 Update Context
- [ ] Replace `StoreContext.tsx` auth functions with Supabase calls
  - Replace `login()` with Supabase `signIn()`
  - Replace `register()` with Supabase `signUp()`
  - Replace `logout()` with Supabase `signOut()`
  - Remove `mockHash` and user password storage
  - Use Supabase session for user state

---

## Phase 4: Data Layer Migration

### 4.1 Create Supabase Data Functions
- [ ] Create `src/lib/supabase/products.ts`
  - `getProducts()` - Fetch all products
  - `getProductById()` - Fetch single product
  - `getProductBySlug()` - Fetch by slug
  - `createProduct()` - Create product (admin)
  - `updateProduct()` - Update product (admin)
  - `deleteProduct()` - Delete product (admin)
  - `toggleProductStatus()` - Toggle live/draft

- [ ] Create `src/lib/supabase/categories.ts`
  - `getCategories()` - Fetch all categories
  - `getCategoryById()` - Fetch single category
  - `getCategoryBySlug()` - Fetch by slug
  - `createCategory()` - Create category (admin)
  - `updateCategory()` - Update category (admin)
  - `deleteCategory()` - Delete category (admin)

- [ ] Create `src/lib/supabase/cart.ts`
  - `getCart()` - Fetch user's cart
  - `addToCart()` - Add item to cart
  - `updateCartItem()` - Update quantity
  - `removeFromCart()` - Remove item
  - `clearCart()` - Clear cart

- [ ] Create `src/lib/supabase/wishlist.ts`
  - `getWishlist()` - Fetch user's wishlist
  - `addToWishlist()` - Add to wishlist
  - `removeFromWishlist()` - Remove from wishlist
  - `isInWishlist()` - Check if item is wishlisted

- [ ] Create `src/lib/supabase/orders.ts`
  - `getOrders()` - Fetch user's orders
  - `getOrderById()` - Fetch single order
  - `createOrder()` - Create new order
  - `cancelOrder()` - Cancel order

- [ ] Create `src/lib/supabase/addresses.ts`
  - `getAddresses()` - Fetch user's addresses
  - `addAddress()` - Add new address
  - `updateAddress()` - Update address
  - `deleteAddress()` - Delete address

- [ ] Create `src/lib/supabase/admin.ts`
  - `getAllOrders()` - Fetch all orders (admin)
  - `getPayments()` - Fetch pending payments
  - `verifyPayment()` - Verify payment
  - `rejectPayment()` - Reject payment
  - `updateOrderStatus()` - Update order status
  - `getCustomers()` - Fetch all customers
  - `getCoupons()` - Fetch all coupons
  - `createCoupon()` - Create coupon
  - `updateCoupon()` - Update coupon
  - `deleteCoupon()` - Delete coupon
  - `getStaff()` - Fetch staff members
  - `addStaff()` - Add staff
  - `deleteStaff()` - Delete staff
  - `getAuditLogs()` - Fetch audit logs
  - `getStockLedger()` - Fetch stock ledger
  - `adjustStock()` - Adjust stock
  - `bulkUpdateStock()` - Bulk stock update
  - `getSettings()` - Fetch settings
  - `updateSettings()` - Update settings
  - `getBanners()` - Fetch banners
  - `saveBanner()` - Save banner
  - `deleteBanner()` - Delete banner
  - `getAnnouncements()` - Fetch announcements
  - `saveAnnouncement()` - Save announcement
  - `deleteAnnouncement()` - Delete announcement
  - `getYoutubeVideos()` - Fetch YouTube videos
  - `saveYoutubeVideo()` - Save YouTube video
  - `deleteYoutubeVideo()` - Delete YouTube video
  - `getFilters()` - Fetch category filters
  - `saveFilter()` - Save filter
  - `deleteFilter()` - Delete filter

---

## Phase 5: Context Migration

### 5.1 Refactor StoreContext
- [ ] Remove `useStoredState` hook (localStorage-based)
- [ ] Replace with Supabase queries using React Query or SWR
- [ ] Update `products` state to fetch from Supabase
- [ ] Update `cart` state to fetch from Supabase
- [ ] Update `wishlist` state to fetch from Supabase
- [ ] Update `orders` state to fetch from Supabase
- [ ] Update `addresses` state to fetch from Supabase
- [ ] Update `user` state to use Supabase auth
- [ ] Remove all localStorage persistence
- [ ] Update all CRUD operations to use Supabase functions

### 5.2 Refactor AdminContext
- [ ] Remove `useStoredAdmin` hook
- [ ] Replace with Supabase queries
- [ ] Update all admin data fetching
- [ ] Update all admin CRUD operations
- [ ] Remove localStorage persistence

---

## Phase 6: Page Updates

### 6.1 Customer-Facing Pages
- [ ] Update `src/app/page.tsx` - Home page
  - Fetch products from Supabase
  - Fetch categories from Supabase
  - Fetch banners from Supabase

- [ ] Update `src/app/products/page.tsx` - Products listing
  - Fetch products from Supabase
  - Apply filters from Supabase

- [ ] Update `src/app/product/[slug]/page.tsx` - Product detail
  - Fetch product from Supabase
  - Already done - needs to use Supabase instead of `getProduct()`

- [ ] Update `src/app/products/[category]/[gender]/page.tsx` - Category pages
  - Fetch products by category from Supabase

- [ ] Update `src/app/cart/page.tsx` - Cart page
  - Fetch cart from Supabase

- [ ] Update `src/app/checkout/page.tsx` - Checkout
  - Create order in Supabase
  - Handle payment submission

- [ ] Update `src/app/wishlist/page.tsx` - Wishlist
  - Fetch wishlist from Supabase

- [ ] Update `src/app/orders/page.tsx` - Orders list
  - Fetch orders from Supabase

- [ ] Update `src/app/orders/[id]/page.tsx` - Order detail
  - Fetch order from Supabase

- [ ] Update `src/app/profile/page.tsx` - Profile
  - Fetch profile from Supabase
  - Fetch addresses from Supabase

### 6.2 Admin Pages
- [ ] Update `src/app/admin/page.tsx` - Admin dashboard
  - Fetch metrics from Supabase

- [ ] Update `src/app/admin/products/page.tsx` - Products management
  - Fetch products from Supabase
  - CRUD operations via Supabase

- [ ] Update `src/app/admin/categories/page.tsx` - Categories management
  - Fetch categories from Supabase
  - CRUD operations via Supabase

- [ ] Update `src/app/admin/orders/page.tsx` - Orders management
  - Fetch orders from Supabase
  - Update status via Supabase

- [ ] Update `src/app/admin/payments/page.tsx` - Payments verification
  - Fetch payments from Supabase
  - Verify/reject via Supabase

- [ ] Update `src/app/admin/customers/page.tsx` - Customers
  - Fetch customers from Supabase

- [ ] Update `src/app/admin/coupons/page.tsx` - Coupons
  - Fetch coupons from Supabase
  - CRUD operations via Supabase

- [ ] Update `src/app/admin/inventory/page.tsx` - Inventory
  - Fetch stock data from Supabase
  - Adjust stock via Supabase

- [ ] Update `src/app/admin/staff/page.tsx` - Staff management
  - Fetch staff from Supabase
  - CRUD operations via Supabase

- [ ] Update `src/app/admin/audit/page.tsx` - Audit logs
  - Fetch audit logs from Supabase

- [ ] Update `src/app/admin/settings/page.tsx` - Settings
  - Fetch settings from Supabase
  - Update via Supabase

- [ ] Update `src/app/admin/content/page.tsx` - Content management
  - Fetch banners/announcements/videos from Supabase
  - CRUD operations via Supabase

- [ ] Update `src/app/admin/reports/page.tsx` - Reports
  - Fetch data from Supabase

---

## Phase 7: Component Updates

### 7.1 Product Components
- [ ] Update all product components to use Supabase data
- [ ] Update `ProductDetailClient` to use Supabase
- [ ] Update product cards to use Supabase

### 7.2 Home Components
- [ ] Update `CategorySection` to use Supabase categories
- [ ] Update `FlashSale` to use Supabase products
- [ ] Update `DealsAndOffers` to use Supabase
- [ ] Update all home components

### 7.3 Layout Components
- [ ] Update navigation to use Supabase auth
- [ ] Update header to show user from Supabase
- [ ] Update cart badge from Supabase

---

## Phase 8: Demo Data Removal

### 8.1 Remove Demo Data Files
- [ ] Delete `src/data/products.ts` (after migration)
- [ ] Delete `src/data/categories.ts` (after migration)
- [ ] Delete `src/data/adminSeed.ts` (after migration)

### 8.2 Remove localStorage Usage
- [ ] Search and remove all `localStorage.getItem()` calls
- [ ] Search and remove all `localStorage.setItem()` calls
- [ ] Search and remove all `sessionStorage` usage
- [ ] Remove `useStoredState` hook
- [ ] Remove `useStoredAdmin` hook

### 8.3 Remove Mock Auth
- [ ] Remove `mockHash` function
- [ ] Remove `MockUser` interface
- [ ] Remove password hashing logic
- [ ] Remove fake user creation

---

## Phase 9: Error Handling & Loading States

### 9.1 Add Loading States
- [ ] Add loading spinners to all data-fetching components
- [ ] Add skeleton loaders where appropriate

### 9.2 Add Error States
- [ ] Add error boundaries
- [ ] Add error messages for failed Supabase queries
- [ ] Add retry logic where appropriate

### 9.3 Add Empty States
- [ ] Add "No products found" messages
- [ ] Add "No orders yet" messages
- [ ] Add "Cart is empty" messages
- [ ] Add "Wishlist is empty" messages

---

## Phase 10: Testing

### 10.1 Customer Flow Testing
- [ ] Test registration
- [ ] Test login
- [ ] Test logout
- [ ] Test session persistence
- [ ] Test browsing products
- [ ] Test product details
- [ ] Test adding to cart
- [ ] Test cart persistence
- [ ] Test wishlist
- [ ] Test checkout
- [ ] Test order placement
- [ ] Test order viewing

### 10.2 Admin Flow Testing
- [ ] Test admin login
- [ ] Test adding product
- [ ] Test editing product
- [ ] Test deleting product
- [ ] Test adding category
- [ ] Test editing category
- [ ] Test deleting category
- [ ] Test viewing orders
- [ ] Test updating order status
- [ ] Test verifying payment
- [ ] Test rejecting payment
- [ ] Test adjusting stock
- [ ] Test creating coupon
- [ ] Test viewing customers
- [ ] Test adding staff
- [ ] Test viewing audit logs

---

## Phase 11: Final Cleanup

### 11.1 Code Quality
- [ ] Run TypeScript type check
- [ ] Fix all TypeScript errors
- [ ] Run ESLint
- [ ] Fix all ESLint errors
- [ ] Run build
- [ ] Fix all build errors

### 11.2 Documentation
- [ ] Update README with Supabase setup instructions
- [ ] Document environment variables
- [ ] Document RLS policies
- [ ] Create migration report

---

## Phase 12: Deployment Preparation

### 12.1 Environment Variables
- [ ] Document required environment variables
- [ ] Create `.env.example` file
- [ ] Ensure no secrets in code

### 12.2 Database Migration
- [ ] Create SQL migration file
- [ ] Test migration on staging
- [ ] Prepare production migration

---

## Summary

**Total Tasks**: ~150+
**Estimated Time**: 8-12 hours of focused work

**Key Milestones:**
1. ✅ Schema design (COMPLETE)
2. ⏳ Supabase setup (awaiting credentials)
3. ⏳ Auth migration
4. ⏳ Data layer migration
5. ⏳ Context refactoring
6. ⏳ Page updates
7. ⏳ Demo data removal
8. ⏳ Testing
9. ⏳ Final cleanup

**Ready to proceed with credentials.**
