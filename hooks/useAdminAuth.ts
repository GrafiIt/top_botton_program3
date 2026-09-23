"use client"

import { useCallback, useEffect, useState } from "react"

export const ADMIN_AUTH_SESSION_KEY = "__HUMAN_GW_ADMIN_AUTH_SESSION_KEY_1024__"

const ADMIN_ID = "human"
const ADMIN_PASSWORD = "1024"

type AdminCredentials = {
  id: string
  password: string
}

const emptyCredentials: AdminCredentials = {
  id: "",
  password: "",
}

export function useAdminAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [credentials, setCredentials] = useState<AdminCredentials>(emptyCredentials)
  const [loginError, setLoginError] = useState("")

  useEffect(() => {
    setIsAuthenticated(sessionStorage.getItem(ADMIN_AUTH_SESSION_KEY) === "authenticated")
    setIsInitialized(true)
  }, [])

  const login = useCallback(() => {
    if (credentials.id !== ADMIN_ID || credentials.password !== ADMIN_PASSWORD) {
      setLoginError("아이디 또는 비밀번호가 올바르지 않습니다.")
      return false
    }

    sessionStorage.setItem(ADMIN_AUTH_SESSION_KEY, "authenticated")
    setCredentials(emptyCredentials)
    setLoginError("")
    setIsAuthenticated(true)
    return true
  }, [credentials])

  const logout = useCallback(() => {
    sessionStorage.removeItem(ADMIN_AUTH_SESSION_KEY)
    setCredentials(emptyCredentials)
    setLoginError("")
    setIsAuthenticated(false)
  }, [])

  return {
    isAuthenticated,
    isInitialized,
    credentials,
    loginError,
    setCredentials,
    login,
    logout,
  }
}
