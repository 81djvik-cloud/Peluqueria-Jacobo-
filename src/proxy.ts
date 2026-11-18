import { NextResponse, type NextRequest } from "next/server";

/**
 * Comprobación rápida: sin cookie de sesión, /panel redirige al login.
 * La validación real de la firma se hace en el servidor (lib/auth.ts).
 */
export function proxy(request: NextRequest) {
  if (!request.cookies.has("jacobo_admin")) {
    return NextResponse.redirect(new URL("/panel/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/panel"],
};
