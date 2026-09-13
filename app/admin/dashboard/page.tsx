"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { getSupabaseBrowser } from "@/lib/supabase";
import {
  CheckCircle2,
  Download,
  Search,
  ShieldCheck,
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
};
type Order = {
  id: string;
  client_id: string;
  status: "pending_verification" | "approved" | "rejected";
  receipt_url: string;
  created_at: string;
  clients?: { name: string; email: string } | null;
};
export default function AdminDashboard() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [tab, setTab] = useState<"orders" | "clients">("orders");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  async function load() {
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
        .select("id,name,email,slug,role,subscription_status")
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
  }
  useEffect(() => {
    load();
  }, []);
  async function subscription(
    id: string,
    status: Client["subscription_status"],
  ) {
    await getSupabaseBrowser()
      .from("clients")
      .update({ subscription_status: status })
      .eq("id", id);
    setClients((x) =>
      x.map((c) => (c.id === id ? { ...c, subscription_status: status } : c)),
    );
  }
  async function orderStatus(id: string, status: Order["status"]) {
    await getSupabaseBrowser().from("orders").update({ status }).eq("id", id);
    setOrders((x) => x.map((o) => (o.id === id ? { ...o, status } : o)));
  }
  const filteredClients = clients.filter((c) =>
    (c.name + c.email).toLowerCase().includes(query.toLowerCase()),
  );
  const filteredOrders = orders.filter((o) =>
    (o.id + (o.clients?.name || ""))
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  if (loading)
    return (
      <main className="grid min-h-screen place-items-center bg-ink">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-violet border-t-transparent" />
      </main>
    );
  return (
    <AppShell
      eyebrow="Supabase · Administration"
      title="Centre de contrôle."
      back="/"
    >
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          [
            CheckCircle2,
            "Commandes en attente",
            orders.filter((o) => o.status === "pending_verification").length,
          ],
          [Users, "Clients", clients.length],
          [
            ShieldCheck,
            "Abonnements actifs",
            clients.filter((c) => c.subscription_status === "active").length,
          ],
        ].map(([I, l, v]: any) => (
          <article key={l} className="panel p-5">
            <I size={18} className="text-violet" />
            <p className="mt-6 text-3xl font-semibold">{v}</p>
            <p className="mt-1 text-sm text-slate-500">{l}</p>
          </article>
        ))}
      </div>
      <section className="panel mt-8 overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex rounded-full bg-black/30 p-1">
            <button
              onClick={() => setTab("orders")}
              className={`rounded-full px-4 py-2 text-xs ${tab === "orders" ? "bg-white text-black" : "text-slate-400"}`}
            >
              Commandes
            </button>
            <button
              onClick={() => setTab("clients")}
              className={`rounded-full px-4 py-2 text-xs ${tab === "clients" ? "bg-white text-black" : "text-slate-400"}`}
            >
              Clients
            </button>
          </div>
          <label className="relative">
            <Search
              className="absolute left-3 top-3 text-slate-500"
              size={15}
            />
            <input
              className="input !py-2.5 !pl-9"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher…"
            />
          </label>
        </div>
        <div className="overflow-x-auto">
          {tab === "orders" ? (
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wider text-slate-600">
                <tr>
                  {[
                    "Commande",
                    "Client",
                    "Date",
                    "Statut",
                    "Reçu",
                    "Actions",
                  ].map((x) => (
                    <th key={x} className="px-6 py-4 font-medium">
                      {x}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((o) => (
                  <tr key={o.id} className="border-t border-white/10">
                    <td className="px-6 py-5 font-mono text-xs">
                      {o.id.slice(0, 8)}
                    </td>
                    <td className="px-6 py-5">
                      <b>{o.clients?.name || "Client"}</b>
                      <small className="block text-slate-500">
                        {o.clients?.email}
                      </small>
                    </td>
                    <td className="px-6 py-5 text-slate-400">
                      {new Date(o.created_at).toLocaleDateString("fr-MA")}
                    </td>
                    <td className="px-6 py-5 capitalize">
                      {o.status.replace("_", " ")}
                    </td>
                    <td className="px-6 py-5">
                      <a
                        href={o.receipt_url}
                        target="_blank"
                        className="btn-secondary !p-2"
                      >
                        <Download size={14} />
                      </a>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex gap-2">
                        <button
                          onClick={() => orderStatus(o.id, "approved")}
                          className="rounded-lg bg-emerald-400/10 p-2 text-emerald-300"
                        >
                          <CheckCircle2 size={15} />
                        </button>
                        <button
                          onClick={() => orderStatus(o.id, "rejected")}
                          className="rounded-lg bg-rose-400/10 p-2 text-rose-300"
                        >
                          <XCircle size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wider text-slate-600">
                <tr>
                  {[
                    "Client",
                    "Profil",
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
                  <tr key={c.id} className="border-t border-white/10">
                    <td className="px-6 py-5">
                      <b>{c.name}</b>
                      <small className="block text-slate-500">{c.email}</small>
                    </td>
                    <td className="px-6 py-5 font-mono text-xs">
                      /card/{c.slug}
                    </td>
                    <td className="px-6 py-5 capitalize">{c.role}</td>
                    <td className="px-6 py-5 capitalize">
                      {c.subscription_status}
                    </td>
                    <td className="px-6 py-5">
                      <button
                        onClick={() =>
                          subscription(
                            c.id,
                            c.subscription_status === "active"
                              ? "expired"
                              : "active",
                          )
                        }
                        className={`relative h-7 w-12 rounded-full ${c.subscription_status === "active" ? "bg-violet" : "bg-slate-700"}`}
                      >
                        <span
                          className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${c.subscription_status === "active" ? "left-6" : "left-1"}`}
                        />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </AppShell>
  );
}
