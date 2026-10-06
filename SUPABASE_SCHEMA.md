# Supabase Database Schema Design

## Overview
This document outlines the complete database schema for migrating the Saara Marketplace from localStorage to Supabase.

---

## Tables to Create

### 1. profiles
User profiles linked to Supabase Auth users.

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  mobile TEXT UNIQUE,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'blocked')),
  block_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes:**
- `idx_profiles_email` on email
- `idx_profiles_mobile` on mobile
- `idx_profiles_role` on role

---

### 2. categories
Product categories with subcategories.

```sql
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  image TEXT,
  description TEXT,
  subcategories TEXT[] DEFAULT '{}',
  product_count INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes:**
- `idx_categories_slug` on slug
- `idx_categories_active` on active

---

### 3. category_filters
Filter options for categories (size, color, fabric, etc.).

```sql
CREATE TABLE category_filters (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  key TEXT NOT NULL,
  target_categories TEXT[] NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('multiselect', 'range', 'single')),
  options TEXT[] NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 4. products
Main products table.

```sql
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
  sub_category TEXT,
  gender TEXT CHECK (gender IN ('men', 'women', 'kids', 'unisex')),
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  mrp NUMERIC(10,2) NOT NULL,
  cost_price NUMERIC(10,2),
  rating NUMERIC(2,1) DEFAULT 0,
  reviews INTEGER DEFAULT 0,
  images TEXT[] NOT NULL,
  colors TEXT[] NOT NULL,
  sizes TEXT[] NOT NULL,
  badges TEXT[] DEFAULT '{}',
  specifications JSONB DEFAULT '{}',
  stock INTEGER DEFAULT 0,
  status TEXT DEFAULT 'live' CHECK (status IN ('live', 'draft')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes:**
- `idx_products_slug` on slug
- `idx_products_category_id` on category_id
- `idx_products_gender` on gender
- `idx_products_status` on status
- `idx_products_created_at` on created_at

---

### 5. product_variants
Product variants (size/color combinations with stock).

```sql
CREATE TABLE product_variants (
  id TEXT PRIMARY KEY,
  product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
  sku TEXT UNIQUE NOT NULL,
  size TEXT NOT NULL,
  color TEXT NOT NULL,
  stock INTEGER DEFAULT 0,
  reserved_stock INTEGER DEFAULT 0,
  price_override NUMERIC(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, size, color)
);
```

**Indexes:**
- `idx_product_variants_product_id` on product_id
- `idx_product_variants_sku` on sku

---

### 6. addresses
User shipping addresses.

```sql
CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  line1 TEXT NOT NULL,
  line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  landmark TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes:**
- `idx_addresses_user_id` on user_id

---

### 7. cart_items
Shopping cart items.

```sql
CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
  color TEXT,
  size TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id, color, size)
);
```

**Indexes:**
- `idx_cart_items_user_id` on user_id
- `idx_cart_items_product_id` on product_id

---

### 8. wishlist_items
User wishlist.

```sql
CREATE TABLE wishlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);
```

**Indexes:**
- `idx_wishlist_items_user_id` on user_id
- `idx_wishlist_items_product_id` on product_id

---

### 9. orders
Customer orders.

```sql
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT NOT NULL,
  subtotal NUMERIC(10,2) NOT NULL,
  discount NUMERIC(10,2) DEFAULT 0,
  shipping_fee NUMERIC(10,2) DEFAULT 0,
  tax_amount NUMERIC(10,2) DEFAULT 0,
  total NUMERIC(10,2) NOT NULL,
  payment_method TEXT NOT NULL,
  payment_status TEXT DEFAULT 'Pending' CHECK (payment_status IN ('Pending', 'Verified', 'Failed', 'Refunded')),
  order_status TEXT DEFAULT 'Placed' CHECK (order_status IN ('Placed', 'Payment Pending', 'Payment Verified', 'Packed', 'Shipped', 'Delivered', 'Payment Rejected', 'Cancelled', 'Returned')),
  utr_number TEXT,
  payment_id TEXT,
  courier_name TEXT,
  tracking_number TEXT,
  tracking_url TEXT,
  internal_notes TEXT[],
  placed_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes:**
- `idx_orders_user_id` on user_id
- `idx_orders_order_status` on order_status
- `idx_orders_payment_status` on payment_status
- `idx_orders_placed_at` on placed_at

---

### 10. order_items
Items within an order.

```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES products(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  sku TEXT,
  variant TEXT,
  price NUMERIC(10,2) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  image TEXT
);
```

**Indexes:**
- `idx_order_items_order_id` on order_id
- `idx_order_items_product_id` on product_id

---

### 11. order_shipping_addresses
Shipping addresses for orders.

```sql
CREATE TABLE order_shipping_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  line1 TEXT NOT NULL,
  line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL
);
```

**Indexes:**
- `idx_order_shipping_addresses_order_id` on order_id

---

### 12. order_timeline
Order status timeline.

```sql
CREATE TABLE order_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  note TEXT,
  staff_name TEXT
);
```

**Indexes:**
- `idx_order_timeline_order_id` on order_id
- `idx_order_timeline_timestamp` on timestamp

---

### 13. payments
Payment records for verification.

```sql
CREATE TABLE payments (
  id TEXT PRIMARY KEY,
  order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  utr_number TEXT NOT NULL,
  payment_method TEXT DEFAULT 'upi_qr',
  screenshot_url TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'pending_verification' CHECK (status IN ('pending_verification', 'verified', 'rejected')),
  is_duplicate_utr BOOLEAN DEFAULT false,
  duplicate_order_id TEXT,
  verified_at TIMESTAMPTZ,
  verified_by TEXT,
  rejection_reason TEXT,
  expires_at TIMESTAMPTZ
);
```

**Indexes:**
- `idx_payments_order_id` on order_id
- `idx_payments_utr_number` on utr_number
- `idx_payments_status` on status

---

### 14. coupons
Discount coupons.

```sql
CREATE TABLE coupons (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'flat')),
  discount_value NUMERIC(10,2) NOT NULL,
  min_order NUMERIC(10,2 NOT NULL),
  max_discount_cap NUMERIC(10,2),
  start_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  usage_limit INTEGER NOT NULL,
  used_count INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes:**
- `idx_coupons_code` on code
- `idx_coupons_active` on active

---

### 15. banners
Homepage banners.

```sql
CREATE TABLE banners (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  badge TEXT,
  image TEXT NOT NULL,
  link TEXT,
  button_text TEXT,
  active BOOLEAN DEFAULT true,
  order_num INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes:**
- `idx_banners_active` on active
- `idx_banners_order_num` on order_num

---

### 16. announcements
Announcement bar items.

```sql
CREATE TABLE announcements (
  id TEXT PRIMARY KEY,
  text TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes:**
- `idx_announcements_active` on active

---

### 17. youtube_videos
YouTube video showcase items.

```sql
CREATE TABLE youtube_videos (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  video_id TEXT NOT NULL,
  thumbnail TEXT NOT NULL,
  duration TEXT,
  views TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes:**
- `idx_youtube_videos_active` on active

---

### 18. settings
Store settings.

```sql
CREATE TABLE settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  store_name TEXT NOT NULL,
  tagline TEXT,
  support_email TEXT,
  support_phone TEXT,
  address TEXT,
  upi_id TEXT,
  upi_merchant_name TEXT,
  qr_code_url TEXT,
  utr_length INTEGER DEFAULT 12,
  free_shipping_threshold NUMERIC(10,2) DEFAULT 999,
  standard_shipping_fee NUMERIC(10,2) DEFAULT 70,
  express_shipping_fee NUMERIC(10,2) DEFAULT 140,
  gstin TEXT,
  default_gst_rate NUMERIC(5,2) DEFAULT 12,
  prices_include_gst BOOLEAN DEFAULT true,
  cart_timeout_minutes INTEGER DEFAULT 30,
  utr_expiry_hours INTEGER DEFAULT 2,
  active_festive_theme TEXT DEFAULT 'default',
  notification_templates JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 19. staff
Admin staff members.

```sql
CREATE TABLE staff (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('Super Admin', 'Store Manager', 'Fulfillment Specialist', 'Inventory Manager', 'Verification Officer')),
  avatar TEXT,
  last_active TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes:**
- `idx_staff_email` on email

---

### 20. audit_logs
Admin audit trail.

```sql
CREATE TABLE audit_logs (
  id TEXT PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  staff_name TEXT NOT NULL,
  role TEXT NOT NULL,
  module TEXT NOT NULL,
  action TEXT NOT NULL,
  description TEXT NOT NULL,
  ip_address TEXT
);
```

**Indexes:**
- `idx_audit_logs_timestamp` on timestamp
- `idx_audit_logs_module` on module

---

### 21. stock_ledger
Stock change history.

```sql
CREATE TABLE stock_ledger (
  id TEXT PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  product_id TEXT REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT,
  variant_sku TEXT,
  variant_label TEXT,
  type TEXT NOT NULL CHECK (type IN ('restock', 'manual_adjust', 'order_reserved', 'order_sale', 'order_cancelled', 'return_restored', 'damage_writeoff')),
  change INTEGER NOT NULL,
  previous_stock INTEGER,
  new_stock INTEGER,
  reason TEXT,
  staff_name TEXT,
  reference_id TEXT
);
```

**Indexes:**
- `idx_stock_ledger_timestamp` on timestamp
- `idx_stock_ledger_product_id` on product_id

---

### 22. user_reviews
Product reviews by users.

```sql
CREATE TABLE user_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
  author TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  body TEXT,
  date TEXT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes:**
- `idx_user_reviews_user_id` on user_id
- `idx_user_reviews_product_id` on product_id

---

### 23. user_questions
Product Q&A by users.

```sql
CREATE TABLE user_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
  author TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT,
  date TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes:**
- `idx_user_questions_product_id` on product_id

---

### 24. notifications
User notifications.

```sql
CREATE TABLE notifications (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  time TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes:**
- `idx_notifications_user_id` on user_id
- `idx_notifications_read` on read

---

### 25. returns
Return requests.

```sql
CREATE TABLE returns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'Return Requested' CHECK (status IN ('Return Requested', 'Approved', 'Picked Up', 'Refunded')),
  requested_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes:**
- `idx_returns_order_id` on order_id
- `idx_returns_user_id` on user_id

---

## Row Level Security (RLS) Policies

### profiles
- **SELECT**: Authenticated users can view their own profile; admins can view all
- **UPDATE**: Users can update their own profile (name, mobile); admins can update all
- **INSERT**: Only via trigger from auth.users creation
- **DELETE**: Only admins can delete

### products
- **SELECT**: Public (anyone can read)
- **INSERT/UPDATE/DELETE**: Admins only

### categories
- **SELECT**: Public
- **INSERT/UPDATE/DELETE**: Admins only

### cart_items
- **SELECT**: Users can view their own cart
- **INSERT**: Users can add to their own cart
- **UPDATE**: Users can update their own cart
- **DELETE**: Users can delete from their own cart

### wishlist_items
- **SELECT**: Users can view their own wishlist
- **INSERT**: Users can add to their own wishlist
- **DELETE**: Users can delete from their own wishlist

### orders
- **SELECT**: Users can view their own orders; admins can view all
- **INSERT**: Users can create orders; system can create
- **UPDATE**: Admins only

### addresses
- **SELECT**: Users can view their own addresses
- **INSERT**: Users can add their own addresses
- **UPDATE**: Users can update their own addresses
- **DELETE**: Users can delete their own addresses

### payments
- **SELECT**: Admins only
- **INSERT**: System only
- **UPDATE**: Admins only (for verification)

### staff
- **SELECT**: Admins only
- **INSERT/UPDATE/DELETE**: Super Admins only

### audit_logs
- **SELECT**: Admins only
- **INSERT**: System only

### stock_ledger
- **SELECT**: Admins only
- **INSERT**: System only

---

## Triggers

### 1. Profile Creation Trigger
Automatically create profile when auth.user is created.

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, mobile)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    NEW.raw_user_meta_data->>'mobile'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 2. Updated At Trigger
Auto-update updated_at timestamp.

```sql
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

Apply to all tables with updated_at column.

---

## Storage Buckets

### 1. product-images
- Public bucket for product images
- RLS: Public read, admin write

### 2. payment-screenshots
- Private bucket for payment screenshots
- RLS: Admin read/write only

---

## Summary

**Total Tables**: 25
**Total Indexes**: ~50
**RLS Policies**: ~30
**Triggers**: 2
**Storage Buckets**: 2

This schema covers all existing functionality:
- ✅ Authentication & User Profiles
- ✅ Products & Categories
- ✅ Cart & Wishlist
- ✅ Orders & Payments
- ✅ Admin Dashboard (products, orders, payments, customers, coupons, staff, settings, audit logs)
- ✅ Stock Management
- ✅ Reviews & Q&A
- ✅ Notifications
- ✅ Returns
- ✅ Addresses
- ✅ Banners & Announcements
- ✅ YouTube Videos
