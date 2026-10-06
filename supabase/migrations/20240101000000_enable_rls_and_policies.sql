-- Enable RLS and create security policies
-- This migration enables Row Level Security and creates policies for all tables

-- ============================================================================
-- PROFILES TABLE
-- ============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile (but not role)
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id 
    AND role = (SELECT role FROM profiles WHERE id = auth.uid())
  );

-- ============================================================================
-- ADDRESSES TABLE
-- ============================================================================
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

-- Users can read their own addresses
CREATE POLICY "Users can view own addresses" ON addresses
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own addresses
CREATE POLICY "Users can insert own addresses" ON addresses
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own addresses
CREATE POLICY "Users can update own addresses" ON addresses
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own addresses
CREATE POLICY "Users can delete own addresses" ON addresses
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- CART_ITEMS TABLE
-- ============================================================================
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Users can read their own cart
CREATE POLICY "Users can view own cart" ON cart_items
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own cart items
CREATE POLICY "Users can insert own cart items" ON cart_items
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own cart items
CREATE POLICY "Users can update own cart items" ON cart_items
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own cart items
CREATE POLICY "Users can delete own cart items" ON cart_items
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- WISHLIST_ITEMS TABLE
-- ============================================================================
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;

-- Users can read their own wishlist
CREATE POLICY "Users can view own wishlist" ON wishlist_items
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own wishlist items
CREATE POLICY "Users can insert own wishlist items" ON wishlist_items
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own wishlist items
CREATE POLICY "Users can delete own wishlist items" ON wishlist_items
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- ORDERS TABLE
-- ============================================================================
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Users can read their own orders
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own orders (through checkout)
CREATE POLICY "Users can insert own orders" ON orders
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users cannot update orders (status changes by admin only)
CREATE POLICY "Users cannot update orders" ON orders
  FOR UPDATE
  USING (false);

-- Users cannot delete orders
CREATE POLICY "Users cannot delete orders" ON orders
  FOR DELETE
  USING (false);

-- ============================================================================
-- ORDER_ITEMS TABLE
-- ============================================================================
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Users can read items from their own orders
CREATE POLICY "Users can view own order items" ON order_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

-- Users cannot insert order items directly (done through order creation)
CREATE POLICY "Users cannot insert order items" ON order_items
  FOR INSERT
  WITH CHECK (false);

-- Users cannot update order items
CREATE POLICY "Users cannot update order items" ON order_items
  FOR UPDATE
  USING (false);

-- Users cannot delete order items
CREATE POLICY "Users cannot delete order items" ON order_items
  FOR DELETE
  USING (false);

-- ============================================================================
-- ORDER_SHIPPING_ADDRESSES TABLE
-- ============================================================================
ALTER TABLE order_shipping_addresses ENABLE ROW LEVEL SECURITY;

-- Users can read shipping addresses from their own orders
CREATE POLICY "Users can view own order shipping addresses" ON order_shipping_addresses
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_shipping_addresses.order_id 
      AND orders.user_id = auth.uid()
    )
  );

-- Users cannot insert shipping addresses directly (done through order creation)
CREATE POLICY "Users cannot insert shipping addresses" ON order_shipping_addresses
  FOR INSERT
  WITH CHECK (false);

-- Users cannot update shipping addresses
CREATE POLICY "Users cannot update shipping addresses" ON order_shipping_addresses
  FOR UPDATE
  USING (false);

-- Users cannot delete shipping addresses
CREATE POLICY "Users cannot delete shipping addresses" ON order_shipping_addresses
  FOR DELETE
  USING (false);

-- ============================================================================
-- ORDER_TIMELINE TABLE
-- ============================================================================
ALTER TABLE order_timeline ENABLE ROW LEVEL SECURITY;

-- Users can read timeline from their own orders
CREATE POLICY "Users can view own order timeline" ON order_timeline
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_timeline.order_id 
      AND orders.user_id = auth.uid()
    )
  );

-- Users cannot insert timeline entries (admin only)
CREATE POLICY "Users cannot insert timeline" ON order_timeline
  FOR INSERT
  WITH CHECK (false);

-- Users cannot update timeline entries
CREATE POLICY "Users cannot update timeline" ON order_timeline
  FOR UPDATE
  USING (false);

-- Users cannot delete timeline entries
CREATE POLICY "Users cannot delete timeline" ON order_timeline
  FOR DELETE
  USING (false);

-- ============================================================================
-- PRODUCTS TABLE
-- ============================================================================
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Everyone can read live products
CREATE POLICY "Public can view live products" ON products
  FOR SELECT
  USING (status = 'live');

-- Authenticated users cannot insert products (admin only)
CREATE POLICY "Users cannot insert products" ON products
  FOR INSERT
  WITH CHECK (false);

-- Authenticated users cannot update products (admin only)
CREATE POLICY "Users cannot update products" ON products
  FOR UPDATE
  USING (false);

-- Authenticated users cannot delete products (admin only)
CREATE POLICY "Users cannot delete products" ON products
  FOR DELETE
  USING (false);

-- ============================================================================
-- PRODUCT_VARIANTS TABLE
-- ============================================================================
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

-- Everyone can read variants of live products
CREATE POLICY "Public can view product variants" ON product_variants
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM products 
      WHERE products.id = product_variants.product_id 
      AND products.status = 'live'
    )
  );

-- Authenticated users cannot insert variants (admin only)
CREATE POLICY "Users cannot insert variants" ON product_variants
  FOR INSERT
  WITH CHECK (false);

-- Authenticated users cannot update variants (admin only)
CREATE POLICY "Users cannot update variants" ON product_variants
  FOR UPDATE
  USING (false);

-- Authenticated users cannot delete variants (admin only)
CREATE POLICY "Users cannot delete variants" ON product_variants
  FOR DELETE
  USING (false);

-- ============================================================================
-- ADMIN POLICIES (Service Role Only)
-- ============================================================================
-- Note: Admin operations should use the service role key on the server side.
-- These policies allow service role bypass for admin operations.

-- Allow service role to bypass RLS for all tables
-- This is done by NOT creating restrictive policies for service role
-- Service role key bypasses RLS by default in Supabase

-- ============================================================================
-- SECURITY NOTES
-- ============================================================================
-- 1. Admin operations MUST use the service role key on the server side
-- 2. Never expose the service role key to the client
-- 3. Role changes in profiles table should be done via database functions or service role only
-- 4. Order status changes should be done via database functions or service role only
-- 5. Stock adjustments should be done via database functions or service role only
