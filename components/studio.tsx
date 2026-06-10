"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Profile, Project } from "@/lib/types";
import { IuryLockup } from "./iury-mark";
import {
  IconArrow,
  IconChevron,
  IconExternal,
  IconPlus,
  IconTrash,
} from "./icons";

const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "project";

const emptyCase = (cs?: Project["caseStudy"]): Project["caseStudy"] =>
  cs ?? { challenge: "", approach: "", result: "" };

type Tab = "projects" | "profile";

export default function Studio() {
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tab, setTab] = useState<Tab>("projects");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/projects").then((r) => r.json()),
      fetch("/api/profile").then((r) => r.json()),
    ]).then(([p, pr]) => {
      setProjects(p.projects || []);
      setProfile(pr.profile || null);
      setSelectedId(p.projects?.[0]?.id ?? null);
    });
  }, []);

  const flash = useCallback((m: string) => {
    setToast(m);
    setTimeout(() => setToast(null), 2600);
  }, []);

  const selected = projects?.find((p) => p.id === selectedId) ?? null;

  const patchProject = (id: string, patch: Partial<Project>) => {
    setProjects((ps) => ps!.map((p) => (p.id === id ? { ...p, ...patch } : p)));
    setDirty(true);
  };

  const addProject = () => {
    const id = `project-${Date.now().toString(36)}`;
    const np: Project = {
      id,
      slug: id,
      name: "Untitled project",
      tagline: "",
      description: "",
      category: "Web App",
      year: String(new Date().getFullYear()),
      role: "",
      stack: [],
      status: "In development",
      links: {},
      images: [],
      featured: false,
      order: (projects?.length ?? 0) + 1,
    };
    setProjects((ps) => [...(ps ?? []), np]);
    setSelectedId(id);
    setDirty(true);
  };

  const deleteProject = (id: string) => {
    if (!confirm("Delete this project? This cannot be undone.")) return;
    setProjects((ps) => ps!.filter((p) => p.id !== id));
    if (selectedId === id) setSelectedId(projects?.[0]?.id ?? null);
    setDirty(true);
  };

  const move = (id: string, dir: -1 | 1) => {
    setProjects((ps) => {
      const arr = [...ps!];
      const i = arr.findIndex((p) => p.id === id);
      const j = i + dir;
      if (j < 0 || j >= arr.length) return arr;
      [arr[i], arr[j]] = [arr[j], arr[i]];
      return arr;
    });
    setDirty(true);
  };

  const saveProjects = async () => {
    setSaving(true);
    const res = await fetch("/api/projects", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projects }),
    });
    setSaving(false);
    if (res.ok) {
      setDirty(false);
      flash("Projects saved");
    } else {
      const e = await res.json().catch(() => ({}));
      flash(e.error || "Save failed");
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile }),
    });
    setSaving(false);
    if (res.ok) {
      setDirty(false);
      flash("Profile saved");
    } else {
      const e = await res.json().catch(() => ({}));
      flash(e.error || "Save failed");
    }
  };

  if (!projects || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink text-ash">
        <span className="meta animate-pulse">Loading studio…</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink text-bone">
      {/* top bar */}
      <header className="sticky top-0 z-50 border-b border-line bg-ink/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-4 px-5 py-3.5">
          <div className="flex items-center gap-3">
            <IuryLockup size={22} />
            <span className="meta text-[10px] text-ash">Studio</span>
          </div>

          <div className="ms-2 flex items-center gap-1 rounded-full border border-line p-0.5">
            {(["projects", "profile"] as Tab[]).map((tt) => (
              <button
                key={tt}
                onClick={() => setTab(tt)}
                className={`rounded-full px-3.5 py-1.5 text-xs capitalize transition-colors ${
                  tab === tt ? "bg-bone text-ink" : "text-smoke hover:text-bone"
                }`}
              >
                {tt}
              </button>
            ))}
          </div>

          <div className="ms-auto flex items-center gap-3">
            {toast && (
              <span className="meta text-[10px] text-emerald-400">{toast}</span>
            )}
            {dirty && !toast && (
              <span className="meta text-[10px] text-amber-400">Unsaved</span>
            )}
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 meta text-[10px] text-smoke hover:text-bone"
            >
              View site <IconExternal size={13} />
            </Link>
            <button
              onClick={tab === "projects" ? saveProjects : saveProfile}
              disabled={saving}
              className="rounded-full bg-bone px-4 py-2 text-xs font-medium text-ink transition-opacity hover:opacity-80 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </div>
      </header>

      {tab === "projects" ? (
        <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-0 lg:grid-cols-[340px_1fr]">
          {/* list */}
          <aside className="border-b border-line lg:border-b-0 lg:border-e lg:min-h-[calc(100vh-57px)]">
            <div className="flex items-center justify-between px-5 py-4">
              <span className="meta text-[10px] text-ash">
                {projects.length} projects
              </span>
              <button
                onClick={addProject}
                className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs text-bone transition-colors hover:border-bone"
              >
                <IconPlus size={14} /> Add
              </button>
            </div>
            <ul className="pb-6">
              {projects.map((p, i) => (
                <li key={p.id}>
                  <div
                    className={`flex items-center gap-3 border-s-2 px-5 py-3 transition-colors ${
                      selectedId === p.id
                        ? "border-s-bone bg-ink-2"
                        : "border-s-transparent hover:bg-ink-2/50"
                    }`}
                  >
                    <div className="flex flex-col">
                      <button
                        onClick={() => move(p.id, -1)}
                        disabled={i === 0}
                        className="text-ash hover:text-bone disabled:opacity-30"
                        aria-label="Move up"
                      >
                        <IconChevron size={13} className="-rotate-90" />
                      </button>
                      <button
                        onClick={() => move(p.id, 1)}
                        disabled={i === projects.length - 1}
                        className="text-ash hover:text-bone disabled:opacity-30"
                        aria-label="Move down"
                      >
                        <IconChevron size={13} className="rotate-90" />
                      </button>
                    </div>
                    <button
                      onClick={() => setSelectedId(p.id)}
                      className="flex min-w-0 flex-1 items-center gap-3 text-start"
                    >
                      <span className="relative h-9 w-12 shrink-0 overflow-hidden rounded border border-line bg-coal">
                        {p.images?.[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={p.images[0]}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : null}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-1.5 truncate text-sm text-bone">
                          {p.name}
                          {p.featured && (
                            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                          )}
                        </span>
                        <span className="meta block truncate text-[9px] text-ash">
                          {p.category}
                        </span>
                      </span>
                    </button>
                    <button
                      onClick={() => deleteProject(p.id)}
                      className="text-ash hover:text-red-400"
                      aria-label="Delete"
                    >
                      <IconTrash size={15} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </aside>

          {/* editor */}
          <main className="px-5 py-7 md:px-8">
            {selected ? (
              <ProjectEditor
                key={selected.id}
                project={selected}
                onPatch={(patch) => patchProject(selected.id, patch)}
                onFlash={flash}
              />
            ) : (
              <div className="flex h-full items-center justify-center py-20 text-ash">
                <span className="meta">Select or add a project</span>
              </div>
            )}
          </main>
        </div>
      ) : (
        <div className="mx-auto max-w-3xl px-5 py-8 md:px-8">
          <ProfileEditor profile={profile} onChange={(p) => { setProfile(p); setDirty(true); }} onFlash={flash} />
        </div>
      )}
    </div>
  );
}

/* ============================== Project editor ============================== */

function ProjectEditor({
  project,
  onPatch,
  onFlash,
}: {
  project: Project;
  onPatch: (patch: Partial<Project>) => void;
  onFlash: (m: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [stackInput, setStackInput] = useState("");
  const [showI18n, setShowI18n] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const upload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    const added: string[] = [];
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("projectId", project.id);
      try {
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (data.path) added.push(data.path);
        else onFlash(data.error || "Upload failed");
      } catch {
        onFlash("Upload failed");
      }
    }
    if (added.length) onPatch({ images: [...project.images, ...added] });
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const setImages = (images: string[]) => onPatch({ images });
  const makeCover = (i: number) => {
    const arr = [...project.images];
    const [img] = arr.splice(i, 1);
    setImages([img, ...arr]);
  };
  const removeImage = (i: number) =>
    setImages(project.images.filter((_, idx) => idx !== i));

  const addStack = (val: string) => {
    const parts = val
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (parts.length) onPatch({ stack: [...project.stack, ...parts] });
    setStackInput("");
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="display text-3xl text-bone">{project.name || "Untitled"}</h2>
        <div className="flex items-center gap-5">
          <Toggle
            label="Featured"
            value={project.featured}
            onChange={(v) => onPatch({ featured: v })}
          />
          <Toggle
            label="Spotlight"
            value={!!project.spotlight}
            onChange={(v) => onPatch({ spotlight: v })}
          />
          <Toggle
            label="Coming soon"
            value={!!project.comingSoon}
            onChange={(v) => onPatch({ comingSoon: v })}
          />
        </div>
      </div>

      {/* images */}
      <Section title="Images" hint="First image is the cover. Drag a file or click +.">
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {project.images.map((img, i) => (
            <div
              key={img + i}
              className="group relative aspect-video overflow-hidden rounded-md border border-line bg-coal"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img} alt="" className="h-full w-full object-cover" />
              {i === 0 && (
                <span className="absolute start-1.5 top-1.5 rounded bg-bone px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-ink">
                  Cover
                </span>
              )}
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-void/75 opacity-0 transition-opacity group-hover:opacity-100">
                {i !== 0 && (
                  <button
                    onClick={() => makeCover(i)}
                    title="Make cover"
                    className="rounded-full border border-line-2 px-2 py-1 text-[10px] text-bone hover:border-bone"
                  >
                    ★ Cover
                  </button>
                )}
                <button
                  onClick={() => removeImage(i)}
                  title="Remove"
                  className="rounded-full border border-line-2 p-1.5 text-bone hover:border-red-400 hover:text-red-400"
                >
                  <IconTrash size={14} />
                </button>
              </div>
            </div>
          ))}
          <label className="flex aspect-video cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed border-line-2 text-ash transition-colors hover:border-bone hover:text-bone">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => upload(e.target.files)}
            />
            {uploading ? (
              <span className="meta text-[9px] animate-pulse">Uploading…</span>
            ) : (
              <>
                <IconPlus size={18} />
                <span className="meta text-[9px]">Add image</span>
              </>
            )}
          </label>
        </div>
      </Section>

      {/* basics */}
      <Section title="Basics">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" value={project.name} onChange={(v) => onPatch({ name: v, slug: project.slug || slugify(v) })} />
          <Field label="Slug" value={project.slug} mono onChange={(v) => onPatch({ slug: slugify(v) })} />
          <Field label="Alt name (e.g. Arabic)" value={project.alt ?? ""} onChange={(v) => onPatch({ alt: v })} />
          <Field label="Category" value={project.category} onChange={(v) => onPatch({ category: v })} hint="Use ' · ' to separate tags; first tag becomes a filter." />
          <Field label="Year" value={project.year} mono onChange={(v) => onPatch({ year: v })} />
          <Field label="Role" value={project.role} onChange={(v) => onPatch({ role: v })} />
          <Field label="Status" value={project.status} onChange={(v) => onPatch({ status: v })} />
        </div>
        <div className="mt-4">
          <Field label="Tagline" value={project.tagline} onChange={(v) => onPatch({ tagline: v })} />
        </div>
        <div className="mt-4">
          <Field label="Description" value={project.description} onChange={(v) => onPatch({ description: v })} textarea />
        </div>
      </Section>

      {/* stack */}
      <Section title="Stack">
        <div className="flex flex-wrap gap-2">
          {project.stack.map((s, i) => (
            <span
              key={s + i}
              className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1 font-mono text-[11px] text-smoke"
            >
              {s}
              <button
                onClick={() => onPatch({ stack: project.stack.filter((_, idx) => idx !== i) })}
                className="text-ash hover:text-red-400"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <input
          value={stackInput}
          onChange={(e) => setStackInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              addStack(stackInput);
            }
          }}
          onBlur={() => stackInput && addStack(stackInput)}
          placeholder="Type a tech and press Enter…"
          className="mt-3 w-full rounded-md border border-line bg-ink px-3 py-2 text-sm text-bone outline-none placeholder:text-ash focus:border-line-2"
        />
      </Section>

      {/* links */}
      <Section title="Links">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Live URL" value={project.links.live ?? ""} mono onChange={(v) => onPatch({ links: { ...project.links, live: v } })} />
          <Field label="Demo URL" value={project.links.demo ?? ""} mono onChange={(v) => onPatch({ links: { ...project.links, demo: v } })} />
          <Field label="Source (GitHub)" value={project.links.github ?? ""} mono onChange={(v) => onPatch({ links: { ...project.links, github: v } })} />
        </div>
      </Section>

      {/* i18n */}
      <Section title="Translations" hint="Optional. Leave blank to fall back to English.">
        <button
          onClick={() => setShowI18n((s) => !s)}
          className="inline-flex items-center gap-1.5 meta text-[10px] text-smoke hover:text-bone"
        >
          <IconChevron size={13} className={showI18n ? "rotate-90" : ""} />
          {showI18n ? "Hide" : "Edit"} French & Arabic
        </button>
        {showI18n && (
          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            {(["fr", "ar"] as const).map((loc) => (
              <div key={loc} className="space-y-3 rounded-md border border-line p-4">
                <span className="meta text-[10px] text-ash">{loc.toUpperCase()}</span>
                <Field
                  label="Tagline"
                  value={project.i18n?.[loc]?.tagline ?? ""}
                  onChange={(v) =>
                    onPatch({ i18n: { ...project.i18n, [loc]: { ...project.i18n?.[loc], tagline: v } } })
                  }
                />
                <Field
                  label="Description"
                  textarea
                  value={project.i18n?.[loc]?.description ?? ""}
                  onChange={(v) =>
                    onPatch({ i18n: { ...project.i18n, [loc]: { ...project.i18n?.[loc], description: v } } })
                  }
                />
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section
        title="Case study"
        hint="Shown in the Featured Case Study spotlight when Spotlight is on."
      >
        <div className="space-y-4">
          <Field
            label="Challenge"
            textarea
            value={project.caseStudy?.challenge ?? ""}
            onChange={(v) => onPatch({ caseStudy: { ...emptyCase(project.caseStudy)!, challenge: v } })}
          />
          <Field
            label="Approach"
            textarea
            value={project.caseStudy?.approach ?? ""}
            onChange={(v) => onPatch({ caseStudy: { ...emptyCase(project.caseStudy)!, approach: v } })}
          />
          <Field
            label="Result"
            textarea
            value={project.caseStudy?.result ?? ""}
            onChange={(v) => onPatch({ caseStudy: { ...emptyCase(project.caseStudy)!, result: v } })}
          />
          <label className="block">
            <span className="meta text-[10px] text-ash">
              Metrics — JSON array of {`{ "value", "label" }`}
            </span>
            <textarea
              defaultValue={JSON.stringify(project.caseStudy?.metrics ?? [], null, 2)}
              onBlur={(e) => {
                try {
                  const metrics = JSON.parse(e.target.value);
                  onPatch({ caseStudy: { ...emptyCase(project.caseStudy)!, metrics } });
                } catch {
                  onFlash("Invalid metrics JSON");
                }
              }}
              rows={5}
              className="mt-2 w-full rounded-md border border-line bg-ink px-3 py-2 font-mono text-xs text-bone outline-none focus:border-line-2"
            />
          </label>
        </div>
      </Section>
    </div>
  );
}

/* ============================== Profile editor ============================== */

function ProfileEditor({
  profile,
  onChange,
  onFlash,
}: {
  profile: Profile;
  onChange: (p: Profile) => void;
  onFlash: (m: string) => void;
}) {
  const [statsText, setStatsText] = useState(() => JSON.stringify(profile.stats, null, 2));
  const [capsText, setCapsText] = useState(() => JSON.stringify(profile.capabilities, null, 2));
  const [servicesText, setServicesText] = useState(() => JSON.stringify(profile.services ?? [], null, 2));
  const [processText, setProcessText] = useState(() => JSON.stringify(profile.process ?? [], null, 2));

  const set = (patch: Partial<Profile>) => onChange({ ...profile, ...patch });

  const syncJson = () => {
    try {
      const stats = JSON.parse(statsText);
      const capabilities = JSON.parse(capsText);
      const services = JSON.parse(servicesText);
      const process = JSON.parse(processText);
      onChange({ ...profile, stats, capabilities, services, process });
      onFlash("Applied — remember to Save");
    } catch {
      onFlash("Invalid JSON in one of the lists");
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="display text-3xl text-bone">Profile</h2>

      <Section title="Identity">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" value={profile.name} onChange={(v) => set({ name: v })} />
          <Field label="Brand" value={profile.brand} onChange={(v) => set({ brand: v })} />
          <Field label="Initials" value={profile.initials} mono onChange={(v) => set({ initials: v })} />
          <Field label="Roles (comma separated)" value={profile.roles.join(", ")} onChange={(v) => set({ roles: v.split(",").map((s) => s.trim()).filter(Boolean) })} />
          <Field label="Email" value={profile.email} mono onChange={(v) => set({ email: v })} />
          <Field label="Phone" value={profile.phone ?? ""} mono onChange={(v) => set({ phone: v })} />
          <Field
            label="Portrait URL"
            mono
            hint="e.g. /portrait.jpg (drop the file in /public) or an external URL"
            value={profile.portraitUrl ?? ""}
            onChange={(v) => set({ portraitUrl: v })}
          />
          <Field
            label="Operating since (year)"
            mono
            value={profile.since ?? ""}
            onChange={(v) => set({ since: v })}
          />
          <div className="sm:col-span-2">
            <span className="meta text-[10px] text-ash">Portrait — upload</span>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <label className="cursor-pointer rounded-md border border-dashed border-line-2 px-3 py-2 text-xs text-smoke transition-colors hover:border-bone hover:text-bone">
                Choose image
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    const fd = new FormData();
                    fd.append("file", f);
                    fd.append("projectId", "portrait");
                    const res = await fetch("/api/upload", { method: "POST", body: fd });
                    const d = await res.json();
                    if (d.path) {
                      set({ portraitUrl: d.path });
                      onFlash("Portrait uploaded — Save to keep");
                    } else onFlash(d.error || "Upload failed");
                  }}
                />
              </label>
              {profile.portraitUrl && (
                <span className="font-mono text-[11px] text-ash">{profile.portraitUrl}</span>
              )}
            </div>
          </div>
        </div>
        <div className="mt-4">
          <Toggle label="Available for work" value={profile.available} onChange={(v) => set({ available: v })} />
        </div>
      </Section>

      <Section title="Localized copy" hint="English is required; French & Arabic are optional.">
        {(["statement", "location", "tagline", "bio"] as const).map((field) => {
          const lt = (profile[field] ?? {}) as Record<string, string>;
          return (
            <div key={field} className="mb-5">
              <span className="meta text-[10px] capitalize text-ash">{field}</span>
              <div className="mt-2 grid gap-3 sm:grid-cols-3">
                {(["en", "fr", "ar"] as const).map((loc) => (
                  <LangField
                    key={loc}
                    loc={loc}
                    textarea={field === "bio" || field === "statement"}
                    value={lt[loc] ?? ""}
                    onChange={(v) =>
                      set({ [field]: { ...lt, [loc]: v } } as Partial<Profile>)
                    }
                  />
                ))}
              </div>
            </div>
          );
        })}
      </Section>

      <Section title="Social links">
        <div className="grid gap-4 sm:grid-cols-2">
          {(["github", "linkedin", "x", "instagram", "website", "whatsapp", "calendly"] as const).map((k) => (
            <Field
              key={k}
              label={k}
              mono
              value={profile.socials[k] ?? ""}
              onChange={(v) => set({ socials: { ...profile.socials, [k]: v } })}
            />
          ))}
        </div>
      </Section>

      <Section title="Lists — advanced JSON" hint="Edit as JSON, click Apply, then Save.">
        <div className="grid gap-4 lg:grid-cols-2">
          <JsonField label="Stats" value={statsText} onChange={setStatsText} />
          <JsonField label="Capabilities" value={capsText} onChange={setCapsText} />
          <JsonField label="Services" value={servicesText} onChange={setServicesText} />
          <JsonField label="Process" value={processText} onChange={setProcessText} />
        </div>
        <button onClick={syncJson} className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-line px-3.5 py-1.5 text-xs text-bone hover:border-bone">
          <IconArrow size={13} /> Apply JSON
        </button>
      </Section>
    </div>
  );
}

/* ============================== Shared bits ============================== */

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-line pt-6">
      <div className="mb-4">
        <h3 className="text-sm font-medium text-bone">{title}</h3>
        {hint && <p className="mt-1 text-xs text-ash">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  textarea,
  mono,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
  mono?: boolean;
  hint?: string;
}) {
  const cls = `mt-2 w-full rounded-md border border-line bg-ink px-3 py-2 text-sm text-bone outline-none placeholder:text-ash focus:border-line-2 ${
    mono ? "font-mono text-xs" : ""
  }`;
  return (
    <label className="block">
      <span className="meta text-[10px] capitalize text-ash">{label}</span>
      {textarea ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={4} className={cls} />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} className={cls} />
      )}
      {hint && <span className="mt-1 block text-[11px] text-ash/70">{hint}</span>}
    </label>
  );
}

function LangField({
  loc,
  value,
  onChange,
  textarea,
}: {
  loc: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
}) {
  const cls = `mt-1.5 w-full rounded-md border border-line bg-ink px-3 py-2 text-sm text-bone outline-none focus:border-line-2 ${
    loc === "ar" ? "font-ar" : ""
  }`;
  return (
    <label className="block">
      <span className="meta text-[9px] text-ash">{loc.toUpperCase()}</span>
      {textarea ? (
        <textarea dir={loc === "ar" ? "rtl" : "ltr"} value={value} onChange={(e) => onChange(e.target.value)} rows={4} className={cls} />
      ) : (
        <input dir={loc === "ar" ? "rtl" : "ltr"} value={value} onChange={(e) => onChange(e.target.value)} className={cls} />
      )}
    </label>
  );
}

function JsonField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="meta text-[10px] text-ash">{label} (JSON)</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={8}
        className="mt-2 w-full rounded-md border border-line bg-ink px-3 py-2 font-mono text-xs text-bone outline-none focus:border-line-2"
      />
    </label>
  );
}

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="inline-flex items-center gap-2.5"
      type="button"
    >
      <span
        className={`relative h-5 w-9 rounded-full border transition-colors ${
          value ? "border-bone bg-bone" : "border-line-2 bg-transparent"
        }`}
      >
        <span
          className={`absolute top-0.5 h-3.5 w-3.5 rounded-full transition-all ${
            value ? "start-[18px] bg-ink" : "start-0.5 bg-smoke"
          }`}
        />
      </span>
      <span className="meta text-[10px] text-smoke">{label}</span>
    </button>
  );
}
