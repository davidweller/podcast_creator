"use client";

import { useParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import type { ProjectImage } from "@/types/database";
import { ILLUSTRATED_SLOTS, IMAGE_SLOTS } from "@/types/database";
import {
  DEFAULT_IMAGE_MODEL,
  DEFAULT_LLM_BY_STAGE,
  IMAGE_MODELS,
  listModelsForStage,
  clearPersistedModelChoiceKeys,
  markModelChoiceStorageRevisionCurrent,
  normalizeLegacyImageModelId,
  shouldRestoreSavedModelChoicesFromStorage,
} from "@/lib/models/registry";

const IMAGE_PROMPT_MODELS = listModelsForStage("imagePrompt");
const LS_IMAGE_PROMPT_MODEL = "cozycrime:llm:imagePrompt";
const LS_IMAGE_PROMPT_THINKING = "cozycrime:llm:imagePrompt:thinking";
const LS_IMAGE_MODEL = "cozycrime:image:model";
const LS_GEMINI_IMAGE = "cozycrime:gemini:imageModel";

interface ThumbnailMeta {
  pass?: boolean;
  score?: number;
  strategy?: string;
  reasons?: string[];
  attemptCount?: number;
}

export default function ImagesPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [images, setImages] = useState<ProjectImage[]>([]);
  const [thumbnailBust, setThumbnailBust] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);
  const [loadingPrompts, setLoadingPrompts] = useState(false);
  const [loadingThumbnailPromptSlot, setLoadingThumbnailPromptSlot] = useState<string | null>(null);
  const [loadingSlots, setLoadingSlots] = useState<Set<string>>(new Set());
  const [loadingAll, setLoadingAll] = useState(false);
  const [generateAllProgress, setGenerateAllProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);
  const [promptsElapsedTime, setPromptsElapsedTime] = useState(0);
  const [imagesElapsedTime, setImagesElapsedTime] = useState(0);
  const [llmModelId, setLlmModelId] = useState(DEFAULT_LLM_BY_STAGE.imagePrompt);
  const [useThinking, setUseThinking] = useState(false);
  const [imageModel, setImageModel] = useState(DEFAULT_IMAGE_MODEL);

  useEffect(() => {
    try {
      if (!shouldRestoreSavedModelChoicesFromStorage()) {
        clearPersistedModelChoiceKeys();
        markModelChoiceStorageRevisionCurrent();
      } else {
        const s = localStorage.getItem(LS_IMAGE_PROMPT_MODEL);
        if (s && IMAGE_PROMPT_MODELS.some((m) => m.id === s)) setLlmModelId(s);
        if (localStorage.getItem(LS_IMAGE_PROMPT_THINKING) === "1") setUseThinking(true);
        const genericModel = normalizeLegacyImageModelId(
          localStorage.getItem(LS_IMAGE_MODEL) ?? ""
        );
        if (genericModel && IMAGE_MODELS.some((m) => m.id === genericModel)) {
          setImageModel(genericModel as typeof DEFAULT_IMAGE_MODEL);
        } else {
          const legacyGemini = localStorage.getItem(LS_GEMINI_IMAGE);
          if (legacyGemini === "gemini-2.5-flash-image") {
            setImageModel("gemini/gemini-2.5-flash-image");
          }
        }
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(LS_IMAGE_PROMPT_MODEL, llmModelId);
      localStorage.setItem(LS_IMAGE_PROMPT_THINKING, useThinking ? "1" : "0");
      localStorage.setItem(LS_IMAGE_MODEL, imageModel);
      if (imageModel === "gemini/gemini-2.5-flash-image") {
        localStorage.setItem(LS_GEMINI_IMAGE, "gemini-2.5-flash-image");
      }
    } catch {
      /* ignore */
    }
  }, [llmModelId, useThinking, imageModel]);

  const selectedPromptModel = IMAGE_PROMPT_MODELS.find((m) => m.id === llmModelId);
  const promptThinkingSupported = selectedPromptModel?.supportsThinking ?? false;

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

  // Timer for prompts generation
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (loadingPrompts) {
      setPromptsElapsedTime(0);
      interval = setInterval(() => {
        setPromptsElapsedTime((prev) => prev + 1);
      }, 1000);
    } else {
      setPromptsElapsedTime(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [loadingPrompts]);

  // Timer for images generation
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (loadingAll) {
      setImagesElapsedTime(0);
      interval = setInterval(() => {
        setImagesElapsedTime((prev) => prev + 1);
      }, 1000);
    } else {
      setImagesElapsedTime(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [loadingAll]);

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  async function generateAllPrompts() {
    setLoadingPrompts(true);
    setError(null);
    try {
      const res = await fetch(`/api/generate/image-prompts/${projectId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          llmModelId,
          useThinking: promptThinkingSupported && useThinking,
        }),
      });
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

  async function generateThumbnailPrompt(slot: "thumbnail_cozy" | "thumbnail_cinematic") {
    setLoadingThumbnailPromptSlot(slot);
    setError(null);
    try {
      const res = await fetch(`/api/generate/image-prompts/${projectId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          llmModelId,
          useThinking: promptThinkingSupported && useThinking,
          thumbnailVariant: slot === "thumbnail_cozy" ? "cozy" : "cinematic",
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setImages(data.images ?? []);
      } else {
        setError(data.error || "Failed to generate thumbnail prompt");
      }
    } catch (err: any) {
      setError(err.message || "Failed to generate thumbnail prompt");
    } finally {
      setLoadingThumbnailPromptSlot(null);
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

  function getThumbnailMeta(slot: string): ThumbnailMeta | null {
    const row = images.find((i) => i.slot === slot);
    const raw = row?.thumbnail_meta_json;
    if (!raw) return null;
    try {
      return JSON.parse(raw) as ThumbnailMeta;
    } catch {
      return null;
    }
  }

  async function generateOne(slot: string, prompt: string, safeMode = false) {
    if (!prompt?.trim()) {
      setError(`No prompt for slot ${slot}. Please add a prompt first.`);
      return;
    }
    setLoadingSlots((prev) => {
      const next = new Set(prev);
      next.add(slot);
      return next;
    });
    setError(null);
    try {
      const res = await fetch(`/api/generate/image/${projectId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slot, prompt, imageModel, safeMode }),
      });
      const data = await res.json();
      if (res.ok) {
        await loadImages();
        if (slot === "thumbnail_cozy" || slot === "thumbnail_cinematic") {
          setThumbnailBust((prev) => ({ ...prev, [slot]: Date.now() }));
        }
      } else {
        const errorMsg = data.error || `Failed to generate image for slot ${slot}`;
        console.error(`Error generating image for slot ${slot}:`, errorMsg, data);
        setError(errorMsg);
      }
    } catch (err: any) {
      const msg = err?.message || "";
      const errorMsg =
        msg === "Failed to fetch"
          ? "Network error while waiting for the server (common if the request runs a long time, the dev server restarted, or a browser extension blocked the call). Retry after the terminal shows the request finished; try the same host you used to open the app (localhost vs LAN IP)."
          : msg || `Failed to generate image for slot ${slot}`;
      console.error(`Error generating image for slot ${slot}:`, err);
      setError(errorMsg);
    } finally {
      setLoadingSlots((prev) => {
        const next = new Set(prev);
        next.delete(slot);
        return next;
      });
    }
  }

  async function generateAllImages() {
    const rowsBySlot = new Map(images.map((i) => [i.slot, i]));
    const orderedWithPrompts = IMAGE_SLOTS.filter((slot) => {
      const row = rowsBySlot.get(slot);
      return row?.prompt?.trim();
    });
    if (orderedWithPrompts.length === 0) {
      setError("No prompts to generate. Generate prompts first.");
      return;
    }

    setLoadingAll(true);
    setError(null);
    setGenerateAllProgress({ current: 0, total: orderedWithPrompts.length });

    try {
      const res = await fetch(`/api/generate/images-all/${projectId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageModel }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError((data as { error?: string }).error || "Failed to generate images");
        return;
      }

      const generated = typeof data.generated === "number" ? data.generated : 0;
      const results = Array.isArray(data.results) ? data.results : [];
      const failures = results
        .filter((r: { ok?: boolean; slot?: string; error?: string }) => !r.ok && r.error !== "No prompt")
        .map((r: { slot?: string; error?: string }) => `${r.slot ?? "unknown"}: ${r.error ?? "failed"}`);

      await loadImages();
      setGenerateAllProgress({ current: orderedWithPrompts.length, total: orderedWithPrompts.length });
      setThumbnailBust((prev) => ({
        ...prev,
        thumbnail_cozy: Date.now(),
        thumbnail_cinematic: Date.now(),
      }));

      if (failures.length > 0) {
        setError(
          generated === 0
            ? failures.join(" · ")
            : `Generated ${generated} of ${orderedWithPrompts.length}. Failures: ${failures.join(" · ")}`
        );
      }
    } finally {
      setLoadingAll(false);
      setGenerateAllProgress(null);
    }
  }

  function downloadImage(slot: string) {
    const url = `/api/projects/${projectId}/images/${slot}`;
    const filename =
      slot === "thumbnail_cozy"
        ? "thumbnail-cozy.png"
        : slot === "thumbnail_cinematic"
        ? "thumbnail-cinematic.png"
        : `image-${slot}.png`;
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
  const sceneSlots = ILLUSTRATED_SLOTS.filter((s) => s !== "thumbnail_cozy" && s !== "thumbnail_cinematic");
  const thumbnailVariants = [
    { slot: "thumbnail_cozy", label: "Cozy thumbnail" },
    { slot: "thumbnail_cinematic", label: "Cinematic thumbnail" },
  ] as const;

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-6 border border-transparent dark:border-slate-700">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-2">Images</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
          12 illustrated scene images plus cozy and cinematic YouTube thumbnails. Style: period-accurate, Rick and Morty–esque illustrated. Defaults: Claude Sonnet 4.6 for prompt LLM and ChatGPT Images 2.0 (gpt-image-2) for image generation; you can switch models in the dropdowns below.
        </p>

        <div className="mb-4 flex flex-wrap gap-6 items-end">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Prompt LLM</label>
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={llmModelId}
                onChange={(e) => {
                  const v = e.target.value;
                  setLlmModelId(v);
                  const m = IMAGE_PROMPT_MODELS.find((x) => x.id === v);
                  if (!m?.supportsThinking) setUseThinking(false);
                }}
                disabled={loadingPrompts}
                className="text-sm border border-slate-300 dark:border-slate-600 rounded px-2 py-1.5 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-w-[12rem]"
              >
                {[...new Set(IMAGE_PROMPT_MODELS.map((m) => m.group))].map((group) => (
                  <optgroup key={group} label={group}>
                    {IMAGE_PROMPT_MODELS.filter((m) => m.group === group).map((model) => (
                      <option key={model.id} value={model.id}>
                        {model.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              {promptThinkingSupported && (
                <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useThinking}
                    onChange={(e) => setUseThinking(e.target.checked)}
                    disabled={loadingPrompts}
                    className="rounded border-slate-300 dark:border-slate-600 dark:bg-slate-900"
                  />
                  Extended thinking
                </label>
              )}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Image model</label>
            <select
              value={imageModel}
              onChange={(e) => setImageModel(e.target.value as typeof DEFAULT_IMAGE_MODEL)}
              disabled={loadingAll || loadingSlots.size > 0}
              className="text-sm border border-slate-300 dark:border-slate-600 rounded px-2 py-1.5 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-w-[12rem]"
            >
              {[...new Set(IMAGE_MODELS.map((m) => m.provider))].map((provider) => (
                <optgroup
                  key={provider}
                  label={provider === "google_gemini" ? "Google Gemini" : "OpenAI"}
                >
                  {IMAGE_MODELS.filter((m) => m.provider === provider).map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 dark:bg-red-950/40 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-300 rounded">
            {error}
          </div>
        )}

        <div className="flex flex-wrap gap-4">
          <button
            onClick={generateAllPrompts}
            disabled={loadingPrompts}
            className="px-6 py-2 bg-slate-900 text-white rounded hover:bg-slate-800 dark:hover:bg-slate-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
          >
            {loadingPrompts ? `Generating… (${formatTime(promptsElapsedTime)})` : "Generate all prompts"}
          </button>
          <button
            onClick={generateAllImages}
            disabled={loadingAll || images.every((i) => !i.prompt?.trim())}
            className="px-6 py-2 bg-emerald-700 text-white rounded hover:bg-emerald-800 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
          >
            {loadingAll
              ? generateAllProgress != null
                ? `Generating ${generateAllProgress.current}/${generateAllProgress.total}… (${formatTime(imagesElapsedTime)})`
                : `Generating… (${formatTime(imagesElapsedTime)})`
              : "Generate all images"}
          </button>
          <button
            onClick={downloadAllImages}
            disabled={imagesWithFiles.length === 0}
            className="px-6 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded hover:bg-slate-300 dark:hover:bg-slate-600 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-500 disabled:cursor-not-allowed transition-colors"
          >
            Download all images ({imagesWithFiles.length})
          </button>
        </div>
      </div>

      {/* YouTube thumbnails */}
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-6 border border-transparent dark:border-slate-700">
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-4">YouTube thumbnails</h3>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {thumbnailVariants.map((variant) => {
            const row = images.find((i) => i.slot === variant.slot);
            const meta = getThumbnailMeta(variant.slot);
            const hasSafetyWarning = Boolean(meta && meta.pass === false);
            return (
              <div key={variant.slot} className="space-y-4 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100">{variant.label}</h4>
                  {hasSafetyWarning && (
                    <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200">
                      Framing risk (score {meta?.score ?? "?"})
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Overlay text (2-4 words)</label>
                  <input
                    type="text"
                    className="w-full border border-slate-300 dark:border-slate-600 rounded px-3 py-2 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-950"
                    placeholder={`${variant.label} overlay text`}
                    value={row?.thumbnail_title ?? ""}
                    onChange={(e) => {
                      setImages((prev) =>
                        prev.map((i) => (i.slot === variant.slot ? { ...i, thumbnail_title: e.target.value } : i))
                      );
                    }}
                    onBlur={(e) => {
                      if (row) savePrompt(variant.slot, row.prompt, e.target.value || null);
                    }}
                  />
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mt-2">Prompt</label>
                  <textarea
                    className="w-full border border-slate-300 dark:border-slate-600 rounded px-3 py-2 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-950 min-h-[100px] text-sm"
                    placeholder={`${variant.label} image prompt...`}
                    value={row?.prompt ?? ""}
                    onChange={(e) => {
                      setImages((prev) =>
                        prev.map((i) => (i.slot === variant.slot ? { ...i, prompt: e.target.value } : i))
                      );
                    }}
                    onBlur={(e) => savePrompt(variant.slot, e.target.value || null, row?.thumbnail_title ?? null)}
                  />
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() =>
                        generateThumbnailPrompt(variant.slot as "thumbnail_cozy" | "thumbnail_cinematic")
                      }
                      disabled={loadingThumbnailPromptSlot === variant.slot || loadingPrompts}
                      className="px-4 py-2 bg-indigo-700 text-white rounded hover:bg-indigo-800 disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed text-sm"
                    >
                      {loadingThumbnailPromptSlot === variant.slot
                        ? "Generating prompt..."
                        : "Generate thumbnail prompt"}
                    </button>
                    <button
                      onClick={() => row?.prompt && generateOne(variant.slot, row.prompt)}
                      disabled={loadingSlots.has(variant.slot) || !row?.prompt?.trim()}
                      className="px-4 py-2 bg-slate-800 text-white rounded hover:bg-slate-700 dark:hover:bg-slate-600 disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed text-sm"
                    >
                      {loadingSlots.has(variant.slot) ? "Generating..." : `Generate ${variant.label.toLowerCase()}`}
                    </button>
                    <button
                      onClick={() => row?.prompt && generateOne(variant.slot, row.prompt, true)}
                      disabled={loadingSlots.has(variant.slot) || !row?.prompt?.trim()}
                      className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed text-sm"
                    >
                      Regenerate safer
                    </button>
                    {row?.image_path && (
                      <button
                        onClick={() => downloadImage(variant.slot)}
                        className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded hover:bg-slate-300 dark:hover:bg-slate-600 text-sm"
                      >
                        Download
                      </button>
                    )}
                  </div>
                </div>
                {hasSafetyWarning && (
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    {meta?.reasons?.[0] || "The thumbnail may have clipped edge content. Try Regenerate safer."}
                  </p>
                )}
                <div>
                  {row?.image_path ? (
                    <img
                      src={`/api/projects/${projectId}/images/${variant.slot}?v=${thumbnailBust[variant.slot] ?? 0}`}
                      alt={variant.label}
                      className="max-w-full rounded border border-slate-200 dark:border-slate-700"
                    />
                  ) : (
                    <div className="aspect-video bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 text-sm">
                      No image yet
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 12 scene images */}
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-6 border border-transparent dark:border-slate-700">
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-4">Scene images (1–12)</h3>
        <div className="space-y-6">
          {sceneSlots.map((slot) => {
            const row = images.find((i) => i.slot === slot);
            const prompt = row?.prompt ?? "";
            const hasImage = !!row?.image_path;
            return (
              <div
                key={slot}
                className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 flex flex-col md:flex-row gap-4"
              >
                <div className="flex-shrink-0 w-full md:w-80 aspect-video flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded overflow-hidden">
                  {hasImage ? (
                    <img
                      src={`/api/projects/${projectId}/images/${slot}`}
                      alt={`Scene ${slot}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-slate-400 dark:text-slate-500 text-xs">#{slot}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0 flex flex-col">
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 flex-shrink-0">Prompt</label>
                  <textarea
                    className="w-full border border-slate-300 dark:border-slate-600 rounded px-3 py-2 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-950 text-sm flex-1 min-h-0 resize-y"
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
                <div className="flex-shrink-0 flex flex-col items-end gap-2">
                  <button
                    onClick={() => generateOne(slot, prompt)}
                    disabled={loadingSlots.has(slot) || loadingAll || !prompt.trim()}
                    className="px-4 py-2 bg-slate-800 text-white rounded hover:bg-slate-700 dark:hover:bg-slate-600 disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed text-sm whitespace-nowrap w-full md:w-auto"
                  >
                    {loadingSlots.has(slot) ? "…" : "Generate"}
                  </button>
                  {hasImage && (
                    <button
                      onClick={() => downloadImage(slot)}
                      className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded hover:bg-slate-300 dark:hover:bg-slate-600 text-sm whitespace-nowrap w-full md:w-auto"
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
