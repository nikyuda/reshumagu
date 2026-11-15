-- Имя (никнейм) из регистрации попадает в профиль.
-- Выполнить один раз в Supabase → SQL Editor.
create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
    insert into profiles (id, email, display_name)
    values (
        new.id,
        new.email,
        coalesce(nullif(trim(new.raw_user_meta_data->>'display_name'), ''), split_part(new.email, '@', 1))
    );
    return new;
end $$;
