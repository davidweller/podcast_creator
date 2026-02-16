"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function ImagePromptPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [imagePrompt, setImagePrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
