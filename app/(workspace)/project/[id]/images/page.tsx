"use client";

import { useParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import type { ProjectImage } from "@/types/database";
import { IMAGE_SLOTS } from "@/types/database";

export default function ImagesPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [images, setImages] = useState<ProjectImage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loadingPrompts, setLoadingPrompts] = useState(false);
  const [loadingSlot, setLoadingSlot] = useState<string | null>(null);
  const [loadingAll, setLoadingAll] = useState(false);
  const [generateAllProgress, setGenerateAllProgress] = useState<number | null>(null);

  const loadImages = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/images`);
      if (res.ok) {
        const data = await res.json();
        setImages(data);
      }
    } catch (err) {
      console.error("Failed to load images:", err);
    }
  }, [projectId]);

  useEffect(() => {
    loadImages();
  }, [loadImages]);

  async function generateAllPrompts() {
    setLoadingPrompts(true);
    setError(null);
    try {
      const res = await fetch(`/api/generate/image-prompts/${projectId}`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setImages(data.images ?? []);
      } else {
        setError(data.error || "Failed to generate prompts");
      }
    } catch (err: any) {
      setError(err.message || "Failed to generate prompts");
    } finally {
      setLoadingPrompts(false);
    }
  }

  async function savePrompt(slot: string, prompt: string | null, thumbnail_title?: string | null) {
    try {
      await fetch(`/api/projects/${projectId}/images`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slot, prompt: prompt ?? "", thumbnail_title }),
      });
      await loadImages();
    } catch (err) {
      console.error("Failed to save prompt:", err);
    }
  }

  async function generateOne(slot: string, prompt: string) {
    setLoadingSlot(slot);
    setError(null);
    try {
      const res = await fetch(`/api/generate/image/${projectId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slot, prompt }),
      });
      const data = await res.json();
      if (res.ok) {
        await loadImages();
      } else {
        setError(data.error || "Failed to generate image");
      }
    } catch (err: any) {
      setError(err.message || "Failed to generate image");
    } finally {
      setLoadingSlot(null);
    }
  }

  async function generateAllImages() {
    setLoadingAll(true);
    setError(null);
    setGenerateAllProgress(0);
    try {
      const res = await fetch(`/api/generate/images-all/${projectId}`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setGenerateAllProgress(data.generated ?? 0);
        await loadImages();
      } else {
        setError(data.error || "Failed to generate images");
      }
    } catch (err: any) {
      setError(err.message || "Failed to generate images");
    } finally {
      setLoadingAll(false);
      setGenerateAllProgress(null);
    }
  }

  function downloadImage(slot: string) {
    const url = `/api/projects/${projectId}/images/${slot}`;
    const filename = slot === "thumbnail" ? "thumbnail.png" : `image-${slot}.png`;
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  async function downloadAllImages() {
    try {
      const res = await fetch(`/api/projects/${projectId}/images/download-all`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Failed to download images");
        return;
      }
      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition");
      const match = disposition?.match(/filename="?([^";\n]+)"?/);
      const filename = match?.[1] ?? "images.zip";
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message || "Failed to download images");
    }
  }

  const imagesWithFiles = images.filter((i) => i.image_path);
  const sceneSlots = IMAGE_SLOTS.filter((s) => s !== "thumbnail");
  const thumbnailRow = images.find((i) => i.slot === "thumbnail");

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Images</h2>
        <p className="text-sm text-slate-600 mb-6">
          20 illustrated scene images plus a YouTube thumbnail. Style: period-accurate, Rick and Morty–esque illustrated. Generate prompts with Claude, then generate images with Gemini.
        </p>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="flex flex-wrap gap-4">
          <button
            onClick={generateAllPrompts}
            disabled={loadingPrompts}
            className="px-6 py-2 bg-slate-900 text-white rounded hover:bg-slate-800 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
          >
            {loadingPrompts ? "Generating…" : "Generate all prompts"}
          </button>
          <button
            onClick={generateAllImages}
            disabled={loadingAll || images.every((i) => !i.prompt?.trim())}
            className="px-6 py-2 bg-emerald-700 text-white rounded hover:bg-emerald-800 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
          >
            {loadingAll ? (generateAllProgress != null ? `Generating ${generateAllProgress}/21…` : "Generating…") : "Generate all images"}
          </button>
          <button
            onClick={downloadAllImages}
            disabled={imagesWithFiles.length === 0}
            className="px-6 py-2 bg-slate-200 text-slate-700 rounded hover:bg-slate-300 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
          >
            Download all images ({imagesWithFiles.length})
          </button>
        </div>
      </div>

      {/* YouTube thumbnail */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-slate-900 mb-4">YouTube thumbnail</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Title (for overlay)</label>
            <input
              type="text"
              className="w-full border border-slate-300 rounded px-3 py-2 text-slate-900"
              placeholder="Thumbnail title"
              value={thumbnailRow?.thumbnail_title ?? ""}
              onChange={(e) => {
                const next = images.map((i) =>
                  i.slot === "thumbnail" ? { ...i, thumbnail_title: e.target.value } : i
                );
                setImages(next);
              }}
              onBlur={(e) => {
                if (thumbnailRow) savePrompt("thumbnail", thumbnailRow.prompt, e.target.value || null);
              }}
            />
            <label className="block text-sm font-medium text-slate-700 mt-2">Prompt</label>
            <textarea
              className="w-full border border-slate-300 rounded px-3 py-2 text-slate-900 min-h-[100px] text-sm"
              placeholder="Thumbnail image prompt…"
              value={thumbnailRow?.prompt ?? ""}
              onChange={(e) => {
                setImages((prev) =>
                  prev.map((i) => (i.slot === "thumbnail" ? { ...i, prompt: e.target.value } : i))
                );
              }}
              onBlur={(e) => savePrompt("thumbnail", e.target.value || null, thumbnailRow?.thumbnail_title ?? null)}
            />
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => thumbnailRow?.prompt && generateOne("thumbnail", thumbnailRow.prompt)}
                disabled={loadingSlot === "thumbnail" || !thumbnailRow?.prompt?.trim()}
                className="px-4 py-2 bg-slate-800 text-white rounded hover:bg-slate-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-sm"
              >
                {loadingSlot === "thumbnail" ? "Generating…" : "Generate thumbnail"}
              </button>
              {thumbnailRow?.image_path && (
                <button
                  onClick={() => downloadImage("thumbnail")}
                  className="px-4 py-2 bg-slate-200 text-slate-700 rounded hover:bg-slate-300 text-sm"
                >
                  Download
                </button>
              )}
            </div>
          </div>
          <div>
            {thumbnailRow?.image_path ? (
              <img
                src={`/api/projects/${projectId}/images/thumbnail`}
                alt="Thumbnail"
                className="max-w-full rounded border border-slate-200"
              />
            ) : (
              <div className="aspect-video bg-slate-100 rounded border border-slate-200 flex items-center justify-center text-slate-500 text-sm">
                No thumbnail yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 20 scene images */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-slate-900 mb-4">Scene images (1–20)</h3>
        <div className="space-y-6">
          {sceneSlots.map((slot) => {
            const row = images.find((i) => i.slot === slot);
            const prompt = row?.prompt ?? "";
            const hasImage = !!row?.image_path;
            return (
              <div
                key={slot}
                className="border border-slate-200 rounded-lg p-4 flex flex-col md:flex-row gap-4"
              >
                <div className="flex-shrink-0 w-32 h-24 flex items-center justify-center bg-slate-100 rounded overflow-hidden">
                  {hasImage ? (
                    <img
                      src={`/api/projects/${projectId}/images/${slot}`}
                      alt={`Scene ${slot}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-slate-400 text-xs">#{slot}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-xs font-medium text-slate-500 mb-1">Prompt</label>
                  <textarea
                    className="w-full border border-slate-300 rounded px-3 py-2 text-slate-900 text-sm min-h-[80px]"
                    placeholder={`Prompt for image ${slot}…`}
                    value={prompt}
                    onChange={(e) => {
                      setImages((prev) =>
                        prev.map((i) => (i.slot === slot ? { ...i, prompt: e.target.value } : i))
                      );
                    }}
                    onBlur={(e) => savePrompt(slot, e.target.value || null)}
                  />
                </div>
                <div className="flex-shrink-0 flex items-end gap-2">
                  <button
                    onClick={() => generateOne(slot, prompt)}
                    disabled={loadingSlot === slot || loadingAll || !prompt.trim()}
                    className="px-4 py-2 bg-slate-800 text-white rounded hover:bg-slate-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-sm whitespace-nowrap"
                  >
                    {loadingSlot === slot ? "…" : "Generate"}
                  </button>
                  {hasImage && (
                    <button
                      onClick={() => downloadImage(slot)}
                      className="px-4 py-2 bg-slate-200 text-slate-700 rounded hover:bg-slate-300 text-sm whitespace-nowrap"
                    >
                      Download
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
