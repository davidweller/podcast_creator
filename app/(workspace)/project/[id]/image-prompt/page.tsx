"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import {
  DEFAULT_LLM_BY_STAGE,
  listModelsForStage,
} from "@/lib/models/registry";

const IMAGE_PROMPT_MODELS = listModelsForStage("imagePrompt");
const LS_IMAGE_PROMPT_MODEL = "cozycrime:llm:imagePrompt";
const LS_IMAGE_PROMPT_THINKING = "cozycrime:llm:imagePrompt:thinking";

export default function ImagePromptPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [imagePrompt, setImagePrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [llmModelId, setLlmModelId] = useState(DEFAULT_LLM_BY_STAGE.imagePrompt);
  const [useThinking, setUseThinking] = useState(false);

  useEffect(() => {
    try {
      const s = localStorage.getItem(LS_IMAGE_PROMPT_MODEL);
      if (s && IMAGE_PROMPT_MODELS.some((m) => m.id === s)) setLlmModelId(s);
      if (localStorage.getItem(LS_IMAGE_PROMPT_THINKING) === "1") setUseThinking(true);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(LS_IMAGE_PROMPT_MODEL, llmModelId);
      localStorage.setItem(LS_IMAGE_PROMPT_THINKING, useThinking ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [llmModelId, useThinking]);

  const selectedImagePromptModel = IMAGE_PROMPT_MODELS.find((m) => m.id === llmModelId);
  const thinkingSupported = selectedImagePromptModel?.supportsThinking ?? false;

  useEffect(() => {
    loadImagePrompt();
  }, [projectId]);

  async function loadImagePrompt() {
    try {
      const res = await fetch(`/api/projects/${projectId}/data`);
      if (res.ok) {
        const data = await res.json();
        setImagePrompt(data.image_prompt || "");
      }
    } catch (error) {
      console.error("Failed to load image prompt:", error);
    }
  }

  async function generateImagePrompt() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/generate/image-prompt/${projectId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          llmModelId,
          useThinking: thinkingSupported && useThinking,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setImagePrompt(data.imagePrompt);
      } else {
        setError(data.error || "Failed to generate image prompt");
      }
    } catch (error) {
      console.error("Failed to generate image prompt:", error);
      setError("Failed to generate image prompt. Please check your API key.");
    } finally {
      setLoading(false);
    }
  }

  function downloadImagePrompt() {
    if (!imagePrompt) {
      alert("No image prompt to download");
      return;
    }

    const blob = new Blob([imagePrompt], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "image-prompt.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function copyToClipboard() {
    if (!imagePrompt) {
      alert("No image prompt to copy");
      return;
    }

    navigator.clipboard.writeText(imagePrompt);
    alert("Image prompt copied to clipboard!");
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">
          Background Image Prompt Generator
        </h2>
        <p className="text-sm text-slate-600 mb-6">
          Generate an image prompt optimized for ChatGPT and Gemini image generation
          systems. The prompt describes a calm, period-accurate background suitable
          for looping video.
        </p>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="mb-4 flex flex-wrap items-center gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-sm font-medium text-slate-700">LLM:</label>
            <select
              value={llmModelId}
              onChange={(e) => {
                const v = e.target.value;
                setLlmModelId(v);
                const m = IMAGE_PROMPT_MODELS.find((x) => x.id === v);
                if (!m?.supportsThinking) setUseThinking(false);
              }}
              disabled={loading}
              className="text-sm border border-slate-300 rounded px-2 py-1.5 bg-white min-w-[14rem]"
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
          </div>
          {thinkingSupported && (
            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={useThinking}
                onChange={(e) => setUseThinking(e.target.checked)}
                disabled={loading}
                className="rounded border-slate-300"
              />
              Extended thinking
            </label>
          )}
        </div>

        <div className="flex gap-4 mb-6">
          <button
            onClick={generateImagePrompt}
            disabled={loading}
            className="px-6 py-2 bg-slate-900 text-white rounded hover:bg-slate-800 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Generating..." : "Generate Image Prompt"}
          </button>
          {imagePrompt && (
            <>
              <button
                onClick={copyToClipboard}
                className="px-6 py-2 bg-slate-200 text-slate-700 rounded hover:bg-slate-300 transition-colors"
              >
                Copy to Clipboard
              </button>
              <button
                onClick={downloadImagePrompt}
                className="px-6 py-2 bg-slate-200 text-slate-700 rounded hover:bg-slate-300 transition-colors"
              >
                Download TXT
              </button>
            </>
          )}
        </div>
      </div>

      {imagePrompt && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-slate-900 mb-4">
            Generated Image Prompt
          </h3>
          <div className="max-h-[400px] overflow-y-auto border border-slate-200 rounded p-4 bg-slate-50">
            <pre className="whitespace-pre-wrap font-sans text-sm text-slate-900">
              {imagePrompt}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
