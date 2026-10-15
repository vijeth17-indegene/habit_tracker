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
      <div className="bg-gray-800">
        <nav className="container mx-auto p-4 text-white flex flex-wrap items-center gap-4">
          <NavLink to="/">
            Dashboard
          </NavLink>
          <NavLink to="/test">
            Test
          </NavLink>

          <div className="ml-auto flex flex-wrap items-center gap-4">
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
          </div>
        </nav>
      </div>
      <div className="container mx-auto px-4 py-6">
        <Outlet />
      </div>
    </div>
  )
}