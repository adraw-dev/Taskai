-- Listas
create table if not exists public.lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

-- Tareas y subtareas (parent_task_id nulo = tarea raíz)
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  list_id uuid references public.lists(id) on delete set null,
  parent_task_id uuid references public.tasks(id) on delete cascade,
  title text not null,
  notes text,
  is_completed boolean not null default false,
  is_important boolean not null default false,
  due_date date,
  priority text check (priority in ('low', 'medium', 'high')),
  position integer not null default 0,
  deleted_at timestamptz,
  created_at timestamptz not null default now()
);

-- Adjuntos (archivos en Supabase Storage, bucket "attachments")
create table if not exists public.attachments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  file_url text not null,
  type text,
  created_at timestamptz not null default now()
);

create index if not exists lists_user_id_idx on public.lists (user_id);
create index if not exists tasks_user_id_idx on public.tasks (user_id);
create index if not exists tasks_list_id_idx on public.tasks (list_id);
create index if not exists tasks_parent_task_id_idx on public.tasks (parent_task_id);
create index if not exists attachments_task_id_idx on public.attachments (task_id);

-- Row Level Security: cada usuario solo accede a sus propios datos.
alter table public.lists enable row level security;
alter table public.tasks enable row level security;
alter table public.attachments enable row level security;

create policy "lists_select_own" on public.lists
  for select using (user_id = auth.uid());
create policy "lists_insert_own" on public.lists
  for insert with check (user_id = auth.uid());
create policy "lists_update_own" on public.lists
  for update using (user_id = auth.uid());
create policy "lists_delete_own" on public.lists
  for delete using (user_id = auth.uid());

create policy "tasks_select_own" on public.tasks
  for select using (user_id = auth.uid());
create policy "tasks_insert_own" on public.tasks
  for insert with check (user_id = auth.uid());
create policy "tasks_update_own" on public.tasks
  for update using (user_id = auth.uid());
create policy "tasks_delete_own" on public.tasks
  for delete using (user_id = auth.uid());

create policy "attachments_select_own" on public.attachments
  for select using (
    exists (select 1 from public.tasks t where t.id = task_id and t.user_id = auth.uid())
  );
create policy "attachments_insert_own" on public.attachments
  for insert with check (
    exists (select 1 from public.tasks t where t.id = task_id and t.user_id = auth.uid())
  );
create policy "attachments_update_own" on public.attachments
  for update using (
    exists (select 1 from public.tasks t where t.id = task_id and t.user_id = auth.uid())
  );
create policy "attachments_delete_own" on public.attachments
  for delete using (
    exists (select 1 from public.tasks t where t.id = task_id and t.user_id = auth.uid())
  );

-- Storage: bucket privado de adjuntos, particionado por user_id/task_id/archivo.
insert into storage.buckets (id, name, public)
values ('attachments', 'attachments', false)
on conflict (id) do nothing;

create policy "attachments_storage_select_own" on storage.objects
  for select using (
    bucket_id = 'attachments' and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "attachments_storage_insert_own" on storage.objects
  for insert with check (
    bucket_id = 'attachments' and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "attachments_storage_delete_own" on storage.objects
  for delete using (
    bucket_id = 'attachments' and (storage.foldername(name))[1] = auth.uid()::text
  );
