import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured, SUPABASE_ANON_KEY, SUPABASE_URL } from "./config";

/**
 * Refresca la sesión de Supabase Auth y protege /admin/*.
 * Si Supabase todavía no está configurado, deja pasar todo (modo demo).
 */
export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({ request });

  if (!isSupabaseConfigured()) {
    return response;
  }

  const supabase = createServerClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
  const isLoginRoute = request.nextUrl.pathname.startsWith("/admin/login");

  // No alcanza con estar logueado: puede ser una cuenta de espectador (/cuenta).
  // Solo deja pasar a /admin/* a quien tenga fila en `usuario` (admin real).
  let esAdmin = false;
  if (user && isAdminRoute) {
    const { data: filaUsuario } = await supabase
      .from("usuario")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();
    esAdmin = Boolean(filaUsuario);
  }

  if (isAdminRoute && !isLoginRoute && !esAdmin) {
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoginRoute && esAdmin) {
    const dashboardUrl = new URL("/admin", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return response;
}
