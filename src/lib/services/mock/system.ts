import { DEMO_CREDENTIALS } from "@/lib/mock"
import type {
  AccessRequest,
  Activity,
  AppUser,
  AutofillProfile,
  CoreMailConfig,
  Integration,
  IntegrationId,
  NotificationPreferences,
  Session,
  UserProfile,
} from "@/lib/types"
import { EMPTY_AUTOFILL } from "@/lib/autofill"
import { delay, networkDelay } from "@/lib/utils/delay"
import { createId } from "@/lib/utils/id"

import type {
  ActivityService,
  AuthService,
  CoreSettingsService,
  IntegrationService,
  SettingsService,
  UserService,
} from "../contracts"
import { collection, logActivity, NotFoundError, read, resetDatabase, write } from "./db"

const integrations = collection("integrations")

export class MockAuthService implements AuthService {
  async login(email: string, password: string): Promise<Session> {
    await delay(900)
    const valid =
      email.trim().toLowerCase() === DEMO_CREDENTIALS.email &&
      password === DEMO_CREDENTIALS.password
    if (!valid) throw new Error("Invalid email or password. Try the demo credentials.")
    return {
      userId: "usr_demo",
      email: DEMO_CREDENTIALS.email,
      name: read("profile").name,
      role: "admin",
      token: createId("mock_token"),
      createdAt: new Date().toISOString(),
    }
  }

  /** Mock tokens never expire. */
  async refresh(session: Session): Promise<Session> {
    return session
  }

  async logout(): Promise<void> {
    await delay(300)
  }

  async changePassword(): Promise<void> {
    await delay(900) // simulated — the demo password never changes
  }

  async requestAccess(): Promise<void> {
    throw new Error(API_ONLY)
  }

  async forgotPassword(): Promise<void> {
    throw new Error(PASSWORD_RESET_API_ONLY)
  }

  async resetPassword(): Promise<void> {
    throw new Error(PASSWORD_RESET_API_ONLY)
  }
}

const API_ONLY = "User management needs the API backend (NEXT_PUBLIC_API_MODE=api)."
const PASSWORD_RESET_API_ONLY = "Password reset isn't available in the demo. It needs the API backend."

/** Mock mode: core settings live in memory only and no email is ever sent. */
export class MockCoreSettingsService implements CoreSettingsService {
  private mail: CoreMailConfig = {
    host: "",
    port: 587,
    username: "",
    password: "",
    encryption: "tls",
    senderName: "IamCandidate",
    senderEmail: "",
    appUrl: typeof window === "undefined" ? "" : window.location.origin,
  }

  async getMail(): Promise<CoreMailConfig> {
    await networkDelay()
    return this.mail
  }

  async saveMail(config: CoreMailConfig): Promise<CoreMailConfig> {
    await networkDelay()
    this.mail = { ...config }
    return this.mail
  }

  async testMail(): Promise<{ ok: true; latencyMs: number }> {
    await delay(700)
    return { ok: true, latencyMs: 120 }
  }

  async sendTestMail(): Promise<void> {
    throw new Error("No email is sent in the demo. Sending needs the API backend.")
  }
}

/** Mock mode has a single demo account and no real user management. */
export class MockUserService implements UserService {
  async list(): Promise<AppUser[]> {
    await delay(200)
    const now = new Date().toISOString()
    return [
      {
        id: "usr_demo",
        email: DEMO_CREDENTIALS.email,
        name: read("profile").name,
        role: "admin",
        disabled: false,
        createdAt: now,
        updatedAt: now,
      },
    ]
  }

  async create(): Promise<AppUser> {
    throw new Error(API_ONLY)
  }

  async update(): Promise<AppUser> {
    throw new Error(API_ONLY)
  }

  async remove(): Promise<void> {
    throw new Error(API_ONLY)
  }

  async listAccessRequests(): Promise<AccessRequest[]> {
    return []
  }

  async grantAccess(): Promise<AppUser> {
    throw new Error(API_ONLY)
  }

  async declineAccess(): Promise<void> {
    throw new Error(API_ONLY)
  }
}

export class MockActivityService implements ActivityService {
  async getActivities(): Promise<Activity[]> {
    await delay(300)
    return read("activities").sort((a, b) => b.date.localeCompare(a.date))
  }
}

export class MockIntegrationService implements IntegrationService {
  async getIntegrations(): Promise<Integration[]> {
    await delay(300)
    return integrations.all()
  }

  async connect(id: IntegrationId): Promise<Integration> {
    await delay(1800) // fake OAuth round trip
    const existing = integrations.find(id)
    if (!existing) throw new NotFoundError("Integration", id)
    if (existing.status === "coming_soon") throw new Error(`${existing.name} is not available yet`)
    const account =
      id === "google_drive" ? "alexmorgan.example.com" : id === "smtp" ? read("smtp").host : undefined
    const next = integrations.patch(id, {
      status: "connected",
      account,
      lastSyncedAt: new Date().toISOString(),
    })
    logActivity({
      type: "integration_connected",
      title: `${existing.name} connected`,
      entity: { type: "integration", id },
    })
    return next
  }

  async disconnect(id: IntegrationId): Promise<Integration> {
    await networkDelay()
    const existing = integrations.find(id)
    if (!existing) throw new NotFoundError("Integration", id)
    const next = integrations.patch(id, { status: "disconnected", account: undefined })
    logActivity({
      type: "integration_disconnected",
      title: `${existing.name} disconnected`,
      entity: { type: "integration", id },
    })
    return next
  }

  async sync(id: IntegrationId): Promise<Integration> {
    await delay(1500)
    const existing = integrations.find(id)
    if (!existing) throw new NotFoundError("Integration", id)
    if (existing.status !== "connected") throw new Error(`${existing.name} is not connected`)
    const next = integrations.patch(id, { lastSyncedAt: new Date().toISOString() })
    if (id === "google_drive") {
      const files = read("driveItems").filter((item) => item.type === "file").length
      logActivity({
        type: "drive_synced",
        title: "Google Drive synced",
        description: `${files} files up to date`,
        entity: { type: "integration", id },
      })
    }
    return next
  }
}

export class MockSettingsService implements SettingsService {
  async getProfile(): Promise<UserProfile> {
    await delay(200)
    return read("profile")
  }

  async updateProfile(profile: UserProfile): Promise<UserProfile> {
    await networkDelay()
    write("profile", profile)
    logActivity({ type: "settings_updated", title: "Profile updated" })
    return profile
  }

  async getNotificationPreferences(): Promise<NotificationPreferences> {
    await delay(200)
    return read("notificationPreferences")
  }

  async updateNotificationPreferences(
    prefs: NotificationPreferences,
  ): Promise<NotificationPreferences> {
    await delay(350)
    write("notificationPreferences", prefs)
    return prefs
  }

  async getAutofill(): Promise<AutofillProfile> {
    await delay(200)
    const saved = read("autofill")
    if (saved) return { ...EMPTY_AUTOFILL, ...saved }
    const profile = read("profile")
    const [firstName = "", ...rest] = profile.name.trim().split(/\s+/)
    return {
      ...EMPTY_AUTOFILL,
      firstName,
      lastName: rest.join(" "),
      email: profile.email,
      city: profile.location,
      currentTitle: profile.role,
      summary: profile.bio,
    }
  }

  async updateAutofill(profile: AutofillProfile): Promise<AutofillProfile> {
    await networkDelay()
    const now = new Date().toISOString()
    const next = {
      ...profile,
      answers: profile.answers.map((a) => ({ ...a, id: a.id ?? createId("ans"), updatedAt: a.updatedAt ?? now })),
      updatedAt: now,
    }
    write("autofill", next)
    logActivity({ type: "settings_updated", title: "Autofill profile updated" })
    return next
  }

  async resetDemoData(): Promise<void> {
    await delay(700)
    resetDatabase()
  }
}
