import {createClient} from "@supabase/supabase-js";
const url=process.env.NEXT_PUBLIC_SUPABASE_URL;const anon=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const isSupabaseConfigured=Boolean(url&&anon);
export function getSupabaseBrowser(){if(!url||!anon)throw new Error("Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");return createClient(url,anon,{auth:{persistSession:true,autoRefreshToken:true}})}
export function getSupabaseAdmin(){const service=process.env.SUPABASE_SERVICE_ROLE_KEY;if(!url||!service)throw new Error("Supabase server credentials are missing.");return createClient(url,service,{auth:{persistSession:false,autoRefreshToken:false}})}
