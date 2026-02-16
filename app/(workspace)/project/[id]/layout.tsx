"use client";

import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Project } from "@/types/database";

const tabs = [
  { id: "research", label: "Research", href: (id: string) => `/project/${id}/research` },
  { id: "scripts", label: "Script Generator", href: (id: string) => `/project/${id}/scripts` },
  { id: "description", label: "YouTube Description, Titles & Metadata", href: (id: string) => `/project/${id}/description` },
  { id: "shorts", label: "Shorts Generator", href: (id: string) => `/project/${id}/shorts` },
  { id: "image-prompt", label: "Background Image Prompt", href: (id: string) => `/project/${id}/image-prompt` },
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
                <h1 className="text-2xl font-bold text-slate-900">{project.title}</h1>
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
