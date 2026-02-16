"use client";

import { useParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import type { ImprovementAnalysis } from "@/types/improvements";
import { formatElapsed } from "@/lib/format-time";
import { getScriptStats30 } from "@/lib/script-stats";

const ESTIMATE_30MIN = "1–3 min";

export default function Script30MinPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [script, setScript] = useState("");
  const [loading, setLoading] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [improvements, setImprovements] = useState<ImprovementAnalysis | null>(null);
  const [loadingImprovements, setLoadingImprovements] = useState(false);
  const [applyingImprovements, setApplyingImprovements] = useState(false);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    loadScript();
  }, [projectId]);

  // Update elapsed time every second while generating
  useEffect(() => {
    if (!loading) {
      startTimeRef.current = null;
      return;
    }
    startTimeRef.current = Date.now();
    setElapsedSeconds(0);
    const interval = setInterval(() => {
      if (startTimeRef.current !== null) {
        setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [loading]);

  async function loadScript() {
    try {
      const res = await fetch(`/api/projects/${projectId}/data`);
      if (res.ok) {
        const data = await res.json();
        setScript(data.script_30min || "");
      }
    } catch (error) {
      console.error("Failed to load script:", error);
    }
  }

  async function generateScript() {
    setLoading(true);
    setError(null);
    setImprovements(null);

    try {
      const res = await fetch(`/api/generate/script/${projectId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "30min" }),
      });

      const data = await res.json();

      if (res.ok) {
        setScript(data.script);
      } else {
        setError(data.error || "Failed to generate script");
      }
    } catch (error) {
      console.error("Failed to generate script:", error);
      setError("Failed to generate script. Please check your API key.");
    } finally {
      setLoading(false);
    }
  }

  async function lookForImprovements() {
    setLoadingImprovements(true);
    setError(null);

    try {
      const res = await fetch(`/api/improve/script/${projectId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "30min" }),
      });

      const data = await res.json();

      if (res.ok) {
        setImprovements(data);
      } else {
        setError(data.error || "Failed to analyze script");
      }
    } catch (error) {
      console.error("Failed to analyze script:", error);
      setError("Failed to analyze script. Please check your API key.");
    } finally {
      setLoadingImprovements(false);
    }
  }

  async function applyImprovements() {
    if (!improvements || !improvements.suggestions || improvements.suggestions.length === 0) {
      setError("No improvements to apply");
      return;
    }

    setApplyingImprovements(true);
    setError(null);

    try {
      const res = await fetch(`/api/apply-improvements/${projectId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "30min",
          suggestions: improvements.suggestions,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setScript(data.script);
        setImprovements(null);
      } else {
        setError(data.error || "Failed to apply improvements");
      }
    } catch (error) {
      console.error("Failed to apply improvements:", error);
      setError("Failed to apply improvements. Please try again.");
    } finally {
      setApplyingImprovements(false);
    }
  }

  function downloadScript() {
    if (!script) {
      alert("No script to download");
      return;
    }

    const blob = new Blob([script], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "script-30min.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-slate-900 mb-2">30-Minute Script</h3>
        <p className="text-sm text-slate-600 mb-4">
          4,500-5,500 words • 5-6 chapters
        </p>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-2 mb-4">
          <div className="flex gap-2">
            <button
              onClick={generateScript}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-slate-900 text-white rounded hover:bg-slate-800 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Generating..." : "Generate 30-Min Script"}
            </button>
            {script && (
              <button
                onClick={downloadScript}
                className="px-4 py-2 bg-slate-200 text-slate-700 rounded hover:bg-slate-300 transition-colors"
              >
                Download TXT
              </button>
            )}
          </div>
          {loading && (
            <p className="text-sm text-slate-600">
              Elapsed: {formatElapsed(elapsedSeconds)} • Approx. {ESTIMATE_30MIN} remaining
            </p>
          )}
          {script && (
            <div className="flex gap-2">
              <button
                onClick={lookForImprovements}
                disabled={loadingImprovements}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
              >
                {loadingImprovements ? "Analyzing..." : "Look for Improvements"}
              </button>
              {improvements && improvements.suggestions.length > 0 && (
                <button
                  onClick={applyImprovements}
                  disabled={applyingImprovements}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors"
                >
                  {applyingImprovements ? "Applying..." : "Apply Improvements"}
                </button>
              )}
            </div>
          )}
        </div>

        {improvements && improvements.suggestions.length > 0 && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
            <p className="font-semibold text-blue-900 mb-2">{improvements.summary}</p>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {improvements.suggestions.map((suggestion, i) => (
                <div key={i} className="p-2 bg-white rounded border border-blue-100">
                  <div className="flex items-start gap-2">
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${
                      suggestion.type === "quality_check" ? "bg-yellow-200 text-yellow-800" :
                      suggestion.type === "copyedit" ? "bg-blue-200 text-blue-800" :
                      "bg-purple-200 text-purple-800"
                    }`}>
                      {suggestion.type.toUpperCase()}
                    </span>
                    <div className="flex-1 text-sm text-slate-700">
                      <p className="font-medium">{suggestion.description}</p>
                      {suggestion.location && (
                        <p className="text-xs text-slate-500 mt-1">Location: {suggestion.location}</p>
                      )}
                      {suggestion.suggestion && (
                        <p className="text-xs text-slate-600 mt-1">{suggestion.suggestion}</p>
                      )}
                      {suggestion.original && suggestion.improved && (
                        <div className="mt-2 text-xs">
                          <p className="text-red-600 line-through">{suggestion.original}</p>
                          <p className="text-green-600">{suggestion.improved}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {script && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-slate-900 mb-1">30-Minute Script</h3>
          <p className="text-sm text-slate-600 mb-4">
            {(() => {
              const { wordCount, chapterCount } = getScriptStats30(script);
              return `${wordCount.toLocaleString()} words • ${chapterCount} chapters`;
            })()}
          </p>
          <div className="max-h-[600px] overflow-y-auto border border-slate-200 rounded p-4 bg-slate-50">
            <pre className="whitespace-pre-wrap font-sans text-sm text-slate-900">
              {script}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
