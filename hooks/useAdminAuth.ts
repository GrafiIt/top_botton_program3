"use client"

import { useCallback, useEffect, useState } from "react"

export const ADMIN_AUTH_SESSION_KEY = "GLOBAL_ADMIN_AUTH_SESSION"

const ADMIN_AUTH_CHANGED_EVENT = "human-gw-admin-auth-changed"
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

function hasAdminSession() {
  return typeof window !== "undefined" && sessionStorage.getItem(ADMIN_AUTH_SESSION_KEY) === "authenticated"
}

function notifyAdminAuthChange() {
  window.dispatchEvent(new Event(ADMIN_AUTH_CHANGED_EVENT))
}

export function useAdminAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [credentials, setCredentials] = useState<AdminCredentials>(emptyCredentials)
  const [loginError, setLoginError] = useState("")

  const synchronizeAuthentication = useCallback(() => {
    setIsAuthenticated(hasAdminSession())
    setIsInitialized(true)
  }, [])

  useEffect(() => {
    synchronizeAuthentication()
    window.addEventListener(ADMIN_AUTH_CHANGED_EVENT, synchronizeAuthentication)
    window.addEventListener("storage", synchronizeAuthentication)

    return () => {
      window.removeEventListener(ADMIN_AUTH_CHANGED_EVENT, synchronizeAuthentication)
      window.removeEventListener("storage", synchronizeAuthentication)
    }
  }, [synchronizeAuthentication])

  const login = useCallback(() => {
    if (credentials.id !== ADMIN_ID || credentials.password !== ADMIN_PASSWORD) {
      setLoginError("아이디 또는 비밀번호가 올바르지 않습니다.")
      return false
    }

    sessionStorage.setItem(ADMIN_AUTH_SESSION_KEY, "authenticated")
    setCredentials(emptyCredentials)
    setLoginError("")
    setIsAuthenticated(true)
    notifyAdminAuthChange()
    return true
  }, [credentials])

  const logout = useCallback(() => {
    sessionStorage.removeItem(ADMIN_AUTH_SESSION_KEY)
    setCredentials(emptyCredentials)
    setLoginError("")
    setIsAuthenticated(false)
    notifyAdminAuthChange()
  }, [])

  return {
    isAuthenticated,
    isAdmin: isAuthenticated,
    isInitialized,
    credentials,
    loginError,
    setCredentials,
    login,
    logout,
    handleLogout: logout,
  }
}
