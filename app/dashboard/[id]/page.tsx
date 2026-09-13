"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabaseBrowser } from "@/lib/supabase";
import {
  Activity,
  BarChart3,
  Check,
  Copy,
  ExternalLink,
  Eye,
  Link2,
  LogOut,
  Radio,
  Save,
  Share2,
  UserRound,
} from "lucide-react";
type Profile = {
  title: string;
  company: string;
  phone: string;
  whatsapp: string;
  email: string;
  website: string;
  linkedin: string;
  instagram: string;
  google_maps: string;
  logo_url: string;
  photo_url: string | null;
};
type Client = {
  id: string;
  name: string;
  email: string;
  slug: string;
  subscription_status: "active" | "expired" | "pending";
  card_profiles: Profile[];
};
const empty: Profile = {
  title: "",
  company: "",
  phone: "",
  whatsapp: "",
  email: "",
  website: "",
  linkedin: "",
  instagram: "",
  google_maps: "",
  logo_url: "",
  photo_url: null,
};
export default function Dashboard() {
  const router = useRouter();
  const [client, setClient] = useState<Client | null>(null);
  const [profile, setProfile] = useState<Profile>(empty);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState<"profile" | "links">("profile");
  const [metrics, setMetrics] = useState({ view: 0, share: 0, contact: 0 });
  useEffect(() => {
    (async () => {
      const supabase = getSupabaseBrowser();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/login");
        return;
      }
      const { data, error } = await supabase
        .from("clients")
        .select("id,name,email,slug,subscription_status,card_profiles(*)")
        .eq("id", user.id)
        .single();
      if (error || !data) {
        router.replace("/login");
        return;
      }
      const record = data as Client;
      setClient(record);
      setProfile(
        record.card_profiles?.[0] || { ...empty, email: record.email },
      );
      const { data: events } = await supabase
        .from("profile_events")
        .select("event_type")
        .eq("client_id", user.id);
      if (events)
        setMetrics(
          events.reduce(
            (a, e) => ({
              ...a,
              [e.event_type]: (a[e.event_type as keyof typeof a] || 0) + 1,
            }),
            { view: 0, share: 0, contact: 0 },
          ),
        );
      setLoading(false);
    })();
  }, [router]);
  async function save() {
    if (!client) return;
    const supabase = getSupabaseBrowser();
    const { error } = await supabase
      .from("card_profiles")
      .update(profile)
      .eq("client_id", client.id);
    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    }
  }
  async function logout() {
    await getSupabaseBrowser().auth.signOut();
    router.replace("/login");
  }
  function copy() {
    if (client)
      navigator.clipboard.writeText(`${location.origin}/card/${client.slug}`);
  }
  if (loading)
    return (
      <main className="grid min-h-screen place-items-center bg-ink">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-violet border-t-transparent" />
      </main>
    );
  if (!client) return null;
  const fields =
    tab === "profile"
      ? [
          ["title", "Titre professionnel"],
          ["company", "Entreprise"],
          ["phone", "Téléphone"],
          ["whatsapp", "WhatsApp"],
          ["email", "E-mail"],
        ]
      : [
          ["website", "Site web"],
          ["linkedin", "LinkedIn"],
          ["instagram", "Instagram"],
          ["google_maps", "Google Maps"],
        ];
  const completion = Math.round(
    (Object.values(profile).filter((v) => v && v !== "#").length / 10) * 100,
  );
  return (
    <main className="min-h-screen bg-ink grid-noise">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-ink/85 backdrop-blur-xl">
        <div className="shell flex h-20 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-violet">
              <Radio size={17} />
            </span>
            NFCcardo<span className="text-violet">.ma</span>
          </Link>
          <button onClick={logout} className="btn-secondary !px-3 !py-2">
            <LogOut size={15} /> Déconnexion
          </button>
        </div>
      </header>
      <div className="shell py-8">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <p className="label text-violet">Espace client connecté</p>
            <h1 className="text-4xl font-semibold tracking-[-.04em]">
              Bonjour, {client.name.split(" ")[0]}.
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Vos modifications sont enregistrées dans Supabase.
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={copy} className="btn-secondary !py-2.5">
              <Copy size={15} /> Copier le lien
            </button>
            <Link href={`/card/${client.slug}`} className="btn-primary !py-2.5">
              Voir ma carte <ExternalLink size={15} />
            </Link>
          </div>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            [Eye, "Vues", metrics.view],
            [Share2, "Partages", metrics.share],
            [Activity, "Contacts", metrics.contact],
            [Radio, "Statut", client.subscription_status],
          ].map(([I, l, v]: any) => (
            <article key={l} className="panel p-5">
              <I size={18} className="text-violet" />
              <p className="mt-6 text-2xl font-semibold capitalize">{v}</p>
              <p className="mt-1 text-xs text-slate-500">{l}</p>
            </article>
          ))}
        </div>
        <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_330px]">
          <section className="panel overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/10 p-6">
              <div>
                <h2 className="font-semibold">Ma carte digitale</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Coordonnées et liens publics
                </p>
              </div>
              <div className="flex rounded-full bg-black/30 p-1">
                <button
                  onClick={() => setTab("profile")}
                  className={`rounded-full px-4 py-2 text-xs ${tab === "profile" ? "bg-white text-black" : "text-slate-400"}`}
                >
                  <UserRound size={13} className="mr-1 inline" />
                  Profil
                </button>
                <button
                  onClick={() => setTab("links")}
                  className={`rounded-full px-4 py-2 text-xs ${tab === "links" ? "bg-white text-black" : "text-slate-400"}`}
                >
                  <Link2 size={13} className="mr-1 inline" />
                  Liens
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid gap-5 sm:grid-cols-2">
                {fields.map(([key, label]) => (
                  <label key={key}>
                    <span className="label">{label}</span>
                    <input
                      className="input"
                      value={String(profile[key as keyof Profile] || "")}
                      onChange={(e) =>
                        setProfile((p) => ({ ...p, [key]: e.target.value }))
                      }
                    />
                  </label>
                ))}
              </div>
              <div className="mt-7 flex justify-end border-t border-white/10 pt-6">
                <button onClick={save} className="btn-primary">
                  {saved ? <Check size={16} /> : <Save size={16} />}{" "}
                  {saved ? "Enregistré" : "Enregistrer"}
                </button>
              </div>
            </div>
          </section>
          <aside className="space-y-5">
            <section className="panel p-6">
              <p className="label">Abonnement</p>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">NFCcardo Signature</h3>
                <span
                  className={`rounded-full px-3 py-1 text-xs capitalize ${client.subscription_status === "active" ? "bg-emerald-400/10 text-emerald-300" : "bg-amber-400/10 text-amber-300"}`}
                >
                  {client.subscription_status}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                L’administrateur contrôle l’activation et la redirection NFC.
              </p>
            </section>
            <section className="panel p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="label">Profil complété</p>
                  <p className="text-3xl font-semibold">{completion}%</p>
                </div>
                <BarChart3 className="text-violet" />
              </div>
              <div className="mt-5 h-2 rounded-full bg-white/10">
                <span
                  className="block h-full rounded-full bg-violet"
                  style={{ width: `${completion}%` }}
                />
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
