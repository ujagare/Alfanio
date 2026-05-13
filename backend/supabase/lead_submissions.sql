create table if not exists public.lead_submissions (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('contact', 'brochure')),
  name text not null,
  email text not null,
  phone text,
  message text,
  source text,
  user_agent text,
  ip_address text,
  email_sent boolean not null default false,
  email_provider text,
  email_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists lead_submissions_created_at_idx
  on public.lead_submissions (created_at desc);

create index if not exists lead_submissions_type_idx
  on public.lead_submissions (type);

alter table public.lead_submissions enable row level security;

drop policy if exists "Service role can manage lead submissions" on public.lead_submissions;

create policy "Service role can manage lead submissions"
  on public.lead_submissions
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
