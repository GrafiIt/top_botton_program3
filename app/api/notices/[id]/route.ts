import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    if (id === "new" || id === "login") {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const supabase = await createClient()

    const { data, error } = await supabase.schema("all_use_programs").from("top_botton_program").select("*").eq("id", id).single()

    if (error) throw error

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: "Failed to fetch notice" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    if (id === "new" || id === "login") {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const body = await request.json()
    const { title, content, images, attachments, adminPassword } = body

    if (adminPassword !== "ener1004@") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .schema("all_use_programs")
      .from("top_botton_program")
      .update({
        title,
        content,
        images,
        attachments,
      })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: "Failed to update notice" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    if (id === "new" || id === "login") {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const body = await request.json()
    const { adminPassword } = body

    if (adminPassword !== "ener1004@") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = await createClient()

    const { error } = await supabase.schema("all_use_programs").from("top_botton_program").delete().eq("id", id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Failed to delete notice" }, { status: 500 })
  }
}
