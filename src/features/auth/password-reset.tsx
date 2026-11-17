"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { AlertCircleIcon, ArrowLeftIcon, CheckCircle2Icon, Loader2Icon, MailCheckIcon } from "lucide-react"
import { z } from "zod"

import { Brand } from "@/components/layout/brand"
import { Field } from "@/components/shared/form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { authService } from "@/lib/services"
import { zodResolver } from "@/lib/utils/zod-resolver"

/** The narrow, centered column the login screen uses, without its side panel. */
function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="pt-safe pb-safe px-safe flex min-h-dvh flex-col px-6 py-8 sm:px-12">
      <Brand />
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">{children}</div>
    </div>
  )
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive"
    >
      <AlertCircleIcon className="mt-0.5 size-4 shrink-0" />
      {message}
    </div>
  )
}

function BackToSignIn() {
  return (
    <Link href="/login" className="mt-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
      <ArrowLeftIcon className="size-4" /> Back to sign in
    </Link>
  )
}

/* ---------------- Forgot password ---------------- */

const forgotSchema = z.object({ email: z.email("Enter a valid email address") })

export function ForgotPasswordScreen() {
  const params = useSearchParams()
  const [sentTo, setSentTo] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { register, handleSubmit, formState } = useForm<z.infer<typeof forgotSchema>>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: params.get("email") ?? "" },
  })

  const onSubmit = handleSubmit(async ({ email }) => {
    setError(null)
    try {
      await authService.forgotPassword(email.trim())
      setSentTo(email.trim())
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Couldn't send the reset email")
    }
  })

  if (sentTo) {
    return (
      <AuthShell>
        <MailCheckIcon className="size-8 text-muted-foreground" />
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">Check your email</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          If <span className="font-medium text-foreground">{sentTo}</span> has an account, we&apos;ve sent it a link to
          reset the password. The link works once, for 30 minutes. Check your spam folder if it doesn&apos;t arrive.
        </p>
        <BackToSignIn />
      </AuthShell>
    )
  }

  const pending = formState.isSubmitting
  return (
    <AuthShell>
      <h1 className="text-2xl font-semibold tracking-tight">Forgot your password?</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Enter the email you sign in with and we&apos;ll send you a link to choose a new password.
      </p>
      <form onSubmit={onSubmit} noValidate className="mt-8 grid grid-cols-1 gap-4">
        {error && <ErrorBanner message={error} />}
        <Field label="Email" htmlFor="email" error={formState.errors.email?.message}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className="h-9"
            aria-invalid={!!formState.errors.email}
            {...register("email")}
          />
        </Field>
        <Button type="submit" size="lg" className="mt-1 h-9" disabled={pending}>
          {pending && <Loader2Icon className="animate-spin" />}
          {pending ? "Sending…" : "Send reset link"}
        </Button>
      </form>
      <BackToSignIn />
    </AuthShell>
  )
}

/* ---------------- Reset password ---------------- */

const resetSchema = z
  .object({
    password: z.string().min(8, "Use at least 8 characters").max(200, "Use at most 200 characters"),
    confirm: z.string(),
  })
  .refine((values) => values.password === values.confirm, { path: ["confirm"], message: "Passwords don't match" })

export function ResetPasswordScreen() {
  const router = useRouter()
  const token = useSearchParams().get("token") ?? ""
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { register, handleSubmit, formState } = useForm<z.infer<typeof resetSchema>>({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: "", confirm: "" },
  })

  const onSubmit = handleSubmit(async ({ password }) => {
    setError(null)
    try {
      await authService.resetPassword(token, password)
      setDone(true)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Couldn't reset your password")
    }
  })

  if (!token) {
    return (
      <AuthShell>
        <h1 className="text-2xl font-semibold tracking-tight">Reset link missing</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Open the link from your reset email again, or ask for a new one.
        </p>
        <Button className="mt-6 h-9" onClick={() => router.push("/forgot-password")}>
          Send a new link
        </Button>
        <BackToSignIn />
      </AuthShell>
    )
  }

  if (done) {
    return (
      <AuthShell>
        <CheckCircle2Icon className="size-8 text-success" />
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">Password changed</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">You can now sign in with your new password.</p>
        <Button className="mt-6 h-9" onClick={() => router.replace("/login")}>
          Sign in
        </Button>
      </AuthShell>
    )
  }

  const pending = formState.isSubmitting
  return (
    <AuthShell>
      <h1 className="text-2xl font-semibold tracking-tight">Choose a new password</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">Use at least 8 characters.</p>
      <form onSubmit={onSubmit} noValidate className="mt-8 grid grid-cols-1 gap-4">
        {error && (
          <div className="grid grid-cols-1 gap-2">
            <ErrorBanner message={error} />
            <Link href="/forgot-password" className="text-sm font-medium underline-offset-4 hover:underline">
              Send a new reset link
            </Link>
          </div>
        )}
        <Field label="New password" htmlFor="password" error={formState.errors.password?.message}>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            className="h-9"
            aria-invalid={!!formState.errors.password}
            {...register("password")}
          />
        </Field>
        <Field label="Confirm new password" htmlFor="confirm" error={formState.errors.confirm?.message}>
          <Input
            id="confirm"
            type="password"
            autoComplete="new-password"
            className="h-9"
            aria-invalid={!!formState.errors.confirm}
            {...register("confirm")}
          />
        </Field>
        <Button type="submit" size="lg" className="mt-1 h-9" disabled={pending}>
          {pending && <Loader2Icon className="animate-spin" />}
          {pending ? "Saving…" : "Set new password"}
        </Button>
      </form>
      <BackToSignIn />
    </AuthShell>
  )
}
