"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import type { Project } from "@/types/database";
import {
  DEFAULT_LLM_BY_STAGE,
  listModelsForStage,
  clearPersistedModelChoiceKeys,
  markModelChoiceStorageRevisionCurrent,
  shouldRestoreSavedModelChoicesFromStorage,
} from "@/lib/models/registry";
import { parseTitlesJson, serializeTitlesJson } from "@/lib/social/episode-title";
import { extractPracticalTagSet } from "@/lib/social/parse-tags";

const SOCIAL_MODELS = listModelsForStage("social");
const LS_SOCIAL_MODEL = "cozycrime:llm:social";
const LS_SOCIAL_THINKING = "cozycrime:llm:social:thinking";

export default function DescriptionPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [project, setProject] = useState<Project | null>(null);
  const [description, setDescription] = useState("");
  const [metadata, setMetadata] = useState("");
  const [socialTitle, setSocialTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingTitle, setLoadingTitle] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [llmModelId, setLlmModelId] = useState(DEFAULT_LLM_BY_STAGE.social);
  const [useThinking, setUseThinking] = useState(false);

  useEffect(() => {
    try {
      if (!shouldRestoreSavedModelChoicesFromStorage()) {
        clearPersistedModelChoiceKeys();
        markModelChoiceStorageRevisionCurrent();
      } else {
        const s = localStorage.getItem(LS_SOCIAL_MODEL);
        if (s && SOCIAL_MODELS.some((m) => m.id === s)) setLlmModelId(s);
        if (localStorage.getItem(LS_SOCIAL_THINKING) === "1") setUseThinking(true);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(LS_SOCIAL_MODEL, llmModelId);
      localStorage.setItem(LS_SOCIAL_THINKING, useThinking ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [llmModelId, useThinking]);

  const selectedSocialModel = SOCIAL_MODELS.find((m) => m.id === llmModelId);
  const thinkingSupported = selectedSocialModel?.supportsThinking ?? false;

  useEffect(() => {
    loadData();
  }, [projectId]);

  async function loadData() {
    try {
      const [dataRes, projectRes] = await Promise.all([
        fetch(`/api/projects/${projectId}/data`),
        fetch(`/api/projects/${projectId}`),
      ]);

      if (dataRes.ok) {
        const data = await dataRes.json();
        setDescription(data.description || "");
        setMetadata(data.metadata_json || "");
        const saved = parseTitlesJson(data.titles_json).canonical;
        if (saved) setSocialTitle(saved);
      }

      if (projectRes.ok) {
        const projectData: Project = await projectRes.json();
        setProject(projectData);
      }
    } catch (error) {
      console.error("Failed to load data:", error);
    }
  }

  async function generateSocialTitle() {
    if (!project) return;
    setLoadingTitle(true);
    setError(null);

    try {
      const res = await fetch(`/api/generate/social-title/${projectId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          llmModelId,
          useThinking: thinkingSupported && useThinking,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSocialTitle(data.title ?? "");
        if (data.warning) setError(data.warning);
      } else {
        setError(data.error || "Failed to generate title");
      }
    } catch (err) {
      console.error("Failed to generate title:", err);
      setError("Failed to generate title. Please check your API key.");
    } finally {
      setLoadingTitle(false);
    }
  }

  async function saveSocialTitle(title: string) {
    if (!title.trim()) return;
    try {
      await fetch(`/api/projects/${projectId}/data`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titles_json: serializeTitlesJson({ canonical: title.trim() }),
        }),
      });
    } catch (err) {
      console.error("Failed to save title:", err);
    }
  }

  async function generateAll() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/generate/description-and-metadata/${projectId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          llmModelId,
          useThinking: thinkingSupported && useThinking,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setDescription(data.description ?? "");
        setMetadata(data.metadata ?? "");
      } else {
        setError(data.error || "Failed to generate description and tags");
      }
    } catch (error) {
      console.error("Failed to generate:", error);
      setError("Failed to generate. Please check your API key.");
    } finally {
      setLoading(false);
    }
  }

  function downloadDescription() {
    if (!description) {
      alert("No description to download");
      return;
    }
    const blob = new Blob([description], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "youtube-description.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const tagsText = extractPracticalTagSet(metadata);

  function downloadTags() {
    const content = tagsText;
    if (!content) {
      alert("No tags to download");
      return;
    }
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tags.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-4 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center gap-4">
        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mr-2">LLM for social copy:</label>
          <select
            value={llmModelId}
            onChange={(e) => {
              const v = e.target.value;
              setLlmModelId(v);
              const m = SOCIAL_MODELS.find((x) => x.id === v);
              if (!m?.supportsThinking) setUseThinking(false);
            }}
            className="text-sm border border-slate-300 dark:border-slate-600 rounded px-2 py-1.5 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-w-[14rem]"
          >
            {[...new Set(SOCIAL_MODELS.map((m) => m.group))].map((group) => (
              <optgroup key={group} label={group}>
                {SOCIAL_MODELS.filter((m) => m.group === group).map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
        {thinkingSupported && (
          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={useThinking}
              onChange={(e) => setUseThinking(e.target.checked)}
              className="rounded border-slate-300 dark:border-slate-600 dark:bg-slate-900"
            />
            Extended thinking
          </label>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-6 border border-transparent dark:border-slate-700">
        <div className="flex items-center justify-between mb-3 gap-3">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Title</h2>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={generateSocialTitle}
              disabled={!project || loadingTitle}
              className="px-4 py-2 bg-slate-900 text-white rounded hover:bg-slate-800 dark:hover:bg-slate-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-sm font-medium transition-colors"
            >
              {loadingTitle ? "Generating..." : "Generate Title"}
            </button>
            <button
              type="button"
              onClick={() => {
                if (!socialTitle) return;
                navigator.clipboard.writeText(socialTitle).catch((err) => {
                  console.error("Failed to copy title:", err);
                });
              }}
              disabled={!socialTitle}
              className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded hover:bg-slate-300 dark:hover:bg-slate-600 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-400 disabled:cursor-not-allowed text-sm font-medium transition-colors"
            >
              Copy Title
            </button>
          </div>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          Generates a canonical episode title from research in the form{" "}
          <span className="font-mono font-semibold">
            NNN | The [Case Name][: hook] | Place, Year
          </span>
          . The episode number is the project ID (e.g. 030). The middle section uses patterns like{" "}
          <span className="italic">The Murder of…</span>, <span className="italic">The [Place] Mystery</span>, or{" "}
          <span className="italic">The Great … Robbery</span>, often with a short factual hook after a colon (e.g.{" "}
          <span className="font-mono">22 Executed</span>, <span className="font-mono">Seven People Condemned</span>).
          The final segment is place and year only (<span className="font-mono">London, 1678</span> or{" "}
          <span className="font-mono">London-Paris, 1885</span>).
        </p>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wide">
              Episode Title
            </label>
            <input
              type="text"
              value={socialTitle}
              onChange={(e) => setSocialTitle(e.target.value)}
              onBlur={(e) => saveSocialTitle(e.target.value)}
              placeholder="030 | The Murder of Sir Edmund Godfrey: 22 Executed | London, 1678"
              className="w-full rounded border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-950 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500 focus:border-slate-400 dark:focus:border-slate-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-6 border border-transparent dark:border-slate-700">
        <div className="flex items-center justify-between mb-4 gap-3">
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50">YouTube Description</h3>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={generateAll}
              disabled={loading}
              className="px-4 py-2 bg-slate-900 text-white rounded hover:bg-slate-800 dark:hover:bg-slate-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-sm font-medium transition-colors"
            >
              {loading ? "Generating..." : "Generate Description & Tags"}
            </button>
            <button
              type="button"
              onClick={() => {
                if (!description) return;
                navigator.clipboard.writeText(description).catch((err) => {
                  console.error("Failed to copy description:", err);
                });
              }}
              disabled={!description}
              className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded hover:bg-slate-300 dark:hover:bg-slate-600 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-400 disabled:cursor-not-allowed text-sm font-medium transition-colors"
            >
              Copy
            </button>
          </div>
        </div>
        <div className="max-h-[500px] overflow-y-auto border border-slate-200 dark:border-slate-700 rounded p-4 bg-slate-50 dark:bg-slate-950/50">
          {description ? (
            <pre className="whitespace-pre-wrap font-sans text-sm text-slate-900 dark:text-slate-100">
              {description}
            </pre>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400 italic">
              No YouTube description yet. Click &quot;Generate Description &amp; Tags&quot; to create one.
            </p>
          )}
        </div>
      </div>

      {metadata && (
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-6 border border-transparent dark:border-slate-700">
          <div className="flex items-center justify-between mb-4 gap-3">
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50">Tags</h3>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={generateAll}
                disabled={loading}
              className="px-4 py-2 bg-slate-900 text-white rounded hover:bg-slate-800 dark:hover:bg-slate-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-sm font-medium transition-colors"
            >
              {loading ? "Generating..." : "Regenerate"}
            </button>
            <button
              type="button"
              onClick={() => {
                if (!tagsText) return;
                navigator.clipboard.writeText(tagsText).catch((err) => {
                  console.error("Failed to copy tags:", err);
                });
              }}
              disabled={!tagsText}
              className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded hover:bg-slate-300 dark:hover:bg-slate-600 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-400 disabled:cursor-not-allowed text-sm font-medium transition-colors"
              >
                Copy
              </button>
            </div>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
            Comma-separated YouTube upload tags for this video.
          </p>
          <div className="max-h-[300px] overflow-y-auto border border-slate-200 dark:border-slate-700 rounded p-4 bg-slate-50 dark:bg-slate-950/50">
            <pre className="whitespace-pre-wrap font-sans text-sm text-slate-900 dark:text-slate-100">
              {tagsText}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
