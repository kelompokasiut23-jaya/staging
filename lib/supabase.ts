import { createClient } from "@supabase/supabase-js"

// Alamat dan kunci publik project Supabase. Kunci ini memang boleh ada di
// aplikasi; data tetap dilindungi aturan akses (Row Level Security) di database.
export const SUPABASE_URL = "https://vqbbwjtxytxtejwcekwx.supabase.co"
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxYmJ3anR4eXR4dGVqd2Nla3d4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA4Mzc4NzQsImV4cCI6MjEwNjQxMzg3NH0.KpE0aPSsEL6ImaM9U9m2H_OI2F3WErILDLK2Mq_swt4"

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

/** Username diubah menjadi alamat email internal untuk login. */
export function usernameToEmail(username: string) {
  return `${username.trim().toLowerCase()}@monitoring-qc.local`
}
