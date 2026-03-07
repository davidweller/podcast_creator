"use client";

import { useParams, usePathname } from "next/navigation";
import Link from "next/link";

const scriptTabs = [
  { id: "90min", label: "90-Minute Script", href: (id: string) => `/project/${id}/scripts/90min` },
  { id: "shorts", label: "YouTube Short", href: (id: string) => `/project/${id}/scripts/shorts` },
];

export default function ScriptsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const pathname = usePathname();
  const projectId = params.id as string;

  const currentTab = scriptTabs.find((tab) => pathname?.includes(`/scripts/${tab.id}`))?.id || "90min";

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">
          Script Generator
        </h2>
        <p className="text-sm text-slate-600 mb-4">
          Generate scripts from your research. After generation, use the "Look for Improvements" button
          to analyze the script and get suggestions for quality checks and copyediting.
        </p>
        <nav className="flex gap-1 border-b border-slate-200">
          {scriptTabs.map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <Link
                key={tab.id}
                href={tab.href(projectId)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "text-slate-900 border-b-2 border-slate-900"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>
      {children}
    </>
  );
}
