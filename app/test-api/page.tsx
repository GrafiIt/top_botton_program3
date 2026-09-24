import { headers } from "next/headers"
import Link from "next/link"
import { decodeCompanyName } from "@/lib/hub"

export default async function TestApiPage() {
  const headerStore = await headers()
  const companyName = decodeCompanyName(headerStore.get("x-company-name"))
  const companyCode = headerStore.get("x-company-code") ?? "(없음)"
  const userLevel = headerStore.get("x-user-level") ?? "(없음)"

  return (
    <main className="min-h-screen bg-background px-6 py-16 text-foreground">
      <div className="mx-auto flex max-w-xl flex-col gap-6 rounded-2xl border border-border bg-card p-8">
        <div className="flex flex-col gap-2">
          <p className="font-mono text-xs uppercase tracking-widest text-primary">Header diagnostics</p>
          <h1 className="text-2xl font-semibold text-balance">통합 권한 헤더 진단</h1>
          <p className="text-sm leading-relaxed text-muted-foreground">이 경로는 미인증 상태에서도 열리며, 로그인된 경우 미들웨어가 주입한 값을 표시합니다.</p>
        </div>
        <dl className="grid gap-3 text-sm">
          <div className="flex justify-between gap-4 border-b border-border pb-3"><dt>회사명</dt><dd>{companyName || "(없음)"}</dd></div>
          <div className="flex justify-between gap-4 border-b border-border pb-3"><dt>회사코드</dt><dd className="font-mono">{companyCode}</dd></div>
          <div className="flex justify-between gap-4"><dt>사용자 등급</dt><dd className="font-mono">{userLevel}</dd></div>
        </dl>
        <Link href="/" className="text-sm font-medium text-primary hover:underline">랜딩으로 돌아가기</Link>
      </div>
    </main>
  )
}
