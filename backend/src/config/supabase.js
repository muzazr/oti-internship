import { createClient } from "@supabase/supabase-js"
import { env } from "./env.js"

console.log("SUPABASE_URL:", env.SUPABASE_URL)
console.log("SERVICE ROLE EXISTS:", !!env.SUPABASE_SERVICE_ROLE_KEY)
console.log("SERVICE ROLE PREFIX:", env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 20))

export const supabaseAdmin =
    env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY
        ? createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        })
        : null