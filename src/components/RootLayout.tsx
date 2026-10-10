import { NavLink, Outlet } from 'react-router';
export default function RootLayout() {
  return (
    <div>
      <nav className="bg-gray-800 p-4">
        <NavLink to="/" className={({ isActive }) =>
            `mr-4 rounded px-3 py-2 ${
              isActive
                ? 'bg-gray-700 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`
          }>Dashboard</NavLink>
        <NavLink to="/login" className={({ isActive }) =>
            `mr-4 rounded px-3 py-2 ${
              isActive
                ? 'bg-gray-700 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`
          }>Login</NavLink>
        <NavLink to="/signup" className={({ isActive }) =>
            `mr-4 rounded px-3 py-2 ${
              isActive
                ? 'bg-gray-700 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`
          }>Sign Up</NavLink>
        <NavLink to="/does-not-exist" className={({ isActive }) =>
            `mr-4 rounded px-3 py-2 ${
              isActive
                ? 'bg-gray-700 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`
          }>404</NavLink>
      </nav>
      <Outlet />
    </div>
  );
}