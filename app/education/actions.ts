"use server"

import { cookies } from "next/headers"

export interface CurrentUser {
  name: string
  email: string
  role: string
  user_level: number | string
}

export async function getCurrentUser(): Promise<CurrentUser> {
  const cookieStore = await cookies()
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ")

  const response = await fetch("https://payment.1004.help/api/v1/users/me", {
    method: "GET",
    headers: {
      Cookie: cookieHeader,
    },
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error("현재 사용자 정보를 불러오지 못했습니다.")
  }

  const payload = (await response.json()) as { user?: CurrentUser }
  if (!payload.user) {
    throw new Error("현재 사용자 정보를 확인할 수 없습니다.")
  }

  return payload.user
}
