-- Run this once in the Supabase SQL Editor for the project used by the app.
-- Each app installation gets its own random device ID. Row-level security
-- allows requests to read or change only rows carrying that installation ID.

create table if not exists public.tasks (
  id text primary key,
  device_id text not null,
  title text not null check (length(trim(title)) > 0),
  completed boolean not null default false,
  created_at bigint not null
);

alter table public.tasks enable row level security;

grant select, insert, update, delete on public.tasks to anon, authenticated;

drop policy if exists "Tasks belong to requesting installation" on public.tasks;

create policy "Tasks belong to requesting installation"
  on public.tasks
  for all
  to anon, authenticated
  using (
    device_id = (
      coalesce(current_setting('request.headers', true)::jsonb, '{}'::jsonb)
      ->> 'x-device-id'
    )
  )
  with check (
    device_id = (
      coalesce(current_setting('request.headers', true)::jsonb, '{}'::jsonb)
      ->> 'x-device-id'
    )
  );
