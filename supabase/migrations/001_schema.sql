-- ============================================================
-- Sanctuary Consulting — Supabase Schema
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── Admin users ───────────────────────────────────────────────
create table public.admin_users (
  id              uuid primary key default uuid_generate_v4(),
  auth_user_id    uuid references auth.users(id) on delete cascade,
  name            text not null,
  email           text not null unique,
  role            text not null check (role in ('super_admin','admin','manager','consultant')),
  title           text,
  avatar          text,
  color           text default 'sage',
  consultant_id   uuid,
  active          boolean default true,
  last_login      timestamptz,
  created_at      timestamptz default now()
);

-- ── Consultants ───────────────────────────────────────────────
create table public.consultants (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  title       text,
  email       text not null,
  mobile      text not null,
  phone       text,
  bio         text,
  specialties text[] default '{}',
  avatar      text,
  color       text default 'sage',
  photo_url   text,
  active      boolean default true,
  created_at  timestamptz default now()
);

-- Update admin_users FK
alter table public.admin_users
  add constraint admin_users_consultant_id_fkey
  foreign key (consultant_id) references public.consultants(id) on delete set null;

-- ── Clients ───────────────────────────────────────────────────
create table public.clients (
  id              uuid primary key default uuid_generate_v4(),
  church          text not null,
  contact         text not null,
  email           text not null unique,
  location        text,
  lat             float,
  lng             float,
  active          boolean default true,
  consultant_id   uuid references public.consultants(id) on delete set null,
  views           integer default 0,
  downloads       integer default 0,
  last_access     timestamptz,
  notes           text,
  goals           jsonb default '[]',
  next_call       date,
  next_call_type  text,
  next_call_note  text,
  created_at      timestamptz default now()
);

-- ── Resources ─────────────────────────────────────────────────
create table public.resources (
  id               uuid primary key default uuid_generate_v4(),
  name             text not null,
  type             text not null check (type in ('guide','presentation','video','checklist','template')),
  icon             text default '📄',
  description      text,
  file_url         text,
  default_download boolean default true,
  views            integer default 0,
  downloads        integer default 0,
  created_at       timestamptz default now()
);

-- ── Client ↔ Resource access ──────────────────────────────────
create table public.client_resources (
  id           uuid primary key default uuid_generate_v4(),
  client_id    uuid not null references public.clients(id) on delete cascade,
  resource_id  uuid not null references public.resources(id) on delete cascade,
  can_view     boolean default true,
  can_download boolean default true,
  can_share    boolean default false,
  assigned_by  text,
  created_at   timestamptz default now(),
  unique(client_id, resource_id)
);

-- ── Invoices ──────────────────────────────────────────────────
create table public.invoices (
  id           uuid primary key default uuid_generate_v4(),
  client_id    uuid not null references public.clients(id) on delete cascade,
  number       text not null unique,
  issue_date   date not null,
  due_date     date not null,
  status       text not null default 'draft' check (status in ('draft','sent','paid')),
  notes        text,
  show_client  boolean default false,
  line_items   jsonb not null default '[]',
  created_by   uuid references public.admin_users(id) on delete set null,
  created_at   timestamptz default now()
);

-- ── Activity log ──────────────────────────────────────────────
create table public.activity_log (
  id          uuid primary key default uuid_generate_v4(),
  client_id   uuid references public.clients(id) on delete cascade,
  user_email  text,
  action      text not null,
  resource_id uuid references public.resources(id) on delete set null,
  metadata    jsonb default '{}',
  created_at  timestamptz default now()
);

-- ── Training assignments ──────────────────────────────────────
create table public.training_assignments (
  id              uuid primary key default uuid_generate_v4(),
  consultant_id   uuid not null references public.consultants(id) on delete cascade,
  client_id       uuid not null references public.clients(id) on delete cascade,
  type            text not null,
  date            date,
  notes           text,
  completed       boolean default false,
  created_at      timestamptz default now()
);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.admin_users         enable row level security;
alter table public.consultants         enable row level security;
alter table public.clients             enable row level security;
alter table public.resources           enable row level security;
alter table public.client_resources    enable row level security;
alter table public.invoices            enable row level security;
alter table public.activity_log        enable row level security;
alter table public.training_assignments enable row level security;

-- Helper: is the calling user an admin?
create or replace function public.is_admin()
returns boolean language sql security definer as $$
  select exists (
    select 1 from public.admin_users
    where auth_user_id = auth.uid() and active = true
  );
$$;

-- Helper: get role of calling user
create or replace function public.my_role()
returns text language sql security definer as $$
  select role from public.admin_users
  where auth_user_id = auth.uid() and active = true
  limit 1;
$$;

-- Helper: get consultant_id of calling user
create or replace function public.my_consultant_id()
returns uuid language sql security definer as $$
  select consultant_id from public.admin_users
  where auth_user_id = auth.uid() and active = true
  limit 1;
$$;

-- Admin users: admins can see all; users can see their own row
create policy "admin_users_select" on public.admin_users
  for select using (is_admin());

create policy "admin_users_insert" on public.admin_users
  for insert with check (my_role() = 'super_admin');

create policy "admin_users_update" on public.admin_users
  for update using (my_role() = 'super_admin');

create policy "admin_users_delete" on public.admin_users
  for delete using (my_role() = 'super_admin');

-- Consultants: all admins read; super_admin/admin write
create policy "consultants_select" on public.consultants
  for select using (is_admin());

create policy "consultants_insert" on public.consultants
  for insert with check (my_role() in ('super_admin','admin'));

create policy "consultants_update" on public.consultants
  for update using (my_role() in ('super_admin','admin'));

create policy "consultants_delete" on public.consultants
  for delete using (my_role() in ('super_admin','admin'));

-- Clients: admins see all; consultants see only their clients; portal access
create policy "clients_select_admin" on public.clients
  for select using (
    is_admin() and (
      my_role() in ('super_admin','admin','manager')
      or consultant_id = my_consultant_id()
    )
  );

-- Allow client portal access by email match (service role handles this)
create policy "clients_select_portal" on public.clients
  for select using (
    auth.role() = 'anon' and email = auth.jwt() ->> 'email'
  );

create policy "clients_insert" on public.clients
  for insert with check (is_admin());

create policy "clients_update" on public.clients
  for update using (is_admin());

create policy "clients_delete" on public.clients
  for delete using (my_role() in ('super_admin','admin'));

-- Resources: all admins read; super_admin/admin/manager write
create policy "resources_select" on public.resources
  for select using (is_admin() or auth.role() = 'anon');

create policy "resources_write" on public.resources
  for all using (my_role() in ('super_admin','admin','manager'));

-- Client resources: admins read; portal reads own
create policy "client_resources_select_admin" on public.client_resources
  for select using (is_admin());

create policy "client_resources_select_portal" on public.client_resources
  for select using (
    exists (
      select 1 from public.clients
      where id = client_id and email = (auth.jwt() ->> 'email')
    )
  );

create policy "client_resources_write" on public.client_resources
  for all using (is_admin());

-- Invoices: super_admin/manager manage; clients see their own if show_client
create policy "invoices_select_admin" on public.invoices
  for select using (my_role() in ('super_admin','manager','admin'));

create policy "invoices_select_portal" on public.invoices
  for select using (
    show_client = true
    and exists (
      select 1 from public.clients
      where id = client_id and email = (auth.jwt() ->> 'email')
    )
  );

create policy "invoices_write" on public.invoices
  for all using (my_role() in ('super_admin','manager'));

-- Activity log
create policy "activity_select" on public.activity_log
  for select using (is_admin());

create policy "activity_insert" on public.activity_log
  for insert with check (true); -- allow portal + admin writes

-- Training assignments
create policy "training_select" on public.training_assignments
  for select using (is_admin());

create policy "training_write" on public.training_assignments
  for all using (is_admin());

-- ============================================================
-- Storage buckets
-- ============================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('consultant-photos', 'consultant-photos', true, 2097152, array['image/jpeg','image/png','image/webp']),
  ('resources', 'resources', false, 52428800, array['application/pdf','video/mp4','application/vnd.ms-powerpoint','application/vnd.openxmlformats-officedocument.presentationml.presentation']);

-- Storage policies
create policy "consultant_photos_public_read" on storage.objects
  for select using (bucket_id = 'consultant-photos');

create policy "consultant_photos_admin_write" on storage.objects
  for insert with check (
    bucket_id = 'consultant-photos'
    and (select is_admin())
  );

create policy "consultant_photos_admin_delete" on storage.objects
  for delete using (
    bucket_id = 'consultant-photos'
    and (select is_admin())
  );

create policy "resources_admin_read" on storage.objects
  for select using (
    bucket_id = 'resources'
    and (select is_admin())
  );

create policy "resources_portal_read" on storage.objects
  for select using (bucket_id = 'resources');

create policy "resources_admin_write" on storage.objects
  for insert with check (
    bucket_id = 'resources'
    and (select is_admin())
  );

-- ============================================================
-- Seed data — run AFTER setting up your first super_admin user
-- ============================================================

-- First create a user in Supabase Auth (Dashboard → Auth → Users)
-- then run:
-- insert into public.admin_users (auth_user_id, name, email, role, title, avatar, color)
-- values ('<your-auth-user-id>', 'Wes Pederson', 'wespederson@comcast.net', 'super_admin', 'Founder & Lead Consultant', 'WP', 'gold');

-- Seed consultants
insert into public.consultants (name, title, email, mobile, phone, bio, specialties, avatar, color)
values
  ('Alex Rivera', 'Lead Consultant', 'alex@sanctuary.consulting', '615-555-0101', '615-555-0201',
   '15+ years in faith community safety strategy. Former law enforcement chaplain.',
   array['Security Strategy','De-Escalation Training','Policy Development'], 'AR', 'forest'),
  ('Jordan Blake', 'Training Specialist', 'jordan@sanctuary.consulting', '615-555-0102', '615-555-0202',
   'Certified CIT trainer and mental health first aid instructor.',
   array['CIT Training','Mental Health Awareness','Volunteer Development'], 'JB', 'teal'),
  ('Morgan Ellis', 'Security Consultant', 'morgan@sanctuary.consulting', '615-555-0103', '615-555-0203',
   'Background in crisis intervention and community safety planning.',
   array['Crisis Intervention','First Responder Coordination','Cultural Integration'], 'ME', 'sage');

-- Seed resources
insert into public.resources (name, type, icon, description, default_download)
values
  ('Caring Well Security Framework', 'guide', '📋', 'Comprehensive security framework for places of worship', true),
  ('De-Escalation CIT Training Deck', 'presentation', '🎓', 'CALM framework presentation for volunteer teams', true),
  ('Volunteer Team Structure Template', 'template', '👥', 'Role definitions, vetting process, and org chart template', true),
  ('Policy & Protocol Package', 'guide', '📄', 'Written policies covering use of force, communication, and documentation', true),
  ('Mental Health Crisis Response Guide', 'guide', '🧠', 'Protocols for behavioral health situations', true),
  ('Security Assessment Checklist', 'checklist', '✅', 'Walk-through assessment checklist for your facility', true),
  ('First Responder Coordination SOP', 'guide', '🚨', 'Standard operating procedures for law enforcement coordination', false);
