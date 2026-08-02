import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  // Supabase keeps the session in localStorage, which the server cannot read.
  ssr: false,
  beforeLoad: async () => {
    // When Supabase is not configured the app runs in local/demo mode and
    // every screen stays reachable.
    if (!supabase) return;
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/login" });
    return { user: data.user };
  },
  component: () => <Outlet />,
});
