# React Router + TanStack Query Setup

## 1) Router

`main.tsx` no longer renders `<App />` directly — it renders a router instead.

**Imports:**
```tsx
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router'
import DashboardPage from './pages/DashboardPage.tsx'
import LoginPage from './pages/loginPage.tsx'
import SignUpPage from './pages/SignUpPage.tsx'
import NotFoundPage from './pages/NotFoundPage.tsx'
```

**Code:**
```tsx
const router = createBrowserRouter([
  { path: '/', element: <DashboardPage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/signup', element: <SignUpPage /> },
  { path: '*', element: <NotFoundPage /> },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
```

- `createBrowserRouter([...])` defines the route table: each entry maps a `path` directly to an `element` (the page component to render).
- `path: '*'` is a catch-all — if no other route matches the URL, `NotFoundPage` renders.
- `<RouterProvider router={router} />` replaces `<App />` as the root element, so the router takes over rendering based on the current URL.
- At this stage there's no shared layout yet — each route renders its page in isolation, with nothing persisting across navigations.

## 2) TanStack Query

**Imports:**
```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
```

**Code:**
```tsx
const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
)
```

- `const queryClient = new QueryClient()` is created once at module scope (outside any component), so the same instance persists across re-renders instead of being recreated each time.
- `<QueryClientProvider client={queryClient}>` wraps the app so any component underneath can use hooks like `useQuery`/`useMutation` to fetch and cache server data (e.g. Supabase calls).
- It's placed above `<RouterProvider>` so the query cache is available no matter which route/page is active.

## 3) Links

**Imports:**
```tsx
import { Link, Outlet } from 'react-router'
```

**Code:**
```tsx
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

```

- `<Link to="...">` (from `react-router`) navigates between routes without a full page reload, unlike a plain `<a href>`.
- The flat route list from step 1 is now wrapped in a single outer route whose `element` holds the `<nav>` and `<Outlet />`, with the pages moved into its `children` array — turning it into a **layout route**.
- `<Outlet />` is the placeholder inside that layout where the matched child route's element gets rendered, so the nav bar shows on every page since the layout wraps all child routes.
- Testing: clicking each link should swap the content below the nav without a page refresh, and the `/does-not-exist` link should render `NotFoundPage` via the `*` route — confirming the whole route table works end-to-end.
