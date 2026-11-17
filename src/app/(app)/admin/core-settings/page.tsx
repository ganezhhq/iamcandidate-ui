import type { Metadata } from "next"

import { CoreSettingsView } from "@/features/core-settings/core-settings-view"

export const metadata: Metadata = { title: "Core settings" }

export default function CoreSettingsPage() {
  return <CoreSettingsView />
}
