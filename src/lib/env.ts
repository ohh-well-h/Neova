const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? '';
const webCheckoutUrl = process.env.EXPO_PUBLIC_WEB_CHECKOUT_URL?.trim() ?? '';

export const env = {
  supabaseUrl,
  supabaseAnonKey,
  webCheckoutUrl,
  isSupabaseConfigured: Boolean(supabaseUrl && supabaseAnonKey),
  isWebCheckoutConfigured: Boolean(webCheckoutUrl),
} as const;
