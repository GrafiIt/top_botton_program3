/**
 * 환경에 따라 쿠키 도메인을 동적으로 반환한다.
 *
 * - localhost / *.localhost           → undefined (도메인 미지정, 현재 호스트에만 쿠키 저장)
 * - Vercel 프리뷰(*.vercel.app)        → undefined (v0/프리뷰 도메인은 .1004.help 공유 불가)
 * - 프로덕션(*.1004.help, 1004.help)   → ".1004.help" (부모/자식 사이트 세션 공유)
 * - 그 외 알 수 없는 호스트            → undefined (안전 기본값)
 *
 * `.1004.help` 로 도메인을 구우면 bestdriver.1004.help(부모)와
 * human-gw.1004.help(iframe) 가 동일한 로그인 세션 쿠키를 공유한다.
 */
export function getCookieDomain(hostname: string | null | undefined): string | undefined {
  if (!hostname) return undefined

  const host = hostname.split(":")[0].toLowerCase()

  if (host === "localhost" || host.endsWith(".localhost")) return undefined
  if (host.endsWith(".vercel.app")) return undefined
  if (host === "1004.help" || host.endsWith(".1004.help")) return ".1004.help"

  return undefined
}
