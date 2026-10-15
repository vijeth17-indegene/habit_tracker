## useHabits.ts -> hook

import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useAuth } from "./useAuth";

export function useHabits() {
    const { user } = useAuth();

    return useQuery({
        queryKey: ["habits", user?.id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("habits")
                .select("id, name, description, frequency, created_at")
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data;
        },
        enabled: !!user,
    });
}


•	queryKey is the cache's label for this data. Including user?.id keeps each user's habits in a separate cache entry, which adds a second layer of protection alongside queryClient.clear() on logout.
•	queryFn is the function that fetches the data. TanStack Query calls it, caches the result, and refetches when needed.
•	if (error) throw error; is the most important line. Supabase returns errors instead of throwing them, but TanStack Query only knows a request failed if the function throws. Without this line, failed requests would look successful with undefined data.
•	enabled: !!user means "don't run until there's a user". !! turns the user object (or null) into true or false.
•	.order(...) puts the newest habits first. user_id isn't selected because RLS already guarantees every row is yours.

DashboardPage.tsx
import { useAuth } from "../hooks/useAuth";
import { useHabits } from "../hooks/useHabits";

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: habits, isPending, isError, error } = useHabits();
  

  return (
    <main>
      <h1>Dashboard</h1>
      <p>Logged in as: {user?.email}</p>
      <p>Your User ID: {user?.id}</p>

      <h2>Habits</h2>

      {isPending ? (
        <p>Loading Habits...</p>
      ) : isError ? (
        <p role="alert">{error.message}</p>
      ) : !habits || habits.length === 0 ? (
        <p>No Habits Yet</p>
      ): (
        <ul>
          {habits.map((habit) => (
            <li key={habit.id}>
              <h3>{habit.name}</h3>
              <p>{habit.description}</p>
              <p>Frequency: {habit.frequency}</p>
            </li>
          ))}
        </ul>
      )}

    </main>
  )
}

In TanStack Query v5 the loading flag is called isPending. Older tutorials use isLoading, which now means something slightly different, so stick with isPending.