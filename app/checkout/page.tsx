"use client";
import { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { getSupabaseBrowser } from "@/lib/supabase";
import {
  Building2,
  Check,
  CheckCircle2,
  Clock3,
  Copy,
  FileCheck2,
  LockKeyhole,
  Receipt,
  Upload,
  X,
} from "lucide-react";
const bank = [
  ["Titulaire", "NFCCARDO.MA SARL"],
  ["RIB", "190 780 2111111111111111 13"],
  ["IBAN", "MA64 1907 8021 1111 1111 1111 113"],
  ["SWIFT", "BCPOMAMC"],
];
export default function Checkout() {
  const [receipt, setReceipt] = useState<File | null>(null);
  const [copied, setCopied] = useState("");
  const [orderId, setOrderId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  function copy(label: string, value: string) {
    navigator.clipboard.writeText(value);
    setCopied(label);
    setTimeout(() => setCopied(""), 1200);
  }
  async function submit() {
    if (!receipt) return;
    setLoading(true);
    setError("");
    const supabase = getSupabaseBrowser();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("Connectez-vous à votre compte avant d’envoyer le reçu.");
      setLoading(false);
      return;
    }
    if (receipt.size > 10 * 1024 * 1024) {
      setError("Le fichier dépasse la limite de 10 Mo.");
      setLoading(false);
      return;
    }
    const ext = receipt.name.split(".").pop()?.toLowerCase() || "file";
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("payment-receipts")
      .upload(path, receipt, { upsert: false });
    if (uploadError) {
      setError(uploadError.message);
      setLoading(false);
      return;
    }
    const { data, error: orderError } = await supabase
      .from("orders")
      .insert({
        client_id: user.id,
        receipt_url: path,
        status: "pending_verification",
      })
      .select("id")
      .single();
    if (orderError) {
      await supabase.storage.from("payment-receipts").remove([path]);
      setError(orderError.message);
      setLoading(false);
      return;
    }
    setOrderId(data.id);
    setLoading(false);
  }
  if (orderId)
    return (
      <AppShell
        eyebrow={`Commande ${orderId.slice(0, 8).toUpperCase()}`}
        title="Paiement envoyé avec succès."
      >
        <div className="mx-auto mt-14 max-w-xl text-center">
          <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-400/10 text-emerald-300">
            <CheckCircle2 size={34} />
          </span>
          <h2 className="mt-7 text-2xl font-semibold">
            Votre reçu est en vérification
          </h2>
          <p className="mt-3 leading-7 text-slate-400">
            La commande est enregistrée dans Supabase. Notre équipe vous
            répondra sous 24 heures ouvrées.
          </p>
          <Link href="/login" className="btn-secondary mt-7">
            Ouvrir mon espace
          </Link>
        </div>
      </AppShell>
    );
  return (
    <AppShell
      eyebrow="Paiement · Dernière étape"
      title="Finalisez votre NFCcardo."
    >
      <div className="mt-9 grid gap-6 lg:grid-cols-[1fr_390px]">
        <section className="panel p-6 sm:p-8">
          <div className="flex items-center gap-4">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-violet/15 text-violet">
              <Building2 />
            </span>
            <div>
              <h2 className="text-lg font-semibold">Virement bancaire</h2>
              <p className="text-sm text-slate-500">
                Banque Populaire · Vérification manuelle
              </p>
            </div>
          </div>
          <div className="mt-7 overflow-hidden rounded-2xl border border-white/10 bg-black/20">
            {bank.map(([label, value]) => (
              <div
                key={label}
                className="flex flex-col gap-2 border-b border-white/10 p-4 last:border-0 sm:flex-row sm:justify-between"
              >
                <span className="text-xs uppercase tracking-wider text-slate-600">
                  {label}
                </span>
                <button
                  onClick={() => copy(label, value)}
                  className="flex items-center gap-2 font-mono text-xs"
                >
                  {value}
                  {copied === label ? (
                    <Check size={14} className="text-emerald-400" />
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-3 rounded-xl bg-amber-400/[.05] p-4 text-xs leading-5 text-amber-100/60">
            <Receipt size={16} />
            <p>
              Données bancaires de démonstration — n’effectuez pas de virement
              réel.
            </p>
          </div>
          <label
            className={`mt-8 grid min-h-44 cursor-pointer place-items-center rounded-2xl border border-dashed text-center ${receipt ? "border-emerald-400/40 bg-emerald-400/5" : "border-white/20 hover:border-violet"}`}
          >
            <input
              type="file"
              accept="image/jpeg,image/png,application/pdf"
              className="hidden"
              onChange={(e) => setReceipt(e.target.files?.[0] || null)}
            />
            {receipt ? (
              <span>
                <FileCheck2 className="mx-auto mb-3 text-emerald-400" />
                <b className="block max-w-xs truncate text-sm">
                  {receipt.name}
                </b>
                <small className="text-slate-500">
                  {(receipt.size / 1024 / 1024).toFixed(2)} Mo
                </small>
              </span>
            ) : (
              <span>
                <Upload className="mx-auto mb-3 text-violet" />
                <b className="block text-sm">Importer le reçu</b>
                <small className="text-slate-500">
                  PDF, JPG ou PNG · 10 Mo
                </small>
              </span>
            )}
          </label>
          {receipt && (
            <button
              onClick={() => setReceipt(null)}
              className="mt-3 flex items-center gap-1 text-xs text-slate-500"
            >
              <X size={13} /> Retirer
            </button>
          )}
        </section>
        <aside className="panel h-fit p-6">
          <h3 className="text-lg font-semibold">NFCcardo Signature</h3>
          <div className="my-6 space-y-3 border-y border-white/10 py-5 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Carte personnalisée</span>
              <span>350 MAD</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">12 mois</span>
              <span>149 MAD</span>
            </div>
          </div>
          <div className="flex justify-between text-xl font-semibold">
            <span>Total</span>
            <span>499 MAD</span>
          </div>
          {error && (
            <p className="mt-5 rounded-xl bg-rose-400/10 p-3 text-xs text-rose-300">
              {error}
            </p>
          )}
          <button
            disabled={!receipt || loading}
            onClick={submit}
            className="btn-primary mt-7 w-full disabled:opacity-35"
          >
            {loading ? (
              <Clock3 className="animate-spin" size={17} />
            ) : (
              <Check size={17} />
            )}{" "}
            {loading ? "Envoi sécurisé…" : "Envoyer pour validation"}
          </button>
          <p className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-600">
            <LockKeyhole size={13} /> Stockage privé Supabase
          </p>
        </aside>
      </div>
    </AppShell>
  );
}
