import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import { createBrowserRouter, RouterProvider, Link, Outlet } from 'react-router'
import DashboardPage from './pages/DashboardPage.tsx'
import LoginPage from './pages/LoginPage.tsx'
import SignUpPage from './pages/SignUpPage.tsx'
import NotFoundPage from './pages/NotFoundPage.tsx'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    element: (
      <div>
        <nav>
          <Link to="/">Dashboard</Link>
          <Link to="/login">Login</Link>
          <Link to="/signup">Sign Up</Link>
          <Link to="/does-not-exist">404 test</Link>
        </nav>
        <Outlet />
      </div>
    ),
    children: [
      { path: '/', element: <DashboardPage /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/signup', element: <SignUpPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>
)
