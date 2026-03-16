"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import type { Project } from "@/types/database";

export default function DescriptionPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [project, setProject] = useState<Project | null>(null);
  const [description, setDescription] = useState("");
  const [metadata, setMetadata] = useState("");
  const [spotifyDescription, setSpotifyDescription] = useState("");
  const [socialTitle, setSocialTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingSpotify, setLoadingSpotify] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        setSpotifyDescription(data.spotify_description || "");
      }

      if (projectRes.ok) {
        const projectData: Project = await projectRes.json();
        setProject(projectData);
      }
    } catch (error) {
      console.error("Failed to load data:", error);
    }
  }

  function generateSocialTitle() {
    if (!project) return;
    const numberPart = String(project.id).padStart(3, "0");
    const titlePart = project.title;
    const locationEraPart = project.era_location;
    const formatted = `${numberPart} | ${titlePart} | ${locationEraPart}`;
    setSocialTitle(formatted);
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

  async function generateSpotify() {
    setLoadingSpotify(true);
    setError(null);

    try {
      const res = await fetch(`/api/generate/spotify-description/${projectId}`, {
        method: "POST",
      });

      const data = await res.json();

      if (res.ok) {
        setSpotifyDescription(data.spotify_description ?? "");
      } else {
        setError(data.error || "Failed to generate Spotify description");
      }
    } catch (error) {
      console.error("Failed to generate Spotify description:", error);
      setError("Failed to generate. Please check your API key.");
    } finally {
      setLoadingSpotify(false);
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

  function extractSection(
    source: string,
    startMarker: string,
    endMarkers: string[]
  ): string {
    if (!source) return "";
    const start = source.indexOf(startMarker);
    if (start === -1) return "";

    let end = source.length;
    for (const marker of endMarkers) {
      const idx = source.indexOf(marker, start + startMarker.length);
      if (idx !== -1 && idx < end) {
        end = idx;
      }
    }

    return source.slice(start, end).trim();
  }

  const tagsText = extractSection(metadata, "7. Practical tag set", [
    "8. Thumbnail overlay text",
    "9. Final recommended upload package",
  ]);

  const thumbnailText = extractSection(metadata, "8. Thumbnail overlay text", [
    "9. Final recommended upload package",
  ]);

  function downloadTags() {
    const content = tagsText || metadata;
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

  function downloadSpotifyDescription() {
    if (!spotifyDescription) {
      alert("No Spotify description to download");
      return;
    }
    const blob = new Blob([spotifyDescription], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "spotify-description.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const hasAny = description || metadata || spotifyDescription;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-3 gap-3">
          <h2 className="text-2xl font-bold text-slate-900">Title</h2>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={generateSocialTitle}
              disabled={!project}
              className="px-4 py-2 bg-slate-900 text-white rounded hover:bg-slate-800 disabled:bg-slate-400 disabled:cursor-not-allowed text-sm font-medium transition-colors"
            >
              Generate Title
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
              className="px-4 py-2 bg-slate-200 text-slate-700 rounded hover:bg-slate-300 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed text-sm font-medium transition-colors"
            >
              Copy Title
            </button>
          </div>
        </div>
        <p className="text-sm text-slate-600 mb-4">
          Generate a canonical episode title for this case, using the format{" "}
          <span className="font-mono font-semibold">
            004 | The Cock Lane Ghost Affair: Scratching in the Dark | London, 1761
          </span>
          . The number comes from the project ID, the middle section is the case title, and the final section is the
          location and year(s).
        </p>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-slate-700 uppercase tracking-wide">
              Episode Title
            </label>
            <input
              type="text"
              value={socialTitle}
              onChange={(e) => setSocialTitle(e.target.value)}
              placeholder="004 | The Cock Lane Ghost Affair: Scratching in the Dark | London, 1761"
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm text-slate-900 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4 gap-3">
          <h3 className="text-xl font-bold text-slate-900">YouTube Description</h3>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={generateAll}
              disabled={loading}
              className="px-4 py-2 bg-slate-900 text-white rounded hover:bg-slate-800 disabled:bg-slate-400 disabled:cursor-not-allowed text-sm font-medium transition-colors"
            >
              {loading ? "Generating..." : "Generate Description & Package"}
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
              className="px-4 py-2 bg-slate-200 text-slate-700 rounded hover:bg-slate-300 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed text-sm font-medium transition-colors"
            >
              Copy
            </button>
          </div>
        </div>
        <div className="max-h-[500px] overflow-y-auto border border-slate-200 rounded p-4 bg-slate-50">
          {description ? (
            <pre className="whitespace-pre-wrap font-sans text-sm text-slate-900">
              {description}
            </pre>
          ) : (
            <p className="text-sm text-slate-500 italic">
              No YouTube description yet. Click &quot;Generate Description &amp; Package&quot; to create one.
            </p>
          )}
        </div>
      </div>

      {metadata && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4 gap-3">
            <h3 className="text-xl font-bold text-slate-900">Tags</h3>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={generateAll}
                disabled={loading}
                className="px-4 py-2 bg-slate-900 text-white rounded hover:bg-slate-800 disabled:bg-slate-400 disabled:cursor-not-allowed text-sm font-medium transition-colors"
              >
                {loading ? "Generating..." : "Regenerate Tags"}
              </button>
              <button
                type="button"
                onClick={() => {
                  const text = tagsText || metadata;
                  if (!text) return;
                  navigator.clipboard.writeText(text).catch((err) => {
                    console.error("Failed to copy tags:", err);
                  });
                }}
                disabled={!tagsText && !metadata}
                className="px-4 py-2 bg-slate-200 text-slate-700 rounded hover:bg-slate-300 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed text-sm font-medium transition-colors"
              >
                Copy
              </button>
            </div>
          </div>
          <p className="text-sm text-slate-600 mb-3">
            Practical upload tags for this single video, pulled from the social media packaging output.
          </p>
          <div className="max-h-[300px] overflow-y-auto border border-slate-200 rounded p-4 bg-slate-50">
            <pre className="whitespace-pre-wrap font-sans text-sm text-slate-900">
              {tagsText || metadata}
            </pre>
          </div>
        </div>
      )}

      {metadata && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4 gap-3">
            <h3 className="text-xl font-bold text-slate-900">Thumbnail Overlays</h3>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={generateAll}
                disabled={loading}
                className="px-4 py-2 bg-slate-900 text-white rounded hover:bg-slate-800 disabled:bg-slate-400 disabled:cursor-not-allowed text-sm font-medium transition-colors"
              >
                {loading ? "Generating..." : "Regenerate Overlays"}
              </button>
              <button
                type="button"
                onClick={() => {
                  const text = thumbnailText || metadata;
                  if (!text) return;
                  navigator.clipboard.writeText(text).catch((err) => {
                    console.error("Failed to copy thumbnail overlays:", err);
                  });
                }}
                disabled={!thumbnailText && !metadata}
                className="px-4 py-2 bg-slate-200 text-slate-700 rounded hover:bg-slate-300 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed text-sm font-medium transition-colors"
              >
                Copy
              </button>
            </div>
          </div>
          <p className="text-sm text-slate-600 mb-3">
            Concise text options for YouTube thumbnail overlays, staying calm, atmospheric, and sleep-safe.
          </p>
          <div className="max-h-[300px] overflow-y-auto border border-slate-200 rounded p-4 bg-slate-50">
            <pre className="whitespace-pre-wrap font-sans text-sm text-slate-900">
              {thumbnailText || metadata}
            </pre>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4 gap-3">
          <h3 className="text-xl font-bold text-slate-900">Spotify Description</h3>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={generateSpotify}
              disabled={loadingSpotify}
              className="px-4 py-2 bg-slate-900 text-white rounded hover:bg-slate-800 disabled:bg-slate-400 disabled:cursor-not-allowed text-sm font-medium transition-colors"
            >
              {loadingSpotify ? "Generating..." : "Generate Spotify Description"}
            </button>
            <button
              type="button"
              onClick={() => {
                if (!spotifyDescription) return;
                navigator.clipboard.writeText(spotifyDescription).catch((err) => {
                  console.error("Failed to copy Spotify description:", err);
                });
              }}
              disabled={!spotifyDescription}
              className="px-4 py-2 bg-slate-200 text-slate-700 rounded hover:bg-slate-300 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed text-sm font-medium transition-colors"
            >
              Copy
            </button>
          </div>
        </div>
        <div className="max-h-[500px] overflow-y-auto border border-slate-200 rounded p-4 bg-slate-50">
          {spotifyDescription ? (
            <pre className="whitespace-pre-wrap font-sans text-sm text-slate-900">
              {spotifyDescription}
            </pre>
          ) : (
            <p className="text-sm text-slate-500 italic">
              No Spotify description yet. Click &quot;Generate Spotify Description&quot; to create one.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
