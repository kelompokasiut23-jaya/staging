-- Line menjadi data yang dikelola super admin.
-- Pengguna (admin/QC) ditempatkan di satu line, dan barang ditugaskan ke line.
-- Semua QC di line tersebut bisa melihat dan mengisi hasil barangnya.

create table public.lines (
  name text primary key check (length(trim(name)) > 0),
  created_at timestamptz not null default now()
);

-- Line yang sudah dipakai sebelumnya ikut dibuat.
insert into public.lines (name)
select distinct line from (
  select line from public.profiles
  union
  select line from public.tasks
) l
where coalesce(trim(line), '') <> ''
on conflict do nothing;

-- Pengguna: line boleh kosong (belum ditempatkan / super admin).
alter table public.profiles alter column line drop default;
alter table public.profiles alter column line drop not null;
update public.profiles set line = null where coalesce(trim(line), '') = '';
alter table public.profiles
  add constraint profiles_line_fkey foreign key (line)
  references public.lines (name) on update cascade on delete restrict;

-- Barang: ditugaskan ke line, bukan lagi ke satu QC.
drop policy "tugas: sesuai role" on public.tasks;
alter table public.tasks drop column assigned_to;
alter table public.tasks
  add constraint tasks_line_fkey foreign key (line)
  references public.lines (name) on update cascade on delete restrict;

-- ---------------------------------------------------------------------------
-- Aturan akses
-- ---------------------------------------------------------------------------

alter table public.lines enable row level security;
revoke all on public.lines from anon;

create policy "line: semua pengguna yang login bisa melihat"
on public.lines for select to authenticated using (true);

create policy "line: super admin menambah"
on public.lines for insert to authenticated
with check (public.my_role() = 'super_admin');

create policy "line: super admin mengganti nama"
on public.lines for update to authenticated
using (public.my_role() = 'super_admin')
with check (public.my_role() = 'super_admin');

create policy "line: super admin menghapus"
on public.lines for delete to authenticated
using (public.my_role() = 'super_admin');

create policy "tugas: sesuai role"
on public.tasks for select to authenticated
using (
  public.my_role() = 'super_admin'
  or (public.my_role() in ('admin', 'qc') and line = public.my_line())
);

-- Super admin menempatkan pengguna ke line. Hanya kolom line yang boleh diubah.
grant update (line) on public.profiles to authenticated;

create policy "profil: super admin mengatur line"
on public.profiles for update to authenticated
using (public.my_role() = 'super_admin' and role <> 'super_admin')
with check (public.my_role() = 'super_admin' and role <> 'super_admin');

-- ---------------------------------------------------------------------------
-- Validasi saat super admin menambah barang
-- ---------------------------------------------------------------------------

create or replace function public.tasks_before_insert() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  admin_name text;
  s jsonb;
begin
  if not exists (select 1 from public.lines where name = new.line) then
    raise exception 'Line tidak ditemukan';
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

-- ---------------------------------------------------------------------------
-- Aksi QC: semua QC di line yang sama boleh mengisi hasil
-- ---------------------------------------------------------------------------

create or replace function public.save_counts(p_task text, p_counts jsonb, p_note text default '')
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
  if not found or t.line is distinct from me.line then raise exception 'Tugas tidak ditemukan'; end if;
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

create or replace function public.finish_task(p_task text, p_note text default '')
returns void
language plpgsql security definer set search_path = public as $$
declare
  t public.tasks;
  me public.profiles;
begin
  select * into me from public.profiles where id = auth.uid() and active and role = 'qc';
  if not found then raise exception 'Hanya QC yang bisa menandai selesai'; end if;

  select * into t from public.tasks where id = p_task for update;
  if not found or t.line is distinct from me.line then raise exception 'Tugas tidak ditemukan'; end if;
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

-- Perubahan line dan penempatan pengguna langsung terlihat di layar lain.
alter publication supabase_realtime add table public.lines, public.profiles;
