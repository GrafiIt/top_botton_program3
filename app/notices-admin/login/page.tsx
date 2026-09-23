"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Lock, User } from "lucide-react"
import { useAdminAuth } from "@/hooks/useAdminAuth"

export default function AdminLoginPage() {
  const router = useRouter()
  const { isAuthenticated, isInitialized, credentials, setCredentials, login, loginError } = useAdminAuth()

  useEffect(() => {
    if (isInitialized && isAuthenticated) router.replace("/notices-admin/new")
  }, [isAuthenticated, isInitialized, router])

  if (!isInitialized) {
    return <main className="flex min-h-dvh items-center justify-center bg-background" aria-busy="true"><span className="sr-only">관리자 인증 상태를 확인하는 중입니다.</span></main>
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">관리자 로그인</CardTitle>
          <CardDescription>공지사항을 작성하려면 관리자 로그인이 필요합니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(event) => { event.preventDefault(); if (login()) router.push("/notices-admin/new") }} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="username">아이디</Label>
              <div className="relative"><User className="absolute left-3 top-3 size-4 text-muted-foreground" aria-hidden="true" /><Input id="username" type="text" placeholder="관리자 아이디" autoComplete="username" value={credentials.id} onChange={(event) => setCredentials((current) => ({ ...current, id: event.target.value }))} className="pl-10" required /></div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">비밀번호</Label>
              <div className="relative"><Lock className="absolute left-3 top-3 size-4 text-muted-foreground" aria-hidden="true" /><Input id="password" type="password" placeholder="비밀번호" autoComplete="current-password" value={credentials.password} onChange={(event) => setCredentials((current) => ({ ...current, password: event.target.value }))} className="pl-10" required /></div>
            </div>
            {loginError ? <p className="text-center text-sm text-destructive" role="alert">{loginError}</p> : null}
            <Button type="submit" className="w-full">로그인</Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
