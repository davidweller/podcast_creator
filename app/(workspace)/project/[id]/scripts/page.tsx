"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function ScriptsPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [script30Min, setScript30Min] = useState("");
  const [script90Min, setScript90Min] = useState("");
  const [loading30, setLoading30] = useState(false);
  const [loading90, setLoading90] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [violations30, setViolations30] = useState<string[]>([]);
  const [violations90, setViolations90] = useState<string[]>([]);

  useEffect(() => {
    loadScripts();
  }, [projectId]);

  async function loadScripts() {
    try {
      const res = await fetch(`/api/projects/${projectId}/data`);
      if (res.ok) {
        const data = await res.json();
        setScript30Min(data.script_30min || "");
        setScript90Min(data.script_90min || "");
      }
    } catch (error) {
      console.error("Failed to load scripts:", error);
    }
  }

  async function generateScript30Min() {
    setLoading30(true);
    setError(null);
    setViolations30([]);

    try {
      const res = await fetch(`/api/generate/script/${projectId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "30min" }),
      });

      const data = await res.json();

      if (res.ok) {
        setScript30Min(data.script);
        if (data.violations && data.violations.length > 0) {
          setViolations30(data.violations);
        }
      } else {
        setError(data.error || "Failed to generate script");
      }
    } catch (error) {
      console.error("Failed to generate script:", error);
      setError("Failed to generate script. Please check your API key.");
    } finally {
      setLoading30(false);
    }
  }

  async function generateScript90Min() {
    setLoading90(true);
    setError(null);
    setViolations90([]);

    try {
      const res = await fetch(`/api/generate/script/${projectId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "90min" }),
      });

      const data = await res.json();

      if (res.ok) {
        setScript90Min(data.script);
        if (data.violations && data.violations.length > 0) {
          setViolations90(data.violations);
        }
      } else {
        setError(data.error || "Failed to generate script");
      }
    } catch (error) {
      console.error("Failed to generate script:", error);
      setError("Failed to generate script. Please check your API key.");
    } finally {
      setLoading90(false);
    }
  }

  function downloadScript(type: "30min" | "90min") {
    const script = type === "30min" ? script30Min : script90Min;
    if (!script) {
      alert("No script to download");
      return;
    }

    const blob = new Blob([script], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `script-${type}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">
          Script Generator
        </h2>
        <p className="text-sm text-slate-600 mb-6">
          Generate publish-ready scripts from your research. Each script is validated
          against Cozy Crime standards and automatically corrected if needed.
        </p>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="border border-slate-200 rounded-lg p-4">
            <h3 className="font-semibold text-slate-900 mb-2">30-Minute Script</h3>
            <p className="text-sm text-slate-600 mb-4">
              4,500-5,500 words • 5-6 chapters
            </p>
            <div className="flex gap-2">
              <button
                onClick={generateScript30Min}
                disabled={loading30}
                className="flex-1 px-4 py-2 bg-slate-900 text-white rounded hover:bg-slate-800 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading30 ? "Generating..." : "Generate 30-Min Script"}
              </button>
              {script30Min && (
                <button
                  onClick={() => downloadScript("30min")}
                  className="px-4 py-2 bg-slate-200 text-slate-700 rounded hover:bg-slate-300 transition-colors"
                >
                  Download TXT
                </button>
              )}
            </div>
            {violations30.length > 0 && (
              <div className="mt-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded text-sm">
                <p className="font-semibold mb-1">Validation warnings:</p>
                <ul className="list-disc list-inside space-y-1">
                  {violations30.map((v, i) => (
                    <li key={i}>{v}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="border border-slate-200 rounded-lg p-4">
            <h3 className="font-semibold text-slate-900 mb-2">90-Minute Script</h3>
            <p className="text-sm text-slate-600 mb-4">
              14,000-16,000 words • 10 chapters
            </p>
            <div className="flex gap-2">
              <button
                onClick={generateScript90Min}
                disabled={loading90}
                className="flex-1 px-4 py-2 bg-slate-900 text-white rounded hover:bg-slate-800 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading90 ? "Generating..." : "Generate 90-Min Script"}
              </button>
              {script90Min && (
                <button
                  onClick={() => downloadScript("90min")}
                  className="px-4 py-2 bg-slate-200 text-slate-700 rounded hover:bg-slate-300 transition-colors"
                >
                  Download TXT
                </button>
              )}
            </div>
            {violations90.length > 0 && (
              <div className="mt-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded text-sm">
                <p className="font-semibold mb-1">Validation warnings:</p>
                <ul className="list-disc list-inside space-y-1">
                  {violations90.map((v, i) => (
                    <li key={i}>{v}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {script30Min && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-slate-900 mb-4">30-Minute Script</h3>
          <div className="max-h-[600px] overflow-y-auto border border-slate-200 rounded p-4 bg-slate-50">
            <pre className="whitespace-pre-wrap font-sans text-sm text-slate-900">
              {script30Min}
            </pre>
          </div>
        </div>
      )}

      {script90Min && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-slate-900 mb-4">90-Minute Script</h3>
          <div className="max-h-[600px] overflow-y-auto border border-slate-200 rounded p-4 bg-slate-50">
            <pre className="whitespace-pre-wrap font-sans text-sm text-slate-900">
              {script90Min}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
