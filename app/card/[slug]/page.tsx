import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Globe,
  Instagram,
  Linkedin,
  LockKeyhole,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Radio,
  RotateCcw,
  UserPlus,
} from "lucide-react";
import { getSupabaseBrowser } from "@/lib/supabase";

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
};
type Client = {
  id: string;
  name: string;
  slug: string;
  subscription_status: string;
  card_profiles: Profile[];
};

const demoClient: Client = {
  id: "demo-yasmine",
  name: "Yasmine El Amrani",
  slug: "yasmine",
  subscription_status: "active",
  card_profiles: [
    {
      title: "Architecte & fondatrice",
      company: "Atelier YA · Casablanca",
      phone: "+212 6 12 34 56 78",
      whatsapp: "+212 6 12 34 56 78",
      email: "yasmine@atelier-ya.ma",
      website: "https://nfccardo-ma.vercel.app",
      linkedin: "https://www.linkedin.com",
      instagram: "https://www.instagram.com",
      google_maps: "https://maps.google.com/?q=Casablanca+Morocco",
    },
  ],
};

export default async function Card({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let client: Client | null = slug === "yasmine" ? demoClient : null;
  if (!client) {
    const supabase = getSupabaseBrowser();
    const { data } = await supabase
      .from("clients")
      .select(
        "id,name,slug,subscription_status,card_profiles(title,company,phone,whatsapp,email,website,linkedin,instagram,google_maps)",
      )
      .eq("slug", slug)
      .single();
    if (!data) notFound();
    client = data as Client;
    if (client.subscription_status === "active")
      await supabase
        .from("profile_events")
        .insert({ client_id: client.id, event_type: "view" });
  }
  if (client.subscription_status !== "active")
    return (
      <main className="grid min-h-screen place-items-center p-6 grid-noise">
        <div className="max-w-md text-center">
          <span className="mx-auto grid h-20 w-20 place-items-center rounded-3xl border border-white/10 bg-white/5 text-slate-400">
            <LockKeyhole size={30} />
          </span>
          <h1 className="mt-7 text-3xl font-semibold">
            Carte temporairement désactivée
          </h1>
          <p className="mt-3 leading-7 text-slate-400">
            Cette carte digitale est momentanément inactive. Contactez son
            propriétaire ou renouvelez l’abonnement.
          </p>
          <Link href="/login" className="btn-primary mt-7">
            <RotateCcw size={16} /> Espace client
          </Link>
        </div>
      </main>
    );
  const p = client.card_profiles[0];
  if (!p) notFound();
  const links = [
    [`tel:${p.phone}`, Phone, "Appeler"],
    [
      `https://wa.me/${p.whatsapp.replace(/\D/g, "")}`,
      MessageCircle,
      "WhatsApp",
    ],
    [`mailto:${p.email}`, Mail, "E-mail"],
    [p.website, Globe, "Site"],
    [p.linkedin, Linkedin, "LinkedIn"],
    [p.instagram, Instagram, "Instagram"],
    [p.google_maps, MapPin, "Adresse"],
  ] as const;
  const initials = client.name
    .split(" ")
    .map((x) => x[0])
    .join("")
    .slice(0, 2);
  return (
    <main className="relative min-h-screen overflow-hidden bg-ink px-4 py-7 grid-noise">
      <div className="absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-violet/20 blur-[120px]" />
      <div className="relative mx-auto max-w-md">
        <div className="mb-3 flex items-center justify-between px-2">
          <Link
            href="/"
            className="text-xs text-slate-500 transition hover:text-white"
          >
            ← NFCcardo.ma
          </Link>
          {slug === "yasmine" && (
            <span className="rounded-full border border-violet/30 bg-violet/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-violet">
              Profil démo
            </span>
          )}
        </div>
        <div className="panel overflow-hidden rounded-[38px] bg-surface shadow-2xl">
          <div className="relative h-52 bg-gradient-to-br from-violet via-indigo-700 to-slate-950">
            <div className="absolute inset-0 opacity-20 grid-noise" />
            <span className="absolute left-6 top-6 flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-[10px] uppercase tracking-wider backdrop-blur-md">
              <Radio size={13} /> NFCcardo
            </span>
            <div className="absolute -bottom-16 left-1/2 grid h-32 w-32 -translate-x-1/2 place-items-center rounded-full border-[6px] border-surface bg-gradient-to-br from-[#343746] to-[#181a21] text-4xl font-semibold shadow-2xl">
              {initials}
            </div>
          </div>
          <div className="px-6 pb-7 pt-20 text-center">
            <h1 className="text-3xl font-semibold tracking-tight">
              {client.name}
            </h1>
            <p className="mt-2 text-slate-400">{p.title}</p>
            <p className="mt-1 text-sm text-violet">{p.company}</p>
            <a
              href={`data:text/vcard;charset=utf-8,BEGIN:VCARD%0AFN:${encodeURIComponent(client.name)}%0ATEL:${encodeURIComponent(p.phone)}%0AEMAIL:${encodeURIComponent(p.email)}%0AORG:${encodeURIComponent(p.company)}%0ATITLE:${encodeURIComponent(p.title)}%0AEND:VCARD`}
              download={`${client.slug}.vcf`}
              className="btn-primary mt-7 w-full"
            >
              <UserPlus size={17} /> Enregistrer le contact
            </a>
            <div className="mt-6 grid grid-cols-4 gap-3">
              {links
                .filter(([href]) => href && href !== "#")
                .map(([href, I, label]) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    title={label}
                    aria-label={label}
                    className="group grid aspect-square place-items-center rounded-2xl border border-white/10 bg-white/[.04] text-slate-400 transition duration-300 hover:-translate-y-1 hover:border-violet hover:bg-violet/10 hover:text-white"
                  >
                    <I size={19} />
                  </a>
                ))}
            </div>
            <div className="mt-7 rounded-2xl border border-white/[.07] bg-black/20 p-4 text-left">
              <p className="text-[10px] uppercase tracking-widest text-slate-600">
                Coordonnées
              </p>
              <p className="mt-2 text-sm text-slate-300">{p.phone}</p>
              <p className="mt-1 text-sm text-slate-500">{p.email}</p>
            </div>
            <p className="mt-7 border-t border-white/10 pt-5 text-[10px] uppercase tracking-[.25em] text-slate-600">
              Powered by NFCcardo.ma
            </p>
          </div>
        </div>
        {slug === "yasmine" && (
          <Link href="/order" className="btn-secondary mt-4 w-full">
            Créer ma propre NFCcardo
          </Link>
        )}
      </div>
    </main>
  );
}
