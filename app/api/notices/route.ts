import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase.schema("all_use_programs").from("top_botton_program").select("*").order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json(data || [])
  } catch {
    return NextResponse.json([])
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, content, images, attachments, adminPassword } = body

    // 간단한 관리자 인증 (실제로는 더 안전한 방법 권장)
    if (adminPassword !== "ener1004@") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .schema("all_use_programs")
      .from("top_botton_program")
      .insert({
        title,
        content,
        images: images || [],
        attachments: attachments || [],
      })
      .select()
      .single()

    console.log("[v0] POST result - data:", data, "error:", error)
    if (error) throw error

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: "Failed to create notice" }, { status: 500 })
  }
}
