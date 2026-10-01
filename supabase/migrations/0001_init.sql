-- Struktur data Monitoring QC.
-- Role: super_admin (kelola semua), admin (lihat line-nya), qc (kerjakan tugasnya).

create type public.app_role as enum ('super_admin', 'admin', 'qc');

-- Profil pengguna. Akun login ada di auth.users, dibuat lewat fungsi admin-users.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null check (length(trim(name)) > 0),
  username text not null unique check (username ~ '^[a-z0-9._]{3,}$'),
  role public.app_role not null,
  line text not null default '',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create sequence public.task_code_seq;

create table public.tasks (
  id text primary key default ('QC-' || lpad(nextval('public.task_code_seq')::text, 3, '0')),
  brand text not null check (length(trim(brand)) > 0),
  item text not null check (length(trim(item)) > 0),
  color text not null check (length(trim(color)) > 0),
  line text not null,
  assigned_to uuid not null references public.profiles (id),
  deadline timestamptz not null,
  -- [{ "size": "M", "target": 300, "passed": 0, "defect": 0 }, ...]
  sizes jsonb not null,
  status text not null default 'belum' check (status in ('belum', 'diperiksa', 'selesai')),
  note text not null default '',
  created_by uuid references public.profiles (id),
  created_by_name text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  finished_at timestamptz
);

create index tasks_assigned_to_idx on public.tasks (assigned_to);
create index tasks_line_idx on public.tasks (line);

create table public.task_logs (
  id bigint generated always as identity primary key,
  task_id text not null references public.tasks (id) on delete cascade,
  at timestamptz not null default now(),
  by_id uuid references public.profiles (id),
  by_name text not null,
  action text not null check (action in ('simpan', 'selesai')),
  note text not null default ''
);

create index task_logs_task_id_idx on public.task_logs (task_id);

-- ---------------------------------------------------------------------------
-- Fungsi bantu untuk aturan akses
-- ---------------------------------------------------------------------------

create function public.my_role() returns public.app_role
language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid() and active
$$;

create function public.my_line() returns text
language sql stable security definer set search_path = public as $$
  select line from public.profiles where id = auth.uid() and active
$$;

-- ---------------------------------------------------------------------------
-- Aturan akses (Row Level Security)
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.tasks enable row level security;
alter table public.task_logs enable row level security;

revoke all on public.profiles, public.tasks, public.task_logs from anon;
revoke insert, update, delete on public.profiles from authenticated;
revoke update on public.tasks from authenticated;
revoke insert, update, delete on public.task_logs from authenticated;

create policy "profil: diri sendiri, super admin semua, admin satu line"
on public.profiles for select to authenticated
using (
  id = auth.uid()
  or public.my_role() = 'super_admin'
  or (public.my_role() = 'admin' and line = public.my_line())
);

create policy "tugas: sesuai role"
on public.tasks for select to authenticated
using (
  public.my_role() = 'super_admin'
  or (public.my_role() = 'admin' and line = public.my_line())
  or (public.my_role() = 'qc' and assigned_to = auth.uid())
);

create policy "tugas: hanya super admin yang menambah"
on public.tasks for insert to authenticated
with check (public.my_role() = 'super_admin');

create policy "tugas: super admin menghapus yang belum dimulai"
on public.tasks for delete to authenticated
using (public.my_role() = 'super_admin' and status = 'belum');

create policy "riwayat: mengikuti akses tugas"
on public.task_logs for select to authenticated
using (exists (select 1 from public.tasks t where t.id = task_id));

-- ---------------------------------------------------------------------------
-- Validasi saat super admin menambah tugas
-- ---------------------------------------------------------------------------

create function public.tasks_before_insert() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  qc public.profiles;
  admin_name text;
  s jsonb;
begin
  select * into qc from public.profiles
  where id = new.assigned_to and role = 'qc' and active;
  if not found then
    raise exception 'QC tidak ditemukan atau sudah nonaktif';
  end if;

  if jsonb_typeof(new.sizes) <> 'array' or jsonb_array_length(new.sizes) = 0 then
    raise exception 'Minimal satu ukuran';
  end if;

  for s in select * from jsonb_array_elements(new.sizes) loop
    if coalesce(trim(s->>'size'), '') = '' or (s->>'target')::int <= 0 then
      raise exception 'Ukuran dan jumlah tidak valid';
    end if;
  end loop;

  select name into admin_name from public.profiles where id = auth.uid();

  new.line := qc.line;
  new.sizes := (
    select jsonb_agg(jsonb_build_object(
      'size', upper(trim(e->>'size')),
      'target', (e->>'target')::int,
      'passed', 0,
      'defect', 0))
    from jsonb_array_elements(new.sizes) e
  );
  new.status := 'belum';
  new.created_by := auth.uid();
  new.created_by_name := coalesce(admin_name, '');
  new.created_at := now();
  new.updated_at := now();
  new.finished_at := null;
  return new;
end
$$;

create trigger tasks_before_insert
before insert on public.tasks
for each row execute function public.tasks_before_insert();

-- ---------------------------------------------------------------------------
-- Aksi QC: simpan hasil dan tandai selesai
-- ---------------------------------------------------------------------------

create function public.save_counts(p_task text, p_counts jsonb, p_note text default '')
returns void
language plpgsql security definer set search_path = public as $$
declare
  t public.tasks;
  me public.profiles;
  next_sizes jsonb;
  bad int;
begin
  select * into me from public.profiles where id = auth.uid() and active and role = 'qc';
  if not found then raise exception 'Hanya QC yang bisa menyimpan hasil'; end if;

  select * into t from public.tasks where id = p_task for update;
  if not found or t.assigned_to <> me.id then raise exception 'Tugas tidak ditemukan'; end if;
  if t.status = 'selesai' then raise exception 'Tugas sudah selesai'; end if;

  select jsonb_agg(
    jsonb_build_object(
      'size', s->>'size',
      'target', (s->>'target')::int,
      'passed', coalesce((c->>'passed')::int, (s->>'passed')::int),
      'defect', coalesce((c->>'defect')::int, (s->>'defect')::int)
    ) order by ord)
  into next_sizes
  from jsonb_array_elements(t.sizes) with ordinality as x(s, ord)
  left join lateral (
    select c from jsonb_array_elements(p_counts) c where c->>'size' = s->>'size' limit 1
  ) m on true;

  select count(*) into bad from jsonb_array_elements(next_sizes) e
  where (e->>'passed')::int < 0 or (e->>'defect')::int < 0
     or (e->>'passed')::int + (e->>'defect')::int > (e->>'target')::int;
  if bad > 0 then raise exception 'Jumlah lolos + defect melebihi target'; end if;

  update public.tasks set
    sizes = next_sizes,
    status = case when exists (
      select 1 from jsonb_array_elements(next_sizes) e
      where (e->>'passed')::int + (e->>'defect')::int > 0
    ) then 'diperiksa' else 'belum' end,
    updated_at = now()
  where id = t.id;

  insert into public.task_logs (task_id, by_id, by_name, action, note)
  values (t.id, me.id, me.name, 'simpan', coalesce(p_note, ''));
end
$$;

create function public.finish_task(p_task text, p_note text default '')
returns void
language plpgsql security definer set search_path = public as $$
declare
  t public.tasks;
  me public.profiles;
begin
  select * into me from public.profiles where id = auth.uid() and active and role = 'qc';
  if not found then raise exception 'Hanya QC yang bisa menandai selesai'; end if;

  select * into t from public.tasks where id = p_task for update;
  if not found or t.assigned_to <> me.id then raise exception 'Tugas tidak ditemukan'; end if;
  if t.status = 'selesai' then return; end if;

  if exists (
    select 1 from jsonb_array_elements(t.sizes) e
    where (e->>'passed')::int + (e->>'defect')::int <> (e->>'target')::int
  ) then
    raise exception 'Semua ukuran harus terisi penuh';
  end if;

  update public.tasks set status = 'selesai', finished_at = now(), updated_at = now()
  where id = t.id;

  insert into public.task_logs (task_id, by_id, by_name, action, note)
  values (t.id, me.id, me.name, 'selesai', coalesce(p_note, ''));
end
$$;

revoke all on function public.save_counts(text, jsonb, text) from public, anon;
revoke all on function public.finish_task(text, text) from public, anon;
grant execute on function public.save_counts(text, jsonb, text) to authenticated;
grant execute on function public.finish_task(text, text) to authenticated;

-- Perubahan langsung dikirim ke layar yang sedang terbuka.
alter publication supabase_realtime add table public.tasks, public.task_logs;
