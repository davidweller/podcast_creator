"use client";

import { useParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";

const CHIRP3_HD_VOICES = {
  female: [
    "Achernar",
    "Aoede",
    "Autonoe",
    "Callirrhoe",
    "Despina",
    "Erinome",
    "Gacrux",
    "Kore",
    "Laomedeia",
    "Leda",
    "Pulcherrima",
    "Sulafat",
    "Vindemiatrix",
    "Zephyr",
  ],
  male: [
    "Achird",
    "Algenib",
    "Algieba",
    "Alnilam",
    "Charon",
    "Enceladus",
    "Fenrir",
    "Iapetus",
    "Orus",
    "Puck",
    "Rasalgethi",
    "Sadachbia",
    "Sadaltager",
    "Schedar",
    "Umbriel",
    "Zubenelgenubi",
  ],
};

const SUPPORTED_LANGUAGES = [
  { code: "en-US", label: "English (United States)" },
  { code: "en-GB", label: "English (United Kingdom)" },
  { code: "en-AU", label: "English (Australia)" },
  { code: "en-IN", label: "English (India)" },
  { code: "es-ES", label: "Spanish (Spain)" },
  { code: "es-US", label: "Spanish (United States)" },
  { code: "fr-FR", label: "French (France)" },
  { code: "fr-CA", label: "French (Canada)" },
  { code: "de-DE", label: "German (Germany)" },
  { code: "it-IT", label: "Italian (Italy)" },
  { code: "pt-BR", label: "Portuguese (Brazil)" },
  { code: "nl-NL", label: "Dutch (Netherlands)" },
  { code: "ja-JP", label: "Japanese (Japan)" },
  { code: "ko-KR", label: "Korean (South Korea)" },
  { code: "cmn-CN", label: "Mandarin Chinese (China)" },
  { code: "hi-IN", label: "Hindi (India)" },
  { code: "ar-XA", label: "Arabic (Generic)" },
  { code: "ru-RU", label: "Russian (Russia)" },
  { code: "pl-PL", label: "Polish (Poland)" },
  { code: "tr-TR", label: "Turkish (Turkey)" },
  { code: "sv-SE", label: "Swedish (Sweden)" },
  { code: "da-DK", label: "Danish (Denmark)" },
  { code: "nb-NO", label: "Norwegian Bokmål (Norway)" },
  { code: "fi-FI", label: "Finnish (Finland)" },
  { code: "el-GR", label: "Greek (Greece)" },
  { code: "he-IL", label: "Hebrew (Israel)" },
  { code: "th-TH", label: "Thai (Thailand)" },
  { code: "vi-VN", label: "Vietnamese (Vietnam)" },
  { code: "id-ID", label: "Indonesian (Indonesia)" },
  { code: "uk-UA", label: "Ukrainian (Ukraine)" },
];

type ScriptSource = "90min" | "shorts" | "custom";

export default function SpeechPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [scriptSource, setScriptSource] = useState<ScriptSource>("90min");
  const [scriptText, setScriptText] = useState("");
  const [shortsText, setShortsText] = useState("");
  const [customText, setCustomText] = useState("");
  const [voice, setVoice] = useState("Charon");
  const [language, setLanguage] = useState("en-US");
  const [speed, setSpeed] = useState(1.0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    loadData();
  }, [projectId]);

  async function loadData() {
    try {
      const res = await fetch(`/api/projects/${projectId}/data`);
      if (res.ok) {
        const data = await res.json();
        setScriptText(data.script_90min || "");
        setShortsText(data.shorts || "");
      }
    } catch (err) {
      console.error("Failed to load project data:", err);
    }
  }

  // Restore generated speech from disk when returning to this tab (file is persisted by the API).
  useEffect(() => {
    if (!projectId || scriptSource === "custom") return;
    const wavPath = `/audio/${projectId}/speech-${scriptSource}.wav`;
    const mp3Path = `/audio/${projectId}/speech-${scriptSource}.mp3`;

    const applyOk = (path: string, res: Response) => {
      if (res.ok) {
        setAudioUrl(path);
        const lastMod = res.headers.get("last-modified");
        setGeneratedAt(lastMod ? new Date(lastMod).toLocaleString() : "Previously generated");
      } else {
        setAudioUrl(null);
        setGeneratedAt(null);
      }
    };

    fetch(wavPath, { method: "HEAD" })
      .then((res) => {
        if (res.ok) {
          applyOk(wavPath, res);
        } else {
          return fetch(mp3Path, { method: "HEAD" }).then((mp3Res) => applyOk(mp3Path, mp3Res));
        }
      })
      .catch(() => {
        setAudioUrl(null);
        setGeneratedAt(null);
      });
  }, [projectId, scriptSource]);

  const currentText = scriptSource === "90min" 
    ? scriptText 
    : scriptSource === "shorts" 
      ? shortsText 
      : customText;
  const hasScript = currentText.trim().length > 0;

  async function generateSpeech() {
    if (!hasScript) {
      setError("No script available. Please generate a script first.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/generate/speech/${projectId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scriptSource,
          customText: scriptSource === "custom" ? customText : undefined,
          voice,
          language,
          speed,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setAudioUrl(data.audioUrl + `?t=${Date.now()}`);
        setGeneratedAt(new Date().toLocaleString());
      } else {
        setError(data.error || "Failed to generate speech");
      }
    } catch (err) {
      console.error("Failed to generate speech:", err);
      setError("Failed to generate speech. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  function downloadAudio() {
    if (!audioUrl) return;
    const a = document.createElement("a");
    a.href = audioUrl;
    const base = audioUrl.split("?")[0];
    const ext = base.endsWith(".wav") ? "wav" : "mp3";
    a.download = `speech-${projectId}-${scriptSource}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  const wordCount = currentText.trim().split(/\s+/).filter(Boolean).length;
  const estimatedMinutes = Math.ceil((wordCount / 150) / speed);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">
          Speech Generation
        </h2>
        <p className="text-sm text-slate-600 mb-6">
          Convert your script to speech using Google Cloud Text-to-Speech with Chirp 3 HD voices.
          Output is saved as a single WAV (streaming synthesis) for cleaner long-form audio than stitched MP3.
        </p>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Script Source
            </label>
            <select
              value={scriptSource}
              onChange={(e) => setScriptSource(e.target.value as ScriptSource)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              <option value="90min">90-Minute Script</option>
              <option value="shorts">Shorts Script</option>
              <option value="custom">Custom Text</option>
            </select>
            {!hasScript && scriptSource !== "custom" && (
              <p className="mt-1 text-sm text-amber-600">
                No {scriptSource === "90min" ? "90-minute" : "shorts"} script available
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Voice
            </label>
            <select
              value={voice}
              onChange={(e) => setVoice(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              <optgroup label="Female Voices">
                {CHIRP3_HD_VOICES.female.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Male Voices">
                {CHIRP3_HD_VOICES.male.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Speed: {speed.toFixed(2)}x
            </label>
            <input
              type="range"
              min="0.25"
              max="2.0"
              step="0.05"
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>0.25x (Slow)</span>
              <span>1.0x (Normal)</span>
              <span>2.0x (Fast)</span>
            </div>
          </div>
        </div>

        {hasScript && (
          <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex justify-between items-center text-sm text-slate-600">
              <span>Word count: {wordCount.toLocaleString()}</span>
              <span>Estimated audio duration: ~{estimatedMinutes} min at {speed}x speed</span>
            </div>
            {wordCount > 500 && (
              <p className="mt-2 text-sm text-amber-600">
                Long scripts stream through the API as multiple text segments (one continuous WAV). This may take several minutes.
              </p>
            )}
          </div>
        )}

        <div className="flex gap-4 items-center">
          <button
            onClick={generateSpeech}
            disabled={loading || !hasScript}
            className="px-6 py-2 bg-slate-900 text-white rounded hover:bg-slate-800 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Generating..." : "Generate Speech"}
          </button>
          {loading && (
            <span className="text-sm text-slate-600">
              Processing... This may take a few minutes for long scripts.
            </span>
          )}
          {audioUrl && !loading && (
            <button
              onClick={downloadAudio}
              className="px-6 py-2 bg-slate-200 text-slate-700 rounded hover:bg-slate-300 transition-colors"
            >
              Download WAV
            </button>
          )}
        </div>
      </div>

      {audioUrl && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-slate-900 mb-4">Generated Audio</h3>
          {generatedAt && (
            <p className="text-sm text-slate-500 mb-4">Generated at: {generatedAt}</p>
          )}
          <audio
            ref={audioRef}
            controls
            className="w-full"
            src={audioUrl}
          >
            Your browser does not support the audio element.
          </audio>
        </div>
      )}

      {scriptSource === "custom" && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-slate-900 mb-4">Custom Script</h3>
          <p className="text-sm text-slate-600 mb-4">
            Enter or paste your custom text below. This text will be converted to speech.
          </p>
          <textarea
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder="Enter your text here..."
            className="w-full h-[400px] p-4 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-400 font-sans text-sm text-slate-900 resize-y"
          />
        </div>
      )}
    </div>
  );
}
