-- Add a column to store each user's profile picture URL
alter table public.profiles add column if not exists avatar_url text;

-- Let users update their own row (name, phone, avatar) — but not role/manager_id
create policy "self update own profile" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Safety net: even via this new policy, block anyone but an admin from
-- changing their own role or manager (prevents self-promoting to admin/CEO).
create or replace function public.prevent_role_escalation() returns trigger as $$
begin
  if not public.is_admin() then
    if new.role is distinct from old.role or new.manager_id is distinct from old.manager_id then
      raise exception 'Only admins can change role or manager';
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_prevent_role_escalation on public.profiles;
create trigger trg_prevent_role_escalation
  before update on public.profiles
  for each row execute function public.prevent_role_escalation();
