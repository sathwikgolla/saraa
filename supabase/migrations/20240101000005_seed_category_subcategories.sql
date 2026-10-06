-- Catalog subcategory hierarchy, stored on the EXISTING public.categories table.
--
-- There is intentionally NO public.subcategories table. The third level of the
-- catalog lives in `categories.subcategories text[]`, and a product records its
-- own category + audience + subcategory via
-- products.category_id / products.gender / products.sub_category.
--
-- The per-audience (Men / Women / Kids) suggestions are applied in the app by
-- `src/lib/catalogTaxonomy.ts`; this seed stores the union per category so the
-- admin UI and database reflect the full list.
--
-- It runs once as a migration. It is written to be error-free if re-applied,
-- but note that re-running it would RESTORE names an admin has since removed
-- (it overwrites the array), so treat it as one-shot seed data.

update public.categories
set subcategories = array[
      'T-Shirts', 'Tops', 'Shirts', 'Jeans', 'Trousers', 'Dresses', 'Skirts',
      'Jackets', 'Sweatshirts', 'Hoodies', 'Shorts', 'Track Pants',
      'Ethnic Wear', 'Innerwear'
    ],
    updated_at = now()
where id = 'clothing';

update public.categories
set subcategories = array[
      'Casual Shoes', 'Sports Shoes', 'Running Shoes', 'Sneakers',
      'Formal Shoes', 'Heels', 'Flats', 'Loafers', 'Sandals', 'Slippers',
      'Boots', 'School Shoes'
    ],
    updated_at = now()
where id = 'footwear';
