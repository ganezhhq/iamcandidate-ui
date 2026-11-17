/**
 * Service contracts. The UI only ever talks to these interfaces (via the
 * instances exported from `@/lib/services`). Today they are backed by mock
 * implementations in `./mock`; later an `Api*Service` can implement the same
 * interface and be swapped in `./index.ts` without touching any UI code.
 */
import type {
  AutofillProfile,
  PortfolioContent,
  PricingConfig,
  AccessRequest,
  AccessRequestInput,
  Activity,
  AppNotification,
  AppUser,
  Application,
  ApplicationInput,
  ApplicationStatus,
  Bookmark,
  BookmarkInput,
  Certification,
  CertificationInput,
  Company,
  CompanyInput,
  ComposeEmailInput,
  DashboardSummary,
  Contact,
  ContactExtraction,
  ContactInput,
  CoreMailConfig,
  CreateUserInput,
  DocumentFile,
  DocumentInput,
  DriveItem,
  Email,
  EmailTemplate,
  EmailTemplateInput,
  ID,
  Integration,
  JobExtraction,
  IntegrationId,
  Interview,
  InterviewInput,
  Board,
  Note,
  NoteInput,
  NotificationPreferences,
  Project,
  ProjectInput,
  Referral,
  ReferralInput,
  Resume,
  ResumeInput,
  Session,
  Skill,
  SkillInput,
  SmtpConfig,
  Task,
  TaskInput,
  TimelineEvent,
  UpdateUserInput,
  UserProfile,
} from "@/lib/types"

/** Generic CRUD contract used by the simpler resources. */
export interface CrudService<T, TInput> {
  list(): Promise<T[]>
  get(id: ID): Promise<T | undefined>
  create(input: TInput): Promise<T>
  update(id: ID, patch: Partial<TInput>): Promise<T>
  remove(id: ID): Promise<void>
}

export interface AuthService {
  login(email: string, password: string): Promise<Session>
  /** Swaps the session's token for a fresh one (rolling sessions). */
  refresh(session: Session): Promise<Session>
  logout(): Promise<void>
  changePassword(currentPassword: string, newPassword: string): Promise<void>
  /** Public: asks the admin for an account. */
  requestAccess(input: AccessRequestInput): Promise<void>
  /** Public: emails a reset link if the address has an account (resolves either way). */
  forgotPassword(email: string): Promise<void>
  /** Public: sets a new password with the token from the reset email. */
  resetPassword(token: string, newPassword: string): Promise<void>
}

/** Admin-only, deployment-wide settings (Core settings). */
export interface CoreSettingsService {
  getMail(): Promise<CoreMailConfig>
  saveMail(config: CoreMailConfig): Promise<CoreMailConfig>
  testMail(config: CoreMailConfig): Promise<{ ok: true; latencyMs: number }>
  /** Sends a real message with the saved settings. */
  sendTestMail(to: string): Promise<void>
}

/** Admin-only account management (API mode). */
export interface UserService {
  list(): Promise<AppUser[]>
  create(input: CreateUserInput): Promise<AppUser>
  update(id: ID, patch: UpdateUserInput): Promise<AppUser>
  remove(id: ID): Promise<void>
  listAccessRequests(): Promise<AccessRequest[]>
  /** Creates the requester's account (role user) with the password they chose. */
  grantAccess(requestId: ID): Promise<AppUser>
  declineAccess(requestId: ID): Promise<void>
}

export interface ApplicationService {
  getApplications(): Promise<Application[]>
  getApplication(id: ID): Promise<Application | undefined>
  createApplication(input: ApplicationInput): Promise<Application>
  updateApplication(id: ID, patch: Partial<ApplicationInput>): Promise<Application>
  changeStatus(id: ID, status: ApplicationStatus): Promise<Application>
  addTimelineEvent(id: ID, event: Omit<TimelineEvent, "id">): Promise<Application>
  deleteApplication(id: ID): Promise<void>
  /** Reads a job posting from a link; nothing is saved. */
  extractFromLink(url: string): Promise<JobExtraction>
}

export interface CompanyService {
  getCompanies(): Promise<Company[]>
  getCompany(id: ID): Promise<Company | undefined>
  createCompany(input: CompanyInput): Promise<Company>
  updateCompany(id: ID, patch: Partial<CompanyInput>): Promise<Company>
  deleteCompany(id: ID): Promise<void>
}

export interface ContactService {
  getContacts(): Promise<Contact[]>
  getContact(id: ID): Promise<Contact | undefined>
  createContact(input: ContactInput): Promise<Contact>
  updateContact(id: ID, patch: Partial<ContactInput>): Promise<Contact>
  deleteContact(id: ID): Promise<void>
  /** Reads a person from a profile link; nothing is saved. */
  extractFromLink(url: string): Promise<ContactExtraction>
}

export type ReferralService = CrudService<Referral, ReferralInput>
export type InterviewService = CrudService<Interview, InterviewInput>

export interface ResumeService {
  getResumes(): Promise<Resume[]>
  getResume(id: ID): Promise<Resume | undefined>
  createResume(input: ResumeInput): Promise<Resume>
  updateResume(id: ID, patch: Partial<ResumeInput>): Promise<Resume>
  duplicateResume(id: ID): Promise<Resume>
  setDefaultResume(id: ID): Promise<Resume[]>
  deleteResume(id: ID): Promise<void>
  /** Compiles LaTeX to a PDF (API mode only; runs Tectonic on the server). */
  compileLatex(source: string): Promise<Blob>
}

export interface DocumentService {
  getDocuments(): Promise<DocumentFile[]>
  /**
   * Uploads `file` (required by the API backend, ignored by the mock) and
   * saves its metadata.
   */
  uploadDocument(
    input: DocumentInput,
    onProgress?: (percent: number) => void,
    file?: Blob,
  ): Promise<DocumentFile>
  renameDocument(id: ID, name: string): Promise<DocumentFile>
  toggleStar(id: ID): Promise<DocumentFile>
  /** Short-lived download URL, or `null` when there is no stored file (mock data). */
  getDownloadUrl(id: ID): Promise<string | null>
  deleteDocument(id: ID): Promise<void>
}

export interface DriveService {
  /** Children of one folder (`null` = My Drive). */
  listItems(parentId: ID | null): Promise<DriveItem[]>
  importToDocuments(id: ID): Promise<DocumentFile>
  /** API mode: Google consent URL to send the browser to. */
  getAuthUrl(): Promise<string>
  /** API mode: finish the OAuth redirect with Google's `code` and `state`. */
  completeConnect(code: string, state: string): Promise<void>
}

export interface EmailService {
  getEmails(): Promise<Email[]>
  sendEmail(input: ComposeEmailInput): Promise<Email>
  saveDraft(input: ComposeEmailInput, draftId?: ID): Promise<Email>
  markRead(id: ID, read: boolean): Promise<Email>
  toggleStar(id: ID): Promise<Email>
  deleteEmail(id: ID): Promise<void>
}

export interface TemplateService extends CrudService<EmailTemplate, EmailTemplateInput> {
  duplicate(id: ID): Promise<EmailTemplate>
  /** Re-adds any default templates that were deleted; returns the full list. */
  restoreDefaults(): Promise<{ added: number; templates: EmailTemplate[] }>
}

export interface SmtpService {
  getConfig(): Promise<SmtpConfig>
  saveConfig(config: SmtpConfig): Promise<SmtpConfig>
  testConnection(config: SmtpConfig): Promise<{ ok: true; latencyMs: number }>
}

export type ProjectService = CrudService<Project, ProjectInput>

export interface TaskService {
  getTasks(): Promise<Task[]>
  createTask(input: TaskInput): Promise<Task>
  updateTask(id: ID, patch: Partial<TaskInput>): Promise<Task>
  toggleComplete(id: ID): Promise<Task>
  deleteTask(id: ID): Promise<void>
}

export type NoteService = CrudService<Note, NoteInput>

export interface BoardService {
  get(): Promise<Board>
  save(content: string): Promise<Board>
}
export type SkillService = CrudService<Skill, SkillInput>
export type CertificationService = CrudService<Certification, CertificationInput>
export type BookmarkService = CrudService<Bookmark, BookmarkInput>

export interface ActivityService {
  getActivities(): Promise<Activity[]>
}

export interface DashboardService {
  getSummary(): Promise<DashboardSummary>
}

export interface NotificationService {
  getNotifications(): Promise<AppNotification[]>
  markRead(id: string): Promise<void>
  markAllRead(): Promise<AppNotification[]>
}

/** Public pricing page; admins edit the plans. */
export interface PricingService {
  /** Visible plans, for the public page (no sign-in needed). */
  getPublic(): Promise<PricingConfig>
  /** Every plan, including hidden ones (admins). */
  getAdmin(): Promise<PricingConfig>
  save(config: PricingConfig): Promise<PricingConfig>
  /** Back to the built-in plans. */
  reset(): Promise<PricingConfig>
}

/** Ganeshguru's portfolio site content; only the owner's account can save. */
export interface PortfolioService {
  /** Null until it has been saved once (the site then shows its built-in content). */
  get(): Promise<PortfolioContent | null>
  save(content: PortfolioContent): Promise<PortfolioContent>
  /** Uploads an image to the public portfolio bucket and returns its URL. */
  uploadImage(file: File, onProgress?: (percent: number) => void): Promise<string>
  /** Publishes a resume's saved PDF as the site's "Download résumé" file. */
  syncResume(resumeId: ID): Promise<PortfolioContent>
}

export interface IntegrationService {
  getIntegrations(): Promise<Integration[]>
  connect(id: IntegrationId): Promise<Integration>
  disconnect(id: IntegrationId): Promise<Integration>
  sync(id: IntegrationId): Promise<Integration>
}

export interface SettingsService {
  getProfile(): Promise<UserProfile>
  updateProfile(profile: UserProfile): Promise<UserProfile>
  getNotificationPreferences(): Promise<NotificationPreferences>
  updateNotificationPreferences(prefs: NotificationPreferences): Promise<NotificationPreferences>
  /** Details the browser extension fills application forms with. */
  getAutofill(): Promise<AutofillProfile>
  updateAutofill(profile: AutofillProfile): Promise<AutofillProfile>
  /** Mock mode only — the API backend keeps real data. */
  resetDemoData(): Promise<void>
}
