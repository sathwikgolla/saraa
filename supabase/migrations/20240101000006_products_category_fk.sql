-- Enforce the product → category relationship at the database level.
--
-- The base schema declared `products.category_id text` without a foreign key
-- (the earlier constraints migration only left a comment). This adds the real
-- FK so a product can never be stored against a category that doesn't exist.
--
-- Safe to apply: the constraint is added NOT VALID first (so it never aborts on
-- pre-existing rows), orphan references are cleared, then it is validated.
--
-- NOTE: `product_variants.product_id → products(id) ON DELETE CASCADE` already
-- exists (see 20240101000001_add_constraints.sql), so deleting a product
-- removes its variants.

-- 1. Clear any orphan references so the constraint can validate.
update public.products
set category_id = null
where category_id is not null
  and category_id not in (select id from public.categories);

-- 2. Add the constraint without a full scan (no-op if already present).
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'products_category_id_fkey'
  ) then
    alter table public.products
      add constraint products_category_id_fkey
      foreign key (category_id) references public.categories(id)
      on delete restrict
      not valid;
  end if;
end $$;

-- 3. Now validate it against existing rows.
alter table public.products validate constraint products_category_id_fkey;
