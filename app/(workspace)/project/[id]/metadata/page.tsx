"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function MetadataPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [metadata, setMetadata] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMetadata();
  }, [projectId]);

  async function loadMetadata() {
    try {
      const res = await fetch(`/api/projects/${projectId}/data`);
      if (res.ok) {
        const data = await res.json();
        setMetadata(data.metadata_json || "");
      }
    } catch (error) {
      console.error("Failed to load metadata:", error);
    }
  }

  async function generateMetadata() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/generate/metadata/${projectId}`, {
        method: "POST",
      });

      const data = await res.json();

      if (res.ok) {
        setMetadata(data.metadata);
      } else {
        setError(data.error || "Failed to generate metadata");
      }
    } catch (error) {
      console.error("Failed to generate metadata:", error);
      setError("Failed to generate metadata. Please check your API key.");
    } finally {
      setLoading(false);
    }
  }

  function downloadMetadata() {
    if (!metadata) {
      alert("No metadata to download");
      return;
    }

    const blob = new Blob([metadata], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "metadata.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">
          Title & Metadata Generator
        </h2>
        <p className="text-sm text-slate-600 mb-6">
          Generate episode titles, summaries, SEO keywords, tags, and upload
          checklist.
        </p>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="flex gap-4 mb-6">
          <button
            onClick={generateMetadata}
            disabled={loading}
            className="px-6 py-2 bg-slate-900 text-white rounded hover:bg-slate-800 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Generating..." : "Generate Titles & Metadata"}
          </button>
          {metadata && (
            <button
              onClick={downloadMetadata}
              className="px-6 py-2 bg-slate-200 text-slate-700 rounded hover:bg-slate-300 transition-colors"
            >
              Download TXT
            </button>
          )}
        </div>
      </div>

      {metadata && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-slate-900 mb-4">
            Generated Titles & Metadata
          </h3>
          <div className="max-h-[600px] overflow-y-auto border border-slate-200 rounded p-4 bg-slate-50">
            <pre className="whitespace-pre-wrap font-sans text-sm text-slate-900">
              {metadata}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
