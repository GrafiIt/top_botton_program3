"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Edit, Trash2 } from "lucide-react"

async function verifyAuth(authId: string, authPs: string): Promise<boolean> {
  const { createClient } = await import("@/lib/supabase/client")
  const supabase = createClient()
  const { data, error } = await supabase
    .from("all_program_auths")
    .select("auth_id, auth_ps")
    .eq("company_code", "human")
    .eq("auth_id", authId)
    .eq("auth_ps", authPs)
    .maybeSingle()

  if (error || !data) return false
  return true
}

export function NoticeAdminPanel({ noticeId }: { noticeId: string }) {
  const router = useRouter()
  const [showAdminPanel, setShowAdminPanel] = useState(false)
  const [authId, setAuthId] = useState("")
  const [authPs, setAuthPs] = useState("")
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)

  const handleEditClick = async () => {
    if (!authId || !authPs) {
      alert("아이디와 비밀번호를 모두 입력해주세요.")
      return
    }
    setIsVerifying(true)
    const valid = await verifyAuth(authId, authPs)
    setIsVerifying(false)
    if (!valid) {
      alert("아이디 또는 비밀번호가 올바르지 않습니다.")
      return
    }
    router.push(`/notices/${noticeId}/edit?authId=${encodeURIComponent(authId)}&authPs=${encodeURIComponent(authPs)}`)
  }

  const handleDelete = async () => {
    if (!authId || !authPs) {
      alert("아이디와 비밀번호를 모두 입력해주세요.")
      return
    }
    setIsVerifying(true)
    const valid = await verifyAuth(authId, authPs)
    setIsVerifying(false)
    if (!valid) {
      alert("아이디 또는 비밀번호가 올바르지 않습니다.")
      setShowDeleteConfirm(false)
      return
    }

    try {
      const { createClient } = await import("@/lib/supabase/client")
      const supabase = createClient()
      const { error } = await supabase
        .schema("all_use_programs")
        .from("top_botton_program")
        .delete()
        .eq("id", noticeId)

      if (error) {
        alert("삭제 실패: " + error.message)
        return
      }

      alert("공지사항이 삭제되었습니다.")
      router.push("/")
    } catch {
      alert("삭제 중 오류가 발생했습니다.")
    }
  }

  return (
    <>
      {!showAdminPanel ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAdminPanel(true)}
          className="text-xs text-muted-foreground"
        >
          관리자 로그인
        </Button>
      ) : (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">관리자 기능</h3>
          <div className="space-y-2">
            <div>
              <Label htmlFor="admin-auth-id">아이디</Label>
              <Input
                id="admin-auth-id"
                type="text"
                placeholder="관리자 아이디"
                value={authId}
                onChange={(e) => setAuthId(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="admin-auth-ps">비밀번호</Label>
              <Input
                id="admin-auth-ps"
                type="password"
                placeholder="관리자 비밀번호"
                value={authPs}
                onChange={(e) => setAuthPs(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-4">
            <Button
              variant="outline"
              className="gap-2 bg-transparent"
              onClick={handleEditClick}
              disabled={!authId || !authPs || isVerifying}
            >
              <Edit className="w-4 h-4" />
              {isVerifying ? "확인 중..." : "수정"}
            </Button>
            <Button
              variant="destructive"
              className="gap-2"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={!authId || !authPs || isVerifying}
            >
              <Trash2 className="w-4 h-4" />
              삭제
            </Button>
            <Button variant="ghost" onClick={() => setShowAdminPanel(false)}>
              취소
            </Button>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>공지사항 삭제</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>정말로 이 공지사항을 삭제하시겠습니까?</p>
              <div className="flex gap-4">
                <Button variant="destructive" onClick={handleDelete} className="flex-1" disabled={isVerifying}>
                  {isVerifying ? "확인 중..." : "삭제"}
                </Button>
                <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} className="flex-1">
                  취소
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}
