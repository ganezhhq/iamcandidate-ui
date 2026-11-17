"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm, useWatch } from "react-hook-form"
import {
  AlertCircleIcon,
  BriefcaseBusinessIcon,
  CheckIcon,
  CopyIcon,
  FolderOpenIcon,
  Loader2Icon,
  MailIcon,
  SparklesIcon,
} from "lucide-react"
import { z } from "zod"

import { Brand, BrandName } from "@/components/layout/brand"
import { Field } from "@/components/shared/form"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { isApiMode } from "@/lib/api/config"
import { DEMO_CREDENTIALS } from "@/lib/mock"
import { RequestAccessButton } from "./request-access"
import { signIn, useSession } from "@/lib/store/session"
import { zodResolver } from "@/lib/utils/zod-resolver"

const schema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
})

type FormValues = z.infer<typeof schema>

export function LoginScreen() {
  const router = useRouter()
  const params = useSearchParams()
  const session = useSession()
  const next = params.get("next")
  const destination = next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard"
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const { register, handleSubmit, setValue, formState, control } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  })

  useEffect(() => {
    if (session && session !== "pending") router.replace(destination)
  }, [session, router, destination])

  const onSubmit = handleSubmit(async ({ email, password }) => {
    setError(null)
    try {
      await signIn(email, password)
      router.replace(destination)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Sign in failed")
    }
  })

  const fillDemo = () => {
    setValue("email", DEMO_CREDENTIALS.email, { shouldValidate: true })
    setValue("password", DEMO_CREDENTIALS.password, { shouldValidate: true })
    setCopied(true)
    setError(null)
  }

  const typedEmail = (useWatch({ control, name: "email" }) ?? "").trim()
  const pending = formState.isSubmitting

  return (
    <div className="pt-safe pb-safe px-safe grid grid-cols-1 min-h-dvh lg:grid-cols-[1fr_1.1fr]">
      <div className="flex flex-col px-6 py-8 sm:px-12">
        <Brand />
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Sign in to your personal command center.
          </p>

          <form onSubmit={onSubmit} noValidate className="mt-8 grid grid-cols-1 gap-4">
            {error && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive"
              >
                <AlertCircleIcon className="mt-0.5 size-4 shrink-0" />
                {error}
              </div>
            )}
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
            <Field label="Password" htmlFor="password" error={formState.errors.password?.message}>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                className="h-9"
                aria-invalid={!!formState.errors.password}
                {...register("password")}
              />
            </Field>
            <div className="flex items-center justify-between">
              <Label className="text-sm font-normal text-muted-foreground">
                <Checkbox defaultChecked /> Remember me
              </Label>
              {isApiMode ? (
                <Link
                  href={`/forgot-password${typedEmail ? `?email=${encodeURIComponent(typedEmail)}` : ""}`}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Forgot password?
                </Link>
              ) : (
                <button
                  type="button"
                  className="text-sm text-muted-foreground hover:text-foreground"
                  onClick={() => setError("Password reset isn't available in the demo.")}
                >
                  Forgot password?
                </button>
              )}
            </div>
            <Button type="submit" size="lg" className="mt-1 h-9" disabled={pending}>
              {pending && <Loader2Icon className="animate-spin" />}
              {pending ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <div className="mt-8 rounded-xl border bg-muted/40 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Demo account</p>
                <p className="mt-1.5 font-mono text-sm">{DEMO_CREDENTIALS.email}</p>
                <p className="font-mono text-sm">{DEMO_CREDENTIALS.password}</p>
              </div>
              <Button variant="outline" size="sm" onClick={fillDemo}>
                {copied ? <CheckIcon /> : <CopyIcon />}
                {copied ? "Filled" : "Use demo"}
              </Button>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">IamCandidate is in development. No account yet?</p>
            <RequestAccessButton variant="outline" size="sm" />
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <p>
            {isApiMode
              ? "Signed in to the IamCandidate API · ask your admin for an account."
              : "Frontend prototype · all data is mock and stays in your browser."}
          </p>
          <p className="flex gap-3">
            <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground">Terms</Link>
          </p>
        </div>
      </div>

      <div className="relative hidden overflow-hidden border-l bg-sidebar lg:block">
        <div
          aria-hidden
          className="absolute inset-0 [background-image:radial-gradient(var(--border)_1px,transparent_1px)] [background-size:20px_20px] opacity-70"
        />
        <div className="relative flex h-full flex-col justify-center px-14">
          <BrandName className="block text-sm font-semibold tracking-tight" />
          <h2 className="mt-3 max-w-md text-3xl font-semibold tracking-tight text-balance">
            Your job search, documents and knowledge — in one calm place.
          </h2>
          <div className="mt-10 grid grid-cols-1 max-w-md gap-3">
            {[
              { icon: BriefcaseBusinessIcon, title: "Application pipeline", text: "Kanban board from wishlist to offer" },
              { icon: MailIcon, title: "Outreach that scales", text: "Templates, referrals and follow-ups" },
              { icon: FolderOpenIcon, title: "Every document", text: "Resumes, certificates and Drive files" },
              { icon: SparklesIcon, title: "Knowledge base", text: "Notes, skills and bookmarks" },
            ].map((item) => (
              <div key={item.title} className="flex items-center gap-3 rounded-xl border bg-background/80 p-3 backdrop-blur">
                <span className="flex size-9 items-center justify-center rounded-lg border bg-background">
                  <item.icon className="size-4 text-muted-foreground" />
                </span>
                <div>
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
