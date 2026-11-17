import { apiClient } from "@/lib/api/client"
import type {
  AccessRequest,
  AccessRequestInput,
  AppUser,
  CoreMailConfig,
  CreateUserInput,
  ID,
  Session,
  UpdateUserInput,
} from "@/lib/types"

import type { AuthService, CoreSettingsService, UserService } from "../contracts"

const enc = encodeURIComponent

interface LoginResponse {
  token: string
  expiresIn: number
  user: AppUser
}

function toSession({ token, user }: LoginResponse): Session {
  return {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    ...(user.readOnly ? { readOnly: true } : {}),
    token,
    createdAt: new Date().toISOString(),
  }
}

export class ApiAuthService implements AuthService {
  async login(email: string, password: string): Promise<Session> {
    return toSession(await apiClient.post<LoginResponse>("/auth/login", { email, password }))
  }

  /** Uses the current token (sent by apiClient) to get a fresh one. */
  async refresh(): Promise<Session> {
    return toSession(await apiClient.post<LoginResponse>("/auth/refresh"))
  }

  /** Tokens are stateless; signing out just forgets the token locally. */
  async logout(): Promise<void> {}

  changePassword(currentPassword: string, newPassword: string): Promise<void> {
    return apiClient.put("/auth/password", { currentPassword, newPassword })
  }

  requestAccess(input: AccessRequestInput): Promise<void> {
    return apiClient.post("/access-requests", input)
  }

  forgotPassword(email: string): Promise<void> {
    return apiClient.post("/auth/forgot-password", { email })
  }

  resetPassword(token: string, newPassword: string): Promise<void> {
    return apiClient.post("/auth/reset-password", { token, newPassword })
  }
}

/** Only the fields the API accepts (it rejects unknown ones). */
const toCoreMailInput = ({ host, port, username, password, encryption, senderName, senderEmail, appUrl }: CoreMailConfig) => ({
  host,
  port,
  username,
  password,
  encryption,
  senderName,
  senderEmail,
  appUrl,
})

export class ApiCoreSettingsService implements CoreSettingsService {
  getMail(): Promise<CoreMailConfig> {
    return apiClient.get("/admin/core-settings/mail")
  }

  saveMail(config: CoreMailConfig): Promise<CoreMailConfig> {
    return apiClient.put("/admin/core-settings/mail", toCoreMailInput(config))
  }

  testMail(config: CoreMailConfig): Promise<{ ok: true; latencyMs: number }> {
    return apiClient.post("/admin/core-settings/mail/test", toCoreMailInput(config))
  }

  sendTestMail(to: string): Promise<void> {
    return apiClient.post("/admin/core-settings/mail/send-test", { to })
  }
}

export class ApiUserService implements UserService {
  list(): Promise<AppUser[]> {
    return apiClient.get("/users")
  }

  create(input: CreateUserInput): Promise<AppUser> {
    return apiClient.post("/users", input)
  }

  update(id: ID, patch: UpdateUserInput): Promise<AppUser> {
    return apiClient.put(`/users/${enc(id)}`, patch)
  }

  remove(id: ID): Promise<void> {
    return apiClient.delete(`/users/${enc(id)}`)
  }

  listAccessRequests(): Promise<AccessRequest[]> {
    return apiClient.get("/access-requests")
  }

  grantAccess(requestId: ID): Promise<AppUser> {
    return apiClient.post(`/access-requests/${enc(requestId)}/grant`)
  }

  declineAccess(requestId: ID): Promise<void> {
    return apiClient.delete(`/access-requests/${enc(requestId)}`)
  }
}
