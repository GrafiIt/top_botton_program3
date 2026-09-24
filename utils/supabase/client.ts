import { createBrowserClient } from "@supabase/ssr"
import { getCookieDomain } from "./cookie-domain"

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

  // 브라우저에서 세션 쿠키를 .1004.help 도메인에 구워
  // 부모(bestdriver) 사이트와 iframe(human-gw) 사이에서 로그인 세션을 공유한다.
  const cookieDomain = typeof window !== "undefined" ? getCookieDomain(window.location.hostname) : undefined

  client = createBrowserClient(supabaseUrl, supabaseKey, {
    cookieOptions: {
      domain: cookieDomain,
      path: "/",
      sameSite: "lax",
      secure: cookieDomain !== undefined,
    },
  })
  return client
}
