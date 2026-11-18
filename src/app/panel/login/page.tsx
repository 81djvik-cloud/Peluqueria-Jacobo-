import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Acceso al panel",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-sm space-y-8 pt-6">
      <header className="text-center">
        <h1 className="text-3xl font-extrabold tracking-tight">Panel del negocio</h1>
        <p className="mt-2 text-lg text-slate-600">Introduce la contraseña de administrador.</p>
      </header>
      <LoginForm />
    </div>
  );
}
