-- ============================================================================
-- BASE SCHEMA — create every table the application expects
-- ============================================================================
--
-- WHY THIS FILE EXISTS
-- --------------------
-- The security migrations assume the application tables already exist:
--
--   20240101000000_enable_rls_and_policies.sql  -> ENABLE ROW LEVEL SECURITY + policies
--   20240101000001_add_constraints.sql          -> FKs, NOT NULLs, CHECKs, UNIQUEs, indexes
--   20240101000002_secure_checkout.sql          -> create_order() / cancel_order()
--   20240101000003_seed_demo_coupons.sql        -> demo coupon seed
--
-- ...but no migration created the tables, so a fresh Supabase project failed
-- with:  ERROR: 42P01: relation "profiles" does not exist.
--
-- This migration sorts BEFORE 20240101000000 and creates the tables. It is
-- deliberately additive and idempotent (`IF NOT EXISTS`) so it is safe to run
-- against an empty project and safe to re-run.
--
-- SPLIT OF RESPONSIBILITY (important)
-- -----------------------------------
-- For the tables that 20240101000001 already handles (profiles, addresses,
-- cart_items, wishlist_items, orders, order_items, order_shipping_addresses,
-- order_timeline, products, product_variants) this file creates ONLY the
-- columns, types, defaults and primary keys. The foreign keys, NOT NULLs,
-- CHECKs and UNIQUE constraints are intentionally left to
-- 20240101000001_add_constraints.sql, because that migration adds them by
-- NAME with plain `ALTER TABLE ... ADD CONSTRAINT` (not IF NOT EXISTS).
-- Creating them here too would make 0001 fail with "constraint already exists".
--
-- Tables NOT covered by 0000/0001 (coupons, payments, audit_logs, banners,
-- announcements, youtube_videos, settings, staff, stock_ledger,
-- category_filters, categories) are defined completely here.
--
-- Id types: order/product/variant/entity ids are application-generated TEXT
-- (e.g. "ORD-…", "p1"); user-owned child rows use UUID primary keys.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. profiles  (one row per auth.users row; created by the trigger below)
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id           uuid primary key,                       -- FK -> auth.users added in 0001
  name         text,
  email        text,
  mobile       text,
  role         text not null default 'customer',       -- never client-settable
  status       text not null default 'active',
  block_reason text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 2. addresses
-- ----------------------------------------------------------------------------
create table if not exists public.addresses (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid,
  name       text,
  phone      text,
  line1      text,
  line2      text,
  city       text,
  state      text,
  pincode    text,
  landmark   text,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 3. cart_items
-- ----------------------------------------------------------------------------
create table if not exists public.cart_items (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid,
  product_id text,
  quantity   integer not null default 1,
  color      text,
  size       text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 4. wishlist_items
-- ----------------------------------------------------------------------------
create table if not exists public.wishlist_items (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid,
  product_id text,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 5. orders
-- ----------------------------------------------------------------------------
create table if not exists public.orders (
  id             text primary key,
  user_id        uuid,
  customer_name  text,
  customer_email text,
  customer_phone text,
  subtotal       numeric(12,2) not null default 0,
  discount       numeric(12,2) not null default 0,
  shipping_fee   numeric(12,2) not null default 0,
  tax_amount     numeric(12,2) not null default 0,
  total          numeric(12,2) not null default 0,
  payment_method text,
  payment_status text,
  order_status   text,
  utr_number     text,
  payment_id     text,
  courier_name   text,
  tracking_number text,
  tracking_url   text,
  internal_notes text[] not null default '{}'::text[],
  placed_at      timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 6. order_items
-- ----------------------------------------------------------------------------
create table if not exists public.order_items (
  id         uuid primary key default gen_random_uuid(),
  order_id   text,
  product_id text,
  name       text,
  sku        text,
  variant    text,
  price      numeric(12,2),
  quantity   integer,
  image      text,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 7. order_shipping_addresses
-- ----------------------------------------------------------------------------
create table if not exists public.order_shipping_addresses (
  id         uuid primary key default gen_random_uuid(),
  order_id   text,
  name       text,
  phone      text,
  line1      text,
  line2      text,
  city       text,
  state      text,
  pincode    text,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 8. order_timeline
-- ----------------------------------------------------------------------------
create table if not exists public.order_timeline (
  id         uuid primary key default gen_random_uuid(),
  order_id   text,
  status     text,
  timestamp  timestamptz not null default now(),
  note       text,
  staff_name text
);

-- ----------------------------------------------------------------------------
-- 9. products
-- ----------------------------------------------------------------------------
create table if not exists public.products (
  id             text primary key,
  slug           text,
  name           text,
  brand          text,
  description    text,
  category_id    text,
  sub_category   text,
  gender         text,                                  -- 'men' | 'women' | 'kids' | 'unisex'
  price          numeric(12,2),
  mrp            numeric(12,2),
  cost_price     numeric(12,2),
  rating         numeric(2,1) not null default 5,
  reviews        integer not null default 0,
  images         text[] not null default '{}'::text[],
  colors         text[] not null default '{}'::text[],
  sizes          text[] not null default '{}'::text[],
  badges         text[] not null default '{}'::text[],
  specifications jsonb not null default '[]'::jsonb,
  stock          integer not null default 0,
  status         text not null default 'live',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'products_gender_check') then
    alter table public.products
      add constraint products_gender_check
      -- '' is allowed and treated as "unset" (see getProductGender in src/lib/gender.ts).
      check (gender is null or gender = '' or gender in ('men', 'women', 'kids', 'unisex'));
  end if;
end $$;

-- ----------------------------------------------------------------------------
-- 10. product_variants
-- ----------------------------------------------------------------------------
create table if not exists public.product_variants (
  id             text primary key,
  product_id     text,
  sku            text,
  size           text,
  color          text,
  stock          integer not null default 0,
  reserved_stock integer not null default 0,
  price_override numeric(12,2),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ============================================================================
-- ADMIN / CONTENT TABLES
-- These are read and written ONLY through the server-side service-role client
-- (behind requireAdmin()). RLS is enabled on each of them below with no
-- policies, which denies anon/authenticated access by default. The service
-- role bypasses RLS.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 11. categories  (read by the storefront/admin client — needs a read policy)
-- ----------------------------------------------------------------------------
create table if not exists public.categories (
  id            text primary key,
  name          text not null,
  slug          text not null,
  image         text,
  description   text,
  subcategories text[] not null default '{}'::text[],
  active        boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 12. coupons  (validated by create_order())
-- ----------------------------------------------------------------------------
create table if not exists public.coupons (
  id              text primary key,
  code            text not null,
  description     text,
  discount_type   text not null default 'flat',
  discount_value  numeric(12,2) not null default 0,
  min_order       numeric(12,2) not null default 0,
  max_discount_cap numeric(12,2),
  start_date      date,
  expiry_date     date,
  usage_limit     integer,
  used_count      integer not null default 0,
  active          boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'coupons_discount_type_check') then
    alter table public.coupons
      add constraint coupons_discount_type_check
      check (discount_type in ('percentage', 'flat'));
  end if;
end $$;

-- ----------------------------------------------------------------------------
-- 13. payments
-- ----------------------------------------------------------------------------
create table if not exists public.payments (
  id                text primary key,
  order_id          text,
  customer_name     text,
  customer_phone    text,
  amount            numeric(12,2),
  utr_number        text,
  payment_method    text not null default 'upi_qr',
  screenshot_url    text,
  submitted_at      timestamptz not null default now(),
  status            text not null default 'pending_verification',
  is_duplicate_utr  boolean not null default false,
  duplicate_order_id text,
  verified_at       timestamptz,
  verified_by       text,
  rejection_reason  text,
  expires_at        timestamptz,
  created_at        timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 14. audit_logs
-- ----------------------------------------------------------------------------
create table if not exists public.audit_logs (
  id          text primary key,
  timestamp   timestamptz not null default now(),
  staff_name  text,
  role        text,
  module      text,
  action      text,
  description text,
  ip_address  text
);

-- ----------------------------------------------------------------------------
-- 15. banners
-- ----------------------------------------------------------------------------
create table if not exists public.banners (
  id          text primary key,
  title       text,
  subtitle    text,
  badge       text,
  image       text,
  link        text,
  button_text text,
  active      boolean not null default true,
  order_num   integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 16. announcements
-- ----------------------------------------------------------------------------
create table if not exists public.announcements (
  id         text primary key,
  text       text not null,
  active     boolean not null default true,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 17. youtube_videos
-- ----------------------------------------------------------------------------
create table if not exists public.youtube_videos (
  id         text primary key,
  title      text,
  video_id   text,
  thumbnail  text,
  duration   text,
  views      text,
  active     boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 18. settings  (single row, id = 'default')
-- ----------------------------------------------------------------------------
create table if not exists public.settings (
  id                       text primary key default 'default',
  store_name               text,
  tagline                  text,
  support_email            text,
  support_phone            text,
  address                  text,
  upi_id                   text,
  upi_merchant_name        text,
  qr_code_url              text,
  utr_length               integer not null default 12,
  free_shipping_threshold  numeric(12,2) not null default 499,
  standard_shipping_fee    numeric(12,2) not null default 50,
  express_shipping_fee     numeric(12,2) not null default 100,
  gstin                    text,
  default_gst_rate         numeric(5,2) not null default 18,
  prices_include_gst       boolean not null default true,
  cart_timeout_minutes     integer not null default 30,
  utr_expiry_hours         integer not null default 24,
  active_festive_theme     text not null default 'default',
  notification_templates   jsonb not null default '{}'::jsonb,
  updated_at               timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 19. staff
-- ----------------------------------------------------------------------------
create table if not exists public.staff (
  id          text primary key,
  name        text,
  email       text,
  role        text,
  avatar      text,
  last_active timestamptz,
  status      text not null default 'active',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 20. stock_ledger
-- ----------------------------------------------------------------------------
create table if not exists public.stock_ledger (
  id             text primary key,
  timestamp      timestamptz not null default now(),
  product_id     text,
  product_name   text,
  variant_sku    text,
  variant_label  text,
  type           text,
  change         integer,
  previous_stock integer,
  new_stock      integer,
  reason         text,
  staff_name     text,
  reference_id   text
);

-- ----------------------------------------------------------------------------
-- 21. category_filters
-- ----------------------------------------------------------------------------
create table if not exists public.category_filters (
  id                text primary key,
  name              text,
  key               text,
  target_categories text[] not null default '{}'::text[],
  type              text,
  options           text[] not null default '{}'::text[],
  active            boolean not null default true,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ============================================================================
-- INDEXES (admin / content tables; core-table indexes live in 0001)
-- ============================================================================
create index if not exists categories_slug_idx        on public.categories (slug);
create index if not exists categories_active_idx      on public.categories (active);
create index if not exists coupons_code_idx           on public.coupons (code);
create index if not exists coupons_active_idx         on public.coupons (active);
create index if not exists payments_order_id_idx      on public.payments (order_id);
create index if not exists payments_status_idx        on public.payments (status);
create index if not exists audit_logs_timestamp_idx   on public.audit_logs (timestamp desc);
create index if not exists stock_ledger_timestamp_idx on public.stock_ledger (timestamp desc);
create index if not exists stock_ledger_product_id_idx on public.stock_ledger (product_id);
create index if not exists banners_order_num_idx      on public.banners (order_num);

-- ============================================================================
-- UNIQUE CONSTRAINTS (admin / content tables — not touched by 0001)
-- ============================================================================
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'categories_slug_key') then
    alter table public.categories add constraint categories_slug_key unique (slug);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'coupons_code_key') then
    alter table public.coupons add constraint coupons_code_key unique (code);
  end if;
end $$;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
-- The ten core tables get their RLS + policies in
-- 20240101000000_enable_rls_and_policies.sql.
--
-- The admin/content tables below are enabled here with NO policies, so they
-- are denied to anon/authenticated callers and reachable only via the
-- service-role client (which bypasses RLS). `categories` is the one exception:
-- the storefront/admin client reads it, so it gets a read-only policy.

alter table public.coupons         enable row level security;
alter table public.payments        enable row level security;
alter table public.audit_logs      enable row level security;
alter table public.banners         enable row level security;
alter table public.announcements   enable row level security;
alter table public.youtube_videos  enable row level security;
alter table public.settings        enable row level security;
alter table public.staff           enable row level security;
alter table public.stock_ledger    enable row level security;
alter table public.category_filters enable row level security;

alter table public.categories enable row level security;

drop policy if exists "Public can view active categories" on public.categories;
create policy "Public can view active categories" on public.categories
  for select
  using (active = true);

-- ============================================================================
-- PROFILE CREATION ON SIGN-UP
-- ============================================================================
-- `supabase.auth.signUp()` only creates a row in auth.users. The application
-- reads the matching row from public.profiles, so this trigger creates it.
--
-- SECURITY DEFINER lets the trigger (which runs in the auth context) insert
-- into profiles despite RLS. The role is hard-coded to 'customer' and is never
-- read from user-supplied metadata, so a client cannot register itself as an
-- admin. Promotion to admin is a deliberate, server-side/service-role action.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, email, mobile, role)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'name', ''), split_part(coalesce(new.email, 'user'), '@', 1)),
    coalesce(new.email, ''),
    nullif(new.raw_user_meta_data->>'mobile', ''),
    'customer'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- DEFAULT SETTINGS ROW
-- ============================================================================
-- The settings screen reads a single row with id = 'default'. Seed it so the
-- admin settings page has something to update (idempotent).
insert into public.settings (id, store_name, tagline, support_email, support_phone)
values ('default', 'Saara', 'Fashion, footwear & more', 'support@saara.example', '+91 00000 00000')
on conflict (id) do nothing;

-- ============================================================================
-- TABLE PRIVILEGES (GRANTs)
-- ============================================================================
-- RLS policies only take effect once the role has table privileges. Supabase
-- usually provisions default privileges for the objects created by migrations,
-- but granting explicitly here makes the schema self-sufficient:
--   * anon / authenticated : only the customer-facing reads/writes (RLS then
--     narrows them to the caller's own rows).
--   * service_role         : full access for the admin server layer.
-- Admin/content tables are intentionally NOT granted to anon/authenticated —
-- they have RLS enabled with no policies, so they are service-role only.

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    grant usage on schema public to anon;
    grant select on public.products, public.product_variants, public.categories to anon;
  end if;

  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    grant usage on schema public to authenticated;
    grant select on public.products, public.product_variants, public.categories to authenticated;
    grant select, insert, update, delete on
      public.cart_items, public.wishlist_items, public.addresses to authenticated;
    grant select, update on public.profiles to authenticated;
    grant select on
      public.orders, public.order_items, public.order_shipping_addresses, public.order_timeline
      to authenticated;
  end if;

  if exists (select 1 from pg_roles where rolname = 'service_role') then
    grant usage on schema public to service_role;
    grant all on all tables in schema public to service_role;
    grant all on all sequences in schema public to service_role;
  end if;
end $$;
