create table profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    full_name text,
    avatar_url text,
    role text not null default 'user' check (role in ('user', 'admin')),
    created_at timestamptz not null default now()
);

create table habits (
    id bigint generated always as identity primary key,
    user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
    name text not null check (char_length(name) between 1 and 100),
    description text, 
    frequency text not null default 'daily' check (frequency in ('daily', 'weekly')),
    created_at timestamptz not null default now()
);

create table logs (
    id bigint generated always as identity primary key,
    habit_id bigint not null references habits(id) on delete cascade,
    user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
    done_date date not null,
    created_at timestamptz not null default now(),
    unique (habit_id, done_date)
);

-- default auth.uid() fills in user_id automatically from the logged-in user's token, so your React code never has to send it.
-- on delete cascade on user_id: if a user deletes their account, their habits and logs go too.
-- char_length check stops empty or absurdly long habit names at the database level.
-- No default on done_date: the database runs on UTC, so current_date would give yesterday's date for anyone in India before 5:30 AM. Your app will send the user's local date instead.
-- Indexes on user_id: every RLS check filters by user_id, so an index keeps those lookups fast as data grows. (The unique constraint already creates an index for habit_id + done_date.)

create index habits_user_id_idx on habits(user_id);
create index logs_user_id_idx on logs(user_id);

-- What create index habits_user_id_idx on habits(user_id); does

--Think of the index at the back of a textbook. To find every page about "photosynthesis" without one, you'd read every page. With it, you jump straight to pages 42, 87 and 130.

-- A database index works the same way. Without one, where user_id = '...' makes Postgres check every row in the table. With an index on user_id, it jumps straight to that user's rows.

--Breaking the line down:
-- 1) create index builds the lookup structure.
-- 2) habits_user_id_idx is the name of the index. The table_column_idx pattern is a common convention.
-- 3) on habits(user_id) says which table and which column to index.

-- Why user_id specifically: your RLS policies will add user_id = auth.uid() to every query on these tables, so it's the column you filter on most.

-- The tradeoff: indexes use extra storage and make inserts and updates slightly slower, because the index has to be updated too. So you index columns you filter or join on often, not everything. Primary keys and unique constraints get indexes automatically, which is why the profiles one was redundant, and why your unique (habit_id, done_date) already speeds up lookups by habit_id.

-- With a few rows you won't notice any difference. With a million, it's the difference between instant and seconds.

alter table profiles enable row level security;
alter table habits enable row level security;
alter table logs enable row level security;

-- explain alter table profiles enable row level security; would show the query plan for enabling RLS on the profiles table.
-- row level security (RLS) ensures that users can only access rows they are authorized to see, based on the policies defined for each table.


-- Auto-create profiles with a trigger
-- This is standard Supabase setup with a couple of security details that are easy to get wrong, so here's the SQL to run, followed by what each part does:

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