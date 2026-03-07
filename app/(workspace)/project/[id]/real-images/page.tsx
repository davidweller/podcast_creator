"use client";

import { useParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import type { RealImage, ArchivalSearchResult, ImageSlot } from "@/types/database";
import { IMAGE_SLOTS } from "@/types/database";

const SCENE_SLOTS = IMAGE_SLOTS.filter((s) => s !== "thumbnail");

const SOURCE_LABELS: Record<string, string> = {
  europeana: "Europeana",
  loc: "Library of Congress",
  wikimedia: "Wikimedia Commons",
};

const SOURCE_COLORS: Record<string, string> = {
  europeana: "bg-blue-100 text-blue-800",
  loc: "bg-amber-100 text-amber-800",
  wikimedia: "bg-green-100 text-green-800",
};

export default function RealImagesPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [keywords, setKeywords] = useState<string[]>([]);
  const [newKeyword, setNewKeyword] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ArchivalSearchResult[]>([]);
  const [flaggedImages, setFlaggedImages] = useState<RealImage[]>([]);
  const [searchErrors, setSearchErrors] = useState<{ source: string; error: string }[]>([]);

  const [loadingKeywords, setLoadingKeywords] = useState(false);
  const [searching, setSearching] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const [sources, setSources] = useState({ europeana: true, loc: true, wikimedia: true });
  const [photosOnly, setPhotosOnly] = useState(true);

  const loadFlaggedImages = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/real-images?flagged=true`);
      if (res.ok) {
        const data = await res.json();
        setFlaggedImages(data.images || []);
      }
    } catch (err) {
      console.error("Failed to load flagged images:", err);
    }
  }, [projectId]);

  const loadKeywords = useCallback(async () => {
    setLoadingKeywords(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/real-images?keywords=true`);
      if (res.ok) {
        const data = await res.json();
        const kw = data.keywords || [];
        setKeywords(kw);
        setFlaggedImages(data.images || []);
        // Initialize search query with first keyword if empty
        if (kw.length > 0 && !searchQuery) {
          setSearchQuery(kw[0]);
        }
      }
    } catch (err) {
      console.error("Failed to load keywords:", err);
    } finally {
      setLoadingKeywords(false);
    }
  }, [projectId, searchQuery]);

  useEffect(() => {
    loadKeywords();
  }, [loadKeywords]);

  async function handleSearch() {
    if (!searchQuery.trim()) return;

    setSearching(true);
    setSearchErrors([]);
    setSearchResults([]);

    try {
      const res = await fetch("/api/search/archival-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: searchQuery.trim(),
          europeana: sources.europeana,
          loc: sources.loc,
          wikimedia: sources.wikimedia,
          limit: 30,
          photosOnly,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSearchResults(data.results || []);
        setSearchErrors(data.errors || []);
      } else {
        setSearchErrors([{ source: "search", error: data.error || "Search failed" }]);
      }
    } catch (err: any) {
      setSearchErrors([{ source: "search", error: err.message }]);
    } finally {
      setSearching(false);
    }
  }

  async function flagImage(result: ArchivalSearchResult) {
    try {
      const res = await fetch(`/api/projects/${projectId}/real-images`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result),
      });

      if (res.ok) {
        await loadFlaggedImages();
      }
    } catch (err) {
      console.error("Failed to flag image:", err);
    }
  }

  async function toggleFlag(imageId: number) {
    try {
      const res = await fetch(`/api/projects/${projectId}/real-images`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_id: imageId, action: "toggle_flag" }),
      });

      if (res.ok) {
        await loadFlaggedImages();
      }
    } catch (err) {
      console.error("Failed to toggle flag:", err);
    }
  }

  async function updateSceneSlot(imageId: number, slot: string | null) {
    try {
      await fetch(`/api/projects/${projectId}/real-images`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_id: imageId, scene_slot: slot }),
      });
      await loadFlaggedImages();
    } catch (err) {
      console.error("Failed to update scene slot:", err);
    }
  }

  async function downloadAllFlagged() {
    setDownloading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/real-images/download`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const data = await res.json();
      if (res.ok) {
        await loadFlaggedImages();
        alert(`Downloaded ${data.downloaded} of ${data.total} images`);
      } else {
        alert(data.error || "Download failed");
      }
    } catch (err: any) {
      alert(err.message || "Download failed");
    } finally {
      setDownloading(false);
    }
  }

  function addKeyword() {
    const kw = newKeyword.trim();
    if (kw && !keywords.includes(kw)) {
      setKeywords([...keywords, kw]);
      setNewKeyword("");
    }
  }

  function removeKeyword(kw: string) {
    setKeywords(keywords.filter((k) => k !== kw));
  }

  const isResultFlagged = (result: ArchivalSearchResult) =>
    flaggedImages.some((img) => img.source === result.source && img.source_id === result.source_id);

  const pendingDownload = flaggedImages.filter((img) => !img.downloaded).length;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Real Images</h2>
        <p className="text-sm text-slate-600 mb-6">
          Search historical archives for real photographs and illustrations. Flag images you want to
          use, assign them to script scenes, and download in full resolution.
        </p>

        {/* Search Query */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Search Query
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Enter search terms..."
              className="flex-1 border border-slate-300 rounded px-3 py-2 text-slate-900"
            />
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Tip: Use specific terms like &quot;Camden Town 1907&quot; or &quot;Edwardian portrait&quot; for better results
          </p>
        </div>

        {/* Suggested Keywords */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Suggested Keywords
            {loadingKeywords && (
              <span className="ml-2 text-slate-400">(extracting from script...)</span>
            )}
            <span className="ml-2 text-slate-400 font-normal">(click to use)</span>
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {keywords.map((kw) => (
              <button
                key={kw}
                onClick={() => setSearchQuery(kw)}
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors ${
                  searchQuery === kw
                    ? "bg-slate-800 text-white"
                    : "bg-slate-100 text-slate-800 hover:bg-slate-200"
                }`}
              >
                {kw}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addKeyword()}
              placeholder="Add custom keyword..."
              className="flex-1 border border-slate-300 rounded px-3 py-2 text-slate-900 text-sm"
            />
            <button
              onClick={addKeyword}
              className="px-4 py-2 bg-slate-200 text-slate-700 rounded hover:bg-slate-300 text-sm"
            >
              Add
            </button>
          </div>
        </div>

        {/* Source toggles */}
        <div className="flex flex-wrap gap-4 mb-6">
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={sources.europeana}
              onChange={(e) => setSources({ ...sources, europeana: e.target.checked })}
              className="rounded border-slate-300"
            />
            <span className={`px-2 py-0.5 rounded text-xs ${SOURCE_COLORS.europeana}`}>
              Europeana
            </span>
          </label>
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={sources.loc}
              onChange={(e) => setSources({ ...sources, loc: e.target.checked })}
              className="rounded border-slate-300"
            />
            <span className={`px-2 py-0.5 rounded text-xs ${SOURCE_COLORS.loc}`}>
              Library of Congress
            </span>
          </label>
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={sources.wikimedia}
              onChange={(e) => setSources({ ...sources, wikimedia: e.target.checked })}
              className="rounded border-slate-300"
            />
            <span className={`px-2 py-0.5 rounded text-xs ${SOURCE_COLORS.wikimedia}`}>
              Wikimedia Commons
            </span>
          </label>
          <span className="text-slate-300">|</span>
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={photosOnly}
              onChange={(e) => setPhotosOnly(e.target.checked)}
              className="rounded border-slate-300"
            />
            <span className="text-slate-700">Photos only</span>
          </label>
        </div>

        <button
          onClick={handleSearch}
          disabled={searching || !searchQuery.trim()}
          className="px-6 py-2 bg-slate-900 text-white rounded hover:bg-slate-800 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
        >
          {searching ? "Searching..." : "Search Archives"}
        </button>

        {searchErrors.length > 0 && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded text-sm text-amber-800">
            {searchErrors.map((e, i) => (
              <div key={i}>
                {e.source}: {e.error}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Search Results */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-slate-900 mb-4">
            Search Results {searchResults.length > 0 && `(${searchResults.length})`}
          </h3>

          {searchResults.length === 0 && !searching && (
            <p className="text-slate-500 text-sm">
              Enter keywords and click &ldquo;Search Archives&rdquo; to find images.
            </p>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {searchResults.map((result, idx) => {
              const flagged = isResultFlagged(result);
              return (
                <div
                  key={`${result.source}-${result.source_id}-${idx}`}
                  className={`relative group border rounded-lg overflow-hidden ${
                    flagged ? "border-emerald-500 ring-2 ring-emerald-200" : "border-slate-200"
                  }`}
                >
                  <div className="aspect-square bg-slate-100 relative">
                    <img
                      src={result.thumbnail_url}
                      alt={result.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'%3E%3Cpath stroke='%23999' stroke-width='1.5' d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'/%3E%3C/svg%3E";
                      }}
                    />
                    <span
                      className={`absolute top-1 left-1 px-1.5 py-0.5 text-xs rounded ${
                        SOURCE_COLORS[result.source]
                      }`}
                    >
                      {result.source === "loc" ? "LOC" : result.source.slice(0, 1).toUpperCase()}
                    </span>
                    <button
                      onClick={() => !flagged && flagImage(result)}
                      disabled={flagged}
                      className={`absolute top-1 right-1 w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                        flagged
                          ? "bg-emerald-500 text-white"
                          : "bg-white/80 text-slate-600 hover:bg-emerald-500 hover:text-white"
                      }`}
                      title={flagged ? "Already flagged" : "Flag for download"}
                    >
                      {flagged ? "✓" : "+"}
                    </button>
                  </div>
                  <div className="p-2">
                    <p
                      className="text-xs text-slate-700 line-clamp-2 mb-1"
                      title={result.title}
                    >
                      {result.title}
                    </p>
                    <p className="text-xs text-slate-500">{result.rights_info}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Flagged Images */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-slate-900">
              Flagged ({flaggedImages.length})
            </h3>
            {pendingDownload > 0 && (
              <button
                onClick={downloadAllFlagged}
                disabled={downloading}
                className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:bg-slate-400 text-sm"
              >
                {downloading ? "Downloading..." : `Download ${pendingDownload}`}
              </button>
            )}
          </div>

          {flaggedImages.length === 0 && (
            <p className="text-slate-500 text-sm">
              Click + on images to flag them for download.
            </p>
          )}

          <div className="space-y-3">
            {flaggedImages.map((image) => (
              <div
                key={image.id}
                className="flex gap-3 p-2 border border-slate-200 rounded-lg"
              >
                <div className="w-16 h-16 flex-shrink-0 bg-slate-100 rounded overflow-hidden relative">
                  {image.local_path ? (
                    <img
                      src={image.local_path}
                      alt={image.title || ""}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={image.thumbnail_url}
                      alt={image.title || ""}
                      className="w-full h-full object-cover"
                    />
                  )}
                  {image.downloaded && (
                    <span className="absolute bottom-0 left-0 right-0 bg-emerald-500 text-white text-[10px] text-center">
                      Downloaded
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-700 line-clamp-1" title={image.title || ""}>
                    {image.title || "Untitled"}
                  </p>
                  <p className="text-xs text-slate-500">{SOURCE_LABELS[image.source]}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <select
                      value={image.scene_slot || ""}
                      onChange={(e) =>
                        updateSceneSlot(image.id, e.target.value || null)
                      }
                      className="text-xs border border-slate-200 rounded px-1 py-0.5"
                    >
                      <option value="">No scene</option>
                      {SCENE_SLOTS.map((slot) => (
                        <option key={slot} value={slot}>
                          Scene {slot}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => toggleFlag(image.id)}
                      className="text-xs text-red-600 hover:text-red-800"
                      title="Remove from flagged"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
