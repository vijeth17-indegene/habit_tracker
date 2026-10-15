import { useAuth } from "../hooks/useAuth";
import { useHabits } from "../hooks/useHabits";

function HabitList() {
  const { data: habits, isPending, isError, error } = useHabits();

  if (isPending) {
    return <p>Loading habits...</p>;
  }

  if (isError) {
    return <p role="alert">{error.message}</p>;
  }

  if (habits.length === 0) {
    return <p>No habits yet</p>;
  }

  return (
    <ul>
      {habits.map((habit) => (
        <li key={habit.id}>
          <h3>{habit.name}</h3>
          <p>{habit.description}</p>
          <p>Frequency: {habit.frequency}</p>
        </li>
      ))}
    </ul>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <main>
      <h1>Dashboard</h1>
      <p>Logged in as: {user?.email}</p>
      <h2>Habits</h2>
      <HabitList />
    </main>
  );
}