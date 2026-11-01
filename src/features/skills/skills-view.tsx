"use client"

import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { ListPlusIcon, MoreHorizontalIcon, PencilIcon, PlusIcon, SparklesIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"
import { z } from "zod"
import { cn } from "cn"

import { EmptyState, ErrorState } from "@/components/shared/empty-state"
import { Field, SimpleSelect } from "@/components/shared/form"
import { FormDialog } from "@/components/shared/form-dialog"
import { ConfirmDialog, SearchInput } from "@/components/shared/misc"
import { PageHeader } from "@/components/shared/page-header"
import { CardGridSkeleton } from "@/components/shared/skeletons"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { proficiencyLabel, SKILL_GROUPS } from "@/lib/constants"
import { skillService } from "@/lib/services"
import { createCrudHooks } from "@/lib/store/crud-hooks"
import { invalidateQueries } from "@/lib/store/query"
import { QK, useSkills } from "@/lib/store/queries"
import type { Skill, SkillGroup } from "@/lib/types"
import { matchesQuery } from "@/lib/utils/format"
import { zodResolver } from "@/lib/utils/zod-resolver"

const skillHooks = createCrudHooks(skillService, QK.skills, "Skill")

const LEVELS = [20, 40, 60, 80, 100]

function ProficiencyMeter({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2" role="meter" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} aria-label={`Proficiency ${value}%`}>
      <div className="flex flex-1 gap-0.5">
        {LEVELS.map((level, i) => {
          const fill = Math.max(0, Math.min(1, (value - (level - 20)) / 20))
          return (
            <span key={level} className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
              <span className={cn("absolute inset-y-0 left-0 rounded-full bg-brand", i === 4 && "bg-brand")} style={{ width: `${fill * 100}%` }} />
            </span>
          )
        })}
      </div>
      <span className="w-8 text-right text-xs tabular-nums text-muted-foreground">{value}</span>
    </div>
  )
}

export function SkillsView() {
  const { data: skills, isLoading, error, refetch } = useSkills()
  const remove = skillHooks.useDelete()
  const [query, setQuery] = useState("")
  const [creating, setCreating] = useState(false)
  const [addingMany, setAddingMany] = useState(false)
  const [editing, setEditing] = useState<Skill | null>(null)
  const [deleting, setDeleting] = useState<Skill | null>(null)

  const all = (skills ?? []).filter((s) => matchesQuery(query, s.name))
  const groups = SKILL_GROUPS.map((group) => ({
    ...group,
    skills: all.filter((s) => s.group === group.value).sort((a, b) => b.proficiency - a.proficiency),
  })).filter((g) => g.skills.length > 0)
  const expert = (skills ?? []).filter((s) => s.proficiency >= 85).length

  return (
    <div>
      <PageHeader
        title="Skills"
        description={skills ? `${skills.length} skills tracked · ${expert} at expert level` : "Your technical skill inventory."}
        actions={
          <>
            <Button variant="outline" onClick={() => setAddingMany(true)}>
              <ListPlusIcon /> Add multiple skills
            </Button>
            <Button onClick={() => setCreating(true)}>
              <PlusIcon /> Add skill
            </Button>
          </>
        }
      >
        <SearchInput value={query} onChange={setQuery} placeholder="Search skills…" />
      </PageHeader>

      {error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : isLoading ? (
        <CardGridSkeleton />
      ) : groups.length === 0 ? (
        <EmptyState icon={SparklesIcon} title={query ? "No skills match" : "No skills yet"} action={<Button onClick={() => setCreating(true)}><PlusIcon /> Add skill</Button>} />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {groups.map((group) => {
            const avg = Math.round(group.skills.reduce((sum, s) => sum + s.proficiency, 0) / group.skills.length)
            return (
              <section key={group.value} className="rounded-xl border bg-card">
                <header className="flex items-center justify-between border-b px-4 py-3">
                  <h2 className="text-sm font-semibold">{group.label}</h2>
                  <span className="text-xs text-muted-foreground">
                    {group.skills.length} · avg {avg}
                  </span>
                </header>
                <ul className="divide-y">
                  {group.skills.map((skill) => (
                    <li key={skill.id} className="group grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1.5 px-4 py-2.5">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{skill.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {proficiencyLabel(skill.proficiency)}
                          {skill.years > 0 && ` · ${skill.years} yr${skill.years === 1 ? "" : "s"}`}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger render={<Button variant="ghost" size="icon-xs" aria-label={`Actions for ${skill.name}`} />}>
                          <MoreHorizontalIcon />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-36">
                          <DropdownMenuItem onClick={() => setEditing(skill)}>
                            <PencilIcon /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem variant="destructive" onClick={() => setDeleting(skill)}>
                            <Trash2Icon /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <div className="col-span-2">
                        <ProficiencyMeter value={skill.proficiency} />
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )
          })}
        </div>
      )}

      {creating && <SkillFormDialog open onOpenChange={setCreating} />}
      {addingMany && <AddManySkillsDialog open onOpenChange={setAddingMany} existing={skills ?? []} />}
      {editing && <SkillFormDialog key={editing.id} open skill={editing} onOpenChange={(o) => !o && setEditing(null)} />}
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={`Delete ${deleting?.name}?`}
        onConfirm={async () => {
          if (deleting) await remove.mutate(deleting.id)
        }}
      />
    </div>
  )
}

const schema = z.object({
  name: z.string().trim().min(1, "Skill name is required"),
  group: z.enum(["frontend", "backend", "mobile", "database", "cloud", "ai", "tools"]),
  proficiency: z.number().min(0).max(100),
  years: z.string().regex(/^\d{1,2}$/, "Years"),
})

type FormValues = z.infer<typeof schema>

function SkillFormDialog({ open, onOpenChange, skill }: { open: boolean; onOpenChange: (open: boolean) => void; skill?: Skill }) {
  const create = skillHooks.useCreate()
  const update = skillHooks.useUpdate()
  const { register, control, handleSubmit, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: skill?.name ?? "",
      group: skill?.group ?? "frontend",
      proficiency: skill?.proficiency ?? 60,
      years: String(skill?.years ?? 1),
    },
  })
  const onSubmit = handleSubmit(async (values) => {
    const input = { ...values, years: Number(values.years) }
    const result = skill ? await update.mutate(skill.id, input) : await create.mutate(input)
    if (result) onOpenChange(false)
  })
  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={skill ? "Edit skill" : "Add skill"}
      submitLabel={skill ? "Save" : "Add skill"}
      pending={create.isPending || update.isPending}
      onSubmit={onSubmit}
      size="sm"
    >
      <Field label="Name" htmlFor="sk-name" error={formState.errors.name?.message}>
        <Input id="sk-name" placeholder="TypeScript" {...register("name")} />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Group">
          <Controller control={control} name="group" render={({ field }) => <SimpleSelect value={field.value} onValueChange={field.onChange} options={SKILL_GROUPS} />} />
        </Field>
        <Field label="Years" htmlFor="sk-years" error={formState.errors.years?.message}>
          <Input id="sk-years" inputMode="numeric" {...register("years")} />
        </Field>
      </div>
      <Controller
        control={control}
        name="proficiency"
        render={({ field }) => (
          <Field label={`Proficiency — ${field.value} (${proficiencyLabel(field.value)})`} htmlFor="sk-prof">
            <input
              id="sk-prof"
              type="range"
              min={0}
              max={100}
              step={5}
              value={field.value}
              onChange={(e) => field.onChange(Number(e.target.value))}
              className="w-full accent-[var(--brand)]"
            />
          </Field>
        )}
      />
    </FormDialog>
  )
}

/* ------------------------------------------------------- several at once */

/** Groups for common skills; anything else lands in Tools and can be moved with Edit. */
const GROUP_HINTS: Array<[SkillGroup, RegExp]> = [
  ["mobile", /react native|flutter|android|\bios\b|swift|kotlin|expo/],
  ["frontend", /react|next|vue|angular|svelte|html|css|tailwind|redux|javascript|typescript|figma|webpack|vite/],
  ["database", /sql|postgres|mongo|redis|dynamo|firestore|elastic|cassandra|prisma/],
  ["cloud", /aws|azure|gcp|google cloud|lambda|serverless|kubernetes|docker|terraform|firebase|vercel/],
  ["ai", /\bai\b|\bml\b|llm|machine learning|deep learning|pytorch|tensorflow|langchain|openai|nlp/],
  ["backend", /node|express|nest|django|flask|fastapi|spring|java\b|python|\bgo\b|golang|rust|php|ruby|rails|\.net|c#|graphql|\brest\b|kafka|microservice/],
]

const groupFor = (name: string): SkillGroup => GROUP_HINTS.find(([, pattern]) => pattern.test(name.toLowerCase()))?.[0] ?? "tools"

/** "React:3, Node.js, AWS: 2" → [{ name: "React", years: 3 }, { name: "Node.js" }, { name: "AWS", years: 2 }]. */
function parseSkillList(text: string): Array<{ name: string; years?: number }> {
  const seen = new Set<string>()
  const skills: Array<{ name: string; years?: number }> = []
  for (const part of text.split(/[,\n]/)) {
    const [, rawName = "", rawYears] = part.match(/^\s*(.*?)\s*(?::\s*(\d{1,2}(?:\.\d)?)\s*(?:y|yr|yrs|years?)?)?\s*$/i) ?? []
    const name = rawName.replace(/\s+/g, " ").slice(0, 100)
    if (!name || seen.has(name.toLowerCase())) continue
    seen.add(name.toLowerCase())
    skills.push(rawYears === undefined ? { name } : { name, years: Math.min(60, Number(rawYears)) })
  }
  return skills
}

const manySchema = z.object({
  names: z.string().refine((value) => parseSkillList(value).length > 0, "Add at least one skill"),
  years: z.string().regex(/^(\d{1,2}(\.\d)?)?$/, "A number of years, like 3"),
})

type ManyValues = z.infer<typeof manySchema>

/** Adds a comma-separated list in one go; skills you already have are skipped. */
function AddManySkillsDialog({
  open,
  onOpenChange,
  existing,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  existing: Skill[]
}) {
  const [pending, setPending] = useState(false)
  const { register, handleSubmit, formState } = useForm<ManyValues>({
    resolver: zodResolver(manySchema),
    defaultValues: { names: "", years: "" },
  })

  const onSubmit = handleSubmit(async ({ names, years }) => {
    const have = new Set(existing.map((skill) => skill.name.trim().toLowerCase()))
    const parsed = parseSkillList(names)
    const fresh = parsed.filter((skill) => !have.has(skill.name.toLowerCase()))
    const skipped = parsed.length - fresh.length
    if (!fresh.length) {
      toast.info(skipped === 1 ? "You already have that skill" : "You already have all of those skills")
      return
    }
    setPending(true)
    const results = await Promise.allSettled(
      fresh.map((skill) =>
        skillService.create({
          name: skill.name,
          group: groupFor(skill.name),
          proficiency: 60,
          // No years given: saved as 0, which means "not set".
          years: skill.years ?? (years ? Number(years) : 0),
        }),
      ),
    )
    setPending(false)
    invalidateQueries(QK.skills)
    const added = results.filter((r) => r.status === "fulfilled").length
    const failed = results.length - added
    if (added) {
      toast.success(`Added ${added} skill${added === 1 ? "" : "s"}`, {
        description: [skipped ? `${skipped} already in your list` : "", failed ? `${failed} couldn't be saved` : ""]
          .filter(Boolean)
          .join(" · ") || "Edit one to change its group or proficiency.",
      })
      if (!failed) onOpenChange(false)
    } else {
      toast.error("Couldn't add those skills")
    }
  })

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Add multiple skills"
      description="Separate skills with commas. Add years after a colon if you like."
      submitLabel="Add skills"
      pending={pending}
      onSubmit={onSubmit}
      size="sm"
    >
      <Field label="Skills" htmlFor="sk-many" error={formState.errors.names?.message} hint="e.g. React:3, Node.js:2, AWS, PostgreSQL">
        <Textarea id="sk-many" rows={4} autoFocus aria-invalid={!!formState.errors.names} {...register("names")} />
      </Field>
      <Field
        label="Years of experience (optional)"
        htmlFor="sk-many-years"
        error={formState.errors.years?.message}
        hint="Used for skills without their own years. Leave blank to save them without."
      >
        <Input id="sk-many-years" inputMode="decimal" placeholder="e.g. 2" {...register("years")} />
      </Field>
    </FormDialog>
  )
}
