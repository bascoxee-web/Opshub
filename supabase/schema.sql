-- ============================================================================
-- CreatorDesk Pro — Supabase Postgres Schema, RLS Policies & Realtime Setup
-- Paste this entire script into your Supabase Dashboard -> SQL Editor and Run.
-- ============================================================================

-- 1. Tables
create table if not exists public.partner_workspaces (
  id text primary key check (id ~ '^[a-zA-Z0-9_-]{2,64}$'),
  name text not null check (char_length(name) between 2 and 100),
  owner_uid uuid not null references auth.users(id) on delete restrict,
  owner_email text not null check (char_length(owner_email) between 3 and 120),
  authorized_emails text[] not null default '{}' check (cardinality(authorized_emails) between 1 and 10),
  team_roster text[] not null default '{}' check (cardinality(team_roster) <= 10),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.partner_accounts (
  id text primary key check (id ~ '^[a-zA-Z0-9_-]{2,64}$'),
  workspace_id text not null references public.partner_workspaces(id) on delete cascade,
  owner_uid uuid not null references auth.users(id) on delete restrict,
  platform text not null check (char_length(platform) between 2 and 80),
  category text not null check (category in ('social-selling', 'affiliate', 'creative-tool', 'storefront-payout')),
  responsibility text not null check (responsibility in ('owner-verification', 'team-managed')),
  assigned_operator text not null check (assigned_operator in ('Account Owner', 'Ops Manager', 'Content Editor', 'Shared')),
  status text not null check (status in ('needs_owner', 'in_verification', 'connected', 'attention_needed')),
  account_handle text not null default '' check (char_length(account_handle) <= 120),
  login_email_hint text not null default '' check (char_length(login_email_hint) <= 120),
  portal_url text not null default '' check (char_length(portal_url) <= 300 and (portal_url = '' or portal_url like 'https://%')),
  delegated_access_status text not null check (delegated_access_status in ('not_started', 'invite_sent', 'team_access_granted', 'not_applicable')),
  checklist_steps text[] not null default '{}' check (cardinality(checklist_steps) <= 10),
  completed_step_ids text[] not null default '{}' check (cardinality(completed_step_ids) <= 10),
  notes text not null default '' check (char_length(notes) <= 1000),
  last_updated_by text not null check (char_length(last_updated_by) between 1 and 60),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.verification_requests (
  id text primary key check (id ~ '^[a-zA-Z0-9_-]{2,64}$'),
  workspace_id text not null references public.partner_workspaces(id) on delete cascade,
  account_id text not null references public.partner_accounts(id) on delete cascade,
  owner_uid uuid not null references auth.users(id) on delete restrict,
  platform_name text not null check (char_length(platform_name) between 2 and 80),
  title text not null check (char_length(title) between 3 and 140),
  instructions text not null default '' check (char_length(instructions) <= 1000),
  portal_url text not null default '' check (char_length(portal_url) <= 300 and (portal_url = '' or portal_url like 'https://%')),
  requested_by text not null check (requested_by in ('Account Owner', 'Ops Manager', 'Content Editor')),
  assigned_to text not null check (assigned_to in ('Account Owner', 'Ops Manager', 'Content Editor')),
  priority text not null check (priority in ('standard', 'urgent')),
  status text not null check (status in ('pending_owner', 'in_progress', 'completed')),
  resolution_note text not null default '' check (char_length(resolution_note) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.partner_activity_logs (
  id text primary key check (id ~ '^[a-zA-Z0-9_-]{2,64}$'),
  workspace_id text not null references public.partner_workspaces(id) on delete cascade,
  owner_uid uuid not null references auth.users(id) on delete restrict,
  actor_name text not null check (char_length(actor_name) between 1 and 60),
  action text not null check (char_length(action) between 2 and 160),
  target_platform text not null default '' check (char_length(target_platform) <= 80),
  created_at timestamptz not null default now()
);

-- Indexes for fast workspace lookups
create index if not exists idx_partner_accounts_workspace on public.partner_accounts (workspace_id);
create index if not exists idx_verification_requests_workspace on public.verification_requests (workspace_id, created_at desc);
create index if not exists idx_partner_activity_logs_workspace on public.partner_activity_logs (workspace_id, created_at desc);

-- 2. Security Helper Functions (Row Level Security)
create or replace function public.current_user_email()
returns text
language sql
stable
as $$
  select lower(coalesce(auth.jwt() ->> 'email', ''));
$$;

create or replace function public.is_workspace_member(ws_id text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.partner_workspaces w
    where w.id = ws_id
      and auth.uid() is not null
      and (
        w.owner_uid = auth.uid()
        or public.current_user_email() = any(w.authorized_emails)
      )
  );
$$;

create or replace function public.is_workspace_admin(ws_id text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.partner_workspaces w
    where w.id = ws_id
      and w.owner_uid = auth.uid()
  );
$$;

-- 3. Enable Row Level Security on all tables
alter table public.partner_workspaces enable row level security;
alter table public.partner_accounts enable row level security;
alter table public.verification_requests enable row level security;
alter table public.partner_activity_logs enable row level security;

-- 4. RLS Policies: partner_workspaces
drop policy if exists "Workspace members can read workspace" on public.partner_workspaces;
create policy "Workspace members can read workspace"
  on public.partner_workspaces for select
  using (
    auth.uid() is not null
    and (
      owner_uid = auth.uid()
      or public.current_user_email() = any(authorized_emails)
    )
  );

-- First signed-in user can claim/initialize a new workspace ID if it does not yet exist
drop policy if exists "Authenticated user can initialize unclaimed workspace" on public.partner_workspaces;
create policy "Authenticated user can initialize unclaimed workspace"
  on public.partner_workspaces for insert
  with check (
    auth.uid() is not null
    and owner_uid = auth.uid()
    and lower(owner_email) = public.current_user_email()
    and public.current_user_email() = any(authorized_emails)
  );

drop policy if exists "Workspace admin can update workspace" on public.partner_workspaces;
create policy "Workspace admin can update workspace"
  on public.partner_workspaces for update
  using (owner_uid = auth.uid())
  with check (
    owner_uid = auth.uid()
    and lower(owner_email) = public.current_user_email()
    and public.current_user_email() = any(authorized_emails)
  );

drop policy if exists "Workspace admin can delete workspace" on public.partner_workspaces;
create policy "Workspace admin can delete workspace"
  on public.partner_workspaces for delete
  using (owner_uid = auth.uid());

-- 5. RLS Policies: partner_accounts
drop policy if exists "Workspace members can read accounts" on public.partner_accounts;
create policy "Workspace members can read accounts"
  on public.partner_accounts for select
  using (public.is_workspace_member(workspace_id));

drop policy if exists "Workspace members can create accounts" on public.partner_accounts;
create policy "Workspace members can create accounts"
  on public.partner_accounts for insert
  with check (
    public.is_workspace_member(workspace_id)
    and owner_uid = auth.uid()
  );

drop policy if exists "Workspace members can update accounts" on public.partner_accounts;
create policy "Workspace members can update accounts"
  on public.partner_accounts for update
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

drop policy if exists "Admin or creator can delete accounts" on public.partner_accounts;
create policy "Admin or creator can delete accounts"
  on public.partner_accounts for delete
  using (
    public.is_workspace_member(workspace_id)
    and (public.is_workspace_admin(workspace_id) or owner_uid = auth.uid())
  );

-- 6. RLS Policies: verification_requests
drop policy if exists "Workspace members can read verification requests" on public.verification_requests;
create policy "Workspace members can read verification requests"
  on public.verification_requests for select
  using (public.is_workspace_member(workspace_id));

drop policy if exists "Workspace members can create verification requests" on public.verification_requests;
create policy "Workspace members can create verification requests"
  on public.verification_requests for insert
  with check (
    public.is_workspace_member(workspace_id)
    and owner_uid = auth.uid()
  );

drop policy if exists "Workspace members can update open verification requests" on public.verification_requests;
create policy "Workspace members can update open verification requests"
  on public.verification_requests for update
  using (
    public.is_workspace_member(workspace_id)
    and (public.is_workspace_admin(workspace_id) or status <> 'completed')
  )
  with check (public.is_workspace_member(workspace_id));

drop policy if exists "Workspace admin can delete verification requests" on public.verification_requests;
create policy "Workspace admin can delete verification requests"
  on public.verification_requests for delete
  using (public.is_workspace_admin(workspace_id));

-- 7. RLS Policies: partner_activity_logs (Append-only)
drop policy if exists "Workspace members can read activity logs" on public.partner_activity_logs;
create policy "Workspace members can read activity logs"
  on public.partner_activity_logs for select
  using (public.is_workspace_member(workspace_id));

drop policy if exists "Workspace members can append activity logs" on public.partner_activity_logs;
create policy "Workspace members can append activity logs"
  on public.partner_activity_logs for insert
  with check (
    public.is_workspace_member(workspace_id)
    and owner_uid = auth.uid()
  );

drop policy if exists "Workspace admin can delete activity logs" on public.partner_activity_logs;
create policy "Workspace admin can delete activity logs"
  on public.partner_activity_logs for delete
  using (public.is_workspace_admin(workspace_id));

-- 8. Enable Supabase Realtime for live multi-device sync
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'partner_workspaces'
  ) then
    alter publication supabase_realtime add table public.partner_workspaces;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'partner_accounts'
  ) then
    alter publication supabase_realtime add table public.partner_accounts;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'verification_requests'
  ) then
    alter publication supabase_realtime add table public.verification_requests;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'partner_activity_logs'
  ) then
    alter publication supabase_realtime add table public.partner_activity_logs;
  end if;
end $$;
