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