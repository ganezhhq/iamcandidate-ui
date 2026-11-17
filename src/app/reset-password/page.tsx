import type { Metadata } from "next"
import { Suspense } from "react"

import { ResetPasswordScreen } from "@/features/auth/password-reset"

/** The reset token is in the URL, so never send it on as a referrer. */
export const metadata: Metadata = { title: "Reset password", referrer: "no-referrer" }

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordScreen />
    </Suspense>
  )
}
