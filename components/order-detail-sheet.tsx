"use client"

import { useState } from "react"
import { toast } from "sonner"

import { Field } from "@/components/new-order-dialog"
import { LateBadge, PriorityBadge, StageBadge } from "@/components/order-badges"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  STAGES,
  daysUntil,
  formatDate,
  formatDateTime,
  formatNumber,
  isLate,
  progressPercent,
  stageLabel,
  type Order,
  type StageKey,
} from "@/lib/production"
import { updateProgress, useOrders, useToday } from "@/lib/store"

const STAGE_ITEMS = STAGES.map((s) => ({ value: s.key, label: s.label }))

export function OrderDetailSheet({
  orderId,
  onOpenChange,
}: {
  orderId: string | null
  onOpenChange: (open: boolean) => void
}) {
  const orders = useOrders()
  const today = useToday()
  const isMobile = useIsMobile()
  const order = orders.find((o) => o.id === orderId) ?? null

  return (
    <Sheet open={order !== null} onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className="data-[side=bottom]:max-h-[92dvh] data-[side=bottom]:rounded-t-xl data-[side=right]:sm:max-w-md"
      >
        {order && (
          <>
            <SheetHeader className="pr-12">
              <SheetTitle className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-sm">{order.id}</span>
                <StageBadge stage={order.stage} />
                {isLate(order, today) && <LateBadge />}
              </SheetTitle>
              <SheetDescription>
                {order.product} · {order.customer}
              </SheetDescription>
            </SheetHeader>

            <div className="flex-1 space-y-6 overflow-y-auto px-4 pb-6">
              <Summary order={order} today={today} />
              <UpdateForm
                key={`${order.id}:${order.history.length}`}
                order={order}
              />
              <Timeline order={order} />
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

function Summary({ order, today }: { order: Order; today: string }) {
  const percent = progressPercent(order)
  const remaining = daysUntil(order.dueDate, today)
  const done = order.stage === "selesai"

  let deadlineNote = ""
  if (!done) {
    if (remaining < 0) deadlineNote = `Lewat ${Math.abs(remaining)} hari`
    else if (remaining === 0) deadlineNote = "Hari ini"
    else deadlineNote = `${remaining} hari lagi`
  }

  return (
    <section className="space-y-3">
      <div className="space-y-1.5">
        <div className="flex items-baseline justify-between text-sm">
          <span className="text-muted-foreground">Sudah jadi</span>
          <span className="font-medium tabular-nums">
            {formatNumber(order.produced)} / {formatNumber(order.quantity)} unit
            ({percent}%)
          </span>
        </div>
        <Progress value={percent} aria-label="Progres pengerjaan" />
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
        <div>
          <dt className="text-xs text-muted-foreground">Batas waktu</dt>
          <dd className="font-medium">
            {formatDate(order.dueDate)}
            {deadlineNote && (
              <span className="block text-xs font-normal text-muted-foreground">
                {deadlineNote}
              </span>
            )}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Prioritas</dt>
          <dd className="mt-0.5">
            <PriorityBadge priority={order.priority} />
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Dicatat pada</dt>
          <dd className="font-medium">{formatDate(order.createdAt)}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Catatan</dt>
          <dd className="font-medium">{order.notes || "-"}</dd>
        </div>
      </dl>
    </section>
  )
}

function UpdateForm({ order }: { order: Order }) {
  const [stage, setStage] = useState<StageKey>(order.stage)
  const [produced, setProduced] = useState(String(order.produced))
  const [note, setNote] = useState("")
  const [error, setError] = useState("")

  function pickStage(next: StageKey) {
    setStage(next)
    if (next === "selesai") setProduced(String(order.quantity))
  }

  function submit(event: React.FormEvent) {
    event.preventDefault()
    const value = Number(produced)
    if (!Number.isInteger(value) || value < 0 || value > order.quantity) {
      setError(
        `Isi bilangan bulat antara 0 dan ${formatNumber(order.quantity)}`
      )
      return
    }
    if (stage === order.stage && value === order.produced && !note.trim()) {
      setError("Tidak ada perubahan untuk disimpan")
      return
    }
    updateProgress(order.id, { stage, produced: value, note })
    toast.success(`${order.id} diperbarui ke ${stageLabel(stage)}`)
  }

  return (
    <section className="space-y-3">
      <h3 className="text-sm font-medium">Perbarui kondisi terkini</h3>
      <form onSubmit={submit} className="grid gap-3" noValidate>
        <Field label="Tahap saat ini" htmlFor="update-stage">
          <Select
            value={stage}
            items={STAGE_ITEMS}
            onValueChange={(v) => v && pickStage(v as StageKey)}
          >
            <SelectTrigger id="update-stage" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STAGE_ITEMS.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field
          label="Jumlah yang sudah jadi (unit)"
          htmlFor="update-produced"
          error={error}
        >
          <Input
            id="update-produced"
            type="number"
            inputMode="numeric"
            min={0}
            max={order.quantity}
            value={produced}
            onChange={(e) => {
              setProduced(e.target.value)
              setError("")
            }}
            aria-invalid={!!error}
          />
        </Field>

        <Field label="Catatan (boleh dikosongkan)" htmlFor="update-note">
          <Textarea
            id="update-note"
            rows={2}
            placeholder="Contoh: mesin potong sempat berhenti 2 jam"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </Field>

        <Button type="submit">Simpan Perubahan</Button>
      </form>
    </section>
  )
}

function Timeline({ order }: { order: Order }) {
  const entries = [...order.history].reverse()

  return (
    <section className="space-y-3">
      <h3 className="text-sm font-medium">Riwayat</h3>
      <ol className="relative space-y-4 border-l pl-5">
        {entries.map((entry, index) => (
          <li key={entry.id} className="relative">
            <span
              className={
                "absolute top-1.5 -left-[25px] size-2 rounded-full " +
                (index === 0 ? "bg-primary" : "bg-border")
              }
            />
            <p className="text-sm font-medium">{stageLabel(entry.stage)}</p>
            <p className="text-xs text-muted-foreground">
              {formatDateTime(entry.at)} · {formatNumber(entry.produced)} unit
            </p>
            {entry.note && <p className="mt-0.5 text-sm">{entry.note}</p>}
          </li>
        ))}
      </ol>
    </section>
  )
}
