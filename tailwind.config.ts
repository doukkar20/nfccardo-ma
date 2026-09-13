import type { Config } from "tailwindcss";
export default { content:["./app/**/*.{js,ts,jsx,tsx}","./components/**/*.{js,ts,jsx,tsx}"], theme:{extend:{colors:{ink:"#08090c",surface:"#111318",violet:"#7c5cff"},fontFamily:{sans:["var(--font-geist)","system-ui","sans-serif"]},boxShadow:{glow:"0 0 60px rgba(124,92,255,.2)"}}},plugins:[] } satisfies Config;
