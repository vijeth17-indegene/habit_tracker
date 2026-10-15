import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useAuth } from "./useAuth";

export function useHabits() {
    const { user } = useAuth();

    return useQuery({
        queryKey: ["habits", user?.id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("habits")
                .select("id, name, description, frequency, created_at")
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data;
        },
        enabled: !!user,
    });
}