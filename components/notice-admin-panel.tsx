"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Edit, Trash2 } from "lucide-react"

export function NoticeAdminPanel({ noticeId }: { noticeId: string }) {
  const router = useRouter()
  const [showAdminPanel, setShowAdminPanel] = useState(false)
  const [password, setPassword] = useState("")
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleDelete = async () => {
    if (!password) {
      alert("관리자 비밀번호를 입력해주세요.")
      return
    }

    if (password !== "ener1004@") {
      alert("비밀번호가 올바르지 않습니다.")
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
          <input
            type="password"
            placeholder="관리자 비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
          />
          <div className="flex gap-4">
            <Button
              variant="outline"
              className="gap-2 bg-transparent"
              onClick={() => router.push(`/notices/${noticeId}/edit?password=${password}`)}
              disabled={!password}
            >
              <Edit className="w-4 h-4" />
              수정
            </Button>
            <Button
              variant="destructive"
              className="gap-2"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={!password}
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
                <Button variant="destructive" onClick={handleDelete} className="flex-1">
                  삭제
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
