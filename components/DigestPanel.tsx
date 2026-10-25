"use client";

import { useEffect, useState } from "react";

type Digest = { text: string; provider: "openai" | "insights-engine" };

export function DigestPanel() {
  const [digest, setDigest] = useState<Digest | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/ai/digest")
      .then((r) => r.json())
      .then((d: Digest) => {
        if (!cancelled) setDigest(d);
      })
      .catch(() => {
        if (!cancelled) setError("digest unavailable");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="rounded-lg border border-indigo-200 bg-indigo-50/60 p-5">
      <div className="flex items-center justify-between">
        <div className="text-xs font-medium uppercase tracking-wide text-indigo-700">
          AI cash-flow digest
        </div>
        {digest && (
          <span className="rounded-full border border-indigo-200 bg-white px-2 py-0.5 text-[10px] text-indigo-600">
            {digest.provider === "openai" ? "OpenAI API" : "built-in insights engine"}
          </span>
        )}
      </div>
      <div className="mt-3 min-h-14 text-sm leading-relaxed text-slate-800">
        {error ?? digest?.text ?? (
          <span className="inline-block h-4 w-2/3 animate-pulse rounded bg-indigo-100" />
        )}
      </div>
      <p className="mt-2 text-[11px] text-slate-500">
        Set OPENAI_API_KEY on the server and this panel upgrades itself — no code change.
      </p>
    </div>
  );
}
