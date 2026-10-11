## Two route guards are needed: ProtectedRoute keeps logged-out users away from app pages, and GuestRoute keeps logged-in users away from login and signup. I'll give you the first one; you write the second, since it's almost a mirror image.

## src/components/ProtectedRoute.tsx

import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../hooks/useAuth";

export default function ProtectedRoute() {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) return <p>Loading...</p>

    if(!user) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    return <Outlet />;
}

-- if (loading) waits for Supabase to finish checking for a stored session. Without it, a logged-in user would be redirected to /login on every refresh, because user is briefly null. This is why you added loading in Step 7.
-- <Navigate> redirects during render, without needing a click.
-- replace swaps the current history entry instead of adding one. Without it, pressing Back from /login would return to the protected page, which redirects to /login again, trapping the user in a loop.
-- state={{ from: location }} remembers where the user was trying to go, so you can send them back there after they log in.
-- <Outlet />: if the user is logged in, render whatever child route matched.

## src/components/GuestRoute.tsx

import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../hooks/useAuth";

export default function GuestRoute() {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) return <p>Loading...</p>

    if(user) {
        return <Navigate to={location.state?.from?.pathname ?? "/"} replace />;
    }

    return <Outlet />;
}

## Updating Router in main.tsx

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        element: <ProtectedRoute />,
        children: [
          { path: '/', element: <DashboardPage /> },
        ],
      },
      {
        element: <GuestRoute />,
        children: [
          { path: '/login', element: <LoginPage /> },
          { path: '/signup', element: <SignUpPage /> },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])

Routes with an element but no path are layout routes: they don't change the URL and just wrap their children. Every future app page (habits, history, profile) goes inside the ProtectedRoute group, and the 404 page stays outside both.

## Remove navigate("/") from your login and signup pages. After a successful login, onAuthStateChange updates user, GuestRoute re-renders and redirects automatically. Keeping both can race, with two redirects firing to different places. Let auth state drive navigation in one place.

## Remember: route guards only control what the UI shows. Real security is RLS. Someone can bypass your React code entirely, but they can't bypass the database.



## TEST

## 1. Logged out, visit /: you're sent to /login.
## 2. Log in: you land on /.
## 3. Logged in, visit /login: you're sent to /.
## 4. Refresh on / while logged in: you stay there, with no flash of the login page.
## 5. Log in, then press Back: you don't go back to the login page.
