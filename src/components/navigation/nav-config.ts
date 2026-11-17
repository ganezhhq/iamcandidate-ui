import {
  ActivityIcon,
  AwardIcon,
  BadgeDollarSignIcon,
  BookmarkIcon,
  BriefcaseBusinessIcon,
  Building2Icon,
  CalendarClockIcon,
  CheckSquareIcon,
  ClipboardPasteIcon,
  FileTextIcon,
  FolderKanbanIcon,
  FolderOpenIcon,
  GlobeIcon,
  HandshakeIcon,
  LayoutDashboardIcon,
  LayoutTemplateIcon,
  MailIcon,
  MessageSquarePlusIcon,
  PlugIcon,
  ServerCogIcon,
  SettingsIcon,
  SparklesIcon,
  StickyNoteIcon,
  UserCogIcon,
  UsersIcon,
  WandSparklesIcon,
  type LucideIcon,
} from "lucide-react"

export interface NavItem {
  title: string
  href: string
  icon: LucideIcon
  /** Only shown to admins: `true` needs API mode (user management); "any" also works on demo data. */
  adminOnly?: boolean | "any"
}

export interface NavGroup {
  label?: string
  items: NavItem[]
}

export const NAV_GROUPS: NavGroup[] = [
  {
    items: [
      { title: "Dashboard", href: "/dashboard", icon: LayoutDashboardIcon },
      { title: "Documents", href: "/documents", icon: FolderOpenIcon },
    ],
  },
  {
    label: "Career",
    items: [
      { title: "Applications", href: "/career/applications", icon: BriefcaseBusinessIcon },
      { title: "Chat", href: "/career/chat", icon: MessageSquarePlusIcon },
      { title: "Companies", href: "/career/companies", icon: Building2Icon },
      { title: "Contacts", href: "/career/contacts", icon: UsersIcon },
      { title: "Referrals", href: "/career/referrals", icon: HandshakeIcon },
      { title: "Interviews", href: "/career/interviews", icon: CalendarClockIcon },
      { title: "Resumes", href: "/career/resumes", icon: FileTextIcon },
      { title: "Autofill", href: "/career/autofill", icon: WandSparklesIcon },
    ],
  },
  {
    label: "Communication",
    items: [
      { title: "Email", href: "/communication/email", icon: MailIcon },
      { title: "Templates", href: "/communication/templates", icon: LayoutTemplateIcon },
    ],
  },
  {
    label: "Workspace",
    items: [
      { title: "Projects", href: "/workspace/projects", icon: FolderKanbanIcon },
      { title: "Tasks", href: "/workspace/tasks", icon: CheckSquareIcon },
      { title: "Notes", href: "/workspace/notes", icon: StickyNoteIcon },
      { title: "Board", href: "/workspace/board", icon: ClipboardPasteIcon },
    ],
  },
  {
    label: "Knowledge",
    items: [
      { title: "Skills", href: "/knowledge/skills", icon: SparklesIcon },
      { title: "Certifications", href: "/knowledge/certifications", icon: AwardIcon },
      { title: "Links", href: "/knowledge/links", icon: BookmarkIcon },
    ],
  },
  {
    label: "System",
    items: [
      { title: "Integrations", href: "/integrations", icon: PlugIcon },
      { title: "Activity", href: "/activity", icon: ActivityIcon },
      { title: "Users", href: "/admin/users", icon: UserCogIcon, adminOnly: true },
      { title: "Core settings", href: "/admin/core-settings", icon: ServerCogIcon, adminOnly: true },
      { title: "Pricing", href: "/admin/pricing", icon: BadgeDollarSignIcon, adminOnly: "any" },
      { title: "Portfolio", href: "/admin/portfolio", icon: GlobeIcon, adminOnly: "any" },
      { title: "Settings", href: "/settings", icon: SettingsIcon },
    ],
  },
]

export const NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((group) => group.items)

/** Hides admin-only entries from everyone else. */
export function visibleNavItems(
  items: NavItem[],
  admin: { api: boolean; any: boolean },
): NavItem[] {
  return items.filter((item) =>
    item.adminOnly === "any" ? admin.any : item.adminOnly ? admin.api : true,
  )
}

export function findNavItem(pathname: string): NavItem | undefined {
  return [...NAV_ITEMS]
    .sort((a, b) => b.href.length - a.href.length)
    .find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
}

export function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`)
}
