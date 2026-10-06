-- Add database constraints for data integrity
-- This migration adds foreign keys, NOT NULL constraints, and unique constraints

-- ============================================================================
-- PROFILES TABLE CONSTRAINTS
-- ============================================================================

-- Ensure id matches auth.users
ALTER TABLE profiles 
  ADD CONSTRAINT profiles_id_fkey 
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Ensure email is not null
ALTER TABLE profiles 
  ALTER COLUMN email SET NOT NULL;

-- Ensure name is not null
ALTER TABLE profiles 
  ALTER COLUMN name SET NOT NULL;

-- ============================================================================
-- ADDRESSES TABLE CONSTRAINTS
-- ============================================================================

-- Ensure user_id references profiles
ALTER TABLE addresses 
  ADD CONSTRAINT addresses_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Ensure user_id is not null
ALTER TABLE addresses 
  ALTER COLUMN user_id SET NOT NULL;

-- Ensure required fields are not null
ALTER TABLE addresses 
  ALTER COLUMN name SET NOT NULL,
  ALTER COLUMN phone SET NOT NULL,
  ALTER COLUMN line1 SET NOT NULL,
  ALTER COLUMN city SET NOT NULL,
  ALTER COLUMN state SET NOT NULL,
  ALTER COLUMN pincode SET NOT NULL;

-- ============================================================================
-- CART_ITEMS TABLE CONSTRAINTS
-- ============================================================================

-- Ensure user_id references profiles
ALTER TABLE cart_items 
  ADD CONSTRAINT cart_items_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Ensure product_id references products
ALTER TABLE cart_items 
  ADD CONSTRAINT cart_items_product_id_fkey 
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

-- Ensure user_id is not null
ALTER TABLE cart_items 
  ALTER COLUMN user_id SET NOT NULL;

-- Ensure product_id is not null
ALTER TABLE cart_items 
  ALTER COLUMN product_id SET NOT NULL;

-- Ensure quantity is not null and >= 0
ALTER TABLE cart_items 
  ALTER COLUMN quantity SET NOT NULL,
  ADD CONSTRAINT cart_items_quantity_check CHECK (quantity > 0);

-- Unique constraint: one cart item per user per product variant
ALTER TABLE cart_items 
  ADD CONSTRAINT cart_items_user_product_variant_unique 
  UNIQUE (user_id, product_id, color, size);

-- ============================================================================
-- WISHLIST_ITEMS TABLE CONSTRAINTS
-- ============================================================================

-- Ensure user_id references profiles
ALTER TABLE wishlist_items 
  ADD CONSTRAINT wishlist_items_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Ensure product_id references products
ALTER TABLE wishlist_items 
  ADD CONSTRAINT wishlist_items_product_id_fkey 
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

-- Ensure user_id is not null
ALTER TABLE wishlist_items 
  ALTER COLUMN user_id SET NOT NULL;

-- Ensure product_id is not null
ALTER TABLE wishlist_items 
  ALTER COLUMN product_id SET NOT NULL;

-- Unique constraint: one wishlist item per user per product
ALTER TABLE wishlist_items 
  ADD CONSTRAINT wishlist_items_user_product_unique 
  UNIQUE (user_id, product_id);

-- ============================================================================
-- ORDERS TABLE CONSTRAINTS
-- ============================================================================

-- Ensure user_id references profiles
ALTER TABLE orders 
  ADD CONSTRAINT orders_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Ensure user_id is not null
ALTER TABLE orders 
  ALTER COLUMN user_id SET NOT NULL;

-- Ensure required fields are not null
ALTER TABLE orders 
  ALTER COLUMN customer_name SET NOT NULL,
  ALTER COLUMN customer_phone SET NOT NULL,
  ALTER COLUMN subtotal SET NOT NULL,
  ALTER COLUMN total SET NOT NULL,
  ALTER COLUMN payment_method SET NOT NULL,
  ALTER COLUMN order_status SET NOT NULL,
  ALTER COLUMN payment_status SET NOT NULL,
  ALTER COLUMN placed_at SET NOT NULL;

-- Ensure totals are >= 0
ALTER TABLE orders 
  ADD CONSTRAINT orders_subtotal_check CHECK (subtotal >= 0),
  ADD CONSTRAINT orders_total_check CHECK (total >= 0);

-- Unique constraint on order ID
ALTER TABLE orders 
  ADD CONSTRAINT orders_id_unique UNIQUE (id);

-- ============================================================================
-- ORDER_ITEMS TABLE CONSTRAINTS
-- ============================================================================

-- Ensure order_id references orders
ALTER TABLE order_items 
  ADD CONSTRAINT order_items_order_id_fkey 
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;

-- Ensure product_id references products
ALTER TABLE order_items 
  ADD CONSTRAINT order_items_product_id_fkey 
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT;

-- Ensure order_id is not null
ALTER TABLE order_items 
  ALTER COLUMN order_id SET NOT NULL;

-- Ensure product_id is not null
ALTER TABLE order_items 
  ALTER COLUMN product_id SET NOT NULL;

-- Ensure required fields are not null
ALTER TABLE order_items 
  ALTER COLUMN name SET NOT NULL,
  ALTER COLUMN price SET NOT NULL,
  ALTER COLUMN quantity SET NOT NULL;

-- Ensure price and quantity are >= 0
ALTER TABLE order_items 
  ADD CONSTRAINT order_items_price_check CHECK (price >= 0),
  ADD CONSTRAINT order_items_quantity_check CHECK (quantity > 0);

-- ============================================================================
-- ORDER_SHIPPING_ADDRESSES TABLE CONSTRAINTS
-- ============================================================================

-- Ensure order_id references orders
ALTER TABLE order_shipping_addresses 
  ADD CONSTRAINT order_shipping_addresses_order_id_fkey 
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;

-- Ensure order_id is not null
ALTER TABLE order_shipping_addresses 
  ALTER COLUMN order_id SET NOT NULL;

-- Ensure required fields are not null
ALTER TABLE order_shipping_addresses 
  ALTER COLUMN name SET NOT NULL,
  ALTER COLUMN phone SET NOT NULL,
  ALTER COLUMN line1 SET NOT NULL,
  ALTER COLUMN city SET NOT NULL,
  ALTER COLUMN state SET NOT NULL,
  ALTER COLUMN pincode SET NOT NULL;

-- Unique constraint: one shipping address per order
ALTER TABLE order_shipping_addresses 
  ADD CONSTRAINT order_shipping_addresses_order_id_unique UNIQUE (order_id);

-- ============================================================================
-- ORDER_TIMELINE TABLE CONSTRAINTS
-- ============================================================================

-- Ensure order_id references orders
ALTER TABLE order_timeline 
  ADD CONSTRAINT order_timeline_order_id_fkey 
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;

-- Ensure order_id is not null
ALTER TABLE order_timeline 
  ALTER COLUMN order_id SET NOT NULL;

-- Ensure required fields are not null
ALTER TABLE order_timeline 
  ALTER COLUMN status SET NOT NULL,
  ALTER COLUMN timestamp SET NOT NULL;

-- ============================================================================
-- PRODUCTS TABLE CONSTRAINTS
-- ============================================================================

-- Ensure category_id references categories if categories table exists
-- (Skip if categories table doesn't exist or is derived)

-- Ensure required fields are not null
ALTER TABLE products 
  ALTER COLUMN id SET NOT NULL,
  ALTER COLUMN slug SET NOT NULL,
  ALTER COLUMN name SET NOT NULL,
  ALTER COLUMN brand SET NOT NULL,
  ALTER COLUMN price SET NOT NULL,
  ALTER COLUMN mrp SET NOT NULL,
  ALTER COLUMN status SET NOT NULL,
  ALTER COLUMN created_at SET NOT NULL;

-- Ensure prices are >= 0
ALTER TABLE products 
  ADD CONSTRAINT products_price_check CHECK (price >= 0),
  ADD CONSTRAINT products_mrp_check CHECK (mrp >= 0),
  ADD CONSTRAINT products_mrp_gte_price CHECK (mrp >= price);

-- Ensure stock is >= 0
ALTER TABLE products 
  ADD CONSTRAINT products_stock_check CHECK (stock >= 0);

-- Ensure rating is between 0 and 5
ALTER TABLE products 
  ADD CONSTRAINT products_rating_check CHECK (rating >= 0 AND rating <= 5);

-- Ensure reviews is >= 0
ALTER TABLE products 
  ADD CONSTRAINT products_reviews_check CHECK (reviews >= 0);

-- Unique constraint on slug
ALTER TABLE products 
  ADD CONSTRAINT products_slug_unique UNIQUE (slug);

-- Unique constraint on id
ALTER TABLE products 
  ADD CONSTRAINT products_id_unique UNIQUE (id);

-- ============================================================================
-- PRODUCT_VARIANTS TABLE CONSTRAINTS
-- ============================================================================

-- Ensure product_id references products
ALTER TABLE product_variants 
  ADD CONSTRAINT product_variants_product_id_fkey 
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

-- Ensure product_id is not null
ALTER TABLE product_variants 
  ALTER COLUMN product_id SET NOT NULL;

-- Ensure required fields are not null
ALTER TABLE product_variants 
  ALTER COLUMN id SET NOT NULL,
  ALTER COLUMN sku SET NOT NULL,
  ALTER COLUMN size SET NOT NULL,
  ALTER COLUMN color SET NOT NULL,
  ALTER COLUMN stock SET NOT NULL;

-- Ensure stock is >= 0
ALTER TABLE product_variants 
  ADD CONSTRAINT product_variants_stock_check CHECK (stock >= 0);

-- Ensure reserved_stock is >= 0
ALTER TABLE product_variants 
  ADD CONSTRAINT product_variants_reserved_stock_check CHECK (reserved_stock >= 0);

-- Unique constraint on sku
ALTER TABLE product_variants 
  ADD CONSTRAINT product_variants_sku_unique UNIQUE (sku);

-- Unique constraint on id
ALTER TABLE product_variants 
  ADD CONSTRAINT product_variants_id_unique UNIQUE (id);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Indexes for profiles
CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles(email);
CREATE INDEX IF NOT EXISTS profiles_role_idx ON profiles(role);

-- Indexes for addresses
CREATE INDEX IF NOT EXISTS addresses_user_id_idx ON addresses(user_id);

-- Indexes for cart_items
CREATE INDEX IF NOT EXISTS cart_items_user_id_idx ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS cart_items_product_id_idx ON cart_items(product_id);

-- Indexes for wishlist_items
CREATE INDEX IF NOT EXISTS wishlist_items_user_id_idx ON wishlist_items(user_id);
CREATE INDEX IF NOT EXISTS wishlist_items_product_id_idx ON wishlist_items(product_id);

-- Indexes for orders
CREATE INDEX IF NOT EXISTS orders_user_id_idx ON orders(user_id);
CREATE INDEX IF NOT EXISTS orders_status_idx ON orders(order_status);
CREATE INDEX IF NOT EXISTS orders_placed_at_idx ON orders(placed_at DESC);

-- Indexes for order_items
CREATE INDEX IF NOT EXISTS order_items_order_id_idx ON order_items(order_id);
CREATE INDEX IF NOT EXISTS order_items_product_id_idx ON order_items(product_id);

-- Indexes for order_shipping_addresses
CREATE INDEX IF NOT EXISTS order_shipping_addresses_order_id_idx ON order_shipping_addresses(order_id);

-- Indexes for order_timeline
CREATE INDEX IF NOT EXISTS order_timeline_order_id_idx ON order_timeline(order_id);
CREATE INDEX IF NOT EXISTS order_timeline_timestamp_idx ON order_timeline(timestamp DESC);

-- Indexes for products
CREATE INDEX IF NOT EXISTS products_slug_idx ON products(slug);
CREATE INDEX IF NOT EXISTS products_status_idx ON products(status);
CREATE INDEX IF NOT EXISTS products_category_id_idx ON products(category_id);
CREATE INDEX IF NOT EXISTS products_created_at_idx ON products(created_at DESC);

-- Indexes for product_variants
CREATE INDEX IF NOT EXISTS product_variants_product_id_idx ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS product_variants_sku_idx ON product_variants(sku);
