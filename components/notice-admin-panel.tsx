"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Edit, Trash2 } from "lucide-react"
import { useAdminAuth } from "@/hooks/useAdminAuth"

export function NoticeAdminPanel({ noticeId }: { noticeId: string }) {
  const router = useRouter()
  const { isAdmin, isInitialized } = useAdminAuth()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  if (!isInitialized || !isAdmin) return null

  const handleDelete = async () => {
    setIsDeleting(true)
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
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <div className="flex gap-2">
        <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => router.push(`/notices/${noticeId}/edit`)}>
          <Edit className="size-4" />
          수정
        </Button>
        <Button type="button" variant="destructive" size="sm" className="gap-2" onClick={() => setShowDeleteConfirm(true)}>
          <Trash2 className="size-4" />
          삭제
        </Button>
      </div>

      {showDeleteConfirm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>공지사항 삭제</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <p>정말로 이 공지사항을 삭제하시겠습니까?</p>
              <div className="flex gap-4">
                <Button variant="destructive" onClick={handleDelete} className="flex-1" disabled={isDeleting}>
                  {isDeleting ? "삭제 중..." : "삭제"}
                </Button>
                <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} className="flex-1">
                  취소
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </>
  )
}
