-- SR Dairy Fresh production schema for Supabase/Postgres.
-- Run this once in Supabase SQL Editor, then create your first admin profile as described below.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  phone text,
  role text not null default 'customer' check (role in ('customer','admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id text primary key,
  name text not null,
  category text not null,
  description text not null default '',
  image text,
  unit_prices jsonb not null default '{}'::jsonb,
  default_unit text not null,
  rating numeric(3,2) not null default 0,
  review_count integer not null default 0,
  in_stock boolean not null default true,
  badge text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.serviceable_pincodes (
  pincode text primary key check (pincode ~ '^[0-9]{6}$'),
  city text,
  state text default 'Andhra Pradesh',
  active boolean not null default true
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete restrict,
  status text not null default 'placed' check (status in ('awaiting_payment','placed','confirmed','packed','out_for_delivery','delivered','cancelled','payment_failed','refunded')),
  payment_status text not null default 'cod_pending' check (payment_status in ('created','paid','cod_pending','failed','refunded')),
  payment_method text not null check (payment_method in ('cod','online')),
  subtotal numeric(12,2) not null,
  delivery_fee numeric(12,2) not null default 0,
  total numeric(12,2) not null,
  customer jsonb not null default '{}'::jsonb,
  razorpay_order_id text unique,
  razorpay_payment_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id text not null references public.products(id) on delete restrict,
  name text not null,
  image text,
  unit text not null,
  quantity integer not null check (quantity > 0),
  unit_price numeric(12,2) not null,
  created_at timestamptz not null default now()
);

create index if not exists orders_user_id_created_idx on public.orders(user_id, created_at desc);
create index if not exists orders_status_idx on public.orders(status);
create index if not exists order_items_order_id_idx on public.order_items(order_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, phone)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', ''), coalesce(new.raw_user_meta_data ->> 'phone', ''))
  on conflict (id) do update set name = excluded.name, phone = excluded.phone;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.serviceable_pincodes enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "profiles own select" on public.profiles;
create policy "profiles own select" on public.profiles for select to authenticated using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles own update" on public.profiles;
create policy "profiles own update" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "products public read" on public.products;
create policy "products public read" on public.products for select to anon, authenticated using (true);

drop policy if exists "pincodes public read" on public.serviceable_pincodes;
create policy "pincodes public read" on public.serviceable_pincodes for select to anon, authenticated using (active = true);

drop policy if exists "orders owner read" on public.orders;
create policy "orders owner read" on public.orders for select to authenticated using (user_id = auth.uid() or public.is_admin());

drop policy if exists "orders admin update" on public.orders;
create policy "orders admin update" on public.orders for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "items owner read" on public.order_items;
create policy "items owner read" on public.order_items for select to authenticated using (exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_admin())));

-- The API server uses the Supabase secret key for inserts and payment updates.
-- Do not expose that key in VITE_* variables.

insert into public.serviceable_pincodes (pincode, city) values
('516001','Kadapa'),('516002','Kadapa'),('516003','Kadapa'),('516390','Gudivada')
on conflict (pincode) do update set city = excluded.city, active = true;

insert into public.products (id,name,category,description,image,unit_prices,default_unit,rating,review_count,in_stock,badge) values
('milk-toned','Toned Milk','Milk','Farm-fresh toned milk, pasteurised and chilled the same morning.','/images/products/milk.jpg','{"500 ml":32,"1 L":60,"2 L":115}'::jsonb,'1 L',4.6,214,true,'Bestseller'),
('curd-fresh','Fresh Curd','Curd','Thick, set curd made in small batches for a naturally tangy taste.','/images/products/curd.jpg','{"400 g":45,"1 kg":95}'::jsonb,'400 g',4.7,168,true,'Fresh Today'),
('paneer-soft','Soft Paneer','Paneer','Malai-soft paneer cubes, pressed fresh — no preservatives.','/images/products/paneer.jpg','{"200 g":70,"500 g":165}'::jsonb,'200 g',4.8,132,true,null),
('ghee-desi','Desi Cow Ghee','Ghee','Slow-simmered, bilona-style ghee with a rich golden aroma.','/images/products/ghee.jpg','{"250 ml":220,"500 ml":420}'::jsonb,'500 ml',4.9,301,true,'Premium'),
('butter-table','Table Butter','Butter','Creamy, unsalted white butter churned the traditional way.','/images/products/butter.jpg','{"100 g":55,"500 g":250}'::jsonb,'100 g',4.5,89,true,null),
('cheese-block','Cheddar Cheese Block','Cheese','Mild, meltable cheddar — great for sandwiches and cooking.','/images/products/cheese.jpg','{"200 g":150}'::jsonb,'200 g',4.4,57,false,null),
('sweet-gulabjamun','Gulab Jamun (Fresh)','Sweets','Soft khoya jamuns dipped in light sugar syrup, made fresh daily.','/images/products/gulabjamun.jpg','{"250 g (6 pcs)":90,"500 g (12 pcs)":170}'::jsonb,'250 g (6 pcs)',4.7,143,true,'Fresh Today'),
('combo-weekend','Weekend Dairy Combo','Dairy Combos','Milk, curd, paneer and butter bundled for the weekend, at a lower price.','/images/products/combo.jpg','{"Combo":349}'::jsonb,'Combo',4.8,76,true,'15% OFF')
on conflict (id) do update set name=excluded.name,category=excluded.category,description=excluded.description,image=excluded.image,unit_prices=excluded.unit_prices,default_unit=excluded.default_unit,rating=excluded.rating,review_count=excluded.review_count,in_stock=excluded.in_stock,badge=excluded.badge;

-- After your first signup, promote that user's profile to admin:
-- update public.profiles set role = 'admin' where id = 'YOUR_AUTH_USER_UUID';
