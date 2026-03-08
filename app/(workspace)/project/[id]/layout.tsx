"use client";

import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import type { Project } from "@/types/database";

const tabs = [
  { id: "research", label: "Research", href: (id: string) => `/project/${id}/research` },
  { id: "scripts", label: "Script Generator", href: (id: string) => `/project/${id}/scripts` },
  { id: "description", label: "YouTube", href: (id: string) => `/project/${id}/description` },
  { id: "speech", label: "Speech", href: (id: string) => `/project/${id}/speech` },
  { id: "images", label: "Images", href: (id: string) => `/project/${id}/images` },
  { id: "real-images", label: "Real Images", href: (id: string) => `/project/${id}/real-images` },
];

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const pathname = usePathname();
  const projectId = params.id as string;
  const [project, setProject] = useState<Project | null>(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadProject() {
      try {
        const res = await fetch(`/api/projects/${projectId}`);
        if (res.ok) {
          const data = await res.json();
          setProject(data);
        }
      } catch (error) {
        console.error("Failed to load project:", error);
      }
    }
    loadProject();
  }, [projectId]);

  const startRename = () => {
    if (project) {
      setRenameValue(project.title);
      setIsRenaming(true);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  const cancelRename = () => {
    setIsRenaming(false);
    setRenameValue("");
  };

  const saveRename = async () => {
    const trimmed = renameValue.trim();
    if (!trimmed || trimmed === project?.title || isSaving) {
      cancelRename();
      return;
    }
    setIsSaving(true);
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: trimmed }),
      });
      if (res.ok) {
        setProject((p) => (p ? { ...p, title: trimmed } : null));
        cancelRename();
      }
    } catch (error) {
      console.error("Failed to rename project:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const currentTab = tabs.find((tab) => pathname?.includes(tab.id))?.id || "research";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="mb-4">
            <Link
              href="/"
              className="text-sm text-slate-600 hover:text-slate-900 mb-2 inline-block"
            >
              ← Back to Projects
            </Link>
            {project && (
              <div>
                {isRenaming ? (
                  <div className="flex items-center gap-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveRename();
                        if (e.key === "Escape") cancelRename();
                      }}
                      onBlur={saveRename}
                      disabled={isSaving}
                      className="text-2xl font-bold text-slate-900 border border-slate-300 rounded px-2 py-1 w-full max-w-md focus:outline-none focus:ring-2 focus:ring-slate-400"
                      aria-label="Project name"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-2 group">
                    <h1 className="text-2xl font-bold text-slate-900">{project.title}</h1>
                    <button
                      type="button"
                      onClick={startRename}
                      className="p-1.5 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none transition-opacity"
                      title="Rename project"
                      aria-label="Rename project"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                  </div>
                )}
                <p className="text-sm text-slate-600">{project.era_location}</p>
              </div>
            )}
          </div>
          <nav className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => {
              const isActive = currentTab === tab.id;
              return (
                <Link
                  key={tab.id}
                  href={tab.href(projectId)}
                  className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-8 py-8">{children}</div>
    </div>
  );
}
