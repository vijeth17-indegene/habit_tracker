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