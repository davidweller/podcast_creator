"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ProviderId } from "@/lib/models/types";

type ProviderRow = {
  id: ProviderId;
  label: string;
  envVar: string;
  hint: string | null;
  hasEnvKey: boolean;
  hasDatabaseKey: boolean;
  configured: boolean;
};

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [canStoreKeys, setCanStoreKeys] = useState(false);
  const [providers, setProviders] = useState<ProviderRow[]>([]);
  const [values, setValues] = useState<Partial<Record<ProviderId, string>>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/settings");
        const data = await res.json();
        setCanStoreKeys(Boolean(data.canStoreKeys));
        setProviders(data.providers ?? []);
      } catch {
        setMessage("Failed to load settings.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function save() {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "Save failed.");
        return;
      }
      setValues({});
      setMessage("Saved.");
      const reload = await fetch("/api/settings");
      const r = await reload.json();
      setProviders(r.providers ?? []);
    } catch {
      setMessage("Save failed.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center text-slate-600">
        Loading settings…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-3xl mx-auto px-8 py-10">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <Link
              href="/"
              className="text-sm text-slate-600 hover:text-slate-900 inline-block mb-2"
            >
              ← Back to Projects
            </Link>
            <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
            <p className="text-sm text-slate-600 mt-1">
              API keys are optional if you use environment variables. Stored keys are encrypted
              when <code className="text-xs bg-slate-200 px-1 rounded">COZYCRIME_SECRET</code> is set.
            </p>
          </div>
        </div>

        {!canStoreKeys && (
          <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Database key storage is disabled until{" "}
            <code className="text-xs">COZYCRIME_SECRET</code> (min 16 characters) is set on the
            server. You can still use keys from <code className="text-xs">.env</code>.
          </div>
        )}

        {message && (
          <div
            className={`mb-4 text-sm rounded px-3 py-2 ${
              message.startsWith("Saved")
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {message}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md border border-slate-200 divide-y divide-slate-100">
          {providers.map((p) => (
            <div key={p.id} className="p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <h2 className="font-semibold text-slate-900">{p.label}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Env: <code>{p.envVar}</code>
                    {p.hint ? ` — ${p.hint}` : ""}
                  </p>
                </div>
                <div className="text-xs text-slate-500">
                  {p.configured ? (
                    <span className="text-green-700">
                      Configured
                      {p.hasDatabaseKey ? " (saved)" : ""}
                      {p.hasEnvKey && !p.hasDatabaseKey ? " (env)" : ""}
                    </span>
                  ) : (
                    <span>Not configured</span>
                  )}
                </div>
              </div>
              <input
                type="password"
                autoComplete="off"
                disabled={!canStoreKeys}
                placeholder={
                  canStoreKeys
                    ? "Paste key to save, or leave blank to skip"
                    : "Enable COZYCRIME_SECRET to save keys here"
                }
                className="mt-3 w-full rounded border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:bg-slate-100"
                value={values[p.id] ?? ""}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, [p.id]: e.target.value }))
                }
              />
              <p className="text-xs text-slate-400 mt-1">
                Leave empty and save to clear a stored key. Saving sends the key to the server once;
                it is not shown again.
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={save}
            disabled={saving || !canStoreKeys}
            className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save keys"}
          </button>
          <Link
            href="/"
            className="px-4 py-2 rounded-lg border border-slate-300 text-sm text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
}
