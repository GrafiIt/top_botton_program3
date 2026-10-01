"use server"

import { headers } from "next/headers"

export interface CurrentUser {
  name: string
  email: string
  role: string
  user_level: number | string
}

export async function getCurrentUser(): Promise<CurrentUser> {
  const headerStore = await headers()
  const userLevel = headerStore.get("x-user-level") ?? ""
  const encodedName = headerStore.get("x-user-name") ?? ""
  const email = headerStore.get("x-user-email") ?? ""

  let name = "알 수 없음"
  if (encodedName) {
    try {
      name = decodeURIComponent(encodedName)
    } catch {
      name = encodedName
    }
  }

  return {
    name,
    email,
    role: "",
    user_level: userLevel,
  }
}
