"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function DescriptionPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [description, setDescription] = useState("");
  const [metadata, setMetadata] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [projectId]);

  async function loadData() {
    try {
      const res = await fetch(`/api/projects/${projectId}/data`);
      if (res.ok) {
        const data = await res.json();
        setDescription(data.description || "");
        setMetadata(data.metadata_json || "");
      }
    } catch (error) {
      console.error("Failed to load data:", error);
    }
  }

  async function generateAll() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/generate/description-and-metadata/${projectId}`, {
        method: "POST",
      });

      const data = await res.json();

      if (res.ok) {
        setDescription(data.description ?? "");
        setMetadata(data.metadata ?? "");
      } else {
        setError(data.error || "Failed to generate description and metadata");
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

  function downloadMetadata() {
    if (!metadata) {
      alert("No titles & metadata to download");
      return;
    }
    const blob = new Blob([metadata], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "titles-and-metadata.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const hasAny = description || metadata;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">
          YouTube Description, Titles & Metadata
        </h2>
        <p className="text-sm text-slate-600 mb-6">
          Generate the YouTube description (with SEO, hashtags, timestamps if script is available),
          episode title options, and metadata (summary, tags, upload checklist) in one go.
        </p>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="flex gap-4 mb-6">
          <button
            onClick={generateAll}
            disabled={loading}
            className="px-6 py-2 bg-slate-900 text-white rounded hover:bg-slate-800 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Generating..." : "Generate Description, Titles & Metadata"}
          </button>
          {hasAny && (
            <>
              {description && (
                <button
                  onClick={downloadDescription}
                  className="px-6 py-2 bg-slate-200 text-slate-700 rounded hover:bg-slate-300 transition-colors"
                >
                  Download Description
                </button>
              )}
              {metadata && (
                <button
                  onClick={downloadMetadata}
                  className="px-6 py-2 bg-slate-200 text-slate-700 rounded hover:bg-slate-300 transition-colors"
                >
                  Download Titles & Metadata
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {description && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-slate-900 mb-4">YouTube Description</h3>
          <div className="max-h-[500px] overflow-y-auto border border-slate-200 rounded p-4 bg-slate-50">
            <pre className="whitespace-pre-wrap font-sans text-sm text-slate-900">
              {description}
            </pre>
          </div>
        </div>
      )}

      {metadata && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-slate-900 mb-4">Titles & Metadata</h3>
          <div className="max-h-[500px] overflow-y-auto border border-slate-200 rounded p-4 bg-slate-50">
            <pre className="whitespace-pre-wrap font-sans text-sm text-slate-900">
              {metadata}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
