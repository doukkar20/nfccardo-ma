"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { getSupabaseBrowser } from "@/lib/supabase";
import {
  Activity,
  CheckCircle2,
  Clock3,
  Copy,
  Download,
  ExternalLink,
  LogOut,
  RefreshCw,
  Search,
  ShieldCheck,
  UserCheck,
  Users,
  XCircle,
} from "lucide-react";
type Client = {
  id: string;
  name: string;
  email: string;
  slug: string;
  role: string;
  subscription_status: "active" | "expired" | "pending";
  card_profiles?: { logo_url: string | null }[];
};
type Order = {
  id: string;
  client_id: string;
  status: "pending_verification" | "approved" | "rejected";
  receipt_url: string;
  created_at: string;
  clients?: { name: string; email: string } | null;
};
const statusStyle: Record<string, string> = {
  active: "bg-emerald-400/10 text-emerald-300 border-emerald-400/20",
  expired: "bg-rose-400/10 text-rose-300 border-rose-400/20",
  pending: "bg-amber-400/10 text-amber-300 border-amber-400/20",
  pending_verification: "bg-amber-400/10 text-amber-300 border-amber-400/20",
  approved: "bg-emerald-400/10 text-emerald-300 border-emerald-400/20",
  rejected: "bg-rose-400/10 text-rose-300 border-rose-400/20",
};
function Badge({ value }: { value: string }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${statusStyle[value] || "border-white/10 bg-white/5 text-slate-400"}`}
    >
      {value.replaceAll("_", " ")}
    </span>
  );
}
export default function AdminDashboard() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [tab, setTab] = useState<"orders" | "clients">("orders");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busy, setBusy] = useState("");
  const [notice, setNotice] = useState("");
  async function load(quiet = false) {
    quiet ? setRefreshing(true) : setLoading(true);
    const supabase = getSupabaseBrowser();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user || user.app_metadata.role !== "admin") {
      router.replace("/admin/login");
      return;
    }
    const [{ data: c }, { data: o }] = await Promise.all([
      supabase
        .from("clients")
        .select(
          "id,name,email,slug,role,subscription_status,card_profiles(logo_url)",
        )
        .order("created_at", { ascending: false }),
      supabase
        .from("orders")
        .select(
          "id,client_id,status,receipt_url,created_at,clients(name,email)",
        )
        .order("created_at", { ascending: false }),
    ]);
    setClients((c || []) as Client[]);
    setOrders((o || []) as unknown as Order[]);
    setLoading(false);
    setRefreshing(false);
  }
  useEffect(() => {
    void load();
  }, []);
  async function subscription(
    id: string,
    status: Client["subscription_status"],
  ) {
    setBusy(id);
    const { error } = await getSupabaseBrowser()
      .from("clients")
      .update({ subscription_status: status })
      .eq("id", id);
    if (error) setNotice("La modification n’a pas pu être enregistrée.");
    else {
      setClients((x) =>
        x.map((c) => (c.id === id ? { ...c, subscription_status: status } : c)),
      );
      setNotice(
        status === "active" ? "Carte NFC activée." : "Carte NFC désactivée.",
      );
    }
    setBusy("");
  }
  async function orderStatus(id: string, status: Order["status"]) {
    setBusy(id);
    const { error } = await getSupabaseBrowser()
      .from("orders")
      .update({ status })
      .eq("id", id);
    if (error) setNotice("La commande n’a pas pu être mise à jour.");
    else {
      setOrders((x) => x.map((o) => (o.id === id ? { ...o, status } : o)));
      setNotice(
        status === "approved" ? "Commande approuvée." : "Commande rejetée.",
      );
    }
    setBusy("");
  }
  async function receipt(path: string) {
    const { data, error } = await getSupabaseBrowser()
      .storage.from("payment-receipts")
      .createSignedUrl(path, 60);
    if (error || !data?.signedUrl) {
      setNotice("Impossible d’ouvrir le reçu.");
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  }
  async function signOut() {
    await getSupabaseBrowser().auth.signOut();
    document.cookie = "nfccardo_admin=; Max-Age=0; path=/";
    router.replace("/admin/login");
  }
  const stats = useMemo(
    () => ({
      pending: orders.filter((o) => o.status === "pending_verification").length,
      active: clients.filter((c) => c.subscription_status === "active").length,
      expired: clients.filter((c) => c.subscription_status === "expired")
        .length,
    }),
    [clients, orders],
  );
  const q = query.toLowerCase();
  const filteredClients = clients.filter(
    (c) =>
      (c.name + c.email + c.slug).toLowerCase().includes(q) &&
      (filter === "all" || c.subscription_status === filter),
  );
  const filteredOrders = orders.filter(
    (o) =>
      (o.id + (o.clients?.name || "") + (o.clients?.email || ""))
        .toLowerCase()
        .includes(q) &&
      (filter === "all" || o.status === filter),
  );
  if (loading)
    return (
      <main className="grid min-h-screen place-items-center bg-ink grid-noise">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-violet border-t-transparent" />
          <p className="mt-4 text-xs uppercase tracking-widest text-slate-500">
            Chargement du contrôle
          </p>
        </div>
      </main>
    );
  return (
    <AppShell
      eyebrow="Supabase · Administration"
      title="Centre de contrôle."
      back="/"
    >
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-xl text-sm text-slate-500">
          Supervisez les commandes, justificatifs, clients et redirections NFC
          depuis une seule interface.
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => load(true)}
            className="btn-secondary !px-4 !py-2"
          >
            <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
            Actualiser
          </button>
          <button
            onClick={signOut}
            className="btn-secondary !px-4 !py-2 text-rose-300"
          >
            <LogOut size={15} />
            Quitter
          </button>
        </div>
      </div>
      {notice && (
        <button
          onClick={() => setNotice("")}
          className="mt-5 w-full rounded-2xl border border-violet/20 bg-violet/10 p-3 text-left text-sm text-violet"
        >
          {notice}
          <span className="float-right text-xs opacity-60">Fermer ×</span>
        </button>
      )}
      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          [Clock3, "À vérifier", stats.pending, "text-amber-300"],
          [Users, "Clients", clients.length, "text-violet"],
          [UserCheck, "Actifs", stats.active, "text-emerald-300"],
          [Activity, "Expirés", stats.expired, "text-rose-300"],
        ].map(([I, l, v, color]: any) => (
          <article key={l} className="panel group p-5">
            <div className="flex items-center justify-between">
              <span
                className={`grid h-10 w-10 place-items-center rounded-xl bg-white/5 ${color}`}
              >
                <I size={18} />
              </span>
              <span className="h-2 w-2 rounded-full bg-current opacity-40" />
            </div>
            <p className="mt-5 text-3xl font-semibold tracking-tight">{v}</p>
            <p className="mt-1 text-sm text-slate-500">{l}</p>
          </article>
        ))}
      </div>
      <section className="panel mt-7 overflow-hidden">
        <div className="border-b border-white/10 p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex rounded-full bg-black/30 p-1">
              <button
                onClick={() => {
                  setTab("orders");
                  setFilter("all");
                }}
                className={`flex-1 rounded-full px-5 py-2 text-xs transition sm:flex-none ${tab === "orders" ? "bg-white text-black shadow-lg" : "text-slate-400 hover:text-white"}`}
              >
                Commandes{" "}
                <span className="ml-1 opacity-50">{orders.length}</span>
              </button>
              <button
                onClick={() => {
                  setTab("clients");
                  setFilter("all");
                }}
                className={`flex-1 rounded-full px-5 py-2 text-xs transition sm:flex-none ${tab === "clients" ? "bg-white text-black shadow-lg" : "text-slate-400 hover:text-white"}`}
              >
                Clients{" "}
                <span className="ml-1 opacity-50">{clients.length}</span>
              </button>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <select
                className="input !py-2.5 sm:w-48"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">Tous les statuts</option>
                {(tab === "orders"
                  ? ["pending_verification", "approved", "rejected"]
                  : ["active", "pending", "expired"]
                ).map((x) => (
                  <option key={x} value={x}>
                    {x.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
              <label className="relative">
                <Search
                  className="absolute left-3 top-3 text-slate-500"
                  size={15}
                />
                <input
                  className="input !py-2.5 !pl-9 sm:w-64"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Nom, e-mail, référence…"
                />
              </label>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          {tab === "orders" ? (
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-black/10 text-[10px] uppercase tracking-[.16em] text-slate-600">
                <tr>
                  {[
                    "Commande",
                    "Client",
                    "Date",
                    "Statut",
                    "Reçu",
                    "Décision",
                  ].map((x) => (
                    <th key={x} className="px-6 py-4 font-medium">
                      {x}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((o) => (
                  <tr
                    key={o.id}
                    className="border-t border-white/[.07] transition hover:bg-white/[.025]"
                  >
                    <td className="px-6 py-5 font-mono text-xs text-slate-400">
                      #{o.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-6 py-5">
                      <b>{o.clients?.name || "Client"}</b>
                      <small className="mt-1 block text-slate-500">
                        {o.clients?.email}
                      </small>
                    </td>
                    <td className="px-6 py-5 text-slate-400">
                      {new Date(o.created_at).toLocaleDateString("fr-MA", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-5">
                      <Badge value={o.status} />
                    </td>
                    <td className="px-6 py-5">
                      <button
                        onClick={() => receipt(o.receipt_url)}
                        title="Ouvrir le reçu sécurisé"
                        className="btn-secondary !p-2.5"
                      >
                        <Download size={14} />
                      </button>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex gap-2">
                        <button
                          disabled={busy === o.id}
                          onClick={() => orderStatus(o.id, "approved")}
                          title="Approuver"
                          className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-2.5 text-emerald-300 transition hover:scale-105 hover:bg-emerald-400/20"
                        >
                          <CheckCircle2 size={16} />
                        </button>
                        <button
                          disabled={busy === o.id}
                          onClick={() => orderStatus(o.id, "rejected")}
                          title="Rejeter"
                          className="rounded-xl border border-rose-400/20 bg-rose-400/10 p-2.5 text-rose-300 transition hover:scale-105 hover:bg-rose-400/20"
                        >
                          <XCircle size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!filteredOrders.length && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-16 text-center text-slate-500"
                    >
                      Aucune commande ne correspond à votre recherche.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="bg-black/10 text-[10px] uppercase tracking-[.16em] text-slate-600">
                <tr>
                  {[
                    "Client",
                    "Profil public",
                    "Rôle",
                    "Abonnement",
                    "Redirection NFC",
                  ].map((x) => (
                    <th key={x} className="px-6 py-4 font-medium">
                      {x}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((c) => (
                  <tr
                    key={c.id}
                    className="border-t border-white/[.07] transition hover:bg-white/[.025]"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-violet to-indigo-800 text-xs font-bold">
                          {c.name
                            .split(" ")
                            .map((x) => x[0])
                            .join("")
                            .slice(0, 2)}
                        </span>
                        <span>
                          <b>{c.name}</b>
                          <small className="mt-1 block text-slate-500">
                            {c.email}
                          </small>
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <a
                          href={`/card/${c.slug}`}
                          target="_blank"
                          className="font-mono text-xs text-violet hover:text-white"
                        >
                          /card/{c.slug}
                        </a>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(
                              `${location.origin}/card/${c.slug}`,
                            );
                            setNotice("Lien copié.");
                          }}
                          className="text-slate-600 hover:text-white"
                        >
                          <Copy size={13} />
                        </button>
                        <a
                          href={`/card/${c.slug}`}
                          target="_blank"
                          className="text-slate-600 hover:text-white"
                        >
                          <ExternalLink size={13} />
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <Badge value={c.role} />
                    </td>
                    <td className="px-6 py-5">
                      <Badge value={c.subscription_status} />
                    </td>
                    <td className="px-6 py-5">
                      <button
                        disabled={busy === c.id}
                        aria-label="Activer ou désactiver la carte"
                        onClick={() =>
                          subscription(
                            c.id,
                            c.subscription_status === "active"
                              ? "expired"
                              : "active",
                          )
                        }
                        className={`relative h-7 w-12 rounded-full transition ${c.subscription_status === "active" ? "bg-violet shadow-[0_0_20px_rgba(124,92,255,.35)]" : "bg-slate-700"}`}
                      >
                        <span
                          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${c.subscription_status === "active" ? "left-6" : "left-1"}`}
                        />
                      </button>
                    </td>
                  </tr>
                ))}
                {!filteredClients.length && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-16 text-center text-slate-500"
                    >
                      Aucun client ne correspond à votre recherche.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </section>
      <p className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-600">
        <ShieldCheck size={14} />
        Actions protégées par les politiques Supabase RLS
      </p>
    </AppShell>
  );
}
