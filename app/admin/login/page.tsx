"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LockKeyhole, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { getSupabaseBrowser } from "@/lib/supabase";

const LOGIN_TIMEOUT_MS = 12000;

function withTimeout<T>(request: PromiseLike<T>): Promise<T> {
  return Promise.race([
    Promise.resolve(request),
    new Promise<T>((_, reject) =>
      window.setTimeout(() => reject(new Error("LOGIN_TIMEOUT")), LOGIN_TIMEOUT_MS),
    ),
  ]);
}

export default function AdminLogin() {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const form = new FormData(event.currentTarget);
      const supabase = getSupabaseBrowser();
      const result = await withTimeout(
        supabase.auth.signInWithPassword({
          email: String(form.get("email") || "").trim(),
          password: String(form.get("password") || ""),
        }),
      );

      if (result.error || !result.data.user) {
        const message = result.error?.message.toLowerCase() || "";
        setError(
          message.includes("email not confirmed")
            ? "Votre e-mail n’est pas encore confirmé. Ouvrez l’e-mail envoyé par Supabase, puis cliquez sur le lien de confirmation."
            : "E-mail ou mot de passe incorrect.",
        );
        return;
      }

      const { data: record, error: roleError } = await withTimeout(
        supabase.from("clients").select("role").eq("id", result.data.user.id).single(),
      );

      if (
        roleError ||
        result.data.user.app_metadata.role !== "admin" ||
        record?.role !== "admin"
      ) {
        await supabase.auth.signOut();
        setError("Ce compte est confirmé, mais son accès administrateur n’est pas encore activé.");
        return;
      }

      document.cookie = "nfccardo_admin=demo-authenticated; path=/; SameSite=Strict; Secure";
      router.push("/admin/dashboard");
      router.refresh();
    } catch (loginError) {
      setError(
        loginError instanceof Error && loginError.message === "LOGIN_TIMEOUT"
          ? "La connexion prend trop de temps. Vérifiez votre réseau puis réessayez."
          : "Connexion impossible pour le moment. Veuillez réessayer.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell eyebrow="NFCcardo Control" title="Administration sécurisée.">
      <form onSubmit={submit} className="panel mx-auto mt-12 max-w-md p-8">
        <span className="mb-7 grid h-12 w-12 place-items-center rounded-2xl bg-violet/15 text-violet">
          <LockKeyhole />
        </span>
        <h2 className="text-xl font-semibold">Connexion administrateur</h2>
        <p className="mt-2 text-sm text-slate-500">Authentification et rôle vérifiés par Supabase.</p>
        <label className="mt-7 block">
          <span className="label">E-mail</span>
          <input name="email" type="email" autoComplete="email" className="input" required />
        </label>
        <label className="mt-5 block">
          <span className="label">Mot de passe</span>
          <span className="relative block">
            <input name="password" type={show ? "text" : "password"} autoComplete="current-password" className="input !pr-12" required />
            <button type="button" onClick={() => setShow((visible) => !visible)} className="absolute right-4 top-4 text-slate-500" aria-label={show ? "Masquer le mot de passe" : "Afficher le mot de passe"}>
              {show ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </span>
        </label>
        {error && <p role="alert" className="mt-4 rounded-xl bg-rose-400/10 p-3 text-sm text-rose-300">{error}</p>}
        <button disabled={loading} className="btn-primary mt-7 w-full">
          {loading ? "Vérification…" : "Se connecter"}
        </button>
        <p className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-600"><ShieldCheck size={13} /> Accès contrôlé par rôle</p>
      </form>
    </AppShell>
  );
}
