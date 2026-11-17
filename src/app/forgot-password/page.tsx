import type { Metadata } from "next"
import { Suspense } from "react"

import { ForgotPasswordScreen } from "@/features/auth/password-reset"

export const metadata: Metadata = { title: "Forgot password" }

export default function ForgotPasswordPage() {
  return (
    <Suspense>
      <ForgotPasswordScreen />
    </Suspense>
  )
}
