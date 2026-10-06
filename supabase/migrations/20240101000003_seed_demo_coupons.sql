-- ============================================================================
-- DEMO COUPONS
-- ============================================================================
-- The storefront checkout historically hard-coded three coupon codes
-- (SAVE10 / WELCOME20 / FLAT100). `create_order` validates coupons against the
-- `coupons` table, so seed those codes here to preserve the existing coupon
-- behaviour while making the database the source of truth.
--
-- Kept as its own migration (separate from the checkout RPCs) so that an
-- unexpected `coupons` schema cannot prevent the secure checkout functions
-- from being created.
--
-- Idempotent.

INSERT INTO coupons (
  id, code, description, discount_type, discount_value, min_order,
  max_discount_cap, start_date, expiry_date, usage_limit, used_count, active,
  created_at, updated_at
) VALUES
  ('CPN-SAVE10',    'SAVE10',    '10% off (up to Rs.200)', 'percentage', 10,  0, 200,  DATE '2024-01-01', DATE '2035-12-31', 100000, 0, true, now(), now()),
  ('CPN-WELCOME20', 'WELCOME20', 'Flat Rs.20 off',         'flat',       20,  0, NULL, DATE '2024-01-01', DATE '2035-12-31', 100000, 0, true, now(), now()),
  ('CPN-FLAT100',   'FLAT100',   'Flat Rs.100 off',        'flat',       100, 0, NULL, DATE '2024-01-01', DATE '2035-12-31', 100000, 0, true, now(), now())
ON CONFLICT DO NOTHING;
