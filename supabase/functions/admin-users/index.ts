// Kelola akun pengguna. Hanya bisa dipanggil oleh super admin yang sedang login.
import { createClient } from "npm:@supabase/supabase-js@2"

const EMAIL_DOMAIN = "monitoring-qc.local"
const ROLES = ["admin", "qc"]

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

function reply(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  })
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors })
  if (req.method !== "POST") return reply(405, { error: "Metode tidak didukung" })

  const url = Deno.env.get("SUPABASE_URL")!
  const service = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false },
  })

  // Pastikan pemanggil adalah super admin yang aktif.
  const token = (req.headers.get("Authorization") ?? "").replace("Bearer ", "")
  const { data: auth } = await service.auth.getUser(token)
  if (!auth?.user) return reply(401, { error: "Silakan masuk lagi" })
  const { data: caller } = await service
    .from("profiles")
    .select("id, role, active")
    .eq("id", auth.user.id)
    .single()
  if (!caller || caller.role !== "super_admin" || !caller.active) {
    return reply(403, { error: "Hanya super admin yang bisa mengelola pengguna" })
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return reply(400, { error: "Data tidak valid" })
  }

  const action = String(body.action ?? "")

  if (action === "create") {
    const name = String(body.name ?? "").trim()
    const username = String(body.username ?? "").trim().toLowerCase()
    const role = String(body.role ?? "")
    const line = String(body.line ?? "").trim()
    const password = String(body.password ?? "")

    if (!name) return reply(400, { error: "Nama wajib diisi" })
    if (!/^[a-z0-9._]{3,}$/.test(username)) return reply(400, { error: "Username tidak valid" })
    if (!ROLES.includes(role)) return reply(400, { error: "Role tidak valid" })
    if (!line) return reply(400, { error: "Line wajib dipilih" })
    if (password.length < 6) return reply(400, { error: "Password minimal 6 karakter" })

    const { data: taken } = await service
      .from("profiles")
      .select("id")
      .eq("username", username)
      .maybeSingle()
    if (taken) return reply(409, { error: "Username ini sudah dipakai" })

    const { data: created, error } = await service.auth.admin.createUser({
      email: `${username}@${EMAIL_DOMAIN}`,
      password,
      email_confirm: true,
    })
    if (error || !created.user) return reply(400, { error: error?.message ?? "Gagal membuat akun" })

    const { data: profile, error: profileError } = await service
      .from("profiles")
      .insert({ id: created.user.id, name, username, role, line })
      .select()
      .single()
    if (profileError) {
      await service.auth.admin.deleteUser(created.user.id)
      return reply(400, { error: profileError.message })
    }
    return reply(200, { profile })
  }

  // Aksi berikut hanya untuk akun admin dan QC, bukan super admin.
  const userId = String(body.user_id ?? "")
  const { data: target } = await service
    .from("profiles")
    .select("id, role, name")
    .eq("id", userId)
    .maybeSingle()
  if (!target || !ROLES.includes(target.role)) return reply(404, { error: "Pengguna tidak ditemukan" })

  if (action === "set_password") {
    const password = String(body.password ?? "")
    if (password.length < 6) return reply(400, { error: "Password minimal 6 karakter" })
    const { error } = await service.auth.admin.updateUserById(userId, { password })
    if (error) return reply(400, { error: error.message })
    return reply(200, { ok: true })
  }

  if (action === "set_active") {
    const active = Boolean(body.active)
    if (!active && target.role === "qc") {
      const { count } = await service
        .from("tasks")
        .select("id", { count: "exact", head: true })
        .eq("assigned_to", userId)
        .neq("status", "selesai")
      if ((count ?? 0) > 0) {
        return reply(409, { error: `${target.name} masih punya ${count} tugas belum selesai` })
      }
    }
    const { error } = await service.auth.admin.updateUserById(userId, {
      ban_duration: active ? "none" : "876000h",
    })
    if (error) return reply(400, { error: error.message })
    await service.from("profiles").update({ active }).eq("id", userId)
    return reply(200, { ok: true })
  }

  return reply(400, { error: "Aksi tidak dikenal" })
})
