"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";

export default function ResearchPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [researchText, setResearchText] = useState("");
  const [topic, setTopic] = useState("");
  const [researching, setResearching] = useState(false);
  const [researchError, setResearchError] = useState<string | null>(null);
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
    setResearchError(null);
  };

  async function handleRequestResearch() {
    const trimmed = topic.trim();
    if (!trimmed) return;
    if (researchText.trim() && !window.confirm("This will replace your current research. Continue?")) {
      return;
    }
    setResearching(true);
    setResearchError(null);
    try {
      const res = await fetch(`/api/generate/research/${projectId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) {
        setResearchError(data.error || "Failed to generate research.");
        return;
      }
      setResearchText(data.research);
      setLastSaved(new Date());
    } catch (err) {
      console.error("Request research failed:", err);
      setResearchError("Failed to generate research. Please try again.");
    } finally {
      setResearching(false);
    }
  }

  if (loading) {
    return <div className="text-center py-12 text-slate-600">Loading research...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Research</h2>
        <div className="flex items-center gap-4 text-sm text-slate-600">
          {saving && <span>Saving...</span>}
          {lastSaved && !saving && (
            <span>Saved at {lastSaved.toLocaleTimeString()}</span>
          )}
        </div>
      </div>

      <section className="mb-6 p-4 border border-slate-200 rounded-lg bg-slate-50">
        <h3 className="text-lg font-semibold text-slate-800 mb-2">Request research</h3>
        <p className="text-sm text-slate-600 mb-3">
          Enter a historical topic and Claude will produce structured fact clusters (The World, The People, The Events, The Aftermath) for script writing.
        </p>
        <div className="flex gap-3 flex-wrap items-end">
          <label className="flex-1 min-w-[200px]">
            <span className="sr-only">Research topic</span>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleRequestResearch()}
              placeholder="e.g. The disappearance of Benjamin Bathurst, 1809"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900 placeholder-slate-400"
              disabled={researching}
              aria-label="Research topic"
            />
          </label>
          <button
            type="button"
            onClick={handleRequestResearch}
            disabled={researching || !topic.trim()}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
          >
            {researching ? "Researching…" : "Research this topic"}
          </button>
        </div>
        {researchError && (
          <p className="mt-2 text-sm text-red-600" role="alert">
            {researchError}
          </p>
        )}
      </section>

      <section>
        <h3 className="text-lg font-semibold text-slate-800 mb-2">Your research</h3>
        <p className="text-sm text-slate-600 mb-2">
          Paste your own research here, or use the request above to generate it. This content is used for script and asset generation.
        </p>
        <p className="text-sm text-slate-500 mb-4">
          For best script quality, include: at least 500 words; era or period (e.g. Victorian, century); named people and places.
        </p>
        <textarea
          value={researchText}
          onChange={handleTextChange}
          placeholder="Paste your research here..."
          className="w-full h-[500px] p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent font-mono text-sm resize-none disabled:opacity-70"
          disabled={researching}
          aria-label="Research content"
        />
        <div className="mt-4 text-sm text-slate-600">
          Word count: {researchText.split(/\s+/).filter(Boolean).length}
        </div>
      </section>
    </div>
  );
}
