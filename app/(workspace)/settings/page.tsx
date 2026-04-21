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
  const [importing, setImporting] = useState(false);
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

  async function reloadProviders() {
    const reload = await fetch("/api/settings");
    const r = await reload.json();
    setProviders(r.providers ?? []);
    setCanStoreKeys(Boolean(r.canStoreKeys));
  }

  /** Persist pasted fields only (does not clear untouched providers). */
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
      await reloadProviders();
    } catch {
      setMessage("Save failed.");
    } finally {
      setSaving(false);
    }
  }

  /** Copy all keys from the server environment (.env) into encrypted storage. */
  async function importFromEnvironment() {
    setImporting(true);
    setMessage(null);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ importFromEnv: true }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "Import failed.");
        return;
      }
      const ids = (data.importedFromEnv as string[] | undefined) ?? [];
      setMessage(
        ids.length > 0
          ? `Imported ${ids.length} key(s) from environment into encrypted storage.`
          : "No keys found in environment to import (check your .env file)."
      );
      await reloadProviders();
    } catch {
      setMessage("Import failed.");
    } finally {
      setImporting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center text-slate-600 dark:text-slate-400 pr-16">
        Loading settings…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 pr-16">
      <div className="max-w-3xl mx-auto px-8 py-10">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <Link
              href="/"
              className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 inline-block mb-2"
            >
              ← Back to Projects
            </Link>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Settings</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              API keys are optional if you use environment variables. Stored keys are encrypted
              when <code className="text-xs bg-slate-200 dark:bg-slate-700 px-1 rounded">COZYCRIME_SECRET</code> is set.
            </p>
          </div>
        </div>

        {!canStoreKeys && (
          <div className="mb-6 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 px-4 py-3 text-sm text-amber-900 dark:text-amber-200">
            Database key storage is disabled until{" "}
            <code className="text-xs">COZYCRIME_SECRET</code> (min 16 characters) is set on the
            server. You can still use keys from <code className="text-xs">.env</code>.
          </div>
        )}

        {message && (
          <div
            className={`mb-4 text-sm rounded px-3 py-2 ${
              message.startsWith("Saved") || message.startsWith("Imported")
                ? "bg-green-50 dark:bg-green-950/40 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800"
                : message.startsWith("No keys")
                  ? "bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600"
                  : "bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800"
            }`}
          >
            {message}
          </div>
        )}

        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-700">
          {providers.map((p) => (
            <div key={p.id} className="p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <h2 className="font-semibold text-slate-900 dark:text-slate-50">{p.label}</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Env: <code>{p.envVar}</code>
                    {p.hint ? ` — ${p.hint}` : ""}
                  </p>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {p.configured ? (
                    <span className="text-green-700 dark:text-green-400">
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
                className="mt-3 w-full rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500 disabled:bg-slate-100 dark:disabled:bg-slate-800"
                value={values[p.id] ?? ""}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, [p.id]: e.target.value }))
                }
              />
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Leave empty and save to clear a stored key. Saving sends the key to the server once;
                it is not shown again.
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-3 items-center">
          <button
            type="button"
            onClick={save}
            disabled={saving || !canStoreKeys || Object.keys(values).length === 0}
            className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-50"
            title={
              Object.keys(values).length === 0
                ? "Type or paste at least one key, or use Import from environment"
                : undefined
            }
          >
            {saving ? "Saving…" : "Save pasted keys"}
          </button>
          <button
            type="button"
            onClick={importFromEnvironment}
            disabled={importing || !canStoreKeys}
            className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
          >
            {importing ? "Importing…" : "Import keys from environment"}
          </button>
          <Link
            href="/"
            className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Cancel
          </Link>
        </div>
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 max-w-xl">
          <strong>Import from environment</strong> copies values from your server&apos;s{" "}
          <code className="text-xs">.env</code> (or host env) into the local encrypted database so they
          keep working without redeploying env files. <strong>Save pasted keys</strong> only updates
          providers where you entered text above.
        </p>
      </div>
    </div>
  );
}
