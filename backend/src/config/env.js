import dotenv from "dotenv"

dotenv.config()

export const env = {
    PORT: process.env.PORT || 4000,

    WHATSAPP_VERIFY_TOKEN:
        process.env.WHATSAPP_VERIFY_TOKEN || "tugasbot_verify_123",

    WHATSAPP_ACCESS_TOKEN: process.env.WHATSAPP_ACCESS_TOKEN,
    WHATSAPP_PHONE_NUMBER_ID: process.env.WHATSAPP_PHONE_NUMBER_ID,
    WHATSAPP_BUSINESS_ACCOUNT_ID: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID,
    META_GRAPH_API_VERSION: process.env.META_GRAPH_API_VERSION || "v25.0",

    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,

    FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",
}