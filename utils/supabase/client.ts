import { createBrowserClient } from "@supabase/ssr"

let client: ReturnType<typeof createBrowserClient> | undefined

export function createClient() {
  if (client) return client

  const supabaseUrl = process.env.NEXT_PUBLIC_GRAFISUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey =
    process.env.NEXT_PUBLIC_GRAFISUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_GRAFISUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase 공개 환경 변수가 설정되지 않았습니다.")
  }

  client = createBrowserClient(supabaseUrl, supabaseKey)
  return client
}
