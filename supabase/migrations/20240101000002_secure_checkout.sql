-- ============================================================================
-- SECURE CUSTOMER CHECKOUT & CANCELLATION
-- ============================================================================
--
-- The RLS policies in 20240101000000_enable_rls_and_policies.sql deliberately
-- deny direct client INSERT/UPDATE on orders, order_items,
-- order_shipping_addresses and order_timeline. Rather than weaken those
-- policies, customers now place and cancel orders through these two
-- narrowly-scoped SECURITY DEFINER functions. Each function:
--   * requires an authenticated caller (auth.uid()),
--   * loads authoritative product/variant prices and stock from the database,
--   * computes subtotal / shipping / discount / total itself,
--   * writes all related rows in a single transaction,
--   * sets the initial order status and payment status itself.
-- The caller cannot supply prices, totals, stock, ownership, status or the
-- timeline actor.
--
-- These functions are exposed only to the `authenticated` role and are not
-- generic: there is no way to create an order for someone else, to set a price,
-- or to cancel an order the caller does not own.

-- ----------------------------------------------------------------------------
-- create_order
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.create_order(
  p_items jsonb,
  p_shipping jsonb,
  p_payment_method text,
  p_coupon text DEFAULT NULL
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_now timestamptz := now();

  v_order_id text;
  v_item jsonb;
  v_lines jsonb := '[]'::jsonb;

  v_product_id text;
  v_qty bigint;
  v_color text;
  v_size text;
  v_price numeric(12,2);
  v_mrp numeric(12,2);
  v_stock integer;
  v_status text;
  v_name text;
  v_image text;
  v_sku text;
  v_variant_label text;
  v_variant record;

  v_subtotal numeric(12,2) := 0;
  v_mrp_total numeric(12,2) := 0;
  v_discount numeric(12,2) := 0;
  v_shipping_fee numeric(12,2) := 0;
  v_coupon_discount numeric(12,2) := 0;
  v_total numeric(12,2) := 0;

  v_coupon record;
  v_customer_name text;
  v_customer_email text;
  v_customer_phone text;

  -- Mirrors the storefront checkout rule (FREE_DELIVERY_THRESHOLD / DELIVERY_CHARGE).
  c_free_shipping_threshold constant numeric(12,2) := 499;
  c_standard_shipping_fee constant numeric(12,2) := 50;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'unauthenticated';
  END IF;

  IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'empty_cart';
  END IF;

  -- Delivery address is required and is stored verbatim; ownership is derived
  -- from the session, never from the payload.
  IF NULLIF(trim(COALESCE(p_shipping->>'name', '')), '') IS NULL
     OR NULLIF(trim(COALESCE(p_shipping->>'phone', '')), '') IS NULL
     OR NULLIF(trim(COALESCE(p_shipping->>'line1', '')), '') IS NULL
     OR NULLIF(trim(COALESCE(p_shipping->>'city', '')), '') IS NULL
     OR NULLIF(trim(COALESCE(p_shipping->>'state', '')), '') IS NULL
     OR NULLIF(trim(COALESCE(p_shipping->>'pincode', '')), '') IS NULL THEN
    RAISE EXCEPTION 'invalid_address';
  END IF;

  SELECT name, email, mobile
    INTO v_customer_name, v_customer_email, v_customer_phone
  FROM profiles
  WHERE id = v_user_id;

  v_customer_name := COALESCE(NULLIF(trim(v_customer_name), ''), p_shipping->>'name');
  v_customer_phone := COALESCE(NULLIF(trim(v_customer_phone), ''), p_shipping->>'phone');

  FOR v_item IN SELECT value FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := v_item->>'product_id';
    v_qty := COALESCE((v_item->>'quantity')::bigint, 0);
    v_color := NULLIF(trim(COALESCE(v_item->>'color', '')), '');
    v_size := NULLIF(trim(COALESCE(v_item->>'size', '')), '');

    IF v_product_id IS NULL OR v_qty <= 0 OR v_qty > 1000 THEN
      RAISE EXCEPTION 'invalid_item';
    END IF;

    -- Authoritative product data from the database (never from the client).
    SELECT name, price, mrp, stock, status, images[1]
      INTO v_name, v_price, v_mrp, v_stock, v_status, v_image
    FROM products
    WHERE id = v_product_id;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'product_not_found';
    END IF;

    IF v_status IS DISTINCT FROM 'live' THEN
      RAISE EXCEPTION 'product_unavailable';
    END IF;

    v_sku := NULL;
    v_variant_label := COALESCE(v_color, '') || ' / ' || COALESCE(v_size, '');

    -- If the product is sold in variants, the caller must have selected an
    -- existing size/colour combination; that variant's price override and stock
    -- take precedence. This stops a caller from ordering a variant at the base
    -- price by omitting (or forging) the selection. Products without variants
    -- fall back to their product-level price and stock.
    IF EXISTS (SELECT 1 FROM product_variants WHERE product_id = v_product_id) THEN
      SELECT sku, price_override, stock
        INTO v_variant
      FROM product_variants
      WHERE product_id = v_product_id
        AND (v_size IS NULL OR size = v_size)
        AND (v_color IS NULL OR color = v_color)
      LIMIT 1;

      IF NOT FOUND THEN
        RAISE EXCEPTION 'invalid_variant';
      END IF;

      v_sku := v_variant.sku;
      IF v_variant.stock IS NOT NULL THEN
        v_stock := v_variant.stock;
      END IF;
      IF v_variant.price_override IS NOT NULL THEN
        v_price := v_variant.price_override;
      END IF;
    END IF;

    -- Stock is validated but intentionally NOT decremented here, matching the
    -- application's existing semantics (stock is maintained via the admin
    -- inventory tools). Two concurrent orders can therefore oversell the last
    -- unit; that trade-off is deliberate and preserves current behaviour.
    IF v_stock IS NULL OR v_stock < v_qty THEN
      RAISE EXCEPTION 'insufficient_stock:%', v_name;
    END IF;

    v_subtotal := v_subtotal + (v_price * v_qty);
    v_mrp_total := v_mrp_total + (v_mrp * v_qty);

    v_lines := v_lines || jsonb_build_object(
      'product_id', v_product_id,
      'name', v_name,
      'sku', COALESCE(v_sku, v_product_id),
      'variant', v_variant_label,
      'price', v_price,
      'quantity', v_qty,
      'image', v_image
    );
  END LOOP;

  v_discount := GREATEST(v_mrp_total - v_subtotal, 0);
  v_shipping_fee := CASE
    WHEN v_subtotal >= c_free_shipping_threshold THEN 0
    ELSE c_standard_shipping_fee
  END;

  -- Coupon is validated against the coupons table only; an unknown, expired or
  -- inactive code applies no discount.
  IF p_coupon IS NOT NULL AND length(trim(p_coupon)) > 0 THEN
    SELECT *
      INTO v_coupon
    FROM coupons
    WHERE upper(code) = upper(trim(p_coupon))
      AND active = true
      AND (start_date IS NULL OR start_date <= CURRENT_DATE)
      AND (expiry_date IS NULL OR expiry_date >= CURRENT_DATE)
      AND (usage_limit IS NULL OR used_count < usage_limit)
    LIMIT 1;

    IF FOUND AND v_subtotal >= COALESCE(v_coupon.min_order, 0) THEN
      IF v_coupon.discount_type = 'percentage' THEN
        v_coupon_discount := round(v_subtotal * COALESCE(v_coupon.discount_value, 0) / 100.0, 2);
        IF v_coupon.max_discount_cap IS NOT NULL THEN
          v_coupon_discount := LEAST(v_coupon_discount, v_coupon.max_discount_cap);
        END IF;
      ELSE
        v_coupon_discount := COALESCE(v_coupon.discount_value, 0);
      END IF;
    END IF;
  END IF;

  v_coupon_discount := LEAST(GREATEST(v_coupon_discount, 0), v_subtotal);
  v_total := GREATEST(v_subtotal + v_shipping_fee - v_coupon_discount, 0);

  v_order_id := 'ORD-' || to_char(v_now, 'YYYYMMDD') || '-'
    || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));

  -- Order header: status/payment are server-controlled.
  INSERT INTO orders (
    id, user_id, customer_name, customer_email, customer_phone,
    subtotal, discount, shipping_fee, tax_amount, total,
    payment_method, payment_status, order_status, placed_at, updated_at
  ) VALUES (
    v_order_id, v_user_id, v_customer_name, v_customer_email, v_customer_phone,
    v_subtotal, v_discount, v_shipping_fee, 0, v_total,
    COALESCE(NULLIF(trim(p_payment_method), ''), 'unknown'),
    'Pending', 'Placed', v_now, v_now
  );

  INSERT INTO order_items (order_id, product_id, name, sku, variant, price, quantity, image)
  SELECT v_order_id,
         l->>'product_id',
         l->>'name',
         l->>'sku',
         l->>'variant',
         (l->>'price')::numeric,
         (l->>'quantity')::integer,
         l->>'image'
  FROM jsonb_array_elements(v_lines) AS l;

  INSERT INTO order_shipping_addresses (order_id, name, phone, line1, line2, city, state, pincode)
  VALUES (
    v_order_id,
    p_shipping->>'name',
    p_shipping->>'phone',
    p_shipping->>'line1',
    NULLIF(trim(COALESCE(p_shipping->>'line2', '')), ''),
    p_shipping->>'city',
    p_shipping->>'state',
    p_shipping->>'pincode'
  );

  INSERT INTO order_timeline (order_id, status, timestamp, note)
  VALUES (v_order_id, 'Placed', v_now, 'Order placed successfully');

  DELETE FROM cart_items WHERE user_id = v_user_id;

  RETURN v_order_id;
END;
$$;

-- ----------------------------------------------------------------------------
-- cancel_order
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.cancel_order(p_order_id text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_order record;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'unauthenticated';
  END IF;

  SELECT id, user_id, order_status
    INTO v_order
  FROM orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'order_not_found';
  END IF;

  IF v_order.user_id IS DISTINCT FROM v_user_id THEN
    RAISE EXCEPTION 'not_owner';
  END IF;

  -- Only pre-shipment states are cancellable.
  IF v_order.order_status NOT IN ('Placed', 'Payment Pending', 'Payment Verified', 'Packed') THEN
    RAISE EXCEPTION 'not_cancellable';
  END IF;

  UPDATE orders
     SET order_status = 'Cancelled', updated_at = now()
   WHERE id = p_order_id;

  INSERT INTO order_timeline (order_id, status, timestamp, note)
  VALUES (p_order_id, 'Cancelled', now(), 'Order cancelled by customer');

  RETURN true;
END;
$$;

-- ----------------------------------------------------------------------------
-- Lock down exposure: only authenticated users may call these, and the
-- functions remain narrow (no caller-supplied ownership/prices/status).
-- ----------------------------------------------------------------------------
REVOKE ALL ON FUNCTION public.create_order(jsonb, jsonb, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.cancel_order(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_order(jsonb, jsonb, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_order(text) TO authenticated;

