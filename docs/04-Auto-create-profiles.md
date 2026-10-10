## 1) Auto-create profiles with a trigger

This is standard Supabase setup with a couple of security details that are easy to get wrong, so here's the SQL to run, followed by what each part does:


create function public.handle_new_user() 
returns trigger 
language plpgsql 
security definer 
set search_path = '' 
as $$ 
begin 
    insert into public.profiles (id, full_name) 
    values (new.id, new.raw_user_meta_data ->> 'full_name'); return new; 
end; 
$$; 

create trigger on_auth_user_created 
    after insert on auth.users 
    for each row execute procedure public.handle_new_user();


• create function ... returns trigger defines a small program stored inside the database, meant to run automatically. 
• security definer runs it with the permissions of whoever created it (you, the admin), not the new user. That's needed because the new user isn't allowed to insert into profiles, since RLS has no policies yet. 
• set search_path = '' is a security measure. It forces fully qualified names like public.profiles, so nobody can trick the function into writing to a different table with the same name. 
• new is the row that was just inserted into auth.users, i.e. the new user. 
• raw_user_meta_data ->> 'full_name' pulls full_name out of the metadata you sent in signUp. ->> reads a JSON value as text. 
• create trigger ... after insert on auth.users runs the function once for every new user.


An important detail: the function copies only full_name, and role comes from the column's default. Users can put anything in signup metadata from the browser, including role: 'admin'. Never copy roles from metadata.