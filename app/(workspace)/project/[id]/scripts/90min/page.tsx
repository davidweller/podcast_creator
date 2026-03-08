"use client";

import { useParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import type { ImprovementAnalysis, ImprovementSuggestion, SuggestionStatus } from "@/types/improvements";
import { formatElapsed } from "@/lib/format-time";
import { getScriptStats90 } from "@/lib/script-stats";

const ESTIMATE_90MIN = "3–8 min";

const CLAUDE_MODELS = [
  { id: "claude-sonnet-4-5-20250514", name: "Claude Sonnet 4.5" },
  { id: "claude-sonnet-4-6", name: "Claude Sonnet 4.6" },
  { id: "claude-opus-4-5-20250514", name: "Claude Opus 4.5" },
  { id: "claude-opus-4-6", name: "Claude Opus 4.6" },
] as const;

type ModelId = typeof CLAUDE_MODELS[number]["id"];

const ANALYSIS_PHASES = [
  { id: "opening", label: "Opening & Welcome Block" },
  { id: "structure", label: "Structure & Chapters" },
  { id: "voice", label: "Voice & Tone" },
  { id: "style", label: "Style Rules" },
  { id: "content", label: "Content & People" },
  { id: "phase4", label: "Phase 4 (Sit With It)" },
  { id: "closing", label: "Closing & Farewell" },
  { id: "copyedit", label: "Copyediting & Flow" },
];

export default function Script90MinPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [script, setScript] = useState("");
  const [loading, setLoading] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [improvements, setImprovements] = useState<ImprovementAnalysis | null>(null);
  const [loadingImprovements, setLoadingImprovements] = useState(false);
  const [applyingImprovements, setApplyingImprovements] = useState(false);
  const [suggestionStatuses, setSuggestionStatuses] = useState<Map<number, SuggestionStatus>>(new Map());
  const [analysisPhaseIndex, setAnalysisPhaseIndex] = useState<number>(-1);
  const [expandedSuggestions, setExpandedSuggestions] = useState<Set<number>>(new Set());
  const [applyingSingle, setApplyingSingle] = useState<number | null>(null);
  const [applyElapsed, setApplyElapsed] = useState(0);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const startTimeRef = useRef<number | null>(null);
  const applyTimeRef = useRef<number | null>(null);
  
  // Model selection state
  const [selectedModel, setSelectedModel] = useState<ModelId>("claude-sonnet-4-6");
  const [useThinking, setUseThinking] = useState(false);

  useEffect(() => {
    loadScript();
  }, [projectId]);

  // Update elapsed time every second while generating
  useEffect(() => {
    if (!loading) {
      startTimeRef.current = null;
      return;
    }
    startTimeRef.current = Date.now();
    setElapsedSeconds(0);
    const interval = setInterval(() => {
      if (startTimeRef.current !== null) {
        setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [loading]);

  async function loadScript() {
    try {
      const res = await fetch(`/api/projects/${projectId}/data`);
      if (res.ok) {
        const data = await res.json();
        setScript(data.script_90min || "");
      }
    } catch (error) {
      console.error("Failed to load script:", error);
    }
  }

  async function generateScript() {
    setLoading(true);
    setError(null);
    setImprovements(null);

    try {
      const res = await fetch(`/api/generate/script/${projectId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          type: "90min",
          modelId: selectedModel,
          useThinking,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setScript(data.script);
      } else {
        setError(data.error || "Failed to generate script");
      }
    } catch (error) {
      console.error("Failed to generate script:", error);
      setError("Failed to generate script. Please check your API key.");
    } finally {
      setLoading(false);
    }
  }

  async function lookForImprovements() {
    setLoadingImprovements(true);
    setError(null);
    setAnalysisPhaseIndex(0);

    // Animate through analysis phases while waiting for the API
    const animatePhases = async () => {
      for (let i = 0; i < ANALYSIS_PHASES.length; i++) {
        setAnalysisPhaseIndex(i);
        // Stagger timing - roughly 2-3 seconds per phase to match typical API response time
        await new Promise(resolve => setTimeout(resolve, 2500));
      }
    };

    const animationPromise = animatePhases();

    try {
      const res = await fetch(`/api/improve/script/${projectId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "90min" }),
      });

      const data = await res.json();

      // Wait for animation to complete if API was faster
      await animationPromise;

      if (res.ok) {
        setImprovements(data);
      } else {
        setError(data.error || "Failed to analyze script");
      }
    } catch (error) {
      console.error("Failed to analyze script:", error);
      setError("Failed to analyze script. Please check your API key.");
    } finally {
      setLoadingImprovements(false);
      setAnalysisPhaseIndex(-1);
    }
  }

  async function applyImprovements() {
    if (!improvements || !improvements.suggestions || improvements.suggestions.length === 0) {
      setError("No improvements to apply");
      return;
    }

    setApplyingImprovements(true);
    setError(null);
    
    const suggestions = improvements.suggestions;
    
    // Initialize all suggestions as pending
    const initialStatuses = new Map<number, SuggestionStatus>();
    for (let i = 0; i < suggestions.length; i++) {
      initialStatuses.set(i, "pending");
    }
    setSuggestionStatuses(new Map(initialStatuses));

    // Process each suggestion sequentially
    for (let i = 0; i < suggestions.length; i++) {
      // Mark current suggestion as applying and start timer
      setApplyElapsed(0);
      applyTimeRef.current = Date.now();
      
      const timerInterval = setInterval(() => {
        if (applyTimeRef.current !== null) {
          setApplyElapsed(Math.floor((Date.now() - applyTimeRef.current) / 1000));
        }
      }, 1000);
      
      setSuggestionStatuses(prev => {
        const updated = new Map(prev);
        updated.set(i, "applying");
        return updated;
      });

      try {
        const res = await fetch(`/api/apply-improvement/${projectId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "90min",
            suggestion: suggestions[i],
          }),
        });

        const data = await res.json();

        if (res.ok && data.script) {
          // Update script with the improved version
          setScript(data.script);
          // Mark this suggestion as applied
          setSuggestionStatuses(prev => {
            const updated = new Map(prev);
            updated.set(i, "applied");
            return updated;
          });
        } else {
          // Mark this suggestion as error but continue with others
          setSuggestionStatuses(prev => {
            const updated = new Map(prev);
            updated.set(i, "error");
            return updated;
          });
          console.error(`Failed to apply improvement ${i + 1}:`, data.error);
        }
      } catch (error) {
        console.error(`Error applying improvement ${i + 1}:`, error);
        setSuggestionStatuses(prev => {
          const updated = new Map(prev);
          updated.set(i, "error");
          return updated;
        });
      } finally {
        clearInterval(timerInterval);
        applyTimeRef.current = null;
      }
    }

    // All done - keep the panel visible for a moment to show completion
    setApplyElapsed(0);
    setApplyingImprovements(false);
    
    setTimeout(() => {
      setImprovements(null);
      setSuggestionStatuses(new Map());
    }, 3000);
  }

  async function applySingleSuggestion(index: number) {
    if (!improvements || applyingSingle !== null || applyingImprovements) return;
    
    const suggestion = improvements.suggestions[index];
    if (!suggestion) return;

    setApplyingSingle(index);
    setApplyElapsed(0);
    applyTimeRef.current = Date.now();
    
    // Start elapsed timer
    const timerInterval = setInterval(() => {
      if (applyTimeRef.current !== null) {
        setApplyElapsed(Math.floor((Date.now() - applyTimeRef.current) / 1000));
      }
    }, 1000);
    
    setSuggestionStatuses(prev => {
      const updated = new Map(prev);
      updated.set(index, "applying");
      return updated;
    });

    try {
      const res = await fetch(`/api/apply-improvement/${projectId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "90min",
          suggestion: suggestion,
        }),
      });

      const data = await res.json();

      if (res.ok && data.script) {
        setScript(data.script);
        setSuggestionStatuses(prev => {
          const updated = new Map(prev);
          updated.set(index, "applied");
          return updated;
        });
      } else {
        setSuggestionStatuses(prev => {
          const updated = new Map(prev);
          updated.set(index, "error");
          return updated;
        });
        setError(data.error || "Failed to apply improvement");
      }
    } catch (error) {
      console.error(`Error applying improvement ${index + 1}:`, error);
      setSuggestionStatuses(prev => {
        const updated = new Map(prev);
        updated.set(index, "error");
        return updated;
      });
    } finally {
      clearInterval(timerInterval);
      applyTimeRef.current = null;
      setApplyingSingle(null);
      setApplyElapsed(0);
    }
  }

  function toggleExpanded(index: number) {
    setExpandedSuggestions(prev => {
      const updated = new Set(prev);
      if (updated.has(index)) {
        updated.delete(index);
      } else {
        updated.add(index);
      }
      return updated;
    });
  }

  function downloadScript() {
    if (!script) {
      alert("No script to download");
      return;
    }

    const blob = new Blob([script], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "script-90min.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function handleScriptChange(newValue: string) {
    setScript(newValue);
    setHasUnsavedChanges(true);
  }

  async function saveScript() {
    setSaving(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/data`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ script_90min: script }),
      });
      if (res.ok) {
        setHasUnsavedChanges(false);
      } else {
        setError("Failed to save script");
      }
    } catch (err) {
      console.error("Failed to save script:", err);
      setError("Failed to save script");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-slate-900 mb-2">90-Minute Script</h3>
        <p className="text-sm text-slate-600 mb-4">
          10,800-11,700 words • 5 phases (Descending Spiral)
        </p>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Model Selection */}
        <div className="mb-4 p-4 bg-slate-50 border border-slate-200 rounded">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label htmlFor="model-select" className="text-sm font-medium text-slate-700">
                Model:
              </label>
              <select
                id="model-select"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value as ModelId)}
                disabled={loading}
                className="text-sm border border-slate-300 rounded px-2 py-1.5 bg-white disabled:bg-slate-100 disabled:cursor-not-allowed"
              >
                {CLAUDE_MODELS.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))}
              </select>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={useThinking}
                onChange={(e) => setUseThinking(e.target.checked)}
                disabled={loading}
                className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 disabled:cursor-not-allowed"
              />
              <span className="text-sm text-slate-700">Extended Thinking</span>
            </label>
            {useThinking && (
              <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                Slower but more thoughtful
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 mb-4">
          <div className="flex gap-2">
            <button
              onClick={generateScript}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-slate-900 text-white rounded hover:bg-slate-800 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Generating..." : "Generate 90-Min Script"}
            </button>
            {script && (
              <button
                onClick={downloadScript}
                className="px-4 py-2 bg-slate-200 text-slate-700 rounded hover:bg-slate-300 transition-colors"
              >
                Download TXT
              </button>
            )}
          </div>
          {loading && (
            <p className="text-sm text-slate-600">
              Elapsed: {formatElapsed(elapsedSeconds)} • Approx. {ESTIMATE_90MIN} remaining
            </p>
          )}
          {script && (
            <div className="flex gap-2">
              <button
                onClick={lookForImprovements}
                disabled={loadingImprovements}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
              >
                {loadingImprovements ? "Analyzing..." : "Look for Improvements"}
              </button>
              {improvements && improvements.suggestions.length > 0 && (
                <button
                  onClick={applyImprovements}
                  disabled={applyingImprovements}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors"
                >
                  {applyingImprovements ? "Applying..." : "Apply Improvements"}
                </button>
              )}
            </div>
          )}

        {/* Analysis progress indicator */}
        {loadingImprovements && analysisPhaseIndex >= 0 && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
            <p className="font-semibold text-blue-900 mb-3">Analyzing script...</p>
            <div className="space-y-2">
              {ANALYSIS_PHASES.map((phase, i) => {
                const isComplete = i < analysisPhaseIndex;
                const isCurrent = i === analysisPhaseIndex;
                return (
                  <div 
                    key={phase.id}
                    className={`flex items-center gap-2 text-sm transition-all duration-300 ${
                      isComplete ? "text-green-700" : isCurrent ? "text-blue-700 font-medium" : "text-slate-400"
                    }`}
                  >
                    <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                      {isComplete && (
                        <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      {isCurrent && (
                        <svg className="w-4 h-4 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                      )}
                      {!isComplete && !isCurrent && (
                        <div className="w-2 h-2 bg-slate-300 rounded-full" />
                      )}
                    </div>
                    <span>{phase.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        </div>

        {improvements && improvements.suggestions.length > 0 && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
            <div className="flex items-center justify-between mb-3">
              <p className="font-semibold text-blue-900">{improvements.summary}</p>
              <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                {improvements.suggestions.filter((_, i) => suggestionStatuses.get(i) === "applied").length} / {improvements.suggestions.length} applied
              </span>
            </div>
            <div className="space-y-1.5">
              {improvements.suggestions.map((suggestion, i) => {
                const status = suggestionStatuses.get(i) || "pending";
                const isExpanded = expandedSuggestions.has(i);
                const hasDetails = suggestion.suggestion || (suggestion.original && suggestion.improved);
                
                return (
                  <div 
                    key={i} 
                    className={`px-3 py-2 rounded border transition-all duration-300 ${
                      status === "applied" 
                        ? "bg-green-50 border-green-300" 
                        : status === "applying" 
                        ? "bg-blue-100 border-blue-300" 
                        : status === "error"
                        ? "bg-red-50 border-red-300"
                        : "bg-white border-blue-100"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex-shrink-0 flex items-center gap-1">
                        <div className="w-5 h-5 flex items-center justify-center">
                          {status === "applying" && (
                            <svg className="w-4 h-4 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                          )}
                          {status === "applied" && (
                            <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                          {status === "error" && (
                            <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                          {status === "pending" && (
                            <div className="w-2 h-2 bg-slate-300 rounded-full" />
                          )}
                        </div>
                        {status === "applying" && applyElapsed > 0 && (
                          <span className="text-xs text-blue-600 tabular-nums">{applyElapsed}s</span>
                        )}
                      </div>
                      <span className={`text-xs font-semibold px-1.5 py-0.5 rounded flex-shrink-0 ${
                        suggestion.type === "quality_check" ? "bg-yellow-200 text-yellow-800" :
                        suggestion.type === "copyedit" ? "bg-blue-200 text-blue-800" :
                        "bg-purple-200 text-purple-800"
                      }`}>
                        {suggestion.type === "quality_check" ? "QC" : suggestion.type === "copyedit" ? "EDIT" : "STYLE"}
                      </span>
                      <button
                        onClick={() => hasDetails && toggleExpanded(i)}
                        className={`flex-1 text-left text-sm ${
                          status === "applied" ? "text-green-800" : 
                          status === "applying" ? "text-blue-800 font-medium" : 
                          "text-slate-700"
                        } ${hasDetails ? "cursor-pointer hover:text-slate-900" : "cursor-default"} ${isExpanded ? "" : "truncate"}`}
                      >
                        {suggestion.description}
                        {suggestion.location && (
                          <span className="text-slate-400 ml-1">({suggestion.location})</span>
                        )}
                      </button>
                      {hasDetails && (
                        <button
                          onClick={() => toggleExpanded(i)}
                          className="flex-shrink-0 p-1 text-slate-400 hover:text-slate-600"
                          title={isExpanded ? "Collapse" : "Expand"}
                        >
                          <svg 
                            className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor" 
                            strokeWidth="2"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      )}
                      {status === "pending" && !applyingImprovements && (
                        <button
                          onClick={() => applySingleSuggestion(i)}
                          disabled={applyingSingle !== null}
                          className="flex-shrink-0 px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors"
                          title="Apply this improvement"
                        >
                          Apply
                        </button>
                      )}
                    </div>
                    
                    {/* Expanded details */}
                    {isExpanded && hasDetails && (
                      <div className="mt-2 pl-7 text-sm border-t border-slate-200 pt-2">
                        {suggestion.suggestion && (
                          <p className="text-slate-600 mb-2">{suggestion.suggestion}</p>
                        )}
                        {suggestion.original && suggestion.improved && (
                          <div className="space-y-1">
                            <p className="text-red-600 line-through text-xs">{suggestion.original}</p>
                            <p className="text-green-600 text-xs">{suggestion.improved}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {script && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-xl font-bold text-slate-900">90-Minute Script</h3>
            <div className="flex items-center gap-2">
              {hasUnsavedChanges && (
                <span className="text-sm text-amber-600">Unsaved changes</span>
              )}
              <button
                onClick={saveScript}
                disabled={saving || !hasUnsavedChanges}
                className="px-4 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
          <p className="text-sm text-slate-600 mb-4">
            {(() => {
              const { wordCount, chapterCount } = getScriptStats90(script);
              return `${wordCount.toLocaleString()} words • ${chapterCount} chapters`;
            })()}
          </p>
          <textarea
            value={script}
            onChange={(e) => handleScriptChange(e.target.value)}
            className="w-full h-[600px] border border-slate-200 rounded p-4 bg-slate-50 font-sans text-sm text-slate-900 resize-y focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
        </div>
      )}
    </div>
  );
}
