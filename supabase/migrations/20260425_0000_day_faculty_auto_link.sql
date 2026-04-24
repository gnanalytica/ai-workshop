-- Auto-link day_faculty.main_user_id / support_user_id when a matching profile appears.
-- Fires on profile insert + update of full_name.

create or replace function public.day_faculty_link_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.full_name is null or length(trim(new.full_name)) = 0 then
    return new;
  end if;

  update public.day_faculty df
  set main_user_id = new.id
  where df.main_user_id is null
    and df.main_name is not null
    and df.main_name not in ('TBD','<>','')
    and (lower(new.full_name) = lower(df.main_name)
         or split_part(lower(new.full_name),' ',1) = lower(df.main_name));

  update public.day_faculty df
  set support_user_id = new.id
  where df.support_user_id is null
    and df.support_name is not null
    and df.support_name not in ('TBD','<>','')
    and (lower(new.full_name) = lower(df.support_name)
         or split_part(lower(new.full_name),' ',1) = lower(df.support_name));

  return new;
end;
$$;

drop trigger if exists day_faculty_link_on_profile_insert on public.profiles;
create trigger day_faculty_link_on_profile_insert
  after insert on public.profiles
  for each row execute function public.day_faculty_link_profile();

drop trigger if exists day_faculty_link_on_profile_name_update on public.profiles;
create trigger day_faculty_link_on_profile_name_update
  after update of full_name on public.profiles
  for each row
  when (new.full_name is distinct from old.full_name)
  execute function public.day_faculty_link_profile();
