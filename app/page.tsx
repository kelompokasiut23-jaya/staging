"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  EyeIcon,
  EyeOffIcon,
  LoaderCircleIcon,
  ShieldCheckIcon,
} from "lucide-react"

import { homeOf } from "@/components/role-gate"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signIn, useAuth } from "@/lib/qc-store"

export default function LoginPage() {
  const router = useRouter()
  const auth = useAuth()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [show, setShow] = useState(false)
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)

  // Sudah masuk: langsung ke halaman sesuai role.
  useEffect(() => {
    if (auth.status === "signedIn") router.replace(homeOf(auth.user.role))
  }, [auth, router])

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    if (!username.trim() || !password) {
      setError("Isi username dan password")
      return
    }
    setBusy(true)
    setError("")
    const message = await signIn(username, password)
    if (message) {
      setError(message)
      setBusy(false)
    }
  }

  const notice = auth.status === "signedOut" ? auth.message : undefined
  const redirecting = auth.status === "signedIn"

  return (
    <main className="flex min-h-svh items-center justify-center bg-muted/40 p-4">
      <div className="grid w-full max-w-sm gap-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <ShieldCheckIcon className="size-5" />
          </div>
          <h1 className="text-xl font-semibold">Monitoring QC</h1>
          <p className="text-sm text-muted-foreground">
            Masuk dengan username dan password yang diberikan super admin.
          </p>
        </div>

        <Card>
          <CardContent>
            <form onSubmit={submit} noValidate className="grid gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  autoComplete="username"
                  autoCapitalize="none"
                  autoCorrect="off"
                  className="h-10"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={busy || redirecting}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={show ? "text" : "password"}
                    autoComplete="current-password"
                    className="h-10 pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={busy || redirecting}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="absolute top-1/2 right-1.5 -translate-y-1/2"
                    aria-label={
                      show ? "Sembunyikan password" : "Tampilkan password"
                    }
                    onClick={() => setShow((s) => !s)}
                  >
                    {show ? <EyeOffIcon /> : <EyeIcon />}
                  </Button>
                </div>
              </div>
              {(error || notice) && (
                <p role="alert" className="text-sm text-destructive">
                  {error || notice}
                </p>
              )}
              <Button type="submit" size="lg" disabled={busy || redirecting}>
                {(busy || redirecting) && (
                  <LoaderCircleIcon className="animate-spin" />
                )}
                {redirecting ? "Membuka halaman..." : "Masuk"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Belum punya akun atau lupa password? Hubungi super admin. Akun tidak
          bisa dibuat sendiri.
        </p>
      </div>
    </main>
  )
}
