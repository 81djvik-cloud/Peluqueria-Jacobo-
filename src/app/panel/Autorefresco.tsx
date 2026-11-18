"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** Recarga los datos del panel cada minuto (nuevas reservas y estados automáticos). */
export function Autorefresco({ segundos = 60 }: { segundos?: number }) {
  const router = useRouter();
  useEffect(() => {
    const t = setInterval(() => router.refresh(), segundos * 1000);
    return () => clearInterval(t);
  }, [router, segundos]);
  return null;
}
