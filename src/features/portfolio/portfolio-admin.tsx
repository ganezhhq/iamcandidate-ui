"use client"

import { useEffect, useRef, useState } from "react"
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ExternalLinkIcon,
  GlobeIcon,
  ImageIcon,
  Loader2Icon,
  PlusIcon,
  SaveIcon,
  Trash2Icon,
  Undo2Icon,
  UploadIcon,
  XIcon,
} from "lucide-react"
import { toast } from "sonner"

import { EmptyState, ErrorState } from "@/components/shared/empty-state"
import { Field, SimpleSelect } from "@/components/shared/form"
import { ConfirmDialog } from "@/components/shared/misc"
import { PageHeader } from "@/components/shared/page-header"
import { ListSkeleton } from "@/components/shared/skeletons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { seedPortfolio } from "@/lib/mock/portfolio"
import { portfolioService } from "@/lib/services"
import { SESSION_PENDING, useSession } from "@/lib/store/session"
import type {
  PortfolioAgentSkill,
  PortfolioCardSpan,
  PortfolioContent,
  PortfolioExperience,
  PortfolioOpenSourceRepo,
  PortfolioPair,
  PortfolioProfile,
  PortfolioProject,
  PortfolioTestimonial,
} from "@/lib/types"
import { timeAgo } from "@/lib/utils/dates"

import { OWNER_EMAIL, useIsPortfolioOwner } from "./owner"

const PORTFOLIO_URL = (process.env.NEXT_PUBLIC_PORTFOLIO_URL ?? "https://meganeshguru.web.app").replace(/\/+$/, "")

const SPANS: Array<{ value: PortfolioCardSpan; label: string }> = [
  { value: "md:col-span-2", label: "Small (1/3 width)" },
  { value: "md:col-span-4", label: "Wide (2/3 width)" },
  { value: "md:col-span-6", label: "Full width" },
]

const SLUG = /^[a-z0-9-]{1,80}$/

/** What the API accepts for portfolio images (SVG is left out: it can carry scripts). */
const IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif", "image/avif"]
const MAX_IMAGE_BYTES = 5 * 1024 * 1024

/** Paths like /Images/x.png live on the portfolio site, not here. */
const previewSrc = (value: string) => (value.startsWith("/") ? `${PORTFOLIO_URL}${value}` : value)

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)

/** Drops the blank lines kept while typing in one-per-line fields. */
const lines = (items: string[]) => items.map((s) => s.trim()).filter(Boolean)

/** Tidies the draft into what the API accepts. */
function prepare(draft: PortfolioContent): PortfolioContent {
  const pairs = (rows: PortfolioPair[]) => rows.filter((r) => r.key.trim() || r.value.trim())
  return {
    profile: {
      ...draft.profile,
      aiSkills: lines(draft.profile.aiSkills),
      about: lines(draft.profile.about),
      readout: pairs(draft.profile.readout),
      socials: draft.profile.socials.filter((s) => s.label.trim() || s.href.trim()),
    },
    experience: draft.experience.map((e) => ({
      ...e,
      skills: lines(e.skills),
    })),
    projects: draft.projects.map((p, i) => ({
      ...p,
      slug: p.slug.trim() || slugify(p.title) || `project-${i + 1}`,
      detail: lines(p.detail),
      highlights: lines(p.highlights),
      tags: lines(p.tags),
    })),
    agentSkills: draft.agentSkills.map((s) => ({
      ...s,
      spec: pairs(s.spec),
      tags: lines(s.tags),
    })),
    openSource: draft.openSource,
    toolkit: draft.toolkit.map((g) => ({ ...g, items: lines(g.items) })),
    testimonials: draft.testimonials,
  }
}

/** The API's required fields, so mistakes show before saving. */
function problems(draft: PortfolioContent): string[] {
  const out: string[] = []
  if (!draft.profile.name.trim()) out.push("Profile: name is required")
  draft.experience.forEach((e, i) => !e.title.trim() && out.push(`Experience ${i + 1}: title is required`))
  draft.projects.forEach((p, i) => {
    if (!p.title.trim()) out.push(`Project ${i + 1}: title is required`)
    if (p.slug.trim() && !SLUG.test(p.slug.trim())) out.push(`Project ${i + 1}: slug can only use a–z, 0–9 and dashes`)
  })
  const slugs = prepare(draft).projects.map((p) => p.slug)
  if (new Set(slugs).size !== slugs.length) out.push("Projects: two projects have the same slug")
  draft.agentSkills.forEach((s, i) => !s.name.trim() && out.push(`Agent skill ${i + 1}: name is required`))
  if (!draft.openSource.name.trim()) out.push("Open source: organisation name is required")
  draft.openSource.repos.forEach((r, i) => !r.name.trim() && out.push(`Repository ${i + 1}: name is required`))
  draft.toolkit.forEach((g, i) => !g.group.trim() && out.push(`Toolkit group ${i + 1}: name is required`))
  draft.testimonials.forEach((t, i) => !t.name.trim() && out.push(`Reference ${i + 1}: name is required`))
  return out
}

export function PortfolioAdmin() {
  const session = useSession()
  const canEdit = useIsPortfolioOwner()

  const [saved, setSaved] = useState<PortfolioContent | null>(null)
  const [draft, setDraft] = useState<PortfolioContent | null>(null)
  const [neverSaved, setNeverSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [discarding, setDiscarding] = useState(false)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!canEdit) return
    let active = true
    portfolioService
      .get()
      .then((content) => {
        if (!active) return
        const seed = seedPortfolio()
        // Content saved before the Open source tab existed has no such section yet.
        const start = content ? { ...content, openSource: content.openSource ?? seed.openSource } : seed
        setNeverSaved(!content)
        setSaved(start)
        setDraft(start)
      })
      .catch(
        (caught: unknown) =>
          active && setError(caught instanceof Error ? caught.message : "Couldn't load the portfolio"),
      )
    return () => {
      active = false
    }
  }, [canEdit, attempt])

  const dirty = JSON.stringify(draft) !== JSON.stringify(saved)

  // An afternoon of edits shouldn't vanish with a stray tab close.
  useEffect(() => {
    if (!dirty) return
    const warn = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener("beforeunload", warn)
    return () => window.removeEventListener("beforeunload", warn)
  }, [dirty])

  if (session === SESSION_PENDING) return <ListSkeleton rows={5} />
  if (!canEdit) {
    return (
      <EmptyState
        icon={GlobeIcon}
        title="Owner only"
        description={`Sign in as ${OWNER_EMAIL} to edit the portfolio.`}
      />
    )
  }

  const issues = draft ? problems(draft) : []

  const save = async () => {
    if (!draft) return
    setSaving(true)
    try {
      const next = await portfolioService.save(prepare(draft))
      setSaved(next)
      setDraft(next)
      setNeverSaved(false)
      toast.success("Portfolio saved. The site shows it on the next visit.")
    } catch (caught) {
      toast.error("Couldn't save the portfolio", {
        description: caught instanceof Error ? caught.message : undefined,
      })
    } finally {
      setSaving(false)
    }
  }

  const set = <K extends keyof PortfolioContent>(key: K, value: PortfolioContent[K]) =>
    setDraft((d) => d && { ...d, [key]: value })

  return (
    <div>
      <PageHeader
        title="Portfolio"
        description={
          neverSaved
            ? "Everything on your portfolio site. Not saved yet — the site is showing its built-in content."
            : `Everything on your portfolio site.${saved?.updatedAt ? ` Last saved ${timeAgo(saved.updatedAt)}.` : ""}`
        }
        actions={
          <>
            <Button
              variant="outline"
              nativeButton={false}
              render={<a href={PORTFOLIO_URL} target="_blank" rel="noreferrer" />}
            >
              <ExternalLinkIcon /> View site
            </Button>
            <Button variant="outline" disabled={!dirty} onClick={() => setDiscarding(true)}>
              <Undo2Icon /> Discard
            </Button>
            <Button disabled={(!dirty && !neverSaved) || issues.length > 0 || saving} onClick={() => void save()}>
              {saving ? <Loader2Icon className="animate-spin" /> : <SaveIcon />} Save changes
            </Button>
          </>
        }
      />

      {error ? (
        <ErrorState
          message={error}
          onRetry={() => {
            setError(null)
            setAttempt((n) => n + 1)
          }}
        />
      ) : !draft ? (
        <ListSkeleton rows={5} />
      ) : (
        <div className="max-w-4xl space-y-4">
          {issues.length > 0 && (
            <ul className="space-y-1 rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
              {issues.map((issue) => (
                <li key={issue}>{issue}</li>
              ))}
            </ul>
          )}

          <Tabs defaultValue="profile">
            <TabsList className="flex-wrap">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="experience">Experience · {draft.experience.length}</TabsTrigger>
              <TabsTrigger value="projects">Projects · {draft.projects.length}</TabsTrigger>
              <TabsTrigger value="skills">Agent skills · {draft.agentSkills.length}</TabsTrigger>
              <TabsTrigger value="open-source">Open source · {draft.openSource.repos.length}</TabsTrigger>
              <TabsTrigger value="toolkit">Toolkit · {draft.toolkit.length}</TabsTrigger>
              <TabsTrigger value="references">References · {draft.testimonials.length}</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="pt-2">
              <ProfileEditor
                profile={draft.profile}
                onChange={(patch) => set("profile", { ...draft.profile, ...patch })}
              />
            </TabsContent>

            <TabsContent value="experience" className="pt-2">
              <ListEditor
                items={draft.experience}
                onChange={(experience) => set("experience", experience)}
                title={(e) => [e.title, e.company].filter(Boolean).join(" — ")}
                addLabel="Add role"
                create={(): PortfolioExperience => ({
                  title: "",
                  company: "",
                  location: "",
                  exp: "",
                  description: "",
                  image: "",
                  skills: [],
                })}
                render={(e, update, id) => <ExperienceFields item={e} update={update} id={id} />}
              />
            </TabsContent>

            <TabsContent value="projects" className="pt-2">
              <ListEditor
                items={draft.projects}
                onChange={(projects) => set("projects", projects)}
                title={(p) => p.title}
                addLabel="Add project"
                create={(): PortfolioProject => ({
                  slug: "",
                  title: "",
                  description: "",
                  detail: [],
                  highlights: [],
                  image: "",
                  href: "",
                  meta: "",
                  tags: [],
                  span: "md:col-span-2",
                })}
                render={(p, update, id) => <ProjectFields item={p} update={update} id={id} />}
              />
            </TabsContent>

            <TabsContent value="skills" className="pt-2">
              <ListEditor
                items={draft.agentSkills}
                onChange={(agentSkills) => set("agentSkills", agentSkills)}
                title={(s) => s.name}
                addLabel="Add agent skill"
                create={(): PortfolioAgentSkill => ({
                  name: "",
                  tagline: "",
                  description: "",
                  repo: "",
                  install: "",
                  version: "1.0.0",
                  license: "MIT",
                  spec: [],
                  tags: [],
                })}
                render={(s, update, id) => <SkillFields item={s} update={update} id={id} />}
              />
            </TabsContent>

            <TabsContent value="open-source" className="space-y-4 pt-2">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <TextField
                  label="Organisation"
                  id="open-source-name"
                  value={draft.openSource.name}
                  onChange={(name) => set("openSource", { ...draft.openSource, name })}
                />
                <TextField
                  label="GitHub URL"
                  id="open-source-url"
                  value={draft.openSource.url}
                  onChange={(url) => set("openSource", { ...draft.openSource, url })}
                />
                <TextField
                  label="Intro"
                  id="open-source-intro"
                  multiline
                  value={draft.openSource.intro}
                  onChange={(intro) => set("openSource", { ...draft.openSource, intro })}
                />
              </div>
              <ListEditor
                items={draft.openSource.repos}
                onChange={(repos) => set("openSource", { ...draft.openSource, repos })}
                title={(r) => r.name}
                addLabel="Add repository"
                create={(): PortfolioOpenSourceRepo => ({
                  name: "",
                  description: "",
                  href: "",
                  language: "",
                  license: "",
                })}
                render={(r, update, id) => <RepoFields item={r} update={update} id={id} />}
              />
            </TabsContent>

            <TabsContent value="toolkit" className="pt-2">
              <ListEditor
                items={draft.toolkit}
                onChange={(toolkit) => set("toolkit", toolkit)}
                title={(g) => g.group}
                addLabel="Add group"
                create={() => ({ group: "", items: [] })}
                render={(g, update, id) => (
                  <>
                    <Field label="Group" htmlFor={id("group")} className="sm:col-span-2">
                      <Input id={id("group")} value={g.group} onChange={(e) => update({ group: e.target.value })} />
                    </Field>
                    <TagsField label="Items" id={id("items")} value={g.items} onChange={(items) => update({ items })} />
                  </>
                )}
              />
            </TabsContent>

            <TabsContent value="references" className="pt-2">
              <ListEditor
                items={draft.testimonials}
                onChange={(testimonials) => set("testimonials", testimonials)}
                title={(t) => t.name}
                addLabel="Add reference"
                create={(): PortfolioTestimonial => ({
                  quote: "",
                  name: "",
                  designation: "",
                  src: "",
                  linkedin: "",
                })}
                render={(t, update, id) => <TestimonialFields item={t} update={update} id={id} />}
              />
            </TabsContent>
          </Tabs>
        </div>
      )}

      <ConfirmDialog
        open={discarding}
        onOpenChange={setDiscarding}
        title="Discard unsaved changes?"
        description="The editor goes back to the last saved version."
        confirmLabel="Discard"
        onConfirm={() => setDraft(saved)}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Building blocks                                                     */
/* ------------------------------------------------------------------ */

type Update<T> = (patch: Partial<T>) => void
type FieldId = (field: string) => string

/**
 * Short labels (skills, tags) as removable chips. Enter or a comma adds the
 * typed text; pasting "a, b, c" adds all three; Backspace in an empty box
 * removes the last chip. Duplicates are ignored regardless of case.
 */
function TagsField({
  label,
  id,
  value,
  onChange,
  placeholder = "Type and press Enter",
}: {
  label: string
  id: string
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
}) {
  const [text, setText] = useState("")

  const add = (raw: string) => {
    const seen = new Set(value.map((t) => t.toLowerCase()))
    const next = [...value]
    for (const part of raw.split(/[,\n]/)) {
      const tag = part.trim()
      if (tag && !seen.has(tag.toLowerCase())) {
        seen.add(tag.toLowerCase())
        next.push(tag)
      }
    }
    if (next.length !== value.length) onChange(next)
    setText("")
  }

  return (
    <Field label={label} htmlFor={id} hint="Enter or comma to add" className="sm:col-span-2">
      <div className="flex min-h-8 flex-wrap items-center gap-1.5 rounded-lg border border-input bg-transparent p-1 transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 dark:bg-input/30">
        {value.map((tag, index) => (
          <span
            key={`${tag}-${index}`}
            className="inline-flex h-6 items-center gap-1 rounded-md border bg-muted/50 pr-1 pl-2 text-xs"
          >
            {tag}
            <button
              type="button"
              aria-label={`Remove ${tag}`}
              onClick={() => onChange(value.filter((_, i) => i !== index))}
              className="rounded p-0.5 text-muted-foreground hover:text-foreground"
            >
              <XIcon className="size-3" />
            </button>
          </span>
        ))}
        <input
          id={id}
          value={text}
          placeholder={value.length ? "" : placeholder}
          onChange={(e) => {
            // A typed or pasted comma finishes the tag(s) before it.
            if (/[,\n]/.test(e.target.value)) add(e.target.value)
            else setText(e.target.value)
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              add(text)
            } else if (e.key === "Backspace" && !text && value.length) {
              onChange(value.slice(0, -1))
            }
          }}
          onBlur={() => text.trim() && add(text)}
          className="h-6 min-w-32 flex-1 bg-transparent px-1 text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>
    </Field>
  )
}

/** A string list edited one item per line; blank lines are dropped on save. */
function LinesField({
  label,
  id,
  value,
  onChange,
  hint = "One per line",
  rows,
}: {
  label: string
  id: string
  value: string[]
  onChange: (value: string[]) => void
  hint?: string
  rows?: number
}) {
  return (
    <Field label={label} htmlFor={id} hint={hint} className="sm:col-span-2">
      <Textarea
        id={id}
        rows={rows ?? Math.min(12, Math.max(3, value.length))}
        value={value.join("\n")}
        onChange={(e) => onChange(e.target.value.split("\n"))}
      />
    </Field>
  )
}

/** An image path/URL with a preview and an upload button that puts the file in S3. */
function ImageField({
  label,
  id,
  value,
  onChange,
  wide,
}: {
  label: string
  id: string
  value: string
  onChange: (value: string) => void
  wide?: boolean
}) {
  const input = useRef<HTMLInputElement>(null)
  const [progress, setProgress] = useState<number | null>(null)
  const [broken, setBroken] = useState(false)

  const upload = async (file: File) => {
    if (!IMAGE_TYPES.includes(file.type)) {
      toast.error("Use a PNG, JPEG, WebP, GIF or AVIF image")
      return
    }
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error("Images must be 5 MB or smaller")
      return
    }
    setProgress(0)
    try {
      const url = await portfolioService.uploadImage(file, setProgress)
      setBroken(false)
      onChange(url)
      toast.success("Image uploaded. Save changes to put it on the site.")
    } catch (caught) {
      toast.error("Couldn't upload the image", { description: caught instanceof Error ? caught.message : undefined })
    } finally {
      setProgress(null)
    }
  }

  return (
    <Field
      label={label}
      htmlFor={id}
      hint="Upload an image, or paste a path on the site (/Images/…) or a full URL"
      className={wide ? "sm:col-span-2" : undefined}
    >
      <div className="flex items-center gap-2">
        <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted">
          {value && !broken ? (
            // eslint-disable-next-line @next/next/no-img-element -- arbitrary remote URL, preview only
            <img src={previewSrc(value)} alt="" className="size-full object-cover" onError={() => setBroken(true)} />
          ) : (
            <ImageIcon className="size-4 text-muted-foreground" />
          )}
        </div>
        <Input
          id={id}
          value={value}
          onChange={(e) => {
            setBroken(false)
            onChange(e.target.value)
          }}
        />
        <Button
          variant="outline"
          disabled={progress !== null}
          onClick={() => input.current?.click()}
          aria-label={`Upload ${label.toLowerCase()}`}
        >
          {progress !== null ? (
            <>
              <Loader2Icon className="animate-spin" /> {progress}%
            </>
          ) : (
            <>
              <UploadIcon /> Upload
            </>
          )}
        </Button>
        <input
          ref={input}
          type="file"
          accept={IMAGE_TYPES.join(",")}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            e.target.value = ""
            if (file) void upload(file)
          }}
        />
      </div>
    </Field>
  )
}

function TextField({
  label,
  id,
  value,
  onChange,
  hint,
  placeholder,
  wide,
  multiline,
}: {
  label: string
  id: string
  value: string
  onChange: (value: string) => void
  hint?: string
  placeholder?: string
  wide?: boolean
  multiline?: boolean
}) {
  return (
    <Field label={label} htmlFor={id} hint={hint} className={wide || multiline ? "sm:col-span-2" : undefined}>
      {multiline ? (
        <Textarea id={id} rows={4} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <Input id={id} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      )}
    </Field>
  )
}

/** Label/value rows (readout, spec sheet, social links). */
function PairsEditor<T extends object>({
  label,
  rows,
  onChange,
  fields,
  create,
}: {
  label: string
  rows: T[]
  onChange: (rows: T[]) => void
  fields: Array<{ key: keyof T & string; label: string; className?: string }>
  create: () => T
}) {
  return (
    <div className="space-y-2 sm:col-span-2">
      <p className="text-xs font-medium text-foreground/80">{label}</p>
      {rows.map((row, index) => (
        <div key={index} className="flex items-center gap-2">
          {fields.map((f) => (
            <Input
              key={f.key}
              aria-label={f.label}
              placeholder={f.label}
              className={f.className}
              value={String(row[f.key] ?? "")}
              onChange={(e) => onChange(rows.map((r, i) => (i === index ? { ...r, [f.key]: e.target.value } : r)))}
            />
          ))}
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Remove row ${index + 1}`}
            onClick={() => onChange(rows.filter((_, i) => i !== index))}
          >
            <Trash2Icon />
          </Button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={() => onChange([...rows, create()])}>
        <PlusIcon /> Add row
      </Button>
    </div>
  )
}

/** Ordered cards with reorder/remove controls and an add button. */
function ListEditor<T>({
  items,
  onChange,
  title,
  addLabel,
  create,
  render,
}: {
  items: T[]
  onChange: (items: T[]) => void
  title: (item: T) => string
  addLabel: string
  create: () => T
  render: (item: T, update: Update<T>, id: FieldId) => React.ReactNode
}) {
  const [removing, setRemoving] = useState<number | null>(null)

  const move = (index: number, by: -1 | 1) => {
    const next = [...items]
    const [item] = next.splice(index, 1)
    if (item !== undefined) next.splice(index + by, 0, item)
    onChange(next)
  }

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <section key={index} className="rounded-xl border bg-card">
          <header className="flex items-center gap-2 border-b px-4 py-2.5">
            <span className="text-xs text-muted-foreground tabular-nums">{index + 1}</span>
            <p className="min-w-0 flex-1 truncate text-sm font-semibold">{title(item) || "Untitled"}</p>
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label="Move up"
              disabled={index === 0}
              onClick={() => move(index, -1)}
            >
              <ArrowUpIcon />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label="Move down"
              disabled={index === items.length - 1}
              onClick={() => move(index, 1)}
            >
              <ArrowDownIcon />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label={`Delete ${title(item) || "item"}`}
              onClick={() => setRemoving(index)}
            >
              <Trash2Icon />
            </Button>
          </header>
          <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2">
            {render(
              item,
              (patch) => onChange(items.map((it, i) => (i === index ? { ...it, ...patch } : it))),
              (field) => `item-${index}-${field}`,
            )}
          </div>
        </section>
      ))}

      <Button variant="outline" className="w-full" onClick={() => onChange([...items, create()])}>
        <PlusIcon /> {addLabel}
      </Button>

      <ConfirmDialog
        open={removing !== null}
        onOpenChange={(open) => !open && setRemoving(null)}
        title={`Delete “${removing !== null ? title(items[removing] as T) || "this item" : ""}”?`}
        description="It's removed from the editor now and from the site when you save."
        onConfirm={() => {
          if (removing !== null) onChange(items.filter((_, i) => i !== removing))
          setRemoving(null)
        }}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Sections                                                            */
/* ------------------------------------------------------------------ */

function ProfileEditor({ profile: p, onChange }: { profile: PortfolioProfile; onChange: Update<PortfolioProfile> }) {
  const edu = (patch: Partial<PortfolioProfile["education"]>) => onChange({ education: { ...p.education, ...patch } })

  return (
    <div className="space-y-4">
      <Card title="Hero" description="The top of the page.">
        <TextField label="Name" id="pf-name" value={p.name} onChange={(name) => onChange({ name })} />
        <TextField label="Role" id="pf-role" value={p.role} onChange={(role) => onChange({ role })} />
        <TextField
          label="Status line"
          id="pf-availability"
          wide
          value={p.availability}
          onChange={(availability) => onChange({ availability })}
        />
        <TextField label="Intro" id="pf-intro" multiline value={p.intro} onChange={(intro) => onChange({ intro })} />
        <ImageField label="Photo" id="pf-photo" wide value={p.photo} onChange={(photo) => onChange({ photo })} />
        <PairsEditor
          label="Facts beside the photo"
          rows={p.readout}
          onChange={(readout) => onChange({ readout })}
          create={() => ({ key: "", value: "" })}
          fields={[
            { key: "key", label: "Label", className: "w-36 shrink-0" },
            { key: "value", label: "Value" },
          ]}
        />
      </Card>

      <Card title="AI section">
        <TextField
          label="Heading"
          id="pf-ai-heading"
          wide
          value={p.aiHeading}
          onChange={(aiHeading) => onChange({ aiHeading })}
        />
        <TextField
          label="Text"
          id="pf-ai-blurb"
          multiline
          value={p.aiBlurb}
          onChange={(aiBlurb) => onChange({ aiBlurb })}
        />
        <TagsField label="Chips" id="pf-ai-skills" value={p.aiSkills} onChange={(aiSkills) => onChange({ aiSkills })} />
      </Card>

      <Card title="About" description="The “What I actually do” section.">
        <LinesField
          label="Paragraphs"
          id="pf-about"
          hint="One paragraph per line"
          rows={8}
          value={p.about}
          onChange={(about) => onChange({ about })}
        />
      </Card>

      <Card title="Education">
        <TextField label="Degree" id="pf-degree" value={p.education.degree} onChange={(degree) => edu({ degree })} />
        <TextField label="School" id="pf-school" value={p.education.school} onChange={(school) => edu({ school })} />
        <TextField label="Years" id="pf-years" value={p.education.years} onChange={(years) => edu({ years })} />
        <TextField label="Grade" id="pf-grade" value={p.education.grade} onChange={(grade) => edu({ grade })} />
      </Card>

      <Card title="Contact">
        <TextField label="Email" id="pf-email" value={p.email} onChange={(email) => onChange({ email })} />
        <TextField label="Phone" id="pf-phone" value={p.phone} onChange={(phone) => onChange({ phone })} />
        <TextField
          label="Location"
          id="pf-location"
          value={p.location}
          onChange={(location) => onChange({ location })}
        />
        <TextField
          label="Résumé link"
          id="pf-resume"
          hint="Set by “Sync to portfolio” on a resume, or enter /file.pdf or a full URL"
          value={p.resumeUrl}
          onChange={(resumeUrl) => onChange({ resumeUrl })}
        />
        <TextField
          label="Contact heading"
          id="pf-contact-title"
          wide
          value={p.contactTitle}
          onChange={(contactTitle) => onChange({ contactTitle })}
        />
        <TextField
          label="Contact text"
          id="pf-contact-body"
          multiline
          value={p.contactBody}
          onChange={(contactBody) => onChange({ contactBody })}
        />
        <PairsEditor
          label="Social links (LinkedIn, GitHub and X get their own icons)"
          rows={p.socials}
          onChange={(socials) => onChange({ socials })}
          create={() => ({ label: "", href: "" })}
          fields={[
            { key: "label", label: "Label", className: "w-36 shrink-0" },
            { key: "href", label: "URL" },
          ]}
        />
      </Card>
    </div>
  )
}

function Card({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border bg-card">
      <header className="border-b px-4 py-2.5">
        <p className="text-sm font-semibold">{title}</p>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </header>
      <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2">{children}</div>
    </section>
  )
}

function ExperienceFields({
  item: e,
  update,
  id,
}: {
  item: PortfolioExperience
  update: Update<PortfolioExperience>
  id: FieldId
}) {
  return (
    <>
      <TextField label="Title" id={id("title")} value={e.title} onChange={(title) => update({ title })} />
      <TextField label="Company" id={id("company")} value={e.company} onChange={(company) => update({ company })} />
      <TextField
        label="Location"
        id={id("location")}
        value={e.location}
        onChange={(location) => update({ location })}
      />
      <TextField
        label="Dates"
        id={id("exp")}
        placeholder="Aug 2025 — Present"
        value={e.exp}
        onChange={(exp) => update({ exp })}
      />
      <TextField
        label="Description"
        id={id("description")}
        multiline
        value={e.description}
        onChange={(description) => update({ description })}
      />
      <ImageField label="Logo" id={id("image")} value={e.image} onChange={(image) => update({ image })} />
      <label className="flex items-center gap-2 self-end pb-1.5 text-sm">
        <Switch checked={!!e.current} onCheckedChange={(current) => update({ current })} /> Current role
      </label>
      <TagsField label="Skills" id={id("skills")} value={e.skills} onChange={(skills) => update({ skills })} />
    </>
  )
}

function ProjectFields({
  item: p,
  update,
  id,
}: {
  item: PortfolioProject
  update: Update<PortfolioProject>
  id: FieldId
}) {
  return (
    <>
      <TextField label="Title" id={id("title")} value={p.title} onChange={(title) => update({ title })} />
      <TextField
        label="Slug"
        id={id("slug")}
        hint="Made from the title if left empty"
        value={p.slug}
        onChange={(slug) => update({ slug })}
      />
      <TextField
        label="Card description"
        id={id("description")}
        multiline
        value={p.description}
        onChange={(description) => update({ description })}
      />
      <LinesField
        label="Write-up"
        id={id("detail")}
        hint="One paragraph per line"
        rows={6}
        value={p.detail}
        onChange={(detail) => update({ detail })}
      />
      <LinesField
        label="Highlights"
        id={id("highlights")}
        value={p.highlights}
        onChange={(highlights) => update({ highlights })}
      />
      <ImageField label="Cover image" id={id("image")} wide value={p.image} onChange={(image) => update({ image })} />
      <TextField label="Link" id={id("href")} value={p.href} onChange={(href) => update({ href })} />
      <TextField
        label="Link label"
        id={id("meta")}
        placeholder="GitHub, Google Play…"
        value={p.meta}
        onChange={(meta) => update({ meta })}
      />
      <Field label="Card size">
        <SimpleSelect value={p.span} onValueChange={(v) => update({ span: v as PortfolioCardSpan })} options={SPANS} />
      </Field>
      <label className="flex items-center gap-2 self-end pb-1.5 text-sm">
        <Switch checked={!!p.feature} onCheckedChange={(feature) => update({ feature })} /> Featured card
      </label>
      <TagsField label="Tags" id={id("tags")} value={p.tags} onChange={(tags) => update({ tags })} />
    </>
  )
}

function SkillFields({
  item: s,
  update,
  id,
}: {
  item: PortfolioAgentSkill
  update: Update<PortfolioAgentSkill>
  id: FieldId
}) {
  return (
    <>
      <TextField label="Name" id={id("name")} value={s.name} onChange={(name) => update({ name })} />
      <TextField label="Tagline" id={id("tagline")} value={s.tagline} onChange={(tagline) => update({ tagline })} />
      <TextField
        label="Description"
        id={id("description")}
        multiline
        value={s.description}
        onChange={(description) => update({ description })}
      />
      <TextField label="Repository URL" id={id("repo")} value={s.repo} onChange={(repo) => update({ repo })} />
      <TextField
        label="Install command"
        id={id("install")}
        value={s.install}
        onChange={(install) => update({ install })}
      />
      <TextField label="Version" id={id("version")} value={s.version} onChange={(version) => update({ version })} />
      <TextField label="License" id={id("license")} value={s.license} onChange={(license) => update({ license })} />
      <PairsEditor
        label="Spec sheet"
        rows={s.spec}
        onChange={(spec) => update({ spec })}
        create={() => ({ key: "", value: "" })}
        fields={[
          { key: "key", label: "Label", className: "w-36 shrink-0" },
          { key: "value", label: "Value" },
        ]}
      />
      <TagsField label="Tags" id={id("tags")} value={s.tags} onChange={(tags) => update({ tags })} />
    </>
  )
}

function RepoFields({
  item: r,
  update,
  id,
}: {
  item: PortfolioOpenSourceRepo
  update: Update<PortfolioOpenSourceRepo>
  id: FieldId
}) {
  return (
    <>
      <TextField label="Name" id={id("name")} value={r.name} onChange={(name) => update({ name })} />
      <TextField label="Repository URL" id={id("href")} value={r.href} onChange={(href) => update({ href })} />
      <TextField
        label="Description"
        id={id("description")}
        multiline
        value={r.description}
        onChange={(description) => update({ description })}
      />
      <TextField label="Language" id={id("language")} value={r.language} onChange={(language) => update({ language })} />
      <TextField
        label="License"
        id={id("license")}
        hint="Leave blank if the repository has no LICENSE file."
        value={r.license}
        onChange={(license) => update({ license })}
      />
    </>
  )
}

function TestimonialFields({
  item: t,
  update,
  id,
}: {
  item: PortfolioTestimonial
  update: Update<PortfolioTestimonial>
  id: FieldId
}) {
  return (
    <>
      <TextField label="Name" id={id("name")} value={t.name} onChange={(name) => update({ name })} />
      <TextField
        label="Role"
        id={id("designation")}
        value={t.designation}
        onChange={(designation) => update({ designation })}
      />
      <TextField label="Quote" id={id("quote")} multiline value={t.quote} onChange={(quote) => update({ quote })} />
      <ImageField label="Photo" id={id("src")} value={t.src} onChange={(src) => update({ src })} />
      <TextField
        label="LinkedIn URL"
        id={id("linkedin")}
        value={t.linkedin}
        onChange={(linkedin) => update({ linkedin })}
      />
    </>
  )
}
