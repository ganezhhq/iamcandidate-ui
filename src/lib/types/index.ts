export type ID = string
/** ISO-8601 date-time string */
export type ISODate = string

export interface Entity {
  id: ID
}

/* ------------------------------------------------------------------ */
/* User & settings                                                     */
/* ------------------------------------------------------------------ */

export interface UserProfile {
  name: string
  email: string
  role: string
  bio: string
  location: string
  avatarUrl?: string
}

export type UserRole = "admin" | "user"

export interface Session {
  userId: ID
  email: string
  token: string
  /** When `token` was issued (sign-in or the last refresh). */
  createdAt: ISODate
  /** Present in API mode; admins can manage users. */
  role?: UserRole
  name?: string
  /** API mode: the account can look around but not change anything (the demo). */
  readOnly?: boolean
}

/** A login account (admin-managed in API mode). */
export interface AppUser {
  id: ID
  email: string
  name: string
  role: UserRole
  disabled: boolean
  readOnly?: boolean
  lastLoginAt?: ISODate
  createdAt: ISODate
  updatedAt: ISODate
}

export interface CreateUserInput {
  email: string
  name: string
  password: string
  role: UserRole
}

/** A pending sign-up from the public form; an admin grants or declines it. */
export interface AccessRequest {
  id: ID
  email: string
  name: string
  message?: string
  createdAt: ISODate
}

export interface AccessRequestInput {
  email: string
  name: string
  /** What they'll sign in with once access is granted. */
  password: string
  message?: string
}

export interface UpdateUserInput {
  name?: string
  role?: UserRole
  disabled?: boolean
  /** Sets a new password for the user. */
  password?: string
}

export interface NotificationPreferences {
  emailNotifications: boolean
  interviewReminders: boolean
  taskReminders: boolean
  followUpReminders: boolean
  weeklyDigest: boolean
}

export type ThemePreference = "light" | "dark" | "system"

/* ------------------------------------------------------------------ */
/* Career                                                              */
/* ------------------------------------------------------------------ */

export type ApplicationStatus =
  | "wishlist"
  | "applied"
  | "recruiter"
  | "technical"
  | "hr"
  | "offer"
  | "rejected"

export type WorkMode = "remote" | "hybrid" | "onsite"
export type Priority = "low" | "medium" | "high"

export type TimelineEventType =
  | "created"
  | "status"
  | "email"
  | "interview"
  | "note"
  | "followup"

export interface TimelineEvent {
  id: ID
  date: ISODate
  title: string
  description?: string
  type: TimelineEventType
}

export interface Application extends Entity {
  companyId: ID
  role: string
  location: string
  workMode: WorkMode
  salary?: string
  status: ApplicationStatus
  priority: Priority
  appliedDate?: ISODate
  nextFollowUp?: ISODate
  jobUrl?: string
  jobId?: string
  source?: string
  description?: string
  recruiterId?: ID
  resumeId?: ID
  notes: string
  timeline: TimelineEvent[]
  createdAt: ISODate
  updatedAt: ISODate
}

/** Job details read from a link (POST /applications/extract). Blank = not found. */
export interface ExtractedJob {
  role: string
  company: string
  location: string
  workMode: WorkMode | ""
  salary: string
  jobId: string
  jobUrl: string
  source: string
  description: string
}

export interface JobExtraction {
  url: string
  /** "job" when a posting was recognised on the page. */
  kind: "job" | "unknown"
  /** Job board / ATS ("" when unknown). */
  site: string
  /** "api": the job board's API; "page": the page's HTML; "text": text pasted into the chat. */
  via: "api" | "page" | "text"
  job: ExtractedJob
}

export type ApplicationInput = Omit<
  Application,
  "id" | "timeline" | "createdAt" | "updatedAt"
>

export type CompanyStatus =
  | "researching"
  | "target"
  | "active"
  | "paused"
  | "closed"

export interface Company extends Entity {
  name: string
  industry: string
  website: string
  location: string
  size: string
  status: CompanyStatus
  description: string
  notes: string
  createdAt: ISODate
}

export type CompanyInput = Omit<Company, "id" | "createdAt">

export type Relationship =
  | "recruiter"
  | "hiring_manager"
  | "employee"
  | "referral"
  | "friend"
  | "professional"

export interface Contact extends Entity {
  name: string
  role: string
  companyId?: ID
  email: string
  phone?: string
  linkedin?: string
  relationship: Relationship
  lastContacted?: ISODate
  nextFollowUp?: ISODate
  notes: string
  createdAt: ISODate
}

export type ContactInput = Omit<Contact, "id" | "createdAt">

/** A person read from a profile link (POST /contacts/extract). Blank = not found. */
export interface ExtractedContact {
  name: string
  role: string
  company: string
  location: string
  email: string
  phone: string
  linkedin: string
  website: string
  /** Short bio / headline. */
  about: string
}

export interface ContactExtraction {
  url: string
  /** "profile" when a person was recognised on the page. */
  kind: "profile" | "unknown"
  /** "LinkedIn", "GitHub" or "" (any other page). */
  site: string
  contact: ExtractedContact
}

export type ReferralStatus =
  | "not_contacted"
  | "request_sent"
  | "accepted"
  | "declined"
  | "submitted"
  | "no_response"

export interface Referral extends Entity {
  contactId: ID
  companyId: ID
  role: string
  jobId: string
  jobUrl: string
  requestDate?: ISODate
  followUpDate?: ISODate
  status: ReferralStatus
  notes: string
  createdAt: ISODate
}

export type ReferralInput = Omit<Referral, "id" | "createdAt">

export type InterviewType =
  | "recruiter_screen"
  | "technical"
  | "system_design"
  | "behavioral"
  | "hr"
  | "final"

export type InterviewStatus = "scheduled" | "completed" | "cancelled"

export interface Interview extends Entity {
  applicationId: ID
  type: InterviewType
  scheduledAt: ISODate
  durationMinutes: number
  interviewers: string[]
  meetingUrl?: string
  status: InterviewStatus
  notes: string
  createdAt: ISODate
}

export type InterviewInput = Omit<Interview, "id" | "createdAt">

export interface ResumeExperience {
  id: ID
  company: string
  title: string
  period: string
  highlights: string[]
}

export interface ResumeEducation {
  id: ID
  school: string
  degree: string
  period: string
}

export interface Resume extends Entity {
  title: string
  targetRole: string
  version: string
  isDefault: boolean
  summary: string
  skills: string[]
  experience: ResumeExperience[]
  education: ResumeEducation[]
  /** "structured" (form editor, the default) or "latex" (source compiled to PDF). */
  format?: "structured" | "latex"
  /** LaTeX source when `format` is "latex". */
  latexSource?: string
  /** Uploaded/saved PDF in Documents. */
  documentId?: ID
  updatedAt: ISODate
  createdAt: ISODate
}

export type ResumeInput = Omit<Resume, "id" | "createdAt" | "updatedAt">

/* ------------------------------------------------------------------ */
/* Documents & Drive                                                   */
/* ------------------------------------------------------------------ */

export type DocumentCategory =
  | "resume"
  | "certificates"
  | "experience"
  | "personal"
  | "projects"
  | "other"

export type FileKind = "pdf" | "docx" | "image" | "sheet" | "zip" | "text"

export interface DocumentFile extends Entity {
  name: string
  category: DocumentCategory
  kind: FileKind
  sizeBytes: number
  starred: boolean
  source: "local" | "drive"
  /** Set when imported from Google Drive (API mode). */
  driveFileId?: ID
  description?: string
  uploadedAt: ISODate
  updatedAt: ISODate
}

export type DocumentInput = Pick<
  DocumentFile,
  "name" | "category" | "kind" | "sizeBytes" | "description"
>

export interface DriveItem extends Entity {
  name: string
  type: "folder" | "file"
  parentId: ID | null
  kind?: FileKind
  sizeBytes?: number
  modifiedAt: ISODate
  /** API mode: Google's MIME type. */
  mimeType?: string
}

/* ------------------------------------------------------------------ */
/* Communication                                                       */
/* ------------------------------------------------------------------ */

export type EmailFolder = "inbox" | "sent" | "drafts"

export interface EmailAddress {
  name: string
  email: string
}

export interface Email extends Entity {
  folder: EmailFolder
  from: EmailAddress
  to: string[]
  cc: string[]
  subject: string
  body: string
  date: ISODate
  read: boolean
  starred: boolean
  applicationId?: ID
  contactId?: ID
  templateId?: ID
}

export interface ComposeEmailInput {
  to: string[]
  cc: string[]
  subject: string
  body: string
  applicationId?: ID
  contactId?: ID
  templateId?: ID
}

export type TemplateCategory = "referral" | "outreach" | "follow_up" | "interview" | "other"

/** Email templates are sent from IamCandidate; LinkedIn ones are copied into LinkedIn. */
export type TemplateChannel = "email" | "linkedin"

export interface EmailTemplate extends Entity {
  name: string
  category: TemplateCategory
  /** Missing on templates from before channels existed: treat as "email". */
  channel?: TemplateChannel
  /** Empty for LinkedIn templates. */
  subject: string
  body: string
  usageCount: number
  updatedAt: ISODate
  createdAt: ISODate
}

export type EmailTemplateInput = Pick<
  EmailTemplate,
  "name" | "category" | "channel" | "subject" | "body"
>

/** "yes" / "no" answers to common application questions; "" when not set. */
export type YesNo = "yes" | "no" | ""

export interface AutofillAnswer {
  id?: ID
  question: string
  answer: string
  updatedAt?: ISODate
}

/** One job in an autofill work history; dates are "YYYY-MM", "" when not set. */
export interface AutofillJob {
  title: string
  company: string
  location: string
  startDate: string
  endDate: string
  /** Still working here: the end date is left empty. */
  current: boolean
  description: string
}

/** What the browser extension types into job application forms. Same shape as the server's. */
export interface AutofillProfile {
  firstName: string
  lastName: string
  preferredName: string
  email: string
  phone: string
  pronouns: string
  addressLine: string
  city: string
  state: string
  postalCode: string
  country: string
  linkedin: string
  github: string
  portfolio: string
  currentTitle: string
  currentCompany: string
  experienceYears: string
  noticePeriod: string
  currentSalary: string
  expectedSalary: string
  workAuthorization: YesNo
  needsSponsorship: YesNo
  willingToRelocate: YesNo
  school: string
  degree: string
  fieldOfStudy: string
  graduationYear: string
  gender: string
  ethnicity: string
  disability: string
  veteran: string
  summary: string
  coverLetter: string
  /** Every job, latest first, for forms that ask for your work history. */
  experience: AutofillJob[]
  answers: AutofillAnswer[]
  updatedAt?: ISODate
}

export type SmtpEncryption = "tls" | "ssl" | "none"

export interface SmtpConfig {
  host: string
  port: number
  username: string
  password: string
  encryption: SmtpEncryption
  senderName: string
  senderEmail: string
  lastTestedAt?: ISODate
  /** API mode: a password is saved on the server (it is never sent back). */
  hasPassword?: boolean
}

/* ------------------------------------------------------------------ */
/* Workspace                                                           */
/* ------------------------------------------------------------------ */

export type ProjectStatus =
  | "idea"
  | "planning"
  | "development"
  | "completed"
  | "archived"

export interface Project extends Entity {
  name: string
  description: string
  status: ProjectStatus
  progress: number
  technologies: string[]
  repository?: string
  deployment?: string
  startedAt: ISODate
  updatedAt: ISODate
}

export type ProjectInput = Omit<Project, "id" | "updatedAt">

export type TaskPriority = "low" | "medium" | "high" | "critical"
export type TaskStatus = "todo" | "in_progress" | "done"
export type RelatedType = "application" | "project" | "contact" | "company"

export interface RelatedItem {
  type: RelatedType
  id: ID
  label: string
}

export interface Task extends Entity {
  title: string
  description: string
  priority: TaskPriority
  status: TaskStatus
  dueDate?: ISODate
  related?: RelatedItem
  completedAt?: ISODate
  createdAt: ISODate
}

export type TaskInput = Omit<Task, "id" | "createdAt" | "completedAt">

export type NoteCategory =
  | "dsa"
  | "system_design"
  | "react"
  | "nextjs"
  | "nodejs"
  | "ai"
  | "career"
  | "projects"
  | "personal"

export interface Note extends Entity {
  title: string
  content: string
  category: NoteCategory
  tags: string[]
  favorite: boolean
  createdAt: ISODate
  updatedAt: ISODate
}

export type NoteInput = Pick<Note, "title" | "content" | "category" | "tags" | "favorite">

/** The sync board: one free-form pad, the same text on every system. */
export interface Board {
  content: string
  /** `null` until the first save. */
  updatedAt: ISODate | null
}

/* ------------------------------------------------------------------ */
/* Knowledge                                                           */
/* ------------------------------------------------------------------ */

export type SkillGroup =
  | "frontend"
  | "backend"
  | "mobile"
  | "database"
  | "cloud"
  | "ai"
  | "tools"

export interface Skill extends Entity {
  name: string
  group: SkillGroup
  /** 0–100 */
  proficiency: number
  years: number
}

export type SkillInput = Omit<Skill, "id">

export interface Certification extends Entity {
  name: string
  issuer: string
  issueDate: ISODate
  expiryDate?: ISODate
  credentialId: string
  credentialUrl: string
  documentId?: ID
  skills: string[]
}

export type CertificationInput = Omit<Certification, "id">

export type LinkCategory =
  | "jobs"
  | "learning"
  | "tools"
  | "documentation"
  | "career"
  | "projects"
  | "resources"

export interface Bookmark extends Entity {
  title: string
  url: string
  description: string
  tags: string[]
  category: LinkCategory
  favorite: boolean
  createdAt: ISODate
}

export type BookmarkInput = Omit<Bookmark, "id" | "createdAt">

/* ------------------------------------------------------------------ */
/* System                                                              */
/* ------------------------------------------------------------------ */

export type ActivityType =
  | "application_created"
  | "application_status_changed"
  | "application_deleted"
  | "email_sent"
  | "resume_updated"
  | "document_uploaded"
  | "document_deleted"
  | "task_created"
  | "task_completed"
  | "referral_requested"
  | "interview_scheduled"
  | "note_created"
  | "contact_added"
  | "company_added"
  | "project_updated"
  | "integration_connected"
  | "integration_disconnected"
  | "integration_synced"
  | "data_imported"
  | "drive_synced"
  | "settings_updated"

export type EntityType =
  | "application"
  | "company"
  | "contact"
  | "referral"
  | "interview"
  | "resume"
  | "document"
  | "email"
  | "template"
  | "project"
  | "task"
  | "note"
  | "integration"

export interface Activity extends Entity {
  type: ActivityType
  title: string
  description?: string
  date: ISODate
  entity?: { type: EntityType; id: ID }
}

export type NotificationKind = "interview" | "follow_up" | "task"

/** A reminder derived from interviews, follow-ups and tasks. */
export interface AppNotification {
  /** Stable id derived from the source entity, e.g. `int-int_123`. */
  id: string
  kind: NotificationKind
  title: string
  subtitle?: string
  /** When the interview / follow-up / task is due. */
  date: ISODate
  href: string
  urgent: boolean
  read: boolean
}

/** Aggregates for the dashboard screen (one request in API mode). */
export interface DashboardSummary {
  applications: {
    total: number
    /** Not wishlist / rejected. */
    active: number
    appliedThisWeek: number
    awaitingReply: number
    byStatus: Array<{ status: ApplicationStatus; count: number }>
    /** Oldest → newest; `weekStart` is the local Monday as `YYYY-MM-DD`. */
    overTime: Array<{ weekStart: string; applications: number }>
    funnel: {
      stages: Array<{ label: string; count: number }>
      responseRate: number
      interviewRate: number
      offerRate: number
    }
  }
  interviews: {
    upcoming: number
    next?: Pick<Interview, "id" | "applicationId" | "type" | "scheduledAt">
  }
  tasks: { open: number; dueToday: number; overdue: number }
  documents: { total: number; resumes: number; starred: number }
  recentActivity: Activity[]
}

export type IntegrationId =
  | "google_drive"
  | "smtp"
  | "github"
  | "google_calendar"
  | "linkedin"
  | "aws"

export type IntegrationStatus = "connected" | "disconnected" | "coming_soon"

export interface Integration extends Entity {
  id: IntegrationId
  name: string
  description: string
  category: string
  status: IntegrationStatus
  account?: string
  lastSyncedAt?: ISODate
}

/* ------------------------------------------------------------------ */
/* Server-side integrations (API mode) — mirror iamcandidate-server/src/models */
/* ------------------------------------------------------------------ */

export interface GoogleDriveStatus {
  connected: boolean
  /** Server has Google OAuth credentials configured. */
  available: boolean
  account?: string
  connectedAt?: ISODate
}

export interface CalendarSyncSummary {
  synced: number
  removed: number
  interviews: number
  followUps: number
  tasks: number
}

export interface GoogleCalendarStatus extends GoogleDriveStatus {
  lastSyncedAt?: ISODate
  lastSync?: CalendarSyncSummary
}

export interface GitHubStatus {
  connected: boolean
  account?: string
  name?: string
  avatarUrl?: string
  connectedAt?: ISODate
}

export interface GitHubRepo {
  /** "owner/name" */
  fullName: string
  name: string
  description: string
  url: string
  homepage?: string
  private: boolean
  fork: boolean
  archived: boolean
  language?: string
  topics: string[]
  stars: number
  defaultBranch: string
  pushedAt?: ISODate
  /** IamCandidate project linked to this repository. */
  projectId?: ID
}

export interface GitHubCommit {
  sha: string
  message: string
  author: string
  date: ISODate
  url: string
}

export interface GitHubPullRequest {
  number: number
  title: string
  state: "open" | "closed" | "merged"
  author: string
  updatedAt: ISODate
  url: string
}

export interface GitHubActivity {
  repo: GitHubRepo
  commits: GitHubCommit[]
  pullRequests: GitHubPullRequest[]
}

export type LinkedInExportKind = "connections" | "saved_jobs" | "job_applications"

export interface LinkedInImportResult {
  kind: LinkedInExportKind
  rows: number
  created: number
  skipped: number
  invalid: number
  companiesCreated: number
  sample: string[]
  dryRun: boolean
}

export interface LinkedInStatus {
  lastImportAt?: ISODate
  imports: Partial<Record<LinkedInExportKind, { at: ISODate; created: number }>>
}

export interface BackupSummary {
  at: ISODate
  dataKey: string
  documents: number
  bytes: number
  failed: number
}

export interface AwsBackupStatus {
  connected: boolean
  bucket?: string
  region?: string
  prefix?: string
  /** Masked, e.g. "…3456". */
  accessKeyId?: string
  connectedAt?: ISODate
  lastBackup?: BackupSummary
}

export interface AwsBackupInput {
  bucket: string
  region: string
  prefix: string
  accessKeyId: string
  /** Empty keeps the saved secret. */
  secretAccessKey: string
}

export interface BackupProgress {
  done: boolean
  cursor?: string
  copied: number
  total: number
  bytes: number
  failed: number
  dataKey: string
  summary?: BackupSummary
}

export interface IntegrationsOverview {
  googleDrive: GoogleDriveStatus
  googleCalendar: GoogleCalendarStatus
  github: GitHubStatus
  linkedin: LinkedInStatus
  aws: AwsBackupStatus
}

/* ------------------------------------------------------------------ */
/* Pricing — mirrors iamcandidate-server/src/models                            */
/* ------------------------------------------------------------------ */

export type PricingCurrency = "INR" | "USD" | "EUR" | "GBP"

export interface PricingPlan {
  id: ID
  name: string
  tagline: string
  /** Per month, billed monthly; 0 = free. */
  monthlyPrice: number
  /** Per month, billed yearly. */
  yearlyPrice: number
  features: string[]
  ctaLabel: string
  /** A path like /login, a URL, or mailto:. */
  ctaHref: string
  highlighted: boolean
  visible: boolean
}

export interface PricingConfig {
  currency: PricingCurrency
  note: string
  plans: PricingPlan[]
  updatedAt?: ISODate
}

/* ------------------------------------------------------------------ */
/* Portfolio — mirrors iamcandidate-server/src/schemas/portfolio.ts            */
/* ------------------------------------------------------------------ */

/** A label/value row: the hero readout and agent-skill spec sheets. */
export interface PortfolioPair {
  key: string
  value: string
}

export interface PortfolioProfile {
  name: string
  role: string
  /** Status line above the name, e.g. "Available for full-time roles". */
  availability: string
  intro: string
  aiHeading: string
  aiBlurb: string
  aiSkills: string[]
  /** "What I actually do" paragraphs. */
  about: string[]
  readout: PortfolioPair[]
  email: string
  phone: string
  location: string
  resumeUrl: string
  photo: string
  socials: Array<{ label: string; href: string }>
  education: { degree: string; school: string; years: string; grade: string }
  contactTitle: string
  contactBody: string
}

export interface PortfolioExperience {
  title: string
  company: string
  location: string
  /** Date range, e.g. "Aug 2025 — Present". */
  exp: string
  description: string
  image: string
  skills: string[]
  current?: boolean
}

export type PortfolioCardSpan = "md:col-span-2" | "md:col-span-4" | "md:col-span-6"

export interface PortfolioProject {
  slug: string
  title: string
  description: string
  detail: string[]
  highlights: string[]
  image: string
  href: string
  /** Link label, e.g. "GitHub" or "Google Play". */
  meta: string
  tags: string[]
  span: PortfolioCardSpan
  feature?: boolean
}

export interface PortfolioAgentSkill {
  name: string
  tagline: string
  description: string
  repo: string
  install: string
  version: string
  license: string
  spec: PortfolioPair[]
  tags: string[]
}

export interface PortfolioOpenSourceRepo {
  name: string
  description: string
  href: string
  language: string
  license: string
}

/** The GitHub organisation the site links to, and the repos listed beside the skills. */
export interface PortfolioOpenSource {
  name: string
  url: string
  intro: string
  repos: PortfolioOpenSourceRepo[]
}

export interface PortfolioTestimonial {
  quote: string
  name: string
  designation: string
  src: string
  linkedin: string
}

/** Which IamCandidate resume the site's "Download résumé" links were synced from. */
export interface PortfolioResumeLink {
  resumeId: ID
  title: string
  version: string
  syncedAt: ISODate
}

/** Everything the portfolio site shows; one DynamoDB item. */
export interface PortfolioContent {
  profile: PortfolioProfile
  experience: PortfolioExperience[]
  projects: PortfolioProject[]
  agentSkills: PortfolioAgentSkill[]
  openSource: PortfolioOpenSource
  toolkit: Array<{ group: string; items: string[] }>
  testimonials: PortfolioTestimonial[]
  /** Set by "Sync to portfolio" on a resume; dropped once resumeUrl is edited by hand. */
  resume?: PortfolioResumeLink
  updatedAt?: ISODate
}
