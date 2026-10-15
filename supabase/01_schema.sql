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

create index habits_user_id_idx on habits(user_id);
create index logs_user_id_idx on logs(user_id);

alter table profiles enable row level security;
alter table habits enable row level security;
alter table logs enable row level security;