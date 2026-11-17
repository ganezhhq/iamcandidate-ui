/**
 * Service registry — the single swap point between mock and real backends.
 *
 * `NEXT_PUBLIC_API_MODE=api` routes the data services to the iamcandidate-server
 * REST API (`./api`); anything else keeps the in-browser mocks (`./mock`), so
 * the app still works with no backend. In API mode, Google Drive and the other
 * OAuth integrations are still mocked (SMTP sending is real). UI code only
 * imports the instances below and never knows which one it got.
 */
import { ApiPortfolioService } from "./api/portfolio"
import { ApiPricingService } from "./api/pricing"
import { MockPortfolioService } from "./mock/portfolio"
import { MockPricingService } from "./mock/pricing"
import { isApiMode } from "@/lib/api/config"

import {
  ApiApplicationService,
  ApiCompanyService,
  ApiContactService,
  ApiInterviewService,
  ApiReferralService,
  ApiResumeService,
} from "./api/career"
import {
  ApiEmailService,
  ApiIntegrationService,
  ApiSmtpService,
  ApiTemplateService,
} from "./api/communication"
import { ApiDocumentService, ApiDriveService } from "./api/documents"
import {
  ApiActivityService,
  ApiDashboardService,
  ApiNotificationService,
  ApiSettingsService,
} from "./api/system"
import { ApiAuthService, ApiCoreSettingsService, ApiUserService } from "./api/users"
import {
  ApiBoardService,
  ApiBookmarkService,
  ApiCertificationService,
  ApiNoteService,
  ApiProjectService,
  ApiSkillService,
  ApiTaskService,
} from "./api/workspace"
import type {
  ActivityService,
  ApplicationService,
  AuthService,
  BoardService,
  BookmarkService,
  CoreSettingsService,
  CertificationService,
  CompanyService,
  ContactService,
  DashboardService,
  DocumentService,
  DriveService,
  EmailService,
  IntegrationService,
  PortfolioService,
  PricingService,
  InterviewService,
  NoteService,
  NotificationService,
  ProjectService,
  ReferralService,
  ResumeService,
  SettingsService,
  SkillService,
  SmtpService,
  TaskService,
  TemplateService,
  UserService,
} from "./contracts"
import {
  MockApplicationService,
  MockCompanyService,
  MockContactService,
  MockInterviewService,
  MockReferralService,
  MockResumeService,
} from "./mock/career"
import { MockEmailService, MockSmtpService, MockTemplateService } from "./mock/communication"
import { MockDocumentService, MockDriveService } from "./mock/documents"
import { MockDashboardService, MockNotificationService } from "./mock/insights"
import {
  MockActivityService,
  MockAuthService,
  MockCoreSettingsService,
  MockIntegrationService,
  MockSettingsService,
  MockUserService,
} from "./mock/system"
import {
  MockBoardService,
  MockBookmarkService,
  MockCertificationService,
  MockNoteService,
  MockProjectService,
  MockSkillService,
  MockTaskService,
} from "./mock/workspace"

export type * from "./contracts"

/** Picks the API implementation in `api` mode, the mock otherwise. */
function pick<T>(api: () => NoInfer<T>, mock: () => NoInfer<T>): T {
  return isApiMode ? api() : mock()
}

// Data services — backed by iamcandidate-server in API mode.
export const applicationService: ApplicationService = pick(() => new ApiApplicationService(), () => new MockApplicationService())
export const companyService: CompanyService = pick(() => new ApiCompanyService(), () => new MockCompanyService())
export const contactService: ContactService = pick(() => new ApiContactService(), () => new MockContactService())
export const referralService: ReferralService = pick(() => new ApiReferralService(), () => new MockReferralService())
export const interviewService: InterviewService = pick(() => new ApiInterviewService(), () => new MockInterviewService())
export const resumeService: ResumeService = pick(() => new ApiResumeService(), () => new MockResumeService())
export const documentService: DocumentService = pick(() => new ApiDocumentService(), () => new MockDocumentService())
export const driveService: DriveService = pick(() => new ApiDriveService(), () => new MockDriveService())
export const projectService: ProjectService = pick(() => new ApiProjectService(), () => new MockProjectService())
export const taskService: TaskService = pick(() => new ApiTaskService(), () => new MockTaskService())
export const noteService: NoteService = pick(() => new ApiNoteService(), () => new MockNoteService())
export const boardService: BoardService = pick(() => new ApiBoardService(), () => new MockBoardService())
export const skillService: SkillService = pick(() => new ApiSkillService(), () => new MockSkillService())
export const certificationService: CertificationService = pick(() => new ApiCertificationService(), () => new MockCertificationService())
export const bookmarkService: BookmarkService = pick(() => new ApiBookmarkService(), () => new MockBookmarkService())
export const activityService: ActivityService = pick(() => new ApiActivityService(), () => new MockActivityService())
export const dashboardService: DashboardService = pick(() => new ApiDashboardService(), () => new MockDashboardService())
export const notificationService: NotificationService = pick(() => new ApiNotificationService(), () => new MockNotificationService())
export const settingsService: SettingsService = pick(() => new ApiSettingsService(), () => new MockSettingsService())
export const authService: AuthService = pick(() => new ApiAuthService(), () => new MockAuthService())
export const userService: UserService = pick(() => new ApiUserService(), () => new MockUserService())
export const coreSettingsService: CoreSettingsService = pick(() => new ApiCoreSettingsService(), () => new MockCoreSettingsService())
export const emailService: EmailService = pick(() => new ApiEmailService(), () => new MockEmailService())
export const templateService: TemplateService = pick(() => new ApiTemplateService(), () => new MockTemplateService())
export const smtpService: SmtpService = pick(() => new ApiSmtpService(), () => new MockSmtpService())
export const integrationService: IntegrationService = pick(() => new ApiIntegrationService(), () => new MockIntegrationService())

export const pricingService: PricingService = pick(() => new ApiPricingService(), () => new MockPricingService())
export const portfolioService: PortfolioService = pick(() => new ApiPortfolioService(), () => new MockPortfolioService())
