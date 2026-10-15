## Habits RLS policies + database types

## 1) Policies are database-level permission rules. They ensure each logged-in user can access only their own habits.

Suppose:

- Alice’s habit has user_id = Alice’s ID.
- Bob logs in and tries to read, edit, or delete that habit.

Supabase checks: auth.uid() = user_id

auth.uid() is the logged-in user’s ID. Because Bob’s ID doesn’t match Alice’s, the policies prevent access.

Your four policies control:

Operation	What the policy enforces
select	Read only your own habits
insert	Create habits only with your own user_id
update	Edit only your habits, without assigning them to another user
delete	Delete only your own habits

Why not just protect React routes? Route guards protect the UI, but someone can bypass it and call Supabase directly. RLS policies enforce permissions at the database, even for those direct requests.

With RLS enabled, normal client requests are denied unless a policy permits them. to authenticated makes these rules apply only to logged-in users.


create policy "Users read their own habits"
on public.habits
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users insert their own habits"
on public.habits
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users update their own habits"
on public.habits
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users delete their own habits"
on public.habits
for delete
to authenticated
using ((select auth.uid()) = user_id);

## Why update needs both: using decides which existing rows you're allowed to touch. with check validates what the row looks like after the change. Without with check, a user could update their own habit and set user_id to another user's ID, handing it off to them.

## Production tip: write the check as (select auth.uid()) = user_id rather than auth.uid() = user_id. Wrapping it in select makes Postgres run auth.uid() once per query instead of once per row. Supabase recommends this, and it matters once tables grow.

In the Supabase Dashboard:

Open your project.
Go to Database → Policies.
Select the public schema and find the habits table.
You should see your four policies for SELECT, INSERT, UPDATE, and DELETE.
Open a policy to inspect its role (authenticated) and its USING or WITH CHECK expression.

## 2) Test that users can't see each other's data

1.	Sign up a second test account so you have two users.
2.	In Authentication → Users, copy both user IDs.
3.	In the SQL editor, insert two habits for user A and one for user B, setting user_id explicitly. The SQL editor runs as an admin and skips RLS, which is why this works there.
insert into public.habits (user_id, name, description, frequency)
values
  ('6c656695-8627-45a0-84c8-43bb953022d6', 'Morning walk', 'Walk for 20 minutes', 'daily'),
  ('6c656695-8627-45a0-84c8-43bb953022d6', 'Read a book', 'Read for 15 minutes', 'daily'),
  ('19a06a5d-60d7-45e1-a085-ee57d579fc24', 'Go swimming', 'Swim once a week', 'weekly')
returning id, user_id, name;
4.	Temporarily fetch habits in DashboardPage (like your earlier useEffect test). Log in as A and you should see 2 habits; log in as B and you should see 1.

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";

type Habit = {
  id: number;
  name: string;
  user_id: string;
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    supabase
      .from("habits")
      .select("id, name, user_id") //fetches the id, name, and user_id of each habit. Notice there is no filter by filteruser. RLS (Row Level Security) will handle access control based on the logged-in user.
      .then(({data, error}) => {
        if(ignore) return;
        if(error) {
          setError(error.message);
        } else {
          setHabits(data ?? []); // if data is null or undefined, set habits to an empty array
        }
      })

    return () => {
      ignore = true;
    };
  },[user?.id]) //refetch habits whenever the user ID changes

  return (
    <main>
      <h1>Dashboard</h1>
      <p>Logged in as: {user?.email}</p>
      <p>Your User ID: {user?.id}</p>

      {error && <p role="alert">Error: {error}</p>}

      <h2>Habits ({habits.length})</h2>
      <ul>
        {habits.map((habit) => (
          <li key={habit.id}>
            {habit.name} - owner: {habit.user_id}
          </li>
        ))}
      </ul>
    </main>
  )
}


## part 3: Generating TS types from database

Instead of writing row types by hand, supabase can generate them from your schema

1) npx supabase login
It opens your browser to approve access. If npx asks to install the supabase package, say yes.

2) Generate the types from your project root (where package.json is):
npx supabase gen types typescript --project-id YOUR_PROJECT_ID --schema public > src/types/database.types.ts

Replace YOUR_PROJECT_ID with the part of your Supabase URL before .supabase.co. On Windows, use Git Bash if the file comes out garbled.

3) Open the new file. You'll see a large Database type describing your profiles, habits and logs tables: every column, its type, and which fields are optional when inserting.

4) Ff not CLI, we can download it in from dashboard
https://supabase.com/dashboard/project/pyhefzrqmibkgnfjmaru/integrations/data_api/docs?page=tables-intro


5) Update supabase.ts to use it:
import type { Database } from "../types/database.types";
export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

6) Replace your hand-written Habit type in DashboardPage with the generated one:
import type { Tables } from "../types/database.types";
type Habit = Pick<Tables<"habits">, "id" | "name" | "user_id">;

Tables<"habits"> is a full habit row. Pick keeps just the columns you selected. Hover over data in your query and you'll see it's now properly typed instead of any.

7) Optional shortcut: add a script to package.json so you don't need to remember the command:

"types": "supabase gen types typescript --project-id YOUR_PROJECT_ID --schema public > src/types/database.types.ts"

Then run npm run types whenever you change your schema.

## part 4: database.types
•	id?: never in Insert: your IDs are generated always, so TypeScript won't let you send an id at all. The database owns it.
•	user_id?: string in Insert: optional because of your default auth.uid(). You can insert a habit without passing user_id.
•	The Relationships entry on logs comes from your foreign key. Later it lets you fetch a habit with its logs in one query, like .select("*, logs(*)").
•	frequency and role are plain string. check constraints don't carry over into the generated types, so TypeScript won't stop you writing frequency: "monthly". Fix this in your app by defining type Frequency = "daily" | "weekly" and using a Zod z.enum(["daily", "weekly"]) in your habit form. That's next.
