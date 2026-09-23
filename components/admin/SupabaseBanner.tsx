import { isSupabaseConfigured } from "@/lib/supabase/config";

export function SupabaseBanner() {
  if (isSupabaseConfigured()) return null;

  return (
    <div className="border-b border-accent/40 bg-accent-dark/20 px-4 py-2.5 text-center text-xs text-white sm:px-6">
      Modo demo: Supabase no está conectado todavía, estás viendo datos de ejemplo y los
      cambios no se guardan. Ver <code className="rounded bg-black/30 px-1">README.md</code>.
    </div>
  );
}
