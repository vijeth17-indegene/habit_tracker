import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../hooks/useAuth";

export default function GuestRoute() {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) return <p>Loading...</p>

    if(user) {
        return <Navigate to={location.state?.from ?? "/"} replace />;
    }

    return <Outlet />;
}