## Right now no part of your app knows who's logged in. You'll fix that with a context that holds the session and shares it everywhere.

## 1) Create an AuthProvider component that stores session (starts as null) and loading (starts as true) in state.
## 2) In a useEffect:
    •	Call supabase.auth.getSession() to read the stored session on page load. Save it and set loading to false.
    •	Subscribe with supabase.auth.onAuthStateChange((_event, session) => ...) to update session whenever the user logs in, logs out or a token refreshes.
    •	Return a cleanup function that calls subscription.unsubscribe().
## 3) Create a useAuth() hook that reads the context and throws a clear error if it's used outside the provider.
## 4) Wrap your app: AuthProvider goes inside QueryClientProvider, around RouterProvider.
## 5) Use it in your layout: show the logged-in user's email, plus a Logout button that calls supabase.auth.signOut() and navigates to /login.m

## 1) src/context/AuthContext.ts

import type { Session, User } from "@supabase/supabase-js";
import { createContext } from "react";

export type AuthContextValue = {
    session: Session | null;
    user: User | null;
    loading: boolean;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

-- What a context is: a way to share a value with any component in the tree without passing props through every level. Think of it as a noticeboard: the provider pins the session up, and any component can read it.
-- AuthContextValue describes what's on the noticeboard:
    -- session: the full Supabase session, including tokens. null when logged out.
    -- user: just the user part (id, email, metadata), for convenience.
    -- loading: true while Supabase is still checking for a stored session on page load.
-- createContext<...>(undefined): the default is undefined on purpose. If a component reads the context and gets undefined, you know it isn't inside the provider, which is a bug you want to catch.

## 2) src/hooks/useAuth.ts

import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used inside an AuthProvider");
    }
    return context;
}

-- useContext(AuthContext) reads the current value off the noticeboard.
-- The undefined check turns a confusing "cannot read property of undefined" crash into a clear message telling you exactly what's wrong.
-- A bonus for TypeScript: after the check, the return type is AuthContextValue, not AuthContextValue | undefined, so you never need ?. when using it.
-- Components now just write const { user, loading } = useAuth();

## 3) src/components/AuthProvider.tsx

import { useEffect, useState, type ReactNode } from "react";
import { AuthContext } from "../context/AuthContext";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

export default function AuthProvider({ children }: { children: ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase.auth.getSession().then(({data}) => {
            setSession(data.session);
            setLoading(false);
        });

        const { 
            data: { subscription }
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setLoading(false);
        })

        return () => subscription.unsubscribe();
    }, []);

    return (
        <AuthContext value={{session, user: session?.user ?? null, loading}}>
            {children}
        </AuthContext>
    );
}

-- children: ReactNode: whatever you wrap inside <AuthProvider>, in this case your whole app.
-- loading starts as true because on first render you don't know yet whether someone's logged in. Without it, protected routes would briefly see user = null and kick a logged-in user to /login on every refresh.
-- getSession() reads the session supabase-js saved in Local Storage (the sb-... key you saw). This is what keeps you logged in after a refresh.
-- onAuthStateChange is a listener that fires whenever auth changes: login, logout, or a token refresh (the access/refresh token flow from your notes). It keeps the app's state in sync automatically, even across browser tabs.
-- _event: the event name (like SIGNED_IN). The underscore says "I'm not using this."
-- Only setState calls inside the callback. As mentioned, awaiting other Supabase calls in there can make the auth client hang.
-- return () => subscription.unsubscribe() is the cleanup. Without it, every remount adds another listener. In development StrictMode runs effects twice, and cleanup prevents a duplicate listener.
-- [] dependency array: set this up once, when the provider mounts.
-- <AuthContext value={...}>: in React 19, the context itself works as the provider. Older code writes <AuthContext.Provider>; both work.
-- session?.user ?? null: if there's a session, take its user, otherwise null.

## Wrap the app in main.tsx
AuthProvider sits above the router, so every page and layout can call useAuth().

## Use it in RootLayout.tsx

import { NavLink, Outlet, useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";



export default function RootLayout(){

  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    queryClient.clear();
    navigate("/login");
  };

  return(
    <div>
      <nav>
        <NavLink to="/">
          Dashboard
        </NavLink>

        {!loading && user && (
          <>
            <span>{user.email}</span>
            <button type="button" onClick= {handleLogout}>
              Logout
            </button>
          </>
        )}

        {!loading && !user && (
          <>
            <NavLink to="/login">
              Login
            </NavLink>
            <NavLink to="/signup">
              Sign Up
            </NavLink>
          </>
        )}
      </nav>
      <Outlet />
    </div>
  )
}

-- !loading && ...: show nothing until you know the auth state, so the nav doesn't flash "Login" for a moment and then switch to your email.
-- signOut() clears the tokens from Local Storage. That triggers onAuthStateChange, which sets session to null, and the nav updates on its own.
-- queryClient.clear() wipes TanStack Query's cache. Without it, if one person logs out and another logs in on the same browser, the second person could briefly see the first person's cached habits
-- type="button" is good practice for buttons outside forms.
