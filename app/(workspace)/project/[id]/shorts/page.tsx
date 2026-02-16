"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function ShortsPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [shorts, setShorts] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadShorts();
  }, [projectId]);

  async function loadShorts() {
    try {
      const res = await fetch(`/api/projects/${projectId}/data`);
      if (res.ok) {
        const data = await res.json();
        setShorts(data.shorts || "");
      }
    } catch (error) {
      console.error("Failed to load shorts:", error);
    }
  }

  async function generateShorts() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/generate/shorts/${projectId}`, {
        method: "POST",
      });

      const data = await res.json();

      if (res.ok) {
        setShorts(data.shorts);
      } else {
        setError(data.error || "Failed to generate shorts script");
      }
    } catch (error) {
      console.error("Failed to generate shorts:", error);
      setError("Failed to generate shorts script. Please check your API key.");
    } finally {
      setLoading(false);
    }
  }

  function downloadShorts() {
    if (!shorts) {
      alert("No shorts script to download");
      return;
    }

    const blob = new Blob([shorts], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "shorts-script.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const wordCount = shorts.split(/\s+/).filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">
          Shorts Generator
        </h2>
        <p className="text-sm text-slate-600 mb-6">
          Generate a 50-100 word YouTube Shorts trailer script from your episode
          title and research.
        </p>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="flex gap-4 mb-6">
          <button
            onClick={generateShorts}
            disabled={loading}
            className="px-6 py-2 bg-slate-900 text-white rounded hover:bg-slate-800 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Generating..." : "Generate Shorts Script"}
          </button>
          {shorts && (
            <button
              onClick={downloadShorts}
              className="px-6 py-2 bg-slate-200 text-slate-700 rounded hover:bg-slate-300 transition-colors"
            >
              Download TXT
            </button>
          )}
        </div>
      </div>

      {shorts && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-slate-900">
              Generated Shorts Script
            </h3>
            <span className="text-sm text-slate-600">
              {wordCount} words {wordCount >= 50 && wordCount <= 100 ? "✓" : "(target: 50-100)"}
            </span>
          </div>
          <div className="max-h-[400px] overflow-y-auto border border-slate-200 rounded p-4 bg-slate-50">
            <pre className="whitespace-pre-wrap font-sans text-sm text-slate-900">
              {shorts}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
