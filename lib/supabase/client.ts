import { createBrowserClient } from "@supabase/ssr"

const SUPABASE_URL = "https://kidpzmuebzhcejaxyndd.supabase.co"
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpZHB6bXVlYnpoY2VqYXh5bmRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3ODA4MzQsImV4cCI6MjA3NDM1NjgzNH0.pmVb1GSVSBQynU-fMrbmdqZsaGZ897DywrHCtyx4Xyg"

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || SUPABASE_ANON_KEY

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
