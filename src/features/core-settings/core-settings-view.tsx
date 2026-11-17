"use client"

import { useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import {
  CheckCircle2Icon,
  EyeIcon,
  EyeOffIcon,
  Loader2Icon,
  PlugZapIcon,
  SaveIcon,
  SendIcon,
  ShieldIcon,
  XCircleIcon,
} from "lucide-react"
import { toast } from "sonner"
import { z } from "zod"

import { EmptyState, ErrorState } from "@/components/shared/empty-state"
import { Field, SimpleSelect } from "@/components/shared/form"
import { PageHeader } from "@/components/shared/page-header"
import { Panel } from "@/components/shared/panel"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { coreSettingsService } from "@/lib/services"
import { useIsAdmin, useSession } from "@/lib/store/session"
import type { CoreMailConfig } from "@/lib/types"
import { timeAgo } from "@/lib/utils/dates"
import { zodResolver } from "@/lib/utils/zod-resolver"

export function CoreSettingsView() {
  const isAdmin = useIsAdmin()
  if (!isAdmin) {
    return (
      <EmptyState
        icon={ShieldIcon}
        title="Admins only"
        description="Core settings are available to admins when the app runs against the API backend."
      />
    )
  }
  return (
    <div>
      <PageHeader
        title="Core settings"
        description="System-wide configuration for every account. Only admins can see or change these."
      />
      <div className="grid grid-cols-1 gap-6">
        <MailSettings />
      </div>
    </div>
  )
}

/* ---------------- Mail ---------------- */

function MailSettings() {
  const [config, setConfig] = useState<CoreMailConfig | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    coreSettingsService
      .getMail()
      .then((loaded) => !cancelled && setConfig(loaded))
      .catch((caught: unknown) => !cancelled && setError(caught instanceof Error ? caught.message : "Couldn't load mail settings"))
    return () => {
      cancelled = true
    }
  }, [attempt])

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={() => {
          setError(null)
          setAttempt((n) => n + 1)
        }}
      />
    )
  }
  if (!config) {
    return (
      <Panel title="Mail">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 8 }, (_, i) => (
            <Skeleton key={i} className="h-14" />
          ))}
        </div>
      </Panel>
    )
  }
  return (
    <>
      <MailForm config={config} onSaved={setConfig} />
      <SendTestMail configured={Boolean(config.hasPassword)} />
    </>
  )
}

/** With a password already saved on the server, leaving the field blank keeps it. */
const buildSchema = (hasSavedPassword: boolean) =>
  z.object({
    host: z
      .string()
      .trim()
      .min(1, "Host is required")
      .refine((host) => !host.includes("@"), "Enter the mail server, e.g. smtp.gmail.com — not an email address")
      .refine((host) => /^[a-z0-9.-]+$/i.test(host), "Enter a host name, e.g. smtp.gmail.com"),
    port: z.string().regex(/^\d{2,5}$/, "Enter a valid port"),
    username: z.string().trim().min(1, "Username is required"),
    password: hasSavedPassword ? z.string() : z.string().min(1, "Password is required"),
    encryption: z.enum(["tls", "ssl", "none"]),
    senderName: z.string().trim().min(1, "Sender name is required"),
    senderEmail: z.email("Enter a valid email"),
    appUrl: z
      .string()
      .trim()
      .regex(/^https?:\/\/[^\s/]+(\/[^\s]*)?$/i, "Enter the app's address, e.g. https://app.example.com"),
  })

type FormValues = z.infer<ReturnType<typeof buildSchema>>

const toConfig = (values: FormValues): CoreMailConfig => ({
  ...values,
  port: Number(values.port),
  appUrl: values.appUrl.replace(/\/+$/, ""),
})

type TestState =
  | { status: "idle" }
  | { status: "testing" }
  | { status: "ok"; latencyMs: number }
  | { status: "error"; message: string }

function MailForm({ config, onSaved }: { config: CoreMailConfig; onSaved: (next: CoreMailConfig) => void }) {
  const [showPassword, setShowPassword] = useState(false)
  const [test, setTest] = useState<TestState>({ status: "idle" })
  const [saving, setSaving] = useState(false)

  const hasSavedPassword = Boolean(config.hasPassword)
  const { register, control, handleSubmit, formState, getValues, trigger, reset } = useForm<FormValues>({
    resolver: zodResolver(buildSchema(hasSavedPassword)),
    defaultValues: {
      host: config.host,
      port: String(config.port),
      username: config.username,
      password: "",
      encryption: config.encryption,
      senderName: config.senderName,
      senderEmail: config.senderEmail,
      appUrl: config.appUrl,
    },
  })
  const errors = formState.errors

  const onSave = handleSubmit(async (values) => {
    setSaving(true)
    try {
      const next = await coreSettingsService.saveMail(toConfig(values))
      onSaved(next)
      // The server never returns the password, so clear it from the form too.
      reset({ ...values, password: "" })
      toast.success("Mail settings saved")
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Couldn't save mail settings")
    } finally {
      setSaving(false)
    }
  })

  const onTest = async () => {
    if (!(await trigger())) return
    setTest({ status: "testing" })
    try {
      const result = await coreSettingsService.testMail(toConfig(getValues()))
      setTest({ status: "ok", latencyMs: result.latencyMs })
    } catch (caught) {
      setTest({ status: "error", message: caught instanceof Error ? caught.message : "Connection failed" })
    }
  }

  return (
    <form onSubmit={onSave} noValidate>
      <Panel
        title="Mail"
        description="The system mailbox for account emails, such as password reset links. For Gmail or Outlook use an app password, not your normal one."
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_8rem]">
          <Field label="SMTP host" htmlFor="core-smtp-host" error={errors.host?.message}>
            <Input id="core-smtp-host" autoComplete="off" placeholder="smtp.gmail.com" aria-invalid={!!errors.host} {...register("host")} />
          </Field>
          <Field label="Port" htmlFor="core-smtp-port" error={errors.port?.message}>
            <Input id="core-smtp-port" inputMode="numeric" aria-invalid={!!errors.port} {...register("port")} />
          </Field>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Username" htmlFor="core-smtp-user" error={errors.username?.message}>
            <Input id="core-smtp-user" autoComplete="off" aria-invalid={!!errors.username} {...register("username")} />
          </Field>
          <Field label="Password" htmlFor="core-smtp-pass" error={errors.password?.message}>
            <div className="relative">
              <Input
                id="core-smtp-pass"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder={hasSavedPassword ? "Saved — leave blank to keep" : undefined}
                className="pr-9"
                aria-invalid={!!errors.password}
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
              </button>
            </div>
          </Field>
          <Field label="Encryption">
            <Controller
              control={control}
              name="encryption"
              render={({ field }) => (
                <SimpleSelect
                  value={field.value}
                  onValueChange={field.onChange}
                  options={[
                    { value: "tls", label: "STARTTLS (recommended)" },
                    { value: "ssl", label: "SSL/TLS" },
                    { value: "none", label: "None" },
                  ]}
                />
              )}
            />
          </Field>
          <div />
          <Field label="Sender name" htmlFor="core-smtp-name" error={errors.senderName?.message}>
            <Input id="core-smtp-name" aria-invalid={!!errors.senderName} {...register("senderName")} />
          </Field>
          <Field label="Sender email" htmlFor="core-smtp-from" error={errors.senderEmail?.message}>
            <Input id="core-smtp-from" type="email" aria-invalid={!!errors.senderEmail} {...register("senderEmail")} />
          </Field>
          <Field
            label="App URL"
            htmlFor="core-app-url"
            className="sm:col-span-2"
            hint="This app's address. Links in emails (like password resets) point here."
            error={errors.appUrl?.message}
          >
            <Input id="core-app-url" type="url" placeholder="https://app.example.com" aria-invalid={!!errors.appUrl} {...register("appUrl")} />
          </Field>
        </div>

        {test.status !== "idle" && (
          <div
            role="status"
            className={
              test.status === "error"
                ? "mt-5 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive"
                : test.status === "ok"
                  ? "mt-5 flex items-start gap-2 rounded-lg border border-success/30 bg-success/10 px-3 py-2.5 text-sm"
                  : "mt-5 flex items-start gap-2 rounded-lg border px-3 py-2.5 text-sm text-muted-foreground"
            }
          >
            {test.status === "testing" && <><Loader2Icon className="mt-0.5 size-4 animate-spin" /> Connecting to {getValues("host")}:{getValues("port")}…</>}
            {test.status === "ok" && <><CheckCircle2Icon className="mt-0.5 size-4 text-success" /> SMTP connection successful. Server responded in {test.latencyMs} ms.</>}
            {test.status === "error" && <><XCircleIcon className="mt-0.5 size-4" /> {test.message}</>}
          </div>
        )}

        <div className="mt-5 flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:items-center">
          <p className="text-xs text-muted-foreground sm:mr-auto">
            {!hasSavedPassword
              ? "Not set up — password reset emails can't be sent yet"
              : config.lastTestedAt
                ? `Last tested ${timeAgo(config.lastTestedAt)}`
                : "Saved · never tested"}
          </p>
          <Button type="button" variant="outline" onClick={onTest} disabled={test.status === "testing"}>
            {test.status === "testing" ? <Loader2Icon className="animate-spin" /> : <PlugZapIcon />}
            {test.status === "testing" ? "Testing…" : "Test connection"}
          </Button>
          <Button type="submit" disabled={saving || !formState.isDirty}>
            {saving ? <Loader2Icon className="animate-spin" /> : <SaveIcon />}
            {saving ? "Saving…" : "Save mail settings"}
          </Button>
        </div>
      </Panel>
    </form>
  )
}

function SendTestMail({ configured }: { configured: boolean }) {
  const session = useSession()
  const ownEmail = session && session !== "pending" ? session.email : ""
  const [to, setTo] = useState(ownEmail)
  const [sending, setSending] = useState(false)
  const valid = z.email().safeParse(to.trim()).success

  const onSend = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!valid) return
    setSending(true)
    try {
      await coreSettingsService.sendTestMail(to.trim())
      toast.success(`Test email sent to ${to.trim()}`)
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Couldn't send the test email")
    } finally {
      setSending(false)
    }
  }

  return (
    <form onSubmit={onSend} noValidate>
      <Panel
        title="Send a test email"
        description={configured ? "Sends a real message with the saved mail settings." : "Save the mail settings first."}
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <Field label="Send to" htmlFor="core-test-to" className="flex-1">
            <Input id="core-test-to" type="email" value={to} onChange={(event) => setTo(event.target.value)} />
          </Field>
          <Button type="submit" variant="outline" disabled={!configured || !valid || sending}>
            {sending ? <Loader2Icon className="animate-spin" /> : <SendIcon />}
            {sending ? "Sending…" : "Send test email"}
          </Button>
        </div>
      </Panel>
    </form>
  )
}
