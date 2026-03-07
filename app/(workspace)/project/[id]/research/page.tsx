"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";

export default function ResearchPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [researchText, setResearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    loadResearch();
  }, [projectId]);

  async function loadResearch() {
    try {
      const res = await fetch(`/api/projects/${projectId}/data`);
      if (res.ok) {
        const data = await res.json();
        setResearchText(data.research_text || "");
      }
    } catch (error) {
      console.error("Failed to load research:", error);
    } finally {
      setLoading(false);
    }
  }

  const saveResearch = useDebouncedCallback(async (text: string) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/data`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ research_text: text }),
      });

      if (res.ok) {
        setLastSaved(new Date());
      }
    } catch (error) {
      console.error("Failed to save research:", error);
    } finally {
      setSaving(false);
    }
  }, 1000);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setResearchText(text);
    saveResearch(text);
  };

  if (loading) {
    return <div className="text-center py-12 text-slate-600">Loading research...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Research Input</h2>
        <div className="flex items-center gap-4 text-sm text-slate-600">
          {saving && <span>Saving...</span>}
          {lastSaved && !saving && (
            <span>Saved at {lastSaved.toLocaleTimeString()}</span>
          )}
        </div>
      </div>
      <p className="text-sm text-slate-600 mb-4">
        Paste your historical research fact clusters here. This will be used as the source material for all generated content.
      </p>
      <p className="text-sm text-slate-500 mb-4">
        For best script quality, include: at least 500 words; era or period (e.g. Victorian, century); named people and places.
      </p>
      <textarea
        value={researchText}
        onChange={handleTextChange}
        placeholder="Paste your research here..."
        className="w-full h-[600px] p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent font-mono text-sm resize-none"
      />
      <div className="mt-4 text-sm text-slate-600">
        Word count: {researchText.split(/\s+/).filter(Boolean).length}
      </div>
    </div>
  );
}
