import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('placeholder')) {
  console.error('Missing Supabase env vars. The app will not work.')
  const el = document.createElement('div')
  el.style.cssText = 'position:fixed;top:0;left:0;right:0;background:red;color:white;padding:16px;z-index:9999;font-size:14px;text-align:center'
  el.textContent = '❌ Supabase not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel environment variables and redeploy.'
  document.body.prepend(el)
}

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co',
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key',
)
