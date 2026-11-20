import Link from "next/link";

export function Pie() {
  return (
    <footer className="mt-10 border-t border-marca-100 bg-white">
      <div className="mx-auto max-w-2xl px-5 py-8 text-sm sm:px-6">
        <Link href="/panel" className="text-slate-500 underline-offset-2 hover:underline">
          Acceso del negocio
        </Link>
      </div>
    </footer>
  );
}
