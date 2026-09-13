"use client";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
const slides = [
  {
    src: "/nfc-hero.png",
    alt: "Cartes NFCcardo premium noires",
    label: "La carte signature",
    fit: "object-contain",
  },
  {
    src: "/nfc-hero-v2.png",
    alt: "Cartes NFCcardo avec profil digital sur smartphone",
    label: "L’expérience digitale",
    fit: "object-cover",
  },
];
export function HeroSlider() {
  const [index, setIndex] = useState(0);
  const [start, setStart] = useState<number | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    timer.current = setInterval(
      () => setIndex((i) => (i + 1) % slides.length),
      5500,
    );
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, []);
  const go = (next: number) => setIndex((next + slides.length) % slides.length);
  return (
    <div
      className="relative min-h-[590px] lg:min-h-[700px]"
      onTouchStart={(e) => setStart(e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (
          start !== null &&
          Math.abs(e.changedTouches[0].clientX - start) > 45
        )
          go(index + (e.changedTouches[0].clientX < start ? 1 : -1));
        setStart(null);
      }}
    >
      <div className="absolute inset-4 overflow-hidden rounded-[38px] border border-white/10 bg-white/[.025] shadow-2xl lg:inset-8">
        <div className="absolute inset-0 bg-gradient-to-br from-violet/10 via-transparent to-indigo-500/5" />
        {slides.map((slide, i) => (
          <Image
            key={slide.src}
            src={slide.src}
            alt={slide.alt}
            fill
            priority={i === 0}
            className={`${slide.fit} transition duration-1000 ease-out ${i === index ? "scale-100 opacity-100" : "pointer-events-none scale-105 opacity-0"}`}
            sizes="(max-width:1024px) 100vw,60vw"
          />
        ))}
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/80 via-black/20 to-transparent p-5 pt-20">
          <div>
            <p className="text-[10px] uppercase tracking-[.2em] text-violet">
              0{index + 1} / 0{slides.length}
            </p>
            <p className="mt-1 text-sm font-medium">{slides[index].label}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => go(index - 1)}
              aria-label="Image précédente"
              className="grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-black/30 backdrop-blur-md transition hover:scale-105 hover:bg-white hover:text-black"
            >
              <ChevronLeft size={17} />
            </button>
            <button
              onClick={() => go(index + 1)}
              aria-label="Image suivante"
              className="grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-black/30 backdrop-blur-md transition hover:scale-105 hover:bg-white hover:text-black"
            >
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-1/2 flex -translate-x-1/2 gap-2">
        {slides.map((slide, i) => (
          <button
            key={slide.src}
            onClick={() => go(i)}
            aria-label={`Afficher ${slide.label}`}
            className={`h-1 rounded-full transition-all duration-500 ${i === index ? "w-9 bg-violet" : "w-3 bg-white/20"}`}
          />
        ))}
      </div>
    </div>
  );
}
