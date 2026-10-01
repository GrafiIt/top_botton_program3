import { cookies } from "next/headers"

const USERS_ME_API_URL = "https://payment.1004.help/api/v1/users/me"

export default async function TestUserPage() {
  let statusCode = 0
  let statusText = ""
  let responseBody = ""
  let fetchError: string | null = null

  try {
    const cookieStore = await cookies()
    const cookieString = cookieStore
      .getAll()
      .map((c) => `${c.name}=${c.value}`)
      .join("; ")

    const res = await fetch(USERS_ME_API_URL, {
      method: "GET",
      headers: {
        Cookie: cookieString,
      },
      cache: "no-store",
    })

    statusCode = res.status
    statusText = res.statusText
    responseBody = await res.text()
  } catch (err: unknown) {
    fetchError = err instanceof Error ? err.message : "알 수 없는 오류"
  }

  return (
    <div className="min-h-screen bg-slate-900 p-8 font-mono text-sm text-slate-300">
      <h1 className="mb-2 text-xl font-bold text-white">서버 사이드 users/me API 디버깅</h1>
      <p className="mb-6 text-emerald-400">
        서버(Server Component)에서 payment.1004.help/api/v1/users/me 호출 원본 결과입니다.
      </p>

      {fetchError && (
        <div className="mb-6 rounded-xl border border-red-700 bg-red-950/40 p-4 text-red-400">
          <p className="font-semibold">요청 에러:</p>
          <pre className="mt-1 whitespace-pre-wrap">{fetchError}</pre>
        </div>
      )}

      <div className="flex flex-col gap-6">
        <div className="rounded-xl border border-slate-700 bg-black p-6">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            HTTP 상태 코드
          </h2>
          <pre className={statusCode >= 200 && statusCode < 300 ? "text-emerald-400" : "text-amber-400 font-bold"}>
            {statusCode ? `${statusCode} ${statusText}` : "상태 코드 없음"}
          </pre>
        </div>

        <div className="rounded-xl border border-slate-700 bg-black p-6">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            원본 응답 본문 (Raw Body)
          </h2>
          <pre className="whitespace-pre-wrap break-all text-slate-200">
            {responseBody || "(응답 본문이 비어 있습니다)"}
          </pre>
        </div>
      </div>
    </div>
  )
}
