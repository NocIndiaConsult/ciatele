create extension if not exists pgcrypto;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  brand text not null,
  description text not null,
  price text not null,
  moq text not null,
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
before update on public.products
for each row
execute function public.set_updated_at();

alter table public.products enable row level security;

drop policy if exists "public can read active products" on public.products;
create policy "public can read active products"
on public.products
for select
to public
using (is_active = true);

drop policy if exists "authenticated users can insert products" on public.products;
create policy "authenticated users can insert products"
on public.products
for insert
to authenticated
with check (true);

drop policy if exists "authenticated users can update products" on public.products;
create policy "authenticated users can update products"
on public.products
for update
to authenticated
using (true)
with check (true);

drop policy if exists "authenticated users can delete products" on public.products;
create policy "authenticated users can delete products"
on public.products
for delete
to authenticated
using (true);

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "public can view product images" on storage.objects;
create policy "public can view product images"
on storage.objects
for select
to public
using (bucket_id = 'product-images');

drop policy if exists "authenticated users can upload product images" on storage.objects;
create policy "authenticated users can upload product images"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'product-images');

drop policy if exists "authenticated users can update product images" on storage.objects;
create policy "authenticated users can update product images"
on storage.objects
for update
to authenticated
using (bucket_id = 'product-images')
with check (bucket_id = 'product-images');

drop policy if exists "authenticated users can delete product images" on storage.objects;
create policy "authenticated users can delete product images"
on storage.objects
for delete
to authenticated
using (bucket_id = 'product-images');
