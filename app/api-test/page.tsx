import { cookies } from "next/headers"

const PROGRAM_ID = "human-gw"
const VERIFY_API_BASE = "https://payment.1004.help/api/v1/verify-permission"

export default async function ServerApiTestPage() {
  let apiData: Record<string, unknown> | null = null
  let fetchError: string | null = null

  try {
    // Next.js 최신 규격에 맞게 await 사용
    const cookieStore = await cookies()
    const cookieString = cookieStore
      .getAll()
      .map((c) => `${c.name}=${c.value}`)
      .join("; ")

    const verifyUrl = `${VERIFY_API_BASE}?program_id=${PROGRAM_ID}&_t=${Date.now()}`
    const res = await fetch(verifyUrl, {
      method: "GET",
      headers: { Cookie: cookieString },
      cache: "no-store",
    })

    if (!res.ok) {
      fetchError = `HTTP 에러: ${res.status} ${res.statusText}`
    } else {
      apiData = await res.json()
    }
  } catch (err: unknown) {
    fetchError = err instanceof Error ? err.message : "알 수 없는 오류"
  }

  return (
    <div className="min-h-screen bg-slate-900 p-8 font-mono text-sm text-slate-300">
      <h1 className="mb-2 text-xl font-bold text-white">서버 사이드 API 검증 (CORS 우회 완벽 구현)</h1>
      <p className="mb-6 text-emerald-400">
        이 화면은 middleware.ts와 100% 동일한 환경(서버)에서 통신한 원본 데이터입니다.
      </p>

      <div className="overflow-x-auto rounded-xl border border-slate-700 bg-black p-6">
        {fetchError ? (
          <p className="text-red-500">{fetchError}</p>
        ) : (
          <pre className="text-emerald-300">{JSON.stringify(apiData, null, 2)}</pre>
        )}
      </div>
    </div>
  )
}
