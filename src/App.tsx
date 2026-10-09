import { useEffect } from 'react';
import { supabase } from './lib/supabase';

function App() {
  useEffect(() => {
    supabase
      .from('habits')
      .select('*')
      .then((result) => console.log(result));
  }, []);

  return (
    <div className="App">
      <h1 className="text-3xl font-bold text-emerald-600 p-6">Habit Tracker</h1>
    </div>
  );
}

export default App;