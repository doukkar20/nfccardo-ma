"use client";
import { Languages } from "lucide-react";
import { useEffect, useState } from "react";
type Lang = "fr" | "en" | "ar";
const copy: Record<string, { en: string; ar: string }> = {
  Fonctionnalités: { en: "Features", ar: "المميزات" },
  Tarifs: { en: "Pricing", ar: "الأسعار" },
  "Voir une démo": { en: "View demo", ar: "عرض تجريبي" },
  Connexion: { en: "Sign in", ar: "تسجيل الدخول" },
  "Créer ma carte": { en: "Create my card", ar: "أنشئ بطاقتي" },
  Créer: { en: "Create", ar: "إنشاء" },
  "Une carte.": { en: "One card.", ar: "بطاقة واحدة." },
  "Toutes vos": { en: "All your", ar: "كل" },
  "connexions.": { en: "connections.", ar: "اتصالاتك." },
  "Créer ma NFCcardo": { en: "Create my NFCcardo", ar: "أنشئ بطاقتي" },
  "Découvrir l’expérience": {
    en: "Discover the experience",
    ar: "اكتشف التجربة",
  },
  "Livraison partout au Maroc": {
    en: "Delivery across Morocco",
    ar: "التوصيل في جميع أنحاء المغرب",
  },
  "Paiement sécurisé": { en: "Secure payment", ar: "دفع آمن" },
  "Pourquoi NFCcardo": { en: "Why NFCcardo", ar: "لماذا NFCcardo" },
  "Moins de friction.": { en: "Less friction.", ar: "خطوات أقل." },
  "Plus de connexions.": { en: "More connections.", ar: "اتصالات أكثر." },
  "Toujours à jour": { en: "Always up to date", ar: "دائماً محدثة" },
  "Simple et sécurisé": { en: "Simple and secure", ar: "بسيطة وآمنة" },
  "Votre profil digital": { en: "Your digital profile", ar: "ملفك الرقمي" },
  "Ajouter aux contacts": {
    en: "Add to contacts",
    ar: "إضافة إلى جهات الاتصال",
  },
  "Prix simple, sans surprise": {
    en: "Simple, transparent pricing",
    ar: "سعر بسيط وواضح",
  },
  "Personnaliser ma carte": { en: "Customize my card", ar: "خصص بطاقتي" },
  "Heureux de vous revoir.": { en: "Welcome back.", ar: "مرحباً بعودتك." },
  "Connexion client": { en: "Client sign in", ar: "دخول العميل" },
  "Créer un compte": { en: "Create account", ar: "إنشاء حساب" },
  "Rejoindre NFCcardo": { en: "Join NFCcardo", ar: "انضم إلى NFCcardo" },
  "Nom complet": { en: "Full name", ar: "الاسم الكامل" },
  "E-mail": { en: "Email", ar: "البريد الإلكتروني" },
  "Mot de passe": { en: "Password", ar: "كلمة المرور" },
  "Se connecter": { en: "Sign in", ar: "دخول" },
  "Créer mon compte": { en: "Create my account", ar: "إنشاء حسابي" },
  Retour: { en: "Back", ar: "رجوع" },
  "Administration sécurisée.": {
    en: "Secure administration.",
    ar: "إدارة آمنة.",
  },
  "Connexion administrateur": {
    en: "Administrator sign in",
    ar: "دخول المسؤول",
  },
  "Centre de contrôle.": { en: "Control center.", ar: "مركز التحكم." },
  Commandes: { en: "Orders", ar: "الطلبات" },
  Clients: { en: "Clients", ar: "العملاء" },
  Actualiser: { en: "Refresh", ar: "تحديث" },
  Quitter: { en: "Sign out", ar: "خروج" },
  "Enregistrer le contact": { en: "Save contact", ar: "حفظ جهة الاتصال" },
  Coordonnées: { en: "Contact details", ar: "بيانات الاتصال" },
  "Commander maintenant": { en: "Order now", ar: "اطلب الآن" },
};
const originals = new WeakMap<Text, string>();
export function LanguageSwitcher() {
  const [lang, setLang] = useState<Lang>("fr");
  useEffect(() => {
    const requested = new URLSearchParams(location.search).get(
      "lang",
    ) as Lang | null;
    setLang(
      requested && ["fr", "en", "ar"].includes(requested)
        ? requested
        : (localStorage.getItem("nfccardo_lang") as Lang) || "fr",
    );
  }, []);
  useEffect(() => {
    localStorage.setItem("nfccardo_lang", lang);
    document.documentElement.lang =
      lang === "ar" ? "ar-MA" : lang === "en" ? "en" : "fr-MA";
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    const translate = () => {
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
      );
      let node;
      while ((node = walker.nextNode())) {
        const text = node as Text;
        if (text.parentElement?.closest("[data-no-translate],script,style"))
          continue;
        if (!originals.has(text)) originals.set(text, text.nodeValue || "");
        const base = originals.get(text) || "",
          word = base.trim(),
          item = copy[word];
        const translated =
          lang === "fr" || !item ? base : base.replace(word, item[lang]);
        if (text.nodeValue !== translated) text.nodeValue = translated;
      }
    };
    translate();
    const observer = new MutationObserver(translate);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [lang]);
  return (
    <div
      data-no-translate
      className="fixed bottom-4 right-4 z-[100] flex items-center gap-1 rounded-full border border-white/15 bg-[#101116]/90 p-1.5 shadow-2xl backdrop-blur-xl"
    >
      <span className="grid h-8 w-8 place-items-center text-violet">
        <Languages size={16} />
      </span>
      {(["fr", "en", "ar"] as Lang[]).map((code) => (
        <button
          key={code}
          onClick={() => setLang(code)}
          className={`h-8 min-w-9 rounded-full px-2 text-[10px] font-bold uppercase transition ${lang === code ? "bg-white text-black" : "text-slate-400 hover:bg-white/10 hover:text-white"}`}
        >
          {code}
        </button>
      ))}
    </div>
  );
}
